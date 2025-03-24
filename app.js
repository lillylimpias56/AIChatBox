const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/chat", async (req, res) => {
  const userInput = req.body.message;
  const isSensitive = /\b(ssn|password|passcode|credit card|social security|secret)\b/i.test(userInput);

  try {
    let responseText;
    let source;

    if (isSensitive) {
      responseText = "⚠️ I'm unable to process sensitive personal information for your safety.";
      source = "Private Cloud (Local)";
      console.log(`[PRIVATE CLOUD] Handled sensitive input.`);
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userInput }],
      });

      responseText = response.choices[0].message.content.trim();
      source = "Public Cloud (OpenAI)";
      console.log(`[PUBLIC CLOUD] Response from OpenAI.`);
    }

    res.json({ response: `${responseText}\n\n💬 Source: ${source}` });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Chatbot error" });
  }
});

app.listen(4000, 'localhost', () => {
  console.log('✅ Server is running on http://localhost:4000');
});
