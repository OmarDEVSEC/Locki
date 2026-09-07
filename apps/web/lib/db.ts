import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { CommunityReport } from "@/lib/types";

const dbPath = process.env.DB_PATH ?? "./data/locki.db";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS community_reports (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    status TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reports_domain ON community_reports(domain);

  CREATE TABLE IF NOT EXISTS scan_cache (
    domain TEXT PRIMARY KEY,
    scanned_at TEXT NOT NULL,
    result_json TEXT NOT NULL
  );
`);

const SEED_DOMAINS: Array<Omit<CommunityReport, "id">> = [
  {
    domain: "quick-cash-loans.test",
    category: "scam",
    description: "Charged an 'approval fee' upfront, loan never arrived.",
    submittedAt: "2026-04-02T00:00:00.000Z",
    status: "verified",
  },
  {
    domain: "quick-cash-loans.test",
    category: "scam",
    description: "Asked for bank login credentials directly, not through a bank portal.",
    submittedAt: "2026-05-14T00:00:00.000Z",
    status: "verified",
  },
  {
    domain: "quick-cash-loans.test",
    category: "data-misuse",
    description: "Started receiving spam calls within a day of signing up.",
    submittedAt: "2026-06-01T00:00:00.000Z",
    status: "verified",
  },
  {
    domain: "discount-electronics-outlet.test",
    category: "non-delivery",
    description: "Paid for a laptop, order shows 'processing' for 3 months.",
    submittedAt: "2026-07-10T00:00:00.000Z",
    status: "verified",
  },
  {
    domain: "discount-electronics-outlet.test",
    category: "billing",
    description: "Was billed twice for the same order, no refund given.",
    submittedAt: "2026-07-22T00:00:00.000Z",
    status: "pending",
  },
];

function seedIfEmpty() {
  const count = db
    .prepare("SELECT COUNT(*) as n FROM community_reports")
    .get() as { n: number };
  if (count.n > 0) return;

  const insert = db.prepare(
    `INSERT INTO community_reports (id, domain, category, description, submitted_at, status)
     VALUES (@id, @domain, @category, @description, @submittedAt, @status)`,
  );
  const insertMany = db.transaction((rows: CommunityReport[]) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(
    SEED_DOMAINS.map((r, i) => ({ ...r, id: `seed-${i}` })),
  );
}
seedIfEmpty();

export function getReportsForDomain(domain: string): CommunityReport[] {
  const rows = db
    .prepare(
      `SELECT id, domain, category, description, submitted_at as submittedAt, status
       FROM community_reports WHERE domain = ? ORDER BY submitted_at DESC`,
    )
    .all(domain);
  return rows as CommunityReport[];
}

export function getCachedScan(domain: string, maxAgeMs: number) {
  const row = db
    .prepare(
      `SELECT scanned_at as scannedAt, result_json as resultJson FROM scan_cache WHERE domain = ?`,
    )
    .get(domain) as { scannedAt: string; resultJson: string } | undefined;
  if (!row) return null;
  const age = Date.now() - new Date(row.scannedAt).getTime();
  if (age > maxAgeMs) return null;
  return JSON.parse(row.resultJson);
}

export function setCachedScan(domain: string, result: unknown) {
  db.prepare(
    `INSERT INTO scan_cache (domain, scanned_at, result_json)
     VALUES (@domain, @scannedAt, @resultJson)
     ON CONFLICT(domain) DO UPDATE SET scanned_at = @scannedAt, result_json = @resultJson`,
  ).run({
    domain,
    scannedAt: new Date().toISOString(),
    resultJson: JSON.stringify(result),
  });
}
