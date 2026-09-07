import Anthropic from "@anthropic-ai/sdk";
import type { TosResult, TosSeverity } from "@/lib/types";

const FETCH_TIMEOUT_MS = 8000;
const SEVERITY_PENALTY: Record<TosSeverity, number> = {
  minor: 5,
  moderate: 15,
  major: 30,
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

async function findTosUrl(origin: string): Promise<string | null> {
  try {
    const res = await withTimeout(fetch(origin), FETCH_TIMEOUT_MS);
    const html = await res.text();
    const linkPattern =
      /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    const keywords = /terms|tos|privacy/i;
    let match: RegExpExecArray | null;
    while ((match = linkPattern.exec(html))) {
      const [, href, label] = match;
      if (keywords.test(href) || keywords.test(label)) {
        return new URL(href, origin).toString();
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchTextContent(url: string): Promise<string | null> {
  try {
    const res = await withTimeout(fetch(url), FETCH_TIMEOUT_MS);
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 15000);
  } catch {
    return null;
  }
}

interface ClassifiedFlag {
  text: string;
  severity: TosSeverity;
}

async function classifyWithClaude(text: string): Promise<ClassifiedFlag[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are analyzing a Terms of Service / Privacy Policy document for risky clauses that a non-technical, potentially elderly user should be warned about (e.g. data sharing with third parties, mandatory arbitration, auto-renewal traps, broad liability waivers, vague cancellation terms).

Respond with ONLY a JSON array (no prose, no markdown fences) of objects: {"text": "<one plain-language sentence describing the flag>", "severity": "minor"|"moderate"|"major"}. Return at most 5 items, ordered most severe first. If there is nothing concerning, return [].

Document:
"""
${text}
"""`,
      },
    ],
  });

  const block = message.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") return [];
  try {
    const jsonMatch = block.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (f) =>
          f &&
          typeof f.text === "string" &&
          ["minor", "moderate", "major"].includes(f.severity),
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function scoreTos(rawUrl: string): Promise<TosResult> {
  const origin = new URL(rawUrl).origin;
  const tosUrl = await findTosUrl(origin);

  if (!tosUrl) {
    return { status: "not_found", score: null, redFlags: [] };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { status: "unavailable", score: null, redFlags: [], url: tosUrl };
  }

  const text = await fetchTextContent(tosUrl);
  if (!text) {
    return { status: "unavailable", score: null, redFlags: [], url: tosUrl };
  }

  const redFlags = await classifyWithClaude(text);
  const penalty = redFlags.reduce(
    (sum, f) => sum + SEVERITY_PENALTY[f.severity],
    0,
  );
  const score = Math.max(0, 100 - penalty);

  return { status: "analyzed", score, redFlags, url: tosUrl };
}
