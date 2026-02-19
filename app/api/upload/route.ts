export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Uploaded file:", file.name);
    console.log("File size:", buffer.length);

    // TODO: Process file for embeddings / vector storage

    return Response.json({ success: true });
  } catch (error) {
    return new Response("Upload failed", { status: 500 });
  }
}
