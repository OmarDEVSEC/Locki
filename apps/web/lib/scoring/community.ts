import { getReportsForDomain } from "@/lib/db";
import type { CommunityResult, ReportCategory } from "@/lib/types";

const SEVERITY_WEIGHT: Record<ReportCategory, number> = {
  scam: 25,
  "data-misuse": 20,
  "non-delivery": 15,
  billing: 10,
  other: 5,
};

const RECENT_MS = 1000 * 60 * 60 * 24 * 180; // 6 months

export function scoreCommunity(domain: string): CommunityResult {
  const reports = getReportsForDomain(domain);
  const verified = reports.filter((r) => r.status === "verified");

  const now = Date.now();
  const weightedSum = verified.reduce((sum, r) => {
    const age = now - new Date(r.submittedAt).getTime();
    const recencyFactor = age > RECENT_MS ? 0.5 : 1;
    return sum + SEVERITY_WEIGHT[r.category] * recencyFactor;
  }, 0);

  const score = Math.max(0, Math.round(100 - weightedSum));
  const verifiedScamCount = verified.filter((r) => r.category === "scam").length;

  return { score, reports, verifiedScamCount };
}
