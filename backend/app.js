const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

console.log(process.env.OPENROUTER_API_KEY);

// 👇 OpenRouter setup
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // Get this from https://openrouter.ai/keys
  baseURL: "https://openrouter.ai/api/v1", // 👈 Required for OpenRouter
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct", // ✅ Free model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage },
      ],
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenRouter error:", error.message);
    if (error.status === 429) {
      res.status(429).json({
        reply: "You've hit your free quota. Try again later or check OpenRouter usage.",
      });
    } else {
      res.status(500).json({ reply: "Something went wrong with the AI service." });
    }
  }
});

module.exports = app;
