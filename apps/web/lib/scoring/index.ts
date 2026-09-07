import { scoreSecurity } from "@/lib/scoring/security";
import { scoreTos } from "@/lib/scoring/tos";
import { scoreCommunity } from "@/lib/scoring/community";
import { getCachedScan, setCachedScan } from "@/lib/db";
import type { Rating, ScanResult } from "@/lib/types";

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Unknown ToS is never treated as automatically safe — it contributes a
// caution-level midpoint rather than being dropped from the blend.
const UNKNOWN_TOS_CONTRIBUTION = 50;

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

  const tosContribution = tos.score ?? UNKNOWN_TOS_CONTRIBUTION;
  const overall = Math.round(
    security.score * 0.35 + tosContribution * 0.35 + community.score * 0.3,
  );

  const overrideApplied = community.verifiedScamCount >= 3;
  const rating: Rating = overrideApplied ? "high_risk" : bucketRating(overall);

  const result: ScanResult = {
    domain,
    scannedAt: new Date().toISOString(),
    security,
    tos,
    community,
    overall,
    rating,
    overrideApplied,
  };

  setCachedScan(domain, result);
  return result;
}
