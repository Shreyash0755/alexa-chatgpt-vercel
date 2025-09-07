export default async function handler(req, res) {
  if (req.method === "POST") {
    const alexaRequest = req.body;

    // Get user input
    const userText =
      alexaRequest.request?.intent?.slots?.question?.value || "Say hello";

    // Send request to ChatGPT
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful Alexa assistant." },
          { role: "user", content: userText },
        ],
        max_tokens: 150,
      }),
    });

    const data = await aiRes.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't get a response.";

    // Send back Alexa response
    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: reply,
        },
        shouldEndSession: false,
      },
    });
  } else {
    res.status(200).json({ ok: true });
  }
}

