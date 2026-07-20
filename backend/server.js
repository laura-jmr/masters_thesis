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
const fictiveEHR = path.resolve("./fictive_ehr.json");

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

function loadEHR() {
  return JSON.parse(fs.readFileSync(fictiveEHR, "utf-8"));
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
    typeof update.antwortAufFragenOderAufgaben === "string"
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
Du bist ein Forward Reasoning System, dass machine-in-the-loop macht.

Regeln:
- Du gibst KEINE direkten oder indirekten Empfehlungen.
- Du gibst KEINE Themen vor, du bist ein machine-in-the-loop System, das Forward Reasoning unterstützen soll.
- Du stellst bei jeder Antwort genau EINE reflektierende Frage in reflektierendeFrage.
- Achte bei reflektierendeFrage darauf, keine Fragen zu wiederholen. Benutze hierzu die Chat Historie aus CHAT_HISTORY.
- Reflektierende Fragen sollen NICHT nach unbekannten Fakten, hypothetischen Szenarien oder Detailwissen fragen.
- Reflektierende Fragen sollen die Haltung, Prioritäten, Werte, Sorgen oder Gewichtung des Nutzers zu der aktuellen Entscheidungsdimension oder -faktor erkunden.
- Extrahiere die relevanten Argumentationen aus den Nutzernachrichten.
- Aktualisiere den Gedächtnisspeicher Memory im Kontext aus CURRENT_CONTEXT_JSON; Überprüfe vorab, ob du einen neuen Punkt im Memory aufmachst, oder zu einem bestehen Punkt etwas ergänzt.
- Verwende die bereitgestellten JSON-Dateien des Kontexts CURRENT_CONTEXT_JSON, der Chat Historie CHAT_HISTORY und der Gesundheitsdaten des Nutzers NUTZER_GESUNDHEITSDATEN als dein Hintergrundwissen.
- Die fiktiven Gesundheitsdaten des Nutzers in NUTZER_GESUNDHEITSDATEN sind für dich sichtbar und du darfst auf sie zugreifen.
- Gib AUSSCHLIESSLICH gültiges JSON zurück.
- WiedergabeAussage ist optional: wenn dem Nutzer dadurch seine Aussage verdeutlicht wird und demnach sinnvoll ist, gib eine kurze Spiegelung der Nutzerhaltung zu einer Entscheidungsdimension (max. 1 Satz); wenn nicht sinnvoll, gib leeren String "" zurück; Wenn der Nutzer etwas fragt, ist es nie sinnvoll.
- Wenn ein Thema bereits besprochen ist in behandelteThemen aus deinem Gedächtnisspeicher, kannst du den Nutzer in WiedergabeAussage auch subtil darauf hinweisen, wenn sinnvoll
- antwortAufFragenOderAufgaben ist optional: wenn der Nutzer eine oder mehrere Fragen oder Aufgaben an dich stellt, MUSST du diese ALLE zuerst in antwortAufFragenOderAufgaben sinnvoll beantworten; wenn der Nutzer dich nicht AKTIV fragt oder auffordert, gib einen leeren String "" zurück;
- Du MUSST dem Nutze immer in antwortAufFragenOderAufgaben auf seine Fragen oder Aufforderungen antworten, damit der Nutzer sich gesehen fühlt von dir
- antwortAufFragenOderAufgaben hat Priorität vor reflektierendeFrage.
- reflektierendeFrage wird IMMER zusätzlich gestellt.
- Für antwortAufFragenOderAufgaben gib generelle und neutrale Informationen aus dem Kontext CURRENT_CONTEXT_JSON, dem Consent CURRENT_CONTEXT_JSON, den Gesundheitsdaten des Nutzers NUTZER_GESUNDHEITSDATEN und allgemeinem Wissen wieder. Halte dich kurz und stelle KEINE Fragen.
- Du darfst Informationen für antwortAufFragenOderAufgaben interpretieren oder mit eigenem Wissen erklären.
- Wenn der Nutzer Details zu dem Consent wissen möchte, die du nicht kennst, musst du dem Nutzer mitteilen, dass der Consent fiktiv ist und vereinfacht ist für Forschungszwecke.
- Wenn die Nutzerfrage direkte Empfehlungen zu Entscheidung von dir verlangt, MUSST du exakt schreiben:
"Ich kann dir keine direkten Empfehlungen geben, da mir dazu nicht gemacht bin."
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
  "antwortAufFragenOderAufgaben": "string"
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
    const ehrs = loadEHR();

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

NUTZER_GESUNDHEITSDATEN:
${JSON.stringify(ehrs, null, 2)}

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
              antwortAufFragenOderAufgaben: {
                type: "string"
              }
            },
            required: [
              "behandelteThemen",
              "nutzerIntentionen",
              "konversationZusammenfassung",
              "reflektierendeFrage",
              "wiedergabeAussage",
              "antwortAufFragenOderAufgaben"
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

    if (update.antwortAufFragenOderAufgaben) {
      replyParts.push(update.antwortAufFragenOderAufgaben);
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

      1. Analysiere den Kontext und finde relevante Dimensionen oder Faktoren (max. 3) für die Entscheidung, die noch OFFEN sind oder mehr besprochen werden müssen.
      3. Erstelle zu jedem Thema genau EINE neutrale reflektierende Frage im Stil von Forward Reasoning. Achte bei der reflektierenden Fragen darauf NICHT nach unbekannten Fakten, hypothetischen Szenarien oder Detailwissen zu fragen, sondern nach der Haltung, Prioritäten, Werte, Sorgen oder Gewichtung des Nutzers zu der aktuellen Entscheidungsdimension oder -faktor.
      5. Wiederhole keine bereits ausführlich behandelten Themen, die unter behandelteThemen den Status "besprochen" haben.
      6. Gib NIEMALS Empfehlungen.
      7. Antworte AUSSCHLIESSLICH auf DEUTSCH.
      8. Du dutzt den Nutzer.
      9. Gib ausschließlich gültiges JSON zurück.

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
    console.log(response.output_text);

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