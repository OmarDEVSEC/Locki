"use client";

import { useEffect, useRef, useState } from "react";
import { LockBadge } from "@/components/LockBadge";
import { RatingPanel } from "@/components/RatingPanel";
import type { ScanResult } from "@/lib/types";

// Cycled during a scan so the wait reads as progress toward a finish line
// rather than an indeterminate stall (Doherty Threshold, Goal-Gradient Effect).
const SCAN_STAGES = [
  "Checking security…",
  "Checking Terms of Service…",
  "Checking community reports…",
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
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Locki</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Check a site&apos;s trustworthiness before you proceed.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. example.com"
            className="h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 min-w-24 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white disabled:bg-zinc-400"
          >
            {loading ? "Checking…" : "Check"}
          </button>
        </form>

        <div aria-live="polite" className="mt-2 h-4 text-xs text-zinc-500">
          {loading && SCAN_STAGES[stageIndex]}
        </div>

        <p className="mt-1 text-xs text-zinc-400">
          Try{" "}
          <button
            type="button"
            className="underline underline-offset-2"
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
      </div>

      {result && (
        <div className="mt-8 flex flex-col items-center">
          <LockBadge
            rating={result.rating}
            open={open}
            onToggle={() => setOpen((o) => !o)}
          />
          {open && <RatingPanel result={result} />}
        </div>
      )}
    </div>
  );
}
