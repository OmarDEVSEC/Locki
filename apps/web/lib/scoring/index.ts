import { scoreSecurity } from "@/lib/scoring/security";
import { scoreTos } from "@/lib/scoring/tos";
import { scoreCommunity } from "@/lib/scoring/community";
import { getCachedScan, setCachedScan } from "@/lib/db";
import type { Rating, ScanResult } from "@/lib/types";

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function bucketRating(overall: number): Rating {
  if (overall >= 80) return "trustworthy";
  if (overall >= 50) return "caution";
  return "high_risk";
}

export async function scanSite(rawUrl: string): Promise<ScanResult> {
  const url = rawUrl.match(/^https?:\/\//) ? rawUrl : `https://${rawUrl}`;
  const domain = new URL(url).hostname;

  const cached = getCachedScan(domain, CACHE_TTL_MS);
  if (cached) return cached as ScanResult;

  const [security, tos, community] = await Promise.all([
    scoreSecurity(url),
    scoreTos(url),
    Promise.resolve(scoreCommunity(domain)),
  ]);

  // Blend only over sub-scores backed by real data (design §3, §7). Unknown
  // ToS and unreachable sites are "unknown", never scored as 0 or as safe;
  // with no community reports (v1) community is held out, not counted as 100.
  const parts: Array<{ key: "security" | "tos" | "community"; score: number; weight: number }> = [];
  const excluded: Array<"security" | "tos" | "community"> = [];
  if (security.unreachable) excluded.push("security");
  else parts.push({ key: "security", score: security.score, weight: 0.35 });
  if (tos.score === null) excluded.push("tos");
  else parts.push({ key: "tos", score: tos.score, weight: 0.35 });
  if (community.reports.length === 0) excluded.push("community");
  else parts.push({ key: "community", score: community.score, weight: 0.3 });

  const totalWeight = parts.reduce((n, p) => n + p.weight, 0);
  const overall =
    totalWeight === 0
      ? 0
      : Math.round(parts.reduce((n, p) => n + p.score * p.weight, 0) / totalWeight);

  const overrideApplied = community.verifiedScamCount >= 3;
  let rating: Rating = overrideApplied ? "high_risk" : bucketRating(overall);
  // Verified community reports are real evidence, so they alone are enough
  // to rate a site (e.g. a scam domain that's already offline).
  const confidence: ScanResult["confidence"] =
    parts.length === 0
      ? "insufficient"
      : excluded.includes("tos") || excluded.includes("security")
        ? "partial"
        : "full";
  // Without ToS (or any data) we can't vouch for a site: never "trustworthy".
  if (!overrideApplied && confidence !== "full" && rating === "trustworthy") {
    rating = "caution";
  }
  if (!overrideApplied && confidence === "insufficient") rating = "caution";

  const result: ScanResult = {
    domain,
    scannedAt: new Date().toISOString(),
    security,
    tos,
    community,
    overall,
    rating,
    overrideApplied,
    confidence,
    excluded,
  };

  setCachedScan(domain, result);
  return result;
}
