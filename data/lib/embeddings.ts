export async function createEmbedding(texts: string[]): Promise<number[][]> {
  const res = await fetch("http://localhost:1234/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "text-embedding-nomic-embed-text-v1.5",
      input: texts,
    }),
  });

  const data = await res.json();
  return data.data.map((d: any) => d.embedding);
}