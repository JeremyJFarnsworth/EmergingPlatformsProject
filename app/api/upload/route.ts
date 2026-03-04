import { NextResponse } from "next/server";
import { pineconeIndex } from "@/data/lib/pinecone";
import { createEmbedding } from "@/data/lib/embeddings";
import { chunkText } from "@/data/lib/chunking";
import type { PineconeRecord } from "@pinecone-database/pinecone";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1️⃣ Extract text
    let text = "";

    if (file.name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return new NextResponse("Unsupported file type", { status: 400 });
    }

    if (!text.trim()) {
      return new NextResponse("Empty document", { status: 400 });
    }

    // 2️⃣ Chunk text
    const chunks = chunkText(text);

    // 3️⃣ Embed + upsert
    const embeddings = await createEmbedding(chunks);

const vectors = chunks.map((chunk, i) => ({
  id: `${file.name}-${i}`,
  values: embeddings[i],
  metadata: {
    text: chunk,
    source: file.name,
  },
}));

const batchSize = 100;

for (let i = 0; i < vectors.length; i += batchSize) {
  const batch = vectors.slice(i, i + batchSize);

  await pineconeIndex.upsert({
    records: batch,
  });
}

    return NextResponse.json({
      success: true,
      chunks: vectors.length,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}