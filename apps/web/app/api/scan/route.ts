import { scanSite } from "@/lib/scoring";

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return Response.json({ error: "Missing 'url'" }, { status: 400 });
  }

  let normalized: string;
  try {
    normalized = rawUrl.match(/^https?:\/\//) ? rawUrl : `https://${rawUrl}`;
    new URL(normalized);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const result = await scanSite(normalized);
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 500 },
    );
  }
}
