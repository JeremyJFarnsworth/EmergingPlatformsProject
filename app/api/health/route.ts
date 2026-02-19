export async function GET() {
  try {
    const res = await fetch("http://localhost:1234/v1/models");

    if (!res.ok) {
      throw new Error("LM Studio not responding");
    }

    return Response.json({ status: "connected" });
  } catch {
    return new Response("Not connected", { status: 500 });
  }
}
