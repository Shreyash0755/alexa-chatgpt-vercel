export default async function handler(req, res) {
  if (req.method === "POST") {
    const alexaRequest = req.body;

    // Handle LaunchRequest (when user says: "open chat assistant")
    if (alexaRequest.request?.type === "LaunchRequest") {
      return res.json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "Hello! I’m your Chat Assistant. You can ask me anything, like 'what is AI?'",
          },
          shouldEndSession: false,
        },
      });
    }

    // Handle IntentRequest (when user asks a question)
    if (alexaRequest.request?.type === "IntentRequest") {
      const userText =
        alexaRequest.request.intent?.slots?.question?.value || "Say hello";

      // Call ChatGPT
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

      return res.json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: reply,
          },
          shouldEndSession: false,
        },
      });
    }

    // Default fallback
    return res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Sorry, I didn’t understand that.",
        },
        shouldEndSession: false,
      },
    });
  } else {
    res.status(200).json({ ok: true });
  }
}


