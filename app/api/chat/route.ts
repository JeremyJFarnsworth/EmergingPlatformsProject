export async function POST(req: Request) {
  try {
    const { message, hasDocuments } = await req.json();

    const systemPrompt = hasDocuments
      ? "You are a helpful assistant answering based on provided documentation. If the documentation does not contain the answer, say you do not know."
      : "You are a helpful and knowledgeable assistant. Answer the user's question clearly and accurately.";

    const response = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma-3b",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error("LM Studio error");
    }

    const data = await response.json();

    return Response.json({
      reply: data.choices[0].message.content,
    });
  } catch (error) {
    return new Response("Error communicating with LM Studio", {
      status: 500,
    });
  }
}
