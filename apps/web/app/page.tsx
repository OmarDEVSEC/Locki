"use client";

import { useEffect, useRef, useState } from "react";
import { LockIcon } from "@/components/LockIcon";
import { HowItWorks, Reassurance, WhenToUse } from "@/components/Marketing";
import { RatingPanel } from "@/components/RatingPanel";
import type { ScanResult } from "@/lib/types";

const SCAN_STAGES = [
  "Checking security…",
  "Reading the Terms of Service…",
];

// Accepts a bare domain or full URL and reduces it to the origin we score.
function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const withScheme = trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`;
  return new URL(withScheme).origin;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Bring a fresh result into view (e.g. after the example link is used).
  useEffect(() => {
    if (!result) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [result]);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, SCAN_STAGES.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, [loading]);

  // Smooth scroll unless the user prefers reduced motion (then instant).
  function scrollToTarget(el: HTMLElement | null, block: ScrollLogicalPosition) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block });
  }

  function handleCheckLink() {
    scrollToTarget(inputRef.current, "center");
    inputRef.current?.focus({ preventScroll: true });
  }

  // Runs the check for a given address. Used by the form and the example link.
  async function runScan(raw: string) {
    if (!raw.trim() || loading) return;

    let normalized: string;
    try {
      normalized = normalizeUrl(raw);
    } catch {
      setError("That doesn't look like a valid web address.");
      return;
    }

    // Page content shrinks while checking; bring the progress message into view.
    scrollToTarget(topRef.current, "start");
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runScan(url);
  }

  function handleExample() {
    const example = "quick-cash-loans.test";
    setUrl(example);
    void runScan(example);
  }

  function handleReset() {
    setResult(null);
    setUrl("");
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-2 border-border px-4 py-3">
        <div className="mx-auto flex w-full max-w-xl items-center gap-2">
          <span className="text-xl font-bold">Locki</span>
          <span className="rounded-full border-2 border-border px-2 text-sm text-fg-muted">Beta</span>
        </div>
      </header>

      <main ref={topRef} className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
        {!result && (
          <>
            <div className="flex items-center gap-4">
              <LockIcon rating="idle" size={72} className="hidden shrink-0 sm:block" />
              <div>
                <h1 className="text-3xl font-bold">
                  Protection for everyone.
                  <span className="block text-accent">Even your gran.</span>
                </h1>
                <p className="mt-2 text-lg text-fg-muted">
                  Paste any website below — Locki reads the fine print so you don&apos;t have to.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label htmlFor="url" className="text-base font-bold">
                Website address
              </label>
              <input
                id="url"
                ref={inputRef}
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                placeholder="for example: example.com"
                className="input"
              />
              <button type="submit" disabled={loading || !url.trim()} className="btn btn-primary w-full">
                {loading ? "Checking…" : "Check this website"}
              </button>
            </form>

            {loading && (
              <p aria-live="polite" role="status" className="text-base text-fg-muted">
                {SCAN_STAGES[stageIndex]}
              </p>
            )}
          </>
        )}

        {error && (
          <p role="alert" data-state="high_risk" className="card card-rated p-4 text-base">
            <strong style={{ color: "var(--rating-color)" }}>Problem: </strong>
            {error}
          </p>
        )}

        {result && (
          <div ref={resultRef}>
            <RatingPanel result={result} onReset={handleReset} />
          </div>
        )}

        {!result && !loading && (
          <>
            <WhenToUse onCheckLink={handleCheckLink} />
            <HowItWorks />

            <p className="text-base text-fg-muted">
              Want to try it?{" "}
              <button
                type="button"
                className="min-h-11 font-bold text-fg underline underline-offset-4"
                onClick={handleExample}
              >
                Use an example high-risk site
              </button>
            </p>

            <Reassurance />
          </>
        )}
      </main>
    </div>
  );
}
