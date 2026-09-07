"use client";

import { useState } from "react";
import { LockBadge } from "@/components/LockBadge";
import { RatingPanel } from "@/components/RatingPanel";
import type { ScanResult } from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
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
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. example.com"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-zinc-400"
          >
            {loading ? "Checking…" : "Check"}
          </button>
        </form>

        <p className="mt-2 text-xs text-zinc-400">
          Try{" "}
          <button
            type="button"
            className="underline"
            onClick={() => setUrl("quick-cash-loans.test")}
          >
            quick-cash-loans.test
          </button>{" "}
          for a seeded high-risk example.
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
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
