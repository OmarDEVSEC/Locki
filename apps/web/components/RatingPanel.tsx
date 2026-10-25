"use client";

import { useState } from "react";
import type { ScanResult, Rating, ReportCategory } from "@/lib/types";
import { LockIcon } from "@/components/LockIcon";

export const RATING_HEADLINE: Record<Rating, string> = {
  trustworthy: "Looks safe",
  caution: "Some warning signs. Take care.",
  high_risk: "High risk. Be careful.",
};

const RATING_LABEL: Record<Rating, string> = {
  trustworthy: "Safe",
  caution: "Caution",
  high_risk: "High risk",
};

// Distinct shape per state so color is never the only signal.
function RatingShape({ rating }: { rating: Rating | "idle" }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (rating === "idle") {
    // Dashed circle with a question mark: "unknown", distinct from the other three.
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" strokeDasharray="3 3.5" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.5" />
      </svg>
    );
  }
  if (rating === "trustworthy") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M7.5 12.5l3 3 6-7" />
      </svg>
    );
  }
  if (rating === "caution") {
    return (
      <svg {...common}>
        <path d="M12 3L22 20H2z" />
        <path d="M12 10v4M12 17v.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

function communitySummary(result: ScanResult): string {
  const { reports } = result.community;
  if (reports.length === 0) return "No one has reported problems with this site yet.";
  const counts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {});
  const [topCategory] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const who = reports.length === 1 ? "1 person" : `${reports.length} people`;
  return `${who} reported problems here, most often ${REPORT_LABEL[topCategory as ReportCategory]}.`;
}

const REPORT_LABEL: Record<ReportCategory, string> = {
  scam: "a scam",
  billing: "billing problems",
  "non-delivery": "orders that never arrived",
  "data-misuse": "misuse of personal details",
  other: "other problems",
};

function tosSummaryLine(result: ScanResult): string {
  if (result.tos.status === "not_found") {
    return "We could not find the Terms of Service, so we can't say they are safe.";
  }
  if (result.tos.status === "unavailable") {
    return "Terms of Service found but not checked yet.";
  }
  return "No major warning signs found in the Terms of Service.";
}

type FindingKind = "good" | "problem" | "serious" | "unknown";

const FINDING_STATE: Record<FindingKind, Rating | "idle"> = {
  good: "trustworthy",
  problem: "caution",
  serious: "high_risk",
  unknown: "caution",
};

const FINDING_PREFIX: Record<FindingKind, string> = {
  good: "Good: ",
  problem: "Problem: ",
  serious: "Serious problem: ",
  unknown: "Unknown: ",
};

// One checklist row: shape + color + text, with a screen-reader prefix.
// Unknown reuses the caution color but a distinct (dashed question) shape.
function Finding({ kind, children }: { kind: FindingKind; children: React.ReactNode }) {
  return (
    <li className="finding" data-state={FINDING_STATE[kind]}>
      <span className="finding-icon">
        <RatingShape rating={kind === "unknown" ? "idle" : FINDING_STATE[kind]} />
      </span>
      <span>
        <span className="sr-only">{FINDING_PREFIX[kind]}</span>
        {children}
      </span>
    </li>
  );
}

function securityFindings(signals: ScanResult["security"]["signals"]) {
  const items: { kind: FindingKind; text: string }[] = [
    signals.https
      ? { kind: "good", text: "Uses a secure connection (HTTPS)" }
      : { kind: "serious", text: "No secure connection (HTTPS)" },
    signals.hasCSP
      ? { kind: "good", text: "Has a common safety setting (CSP)" }
      : { kind: "problem", text: "Missing a common safety setting (CSP)" },
    signals.exposedPaths.length > 0
      ? { kind: "serious", text: "Sensitive files may be exposed" }
      : { kind: "good", text: "No exposed sensitive files found" },
  ];
  // Problems first; Array.sort is stable so order is otherwise preserved.
  const rank = (k: FindingKind) => (k === "good" ? 1 : 0);
  return items.sort((a, b) => rank(a.kind) - rank(b.kind));
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t-2 border-border px-5 py-4">
      <h3 className="mb-1 text-sm font-bold text-fg-muted">{label}</h3>
      <div className="text-base text-fg">{children}</div>
    </section>
  );
}

