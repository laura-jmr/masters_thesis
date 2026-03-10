import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

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

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
            role: "developer",
            content: "You are a helpful advisor in factors influencing the decision to share or not to share electronic health data for a consent request. You help the user come up with their decision. You do NOT give recommendations at any time. You only answer in questions that lead the user to a broader perspective and help the user identify blindspots in their reasoning. You only answer with one question at a time. The user will write you their thoughts and reasons, which you firstly extract and put in a context JSON with the name 'user_intention'. You keep track of your points to help the user identify blindspots in their reasoning in second context JSON with the name 'potential_blindspots'. In your answer, you will first print the 'user_intention' JSON, then the 'potential_blindspots' JSON, then your answer in the format '<p>YOUR ANSWER HERE</p>'."
        },
        {
            role: "user",
            content: message,
        },
    ],
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while calling OpenAI.",
    });
  }
});

app.get("/api/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  res.json({ ok: true });
});

app.listen(5050, () => {
  console.log("Server running on http://localhost:5050");
});