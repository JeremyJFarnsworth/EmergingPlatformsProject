import fs from "fs";
import path from "path";

function loadDocuments(): string {
  try {
    const filePath = path.join(process.cwd(), "data", "documents.json");
    if (!fs.existsSync(filePath)) return "";
    const docs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return docs.map((d: any) => d.content).join("\n\n---\n\n");
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const { message, hasDocuments } = await req.json();

    const docsContext = hasDocuments ? loadDocuments() : "";


  const systemPrompt = hasDocuments
    ? `You are a helpful assistant answering based ONLY on the documentation below.
    If the answer is not contained in the documentation, say "I do not know."

Documentation:
${docsContext}`
  : "You are a helpful and knowledgeable assistant.";

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
