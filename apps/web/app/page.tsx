"use client";

import { useEffect, useRef, useState } from "react";
import { LockAvatar } from "@/components/LockAvatar";
import { CharacterPicker } from "@/components/CharacterPicker";
import { RatingPanel } from "@/components/RatingPanel";
import { useCharacterPreference } from "@/lib/characters";
import type { ScanResult } from "@/lib/types";

// Cycled during a scan so the wait reads as progress toward a finish line
// rather than an indeterminate stall (Doherty Threshold, Goal-Gradient Effect).
const SCAN_STAGES = [
  "Checking security…",
  "Checking Terms of Service…",
  "Checking community reports…",
];

const HOW_IT_WORKS = [
  { icon: "🛡️", title: "Security check", body: "HTTPS, headers, cookies, and known vulnerabilities" },
  { icon: "📜", title: "Ancient terms", body: "We read the fine print and flag risky clauses" },
  { icon: "👥", title: "Community reports", body: "Scam and billing reports from real users worldwide" },
];

// Accepts whatever a user types or pastes — a bare domain, a full URL with
// path/query, with or without "www." — and reduces it to the origin we
// actually want to score (Postel's Law: liberal in what we accept).
function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const withScheme = trimmed.match(/^https?:\/\//)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withScheme).origin;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [character, selectCharacter] = useCharacterPreference();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, SCAN_STAGES.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    let normalized: string;
    try {
      normalized = normalizeUrl(url);
    } catch {
      setError("That doesn't look like a valid web address.");
      return;
    }

    setLoading(true);
    setStageIndex(0);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setUrl("");
    setError(null);
    inputRef.current?.focus();
  }

  const isResult = !!result;
  const bubbleState = loading ? "loading" : result ? result.rating : "idle";

  return (
    <div className="relative flex min-h-screen flex-col bg-void font-body text-ink">
      <div aria-hidden className="starfield" />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-void/90 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span
            className="font-display text-ink"
            style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1, letterSpacing: "0.03em" }}
          >
            LOCKI
          </span>
          <span
            className="rounded-full border border-border px-2 py-0.5 font-bold text-muted"
            style={{ fontSize: "0.62rem", letterSpacing: "0.08em" }}
          >
            BETA
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-8 px-4 py-10">
        {!isResult && !loading && (
          <div className="text-center">
            <h1
              className="font-display text-ink"
              style={{ fontSize: "2.1rem", fontWeight: 600, lineHeight: 1.2, letterSpacing: "0.01em" }}
            >
              Protection for everyone.
              <br />
              <span className="glow-text-jedi" style={{ color: "var(--color-jedi)" }}>
                Even your gran.
              </span>
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted">
              Paste any website below — Locki reads the fine print so you don&apos;t have to.
            </p>
          </div>
        )}

        {!isResult && (
          <div className="flex flex-col items-center">
            <LockAvatar character={character} state={bubbleState} size={loading ? 130 : 158} />
            {loading && (
              <>
                <div className="mt-4 flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="scan-dot rounded-full"
                      style={{ width: 8, height: 8, background: "var(--color-jedi)", animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <div aria-live="polite" className="mt-2 text-xs font-semibold text-muted">
                  {SCAN_STAGES[stageIndex]}
                </div>
              </>
            )}
          </div>
        )}

        {!isResult && (
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              placeholder="e.g. suspicious-offers.com"
              className="url-input flex-1 rounded-2xl border-2 border-border bg-panel px-5 py-3.5 text-sm font-semibold text-ink placeholder-muted transition-all disabled:opacity-50"
              style={{ outline: "none" }}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="font-display rounded-2xl bg-ink px-6 py-3.5 text-base font-semibold whitespace-nowrap text-void transition-all hover:brightness-90 active:scale-95 disabled:opacity-40"
            >
              {loading ? "Checking…" : "Check it →"}
            </button>
          </form>
        )}

        {error && (
          <p
            className="w-full rounded-2xl border-2 px-4 py-3 text-sm font-semibold"
            style={{ borderColor: "var(--color-sith)", background: "var(--color-sith-soft)", color: "var(--color-sith-glow)" }}
          >
            {error}
          </p>
        )}

        {result && <RatingPanel result={result} character={character} onReset={handleReset} />}

        {!isResult && !loading && (
          <div className="grid w-full grid-cols-3 gap-3">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-panel p-4 text-center"
                style={{ border: "1.5px solid var(--color-border)" }}
              >
                <div className="mb-2 text-2xl">{item.icon}</div>
                <p className="font-display mb-1 font-semibold text-ink" style={{ fontSize: "0.88rem" }}>
                  {item.title}
                </p>
                <p className="font-semibold text-muted" style={{ fontSize: "0.7rem", lineHeight: 1.45 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && <CharacterPicker selected={character} onSelect={selectCharacter} />}

        {!isResult && !loading && (
          <p className="text-xs text-muted">
            Try{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:brightness-125"
              style={{ color: "var(--color-jedi)" }}
              onClick={() => setUrl("quick-cash-loans.test")}
            >
              quick-cash-loans.test
            </button>{" "}
            for a seeded high-risk example.
          </p>
        )}
      </main>
    </div>
  );
}
