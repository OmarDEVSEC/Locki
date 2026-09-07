"use client";

import { useState } from "react";
import type { ScanResult } from "@/lib/types";

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

export function RatingPanel({ result }: { result: ScanResult }) {
  const [reported, setReported] = useState(false);

  return (
    <div className="rating-panel-enter mt-3 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg">
      <p className="text-lg font-bold text-zinc-900">{HEADLINE[result.rating]}</p>
      {result.overrideApplied && (
        <p className="mt-1 text-xs font-medium text-red-700">
          Forced high risk: 3+ verified scam reports.
        </p>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Terms of Service
        </p>
        {result.tos.redFlags.length > 0 ? (
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {result.tos.redFlags.slice(0, 3).map((flag, i) => (
              <li key={i}>{flag.text}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-zinc-700">{tosSummaryLine(result)}</p>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Community reports
        </p>
        <p className="mt-1 text-sm text-zinc-700">{communitySummary(result)}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Technical security
        </p>
        <p className="mt-1 text-sm text-zinc-700">
          {result.security.signals.https ? "HTTPS enabled" : "No HTTPS"} ·{" "}
          {result.security.signals.hasCSP ? "CSP present" : "Missing CSP"} ·{" "}
          {result.security.signals.exposedPaths.length > 0
            ? "Exposed sensitive paths found"
            : "No exposed paths found"}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setReported(true)}
        disabled={reported}
        className="mt-5 w-full rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white disabled:bg-zinc-400"
      >
        {reported ? "Report submitted — thank you" : "Report this site"}
      </button>
    </div>
  );
}
