import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  // Turbopack and the build tracer both auto-detect a project root by
  // walking up for a lockfile, and stop at the repo root (one level up)
  // rather than this app's own directory — which then duplicates
  // apps/web under itself when writing dev/build output. Pinning both
  // explicitly to this directory stops that misdetection.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
