import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const contextPath = path.resolve("./context.json");
const chatHistoryPath = path.resolve("./chatHistory.json");

function loadContext() {
  return JSON.parse(fs.readFileSync(contextPath, "utf-8"));
}

function saveContext(context) {
  fs.writeFileSync(contextPath, JSON.stringify(context, null, 2), "utf-8");
}

function loadChatHistory() {
  return JSON.parse(fs.readFileSync(chatHistoryPath, "utf-8"));
}

function saveChatHistory(history) {
  fs.writeFileSync(chatHistoryPath, JSON.stringify(history, null, 2), "utf-8");
}

function appendToChatHistory({ role, text }) {
  const history = loadChatHistory();

  const time = new Date().toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  history.push({
    role,
    text,
    time
  });

  saveChatHistory(history);
}

function validateChatUpdate(update) {
  return (
    update &&
    Array.isArray(update.behandelteThemen) &&
    Array.isArray(update.nutzerIntentionen) &&
    Array.isArray(update.konversationZusammenfassung) &&
    typeof update.reflektierendeFrage === "string"
  );
}

function mergeBehandelteThemen(existing = [], incoming = []) {
  const map = new Map();

  existing.forEach(item => {
    map.set(item.thema, {
      ...item,
      evidenz: [...(item.evidenz || [])]
    });
  });

  incoming.forEach(item => {
    if (!map.has(item.thema)) {
      map.set(item.thema, item);
    } else {
      const oldItem = map.get(item.thema);

      map.set(item.thema, {
        thema: item.thema,

        status: mergeStatus(oldItem.status, item.status),

        evidenz: Array.from(new Set([
          ...oldItem.evidenz,
          ...item.evidenz
        ]))
      });
    }
  });

  return Array.from(map.values());
}

function mergeStatus(oldStatus, newStatus) {
  const priority = {
    "offen": 1,
    "besprochen": 2,
    "vertiefung_nötig": 3
  };

  return priority[newStatus] > priority[oldStatus]
    ? newStatus
    : oldStatus;
}

function mergeUnique(existing = [], incoming = []) {
  const map = new Map();

  [...existing, ...incoming].forEach(item => {
    map.set(JSON.stringify(item), item);
  });

  return Array.from(map.values());
}

function mergeContext(oldContext, update) {
  return {
    ...oldContext,
    memory: {
      behandelteThemen: mergeBehandelteThemen(
        oldContext.memory?.behandelteThemen,
        update.behandelteThemen
      ),
      nutzerIntentionen: mergeUnique(
        oldContext.memory?.nutzerIntentionen,
        update.nutzerIntentionen
      ),
      konversationZusammenfassung: mergeUnique(
        oldContext.memory?.konversationZusammenfassung,
        update.konversationZusammenfassung
      )
    }
  };
}

const instructions = `
Du bist ein Unterstützer im Entscheidungsprozess über die Einwilligung zur Weitergabe elektronischer Gesundheitsdaten.

Regeln:
- Du gibst KEINE direkten oder indirekten Empfehlungen.
- Du stellst AUSSCHLIESSLICH reflektierende Fragen.
- Stelle jeweils nur EINE Frage aufeinmal.
- Extrahiere die relevanten Argumentationen aus den Nutzernachrichten.
- Aktualisiere den Gedächtnisspeicher Memory im Kontext.
- Verwende NUR die bereitgestellte JSON-Datei als Gedächstnispeicher.
- Überprüfe vorab, ob du einen neuen Punkt im Gedächtnisspeicher aufmachst, oder zu einem bestehen Punkt etwas ergänzt.
- Gib AUSSCHLIESSLICH gültiges JSON zurück.
- WiedergabeAussage ist optional: wenn sinnvoll, gib eine kurze Spiegelung der Nutzerhaltung zu einer Entscheidungsdimension (max. 1 Satz); wenn nicht sinnvoll, gib leeren Strin "" zurück
- Du antwortest auf DEUTSCH.
- Du dutzt den Nutzer.

Gib NUR dieses JSON-Format zurück zurück:
{
  "behandelteThemen": [
    {
      "thema": "string",
      "status": "besprochen|offen|benötigt_followup",
      "evidenz": ["string"]
    }
  ],
  "nutzerIntentionen": [
    {
      "intention": "string",
      "quelle": "string"
    }
  ],
  "konversationZusammenfassung": [
    {
      "thema": "string",
      "punkte": ["string"]
    }
  ],
  "reflektierendeFrage": "string",
  "wiedergabeAussage": "string"
}
`;

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const context = loadContext();
    appendToChatHistory({
      role: "user",
      text: message
    });

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions,
      input: [
        {
          role: "user",
          content: `CURRENT_CONTEXT_JSON:
    ${JSON.stringify(context, null, 2)}
    
    NUTZER_NACHRICHT:
    ${message}`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "chat_update",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              behandelteThemen: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    thema: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["besprochen", "offen", "vertiefung_nötig"]
                    },
                    evidenz: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["thema", "status", "evidenz"]
                }
              },
              nutzerIntentionen: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    intention: { type: "string" },
                    quelle: { type: "string" }
                  },
                  required: ["intention", "quelle"]
                }
              },
              konversationZusammenfassung: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    thema: { type: "string" },
                    punkte: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["thema", "punkte"]
                }
              },
              reflektierendeFrage: {
                type: "string"
              },
              wiedergabeAussage: {
                type: "string"
              }
            },
            required: [
              "behandelteThemen",
              "nutzerIntentionen",
              "konversationZusammenfassung",
              "reflektierendeFrage",
              "wiedergabeAussage"
            ]
          }
        }
      }
    });

    const update = JSON.parse(response.output_text);

    if (!validateChatUpdate(update)) {
      throw new Error("Model returned unexpected JSON shape.");
    }
    const newContext = mergeContext(context, update);
    saveContext(newContext);

    const replyParts = [];

    if (update.wiedergabeAussage) {
      replyParts.push(update.wiedergabeAussage);
    }

    replyParts.push(update.reflektierendeFrage);

    const reply = replyParts.join("\n\n");

    appendToChatHistory({
      role: "bot",
      text: reply
    });
    res.json({
      reply,
      context: newContext
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while calling OpenAI.",
    });
  }
});

