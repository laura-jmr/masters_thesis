import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function loadConsentById(id) {
  const filePath = `consents/consent-request${id}.json`;
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
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
    typeof update.reflektierendeFrage === "string" &&
    typeof update.antwortAufFrageOderAufgabe === "string"
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
- Du stellst bei jeder Antwort genau EINE reflektierende Frage in reflektierendeFrage.
- Reflektierende Fragen sollen NICHT nach unbekannten Fakten, hypothetischen Szenarien oder Detailwissen fragen.
- Reflektierende Fragen sollen die Haltung, Prioritäten, Werte, Sorgen oder Gewichtung des Nutzers zu dem aktuellen Thema erkunden.
- Extrahiere die relevanten Argumentationen aus den Nutzernachrichten.
- Aktualisiere den Gedächtnisspeicher Memory im Kontext.
- Verwende NUR die bereitgestellte JSON-Datei als Gedächstnispeicher.
- Überprüfe vorab, ob du einen neuen Punkt im Gedächtnisspeicher aufmachst, oder zu einem bestehen Punkt etwas ergänzt.
- Als weiteres Hintergrundwissen benutze die Chat Historie.
- Gib AUSSCHLIESSLICH gültiges JSON zurück.
- WiedergabeAussage ist optional: wenn sinnvoll, gib eine kurze Spiegelung der Nutzerhaltung zu einer Entscheidungsdimension (max. 1 Satz); wenn nicht sinnvoll, gib leeren String "" zurück.
- antwortAufFrageOderAufgabe ist optional: wenn der Nutzer eine Frage stellt oder eine Aufgabe gibt, MUSST du zuerst antwortAufFrageOderAufgabe sinnvoll ausfüllen.
- antwortAufFrageOderAufgabe hat Priorität vor reflektierendeFrage.
- reflektierendeFrage wird IMMER zusätzlich gestellt.
- Für antwortAufFrageOderAufgabe gib Informationen aus Consent, Context oder ChatHistory NUR dann wieder, wenn der Nutzer aktiv eine Frage stellt oder ausdrücklich nach Informationen fragt.
- Wenn ein Punkt im Kontext nur als Stichwort vorliegt (z.B. "Discrimination Concerns"), darfst du diesen NICHT weiter ausformulieren oder Beispiele erfinden.
- Du darfst Informationen aus dem Kontext oder Consent NICHT interpretieren, erweitern oder mit eigenem Wissen ergänzen.
- Du darfst ausschließlich Informationen wiedergeben, die explizit und konkret im Kontext oder Consent stehen.
- Wenn die Nutzerfrage NICHT direkt durch explizite Informationen aus Kontext oder Consent beantwortet werden kann, MUSST du exakt schreiben:
"Ich kann keine weiteren Informationen dazu geben, da mir dazu nichts bekannt ist."
- Wenn der Nutzer lediglich eine Meinung, Präferenz oder Bewertung äußert, gib KEINE zusätzlichen Informationen wieder.
- Du antwortest auf DEUTSCH.
- Du dutzt den Nutzer.

Gib NUR dieses JSON-Format zurück zurück:
{
  "behandelteThemen": [
    {
      "thema": "string",
      "status": {
        type: "string",
        enum: ["besprochen", "offen", "vertiefung_nötig"]
      },
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
  "wiedergabeAussage": "string",
  "antwortAufFrageOderAufgabe": "string"
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
    const { message, consentId } = req.body;

    const context = loadContext();
    const chatHistory = loadChatHistory();
    const consent = loadConsentById(consentId);

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
          content: `CONSENT_CONTEXT:
          ${JSON.stringify(consent, null, 2)}
          
          CURRENT_CONTEXT_JSON:
    ${JSON.stringify(context, null, 2)}
    
    CHAT_HISTORY:
${JSON.stringify(chatHistory, null, 2)}

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
              },
              antwortAufFrageOderAufgabe: {
                type: "string"
              }
            },
            required: [
              "behandelteThemen",
              "nutzerIntentionen",
              "konversationZusammenfassung",
              "reflektierendeFrage",
              "wiedergabeAussage",
              "antwortAufFrageOderAufgabe"
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

    if (update.antwortAufFrageOderAufgabe) {
      replyParts.push(update.antwortAufFrageOderAufgabe);
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
    const { consentId } = req.body;
    const context = loadContext();
    const consent = loadConsentById(consentId);
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: `
      Du bist ein Assistent zur Entscheidungsunterstützung bei Einwilligungsentscheidungen über die Weitergabe elektronischer Gesundheitsdaten.

      Deine Aufgabe:

      1. Analysiere den Kontext und den Consent und finde relevante Dimensionen oder Faktoren (max. 3) für die Entscheidung, die noch OFFEN sind und mehr besprochen werden sollten.
      3. Erstelle zu jedem Thema genau EINE neutrale reflektierende Frage.
      5. Wiederhole keine bereits ausführlich behandelten Themen, die unter behandelteThemen den Status "besprochen" haben.
      6. Gib keine Empfehlungen.
      7. Antworte AUSSCHLIESSLICH auf DEUTSCH.
      8. Gib ausschließlich gültiges JSON zurück.

Gib dieses Format zurück:
{
  "typ": "perspective",
  "themen": [
    {
      "thema": "string",
      "frage": "string"
    }
  ]
}
      `,
      input: [
        {
          role: "user",
          content: `CURRENT_CONTEXT_JSON:\n${JSON.stringify(context, null, 2)}
          
          CONSENT_CONTEXT:
${JSON.stringify(consent, null, 2)}`
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
      error: "Something went wrong while generating the perspectives."
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

app.get("/api/consents/:id", (req, res) => {
  const id = req.params.id;

  const filePath = path.join(
    __dirname,
    "consents",
    `consent-request${id}.json`
  );

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).json({ error: "Consent nicht gefunden" });
    }

    res.json(JSON.parse(data));
  });
});

app.listen(5050, () => {
  console.log("Server running on http://localhost:5050");
});