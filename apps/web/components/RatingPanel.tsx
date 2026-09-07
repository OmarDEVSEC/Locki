"use client";

import { useState } from "react";
import type { ScanResult } from "@/lib/types";
import { LockIcon } from "@/components/LockIcon";

const HEADLINE: Record<ScanResult["rating"], string> = {
  trustworthy: "🟢 Looks trustworthy",
  caution: "🟡 Proceed with caution",
  high_risk: "🔴 High risk",
};

function communitySummary(result: ScanResult): string {
  const { reports } = result.community;
  if (reports.length === 0) return "No community reports yet for this site.";
  const counts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {});
  const [topCategory, topCount] = Object.entries(counts).sort(
    (a, b) => b[1] - a[1],
  )[0];
  return `${reports.length} user${reports.length === 1 ? "" : "s"} reported issues here — most commonly "${topCategory}" (${topCount}).`;
}

function tosSummaryLine(result: ScanResult): string {
  if (result.tos.status === "not_found") {
    return "No Terms of Service found — treated as unknown, not automatically safe.";
  }
  if (result.tos.status === "unavailable") {
    return "Terms of Service found but not yet analyzed (no analysis key configured).";
  }
  if (result.tos.redFlags.length === 0) {
    return "No major red flags found in the Terms of Service.";
  }
  return "";
}

// Each section gets its own bounded card (Law of Common Region) with
// consistent internal spacing (Law of Proximity), so the three signal
// types read as distinct groups instead of one undifferentiated block.
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <div className="mt-1 text-sm text-zinc-700">{children}</div>
    </div>
  );
}

export function RatingPanel({ result }: { result: ScanResult }) {
  const [reported, setReported] = useState(false);

  return (
    <div className="rating-panel-enter mt-3 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg">
      {/* Headline is the one thing a rushed reader needs — kept largest
          and first (Pareto Principle, Serial Position Effect). The larger
          face here is the "peak" moment of the whole interaction. */}
      <div className="flex items-center justify-center gap-3">
        <LockIcon rating={result.rating} open size={44} />
        <p className="text-xl font-bold leading-snug text-zinc-900">
          {HEADLINE[result.rating]}
        </p>
      </div>
      {result.overrideApplied && (
        <p className="mt-1 text-xs font-medium text-red-700">
          Forced high risk: 3+ verified scam reports.
        </p>
      )}

      <Section label="Terms of Service">
        {result.tos.redFlags.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5">
            {result.tos.redFlags.slice(0, 3).map((flag, i) => (
              <li key={i}>{flag.text}</li>
            ))}
          </ul>
        ) : (
          tosSummaryLine(result)
        )}
      </Section>

      <Section label="Community reports">{communitySummary(result)}</Section>

      <Section label="Technical security">
        {result.security.signals.https ? "HTTPS enabled" : "No HTTPS"} ·{" "}
        {result.security.signals.hasCSP ? "CSP present" : "Missing CSP"} ·{" "}
        {result.security.signals.exposedPaths.length > 0
          ? "Exposed sensitive paths found"
          : "No exposed paths found"}
      </Section>

      <button
        type="button"
        onClick={() => setReported(true)}
        disabled={reported}
        className="mt-5 h-11 w-full rounded-lg bg-zinc-900 text-sm font-semibold text-white transition-colors disabled:bg-zinc-400"
      >
        {reported ? "✓ Report submitted — thank you" : "Report this site"}
      </button>
    </div>
  );
}