app.post("/api/finaldecision", async (req, res) => {
  try {
    const context = loadContext();

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: `
      Du bist ein Assistent zur Entscheidungsunterstützung bei Einwilligungsentscheidungen über die Weitergabe elektronischer Gesundheitsdaten.

      Deine Aufgabe:
- Fasse die bisherige Unterhaltung zusammen.
- Verwende AUSSCHLIESSLICH den Memory aus der bereitgestellte JSON-Datei als Kontext
- Gliedere die Zusammenfassung nach Themen.
- Erfinde nichts, was nicht im Memory-Kontext steht.
- Gib keine Empfehlungen ab.
- Gib AUSSCHLIESSLICH gültiges JSON zurück.
- Du antwortest auf DEUTSCH.

Gib dieses Format zurück:
{
  "typ": "final-summary",
  "themen": [
    {
      "thema": "string",
      "punkte": ["string"]
    }
  ],
  "abschließendeFrage": "string"
}
      `,
      input: [
        {
          role: "user",
          content: `Erstelle eine Zusammenfassung basierend auf dem Memory im Kontext:

CURRENT_CONTEXT_JSON:
${JSON.stringify(context, null, 2)}`
        }
      ]
    });

    const summary = JSON.parse(response.output_text);

    appendToChatHistory({
      role: "bot",
      text: JSON.stringify(summary)
    });

    return res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while generating the flashlight question."
    });
  }
});

app.post("/api/summary", async (req, res) => {
  try {
    const context = loadContext();

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: `
      Du bist ein Assistent zur Entscheidungsunterstützung bei Einwilligungsentscheidungen über die Weitergabe elektronischer Gesundheitsdaten.

      Deine Aufgabe:
- Fasse die bisherige Unterhaltung zusammen.
- Verwende AUSSCHLIESSLICH den Memory aus der bereitgestellte JSON-Datei als Kontext
- Gliedere die Zusammenfassung nach Themen.
- Erfinde nichts, was nicht im Memory-Kontext steht.
- Gib keine Empfehlungen ab.
- Gib AUSSCHLIESSLICH gültiges JSON zurück.
- Du antwortest auf DEUTSCH.

Gib dieses Format zurück:
{
  "typ": "summary",
  "themen": [
    {
      "thema": "string",
      "punkte": ["string"]
    }
  ],
  "gesamteZusammenfassung": "string"
}
      `,
      input: [
        {
          role: "user",
          content: `Erstelle eine Zusammenfassung basierend auf dem Memory im Kontext:

CURRENT_CONTEXT_JSON:
${JSON.stringify(context, null, 2)}`
        }
      ]
    });

    const result = JSON.parse(response.output_text);

    appendToChatHistory({
      role: "bot",
      text: result
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while generating the summary."
    });
  }
});

app.post("/api/perspective", async (req, res) => {
  try {
    const context = loadContext();

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: `
You are a reflective decision-support assistant for consent decisions about sharing electronic health data.

Your task:
- Look at the provided context JSON.
- Identify one factor or topic that has not been sufficiently discussed yet.
- Choose an underexplored topic from the available factors if possible.
- Ask exactly one reflective question about that topic.
- Do not give recommendations.
- Do not summarize the whole conversation.
- Return ONLY valid JSON.

Return this format:
{
  "type": "flashlight",
  "unexploredTopic": "string",
  "reason": "string",
  "question": "string"
}
      `,
      input: [
        {
          role: "user",
          content: `CURRENT_CONTEXT_JSON:\n${JSON.stringify(context, null, 2)}`
        }
      ]
    });

    const result = JSON.parse(response.output_text);

    appendToChatHistory({
      role: "bot",
      text: result
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while generating the flashlight question."
    });
  }
});

app.post("/api/message", (req, res) => {
  try {
    const { role, text } = req.body;

    if (typeof text !== "string") {
      return res.status(400).json({
        error: "text must be a string"
      });
    }

    appendToChatHistory({
      role: role || "system",
      text
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

app.listen(5050, () => {
  console.log("Server running on http://localhost:5050");
});