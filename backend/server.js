import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const contextPath = path.resolve("./context.json");

function loadContext() {
  return JSON.parse(fs.readFileSync(contextPath, "utf-8"));
}

function saveContext(context) {
  fs.writeFileSync(contextPath, JSON.stringify(context, null, 2), "utf-8");
}

function validateChatUpdate(update) {
  return (
    update &&
    Array.isArray(update.treatedTopics) &&
    Array.isArray(update.userIntention) &&
    Array.isArray(update.potentialBlindspots) &&
    Array.isArray(update.conversationSummary) &&
    typeof update.assistantQuestion === "string"
  );
}

function mergeContext(oldContext, update) {
  return {
    ...oldContext,
    memory: {
      treatedTopics: [
        ...(oldContext.memory?.treatedTopics || []),
        ...(update.treatedTopics || [])
      ],
      userIntention: [
        ...(oldContext.memory?.userIntention || []),
        ...(update.userIntention || [])
      ],
      potentialBlindspots: [
        ...(oldContext.memory?.potentialBlindspots || []),
        ...(update.potentialBlindspots || [])
      ],
      conversationSummary: [
        ...(oldContext.memory?.conversationSummary || []),
        ...(update.conversationSummary || [])
      ]
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
- Aktualisiere den Gedächtnisspeicher.
- Verwende NUR die bereitgestellte JSON-Datei als Gedächstnispeicher.
- Gib AUSSCHLIESSLICH gültiges JSON zurück.
- Du antwortest auf DEUTSCH.

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
  "reflektierendeFrage": "string"
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
              treatedTopics: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    topic: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["discussed", "open", "needs_followup"]
                    },
                    evidence: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["topic", "status", "evidence"]
                }
              },
              userIntention: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    statement: { type: "string" },
                    source_message: { type: "string" }
                  },
                  required: ["statement", "source_message"]
                }
              },
              potentialBlindspots: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    topic: { type: "string" },
                    reason: { type: "string" }
                  },
                  required: ["topic", "reason"]
                }
              },
              conversationSummary: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    topic: { type: "string" },
                    points: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["topic", "points"]
                }
              },
              assistantQuestion: {
                type: "string"
              }
            },
            required: [
              "treatedTopics",
              "userIntention",
              "potentialBlindspots",
              "conversationSummary",
              "assistantQuestion"
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

    res.json({
      reply: update.assistantQuestion,
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
      Du erstellst eine strukturierte Zusammenfassung der Konversation.
      Verwende ausschließlich die bereitgestellte JSON-Datei.
      Erfinde keine neuen Themen oder Punkte.
      Gib NUR gültiges JSON in diesem Format zurück:
  {
    "thema": [
      {
        "thema": "string",
        "punkt": ["string"]
      }
    ]
  }
  `,
      input: [
        {
          role: "user",
          content: `CURRENT_CONTEXT_JSON:\n${JSON.stringify(context, null, 2)}`
        }
      ]
    });

    const summary = JSON.parse(response.output_text);

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
- Verwende AUSSCHLIESSLICH die bereitgestellte JSON-Datei als Kontext
- Gliedere die Zusammenfassung nach Themen.
- Erfinde nichts, was nicht im Kontext steht.
- Gib keine Empfehlungen ab.
- Gib AUSSCHLIESSLICH gültiges JSON zurück.
- Du antwortest auf DEUTSCH.

Gib dieses Format zurück:
{
  "typ": "summary",
  "themen": [
    {
      "thema": "string",
      "punkt": ["string"]
    }
  ],
  "gesamteZusammenfassung": "string"
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

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while generating the flashlight question."
    });
  }
});

app.listen(5050, () => {
  console.log("Server running on http://localhost:5050");
});