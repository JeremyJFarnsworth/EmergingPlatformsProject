import { NextResponse } from "next/server";
import { pineconeIndex } from "@/data/lib/pinecone";
import { createEmbedding } from "@/data/lib/embeddings";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return new NextResponse("Missing message", { status: 400 });
    }

    // 1️⃣ Embed the user query
    const queryEmbedding = await createEmbedding(message);

    // 2️⃣ Retrieve relevant chunks from Pinecone
    const results = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    const context = results.matches
      .map((match) => match.metadata?.text)
      .filter(Boolean)
      .join("\n\n---\n\n");

    // 3️⃣ Build system prompt
    const systemPrompt = `
You are a helpful assistant.
Answer ONLY using the context below.
If the answer is not contained in the context, say "I do not know."

Context:
${context}
`;

    // 4️⃣ Call LM Studio
    const response = await fetch(
      "http://localhost:1234/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma-3b", // your chat model
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("LM Studio error");
    }

    const data = await response.json();

    return NextResponse.json({
      reply: data.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Chat failed", { status: 500 });
  }
}