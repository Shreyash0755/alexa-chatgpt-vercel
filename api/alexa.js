export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  const respond = (text, end = false) =>
    new Response(
      JSON.stringify({
        version: "1.0",
        response: {
          outputSpeech: { type: "PlainText", text },
          shouldEndSession: end,
          reprompt: end
            ? undefined
            : { outputSpeech: { type: "PlainText", text: "Ask another question." } },
        },
      }),
      { headers: { "content-type": "application/json" } }
    );

  try {
    const body = await req.json();

    if (body?.request?.type === "LaunchRequest") {
      return respond("Hi! Ask me anything, for example: what is a black hole?");
    }

    const userText =
      body?.request?.intent?.slots?.question?.value ||
      body?.request?.intent?.slots?.Query?.value ||
      "";

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a concise voice assistant. Keep answers to 2–3 sentences.",
          },
          { role: "user", content: userText || "Say hello" },
        ],
        max_tokens: 180,
        temperature: 0.7,
      }),
    });

    const data = await aiRes.json();
    let answer = data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't find an answer.";

    if (answer.length > 750) answer = answer.slice(0, 747) + "...";
    return respond(answer);
  } catch (e) {
    return respond("Sorry, something went wrong talking to ChatGPT.", true);
  }
}
