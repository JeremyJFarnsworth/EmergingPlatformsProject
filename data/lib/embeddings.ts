// lib/embeddings.ts
export async function createEmbedding(text: string): Promise<number[]> {
  const res = await fetch("http://localhost:1234/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "text-embedding-nomic-embed-text-v1.5", 
      input: text,
    }),
  });

  if (!res.ok) {
    throw new Error("Embedding failed");
  }

  const data = await res.json();
  return data.data[0].embedding;
}