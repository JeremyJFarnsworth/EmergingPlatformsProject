import { pineconeIndex } from "@/data/lib/pinecone";
import { createEmbedding } from "@/data/lib/embeddings";

export async function POST(req: Request) {
  try {
    const { message, hasDocuments } = await req.json();

    let context = "";

    // 1️⃣ If documents exist, retrieve relevant chunks
    if (hasDocuments) {
      const queryEmbedding = await createEmbedding(message);

      const queryResponse = await pineconeIndex.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
      });

      const matches = queryResponse.matches ?? [];

      if (matches.length > 0) {
        context = matches
          .map((m) => m.metadata?.text)
          .filter(Boolean)
          .join("\n\n---\n\n");
      }
    }

    // 2️⃣ Build system prompt
    const systemPrompt = context
      ? `You are a helpful assistant.
Answer the user's question using ONLY the information below.
If the answer is not present, say "I do not know."

Documentation:
${context}`
      : "You are a helpful and knowledgeable assistant.";

    // 3️⃣ Send to LM Studio chat model
    const response = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma-3-4b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error("LLM request failed");
    }

    const data = await response.json();

    return Response.json({
      reply: data.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    return new Response("Chat failed", { status: 500 });
  }
}