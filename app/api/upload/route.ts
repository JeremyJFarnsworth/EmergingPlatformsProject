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
    const vectors: PineconeRecord[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await createEmbedding(chunks[i]);

      vectors.push({
        id: `${file.name}-${i}`,
        values: embedding,
        metadata: {
          text: chunks[i],
          source: file.name,
        },
      });
    }

    await pineconeIndex.upsert({
      records: vectors,
});

    return NextResponse.json({
      success: true,
      chunks: vectors.length,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}