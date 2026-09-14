import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: (messages || []).map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }]
          }))
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(response.status).json({
        error: "Geminiへの接続に失敗したよ。"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AIから返事がなかったよ。";

    res.json({ text });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AIへの接続に失敗したよ。"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});