// Explains, in one line, what a partial score is based on and why it is capped.
function partialNote(result: ScanResult): string {
  const excluded = result.excluded ?? [];
  const noSecurity = result.security.unreachable || excluded.includes("security");
  const noTos = excluded.includes("tos");
  // On a high-risk verdict, "can't call it fully safe" is beside the point.
  if (result.rating === "high_risk") {
    return noSecurity && noTos
      ? "Based on reports from people who used this site."
      : "Based on the checks we could run.";
  }
  if (noSecurity && !noTos) {
    return "Based on the Terms of Service only. We couldn't reach the site to check its security, so we can't call it fully safe.";
  }
  if (noTos && !noSecurity) {
    const why =
      result.tos.status === "unavailable"
        ? "we couldn't read its Terms of Service"
        : "we couldn't find Terms of Service";
    return `Based on security checks only. ${why[0].toUpperCase()}${why.slice(1)}, so we can't call it fully safe.`;
  }
  return "Based on only part of our checks, so we can't call it fully safe.";
}

export function RatingPanel({
  result,
  onReset,
}: {
  result: ScanResult;
  onReset: () => void;
}) {
  const [reported, setReported] = useState(false);
  const { signals } = result.security;
  const excluded = result.excluded ?? [];
  const confidence = result.confidence ?? "full";
  const insufficient = confidence === "insufficient";
  const partial = confidence === "partial";
  const unreachable = !!result.security.unreachable;
  const state: Rating | "idle" = insufficient ? "idle" : result.rating;
  const showCommunity = !excluded.includes("community");
  const showSecurity = !excluded.includes("security") || unreachable;

  return (
    <div
      key={`${result.domain}-${result.scannedAt}`}
      data-state={state}
      className="card card-rated result-card-enter w-full overflow-hidden"
    >
      {/* 1. Score + plain verdict */}
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p className="rating-chip text-sm">
            <RatingShape rating={state} />
            {state === "idle" ? "Not checked" : RATING_LABEL[state]}
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            {state === "idle" ? "We couldn't check this site" : RATING_HEADLINE[state]}
          </h2>
          <p className="mt-1 break-words text-base text-fg-muted">{result.domain}</p>
          {insufficient ? (
            <>
              <p className="mt-3 text-base">
                {unreachable
                  ? "We couldn't reach it. The address may be wrong, or the site may be offline."
                  : "We couldn't get enough information about it to give a rating."}
              </p>
              <p className="mt-2 text-base font-bold">
                If someone sent you this link, be careful.
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-base">
                <span className="text-3xl font-bold" style={{ color: "var(--rating-color)" }}>
                  {result.overall}
                </span>
                <span className="text-fg-muted"> out of 100 trust score</span>
              </p>
              {partial && <p className="mt-2 text-base text-fg-muted">{partialNote(result)}</p>}
            </>
          )}
          {result.overrideApplied && (
            <p className="mt-2 text-sm text-fg-muted">
              Marked high risk because 3 or more scam reports were confirmed.
            </p>
          )}
        </div>
        <LockIcon rating={state} size={72} className="shrink-0" />
      </div>

      {/* 2. Details */}
      {!insufficient && (
        <>
          {result.tos.redFlags.length > 0 ? (
            <Section label="Terms of Service: warning signs">
              <ul className="flex flex-col gap-2">
                {result.tos.redFlags.slice(0, 3).map((flag, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span aria-hidden className="font-bold">!</span>
                    <span>{flag.text}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : (
            <Section label="Terms of Service">
              {excluded.includes("tos") ? (
                // The score note above already explains why; keep this to one short line.
                <ul>
                  <Finding kind="unknown">
                    {result.tos.status === "unavailable" ? "Couldn't read it" : "Not found"}
                  </Finding>
                </ul>
              ) : (
                tosSummaryLine(result)
              )}
            </Section>
          )}

          {showCommunity && <Section label="Community reports">{communitySummary(result)}</Section>}

          {showSecurity && (
            <Section label="Technical security">
              {unreachable ? (
                "We couldn't reach this site to check it."
              ) : (
                <ul className="flex flex-col gap-2">
                  {securityFindings(signals).map((f) => (
                    <Finding key={f.text} kind={f.kind}>
                      {f.text}
                    </Finding>
                  ))}
                </ul>
              )}
            </Section>
          )}
        </>
      )}

      {/* 3. Actions */}
      <div className="flex flex-wrap gap-3 border-t-2 border-border p-5">
        <button type="button" onClick={onReset} className="btn btn-primary w-full sm:w-auto">
          Check another site
        </button>
        <button
          type="button"
          onClick={() => setReported(true)}
          disabled={reported}
          className="btn btn-secondary w-full sm:w-auto"
        >
          {reported ? "Reported. Thank you." : "Report this site"}
        </button>
      </div>
    </div>
  );
}
