import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const text = await file.text();

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "documents.json");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    let documents = [];
    if (fs.existsSync(filePath)) {
      documents = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    documents.push({
      id: crypto.randomUUID(),
      filename: file.name,
      content: text,
    });

    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

    return Response.json({ success: true });
  } catch {
    return new Response("Upload failed", { status: 500 });
  }
}
