"use client";

import { useEffect, useRef, useState } from "react";
import { LockAvatar } from "@/components/LockAvatar";
import { RatingPanel, RATING_HEADLINE } from "@/components/RatingPanel";
import type { ScanResult, Rating } from "@/lib/types";

// Cycled during a scan so the wait reads as progress toward a finish line
// rather than an indeterminate stall (Doherty Threshold, Goal-Gradient Effect).
const SCAN_STAGES = [
  "Checking security…",
  "Checking Terms of Service…",
  "Checking community reports…",
];

const CHIP_STYLE: Record<Rating, string> = {
  trustworthy: "bg-green-50 border-green-600 text-green-900",
  caution: "bg-yellow-50 border-yellow-600 text-yellow-900",
  high_risk: "bg-red-50 border-red-600 text-red-900",
};

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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
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
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-amber-100 via-orange-50 to-white px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-52 h-80 w-80 rounded-full bg-teal-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900">
          Locki
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Check a site&apos;s trustworthiness before you proceed.
        </p>

        <div className="mt-6" key={result ? result.domain + result.scannedAt : "idle"}>
          <LockAvatar state={result ? result.rating : "idle"} />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. example.com"
            className="h-11 flex-1 rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-900 placeholder-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 min-w-24 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:bg-stone-400"
          >
            {loading ? "Checking…" : "Check"}
          </button>
        </form>

        <div aria-live="polite" className="mt-2 h-4 text-xs text-stone-500">
          {loading && SCAN_STAGES[stageIndex]}
        </div>

        <p className="mt-1 text-xs text-stone-400">
          Try{" "}
          <button
            type="button"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            onClick={() => setUrl("quick-cash-loans.test")}
          >
            quick-cash-loans.test
          </button>{" "}
          for a seeded high-risk example.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-6 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className={`flex h-11 items-center gap-2 rounded-full border-2 px-5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 ${CHIP_STYLE[result.rating]}`}
            >
              {RATING_HEADLINE[result.rating]}
              <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {open && <RatingPanel result={result} />}
          </div>
        )}
      </div>
    </div>
  );
}
