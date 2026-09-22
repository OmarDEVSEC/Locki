"use client";

import { useState } from "react";
import type { ScanResult, Rating } from "@/lib/types";
import { LockIcon } from "@/components/LockIcon";
import type { CharacterId } from "@/lib/characters";

export const RATING_HEADLINE: Record<Rating, string> = {
  trustworthy: "Light side confirmed",
  caution: "Disturbance detected",
  high_risk: "Fallen to the dark side",
};

interface RatingColors {
  txt: string;
  ring: string;
  glowClass: string;
}

const RATING_COLORS: Record<Rating, RatingColors> = {
  trustworthy: { txt: "#38BDF8", ring: "#38BDF8", glowClass: "glow-text-jedi" },
  caution: { txt: "#FBBF24", ring: "#FBBF24", glowClass: "glow-text-caution" },
  high_risk: { txt: "#EF4444", ring: "#EF4444", glowClass: "glow-text-sith" },
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
  return "No major red flags found in the Terms of Service.";
}

// Each section gets its own bounded region (Law of Common Region) with a
// consistent label style, so the signal types read as distinct groups
// instead of one undifferentiated block.
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4" style={{ borderTop: "1px solid var(--color-border)" }}>
      <p
        className="mb-1 font-bold uppercase tracking-widest text-muted"
        style={{ fontSize: "0.6rem", letterSpacing: "0.1em" }}
      >
        {label}
      </p>
      <div className="text-sm font-semibold text-ink">{children}</div>
    </div>
  );
}

export function RatingPanel({
  result,
  character,
  onReset,
}: {
  result: ScanResult;
  character: CharacterId;
  onReset: () => void;
}) {
  const [reported, setReported] = useState(false);
  const colors = RATING_COLORS[result.rating];

  return (
    <div
      key={`${result.domain}-${result.scannedAt}`}
      className="result-card-enter w-full overflow-hidden rounded-3xl bg-panel"
      style={{ border: `1.5px solid ${colors.ring}`, boxShadow: `0 0 28px ${colors.ring}22` }}
    >
      {/* Score + mascot header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <p
            className="mb-1 font-bold uppercase tracking-widest"
            style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: colors.txt }}
          >
            Trust Score
          </p>
          <p
            className={`font-display leading-none ${colors.glowClass}`}
            style={{ fontSize: "4.2rem", fontWeight: 700, color: colors.txt }}
          >
            {result.overall}
          </p>
          <p className="mt-1 font-bold" style={{ fontSize: "1rem", color: colors.txt }}>
            {RATING_HEADLINE[result.rating]}
          </p>
          <div
            className="mt-3"
            style={{ width: 148, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}
          >
            <div
              style={{
                height: "100%",
                width: `${result.overall}%`,
                background: colors.txt,
                borderRadius: 3,
                boxShadow: `0 0 8px ${colors.ring}`,
                transition: "width 0.9s ease-out",
              }}
            />
          </div>
          {result.overrideApplied && (
            <p className="mt-2 text-xs font-medium" style={{ color: colors.txt }}>
              Forced high risk: 3+ verified scam reports.
            </p>
          )}
        </div>
        <LockIcon character={character} rating={result.rating} open size={90} />
      </div>

      {/* ToS red flags */}
      {result.tos.redFlags.length > 0 ? (
        <Section label="Terms of Service — Red Flags">
          <ul className="flex flex-col gap-2.5">
            {result.tos.redFlags.slice(0, 3).map((flag, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span style={{ color: colors.txt, fontSize: "1rem", lineHeight: 1.45, flexShrink: 0 }}>
                  ⚠
                </span>
                <span className="leading-snug font-semibold text-ink">{flag.text}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        <Section label="Terms of Service">{tosSummaryLine(result)}</Section>
      )}

      <Section label="Community Reports">👥 {communitySummary(result)}</Section>

      <Section label="Technical Security">
        {result.security.signals.https ? "HTTPS enabled" : "No HTTPS"} ·{" "}
        {result.security.signals.hasCSP ? "CSP present" : "Missing CSP"} ·{" "}
        {result.security.signals.exposedPaths.length > 0
          ? "Exposed sensitive paths found"
          : "No exposed paths found"}
      </Section>

      {/* Action buttons */}
      <div
        className="flex flex-wrap gap-3 px-6 pb-6"
        style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}
      >
        <button
          type="button"
          onClick={() => setReported(true)}
          disabled={reported}
          className="font-display rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-void transition-all hover:brightness-90 active:scale-95 disabled:opacity-50"
        >
          {reported ? "✓ Reported — thank you" : "🚩 Report this site"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border-2 border-border bg-transparent px-5 py-2.5 text-sm font-bold text-muted transition-all hover:border-ink hover:text-ink active:scale-95"
        >
          ← Check another
        </button>
      </div>
    </div>
  );
}
