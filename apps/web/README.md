# Locki — local demo

Web lookup site implementing the scoring pipeline from `../../locki-design.md` (§2 data model, §3 scoring logic). This is the "secondary" surface from that doc — a manual URL lookup — built first per the SLC/build-order in §7. The browser extension overlay is a fast-follow that will reuse the same `components/` and `lib/scoring/` code.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Enter any domain, or click the seeded `quick-cash-loans.test` example to see a high-risk result without needing a live target.

## What's real vs. stubbed

- **Security score**: fully real — live TLS handshake (protocol/cipher/issuer), HTTP security headers, cookie flags, and a check for exposed `.env`/`.git` paths.
- **ToS score**: real if `ANTHROPIC_API_KEY` is set (calls Claude to classify red flags from the site's actual Terms/Privacy page). Without a key, it reports `unavailable` rather than faking a pass — an unanalyzed ToS is never treated as safe (§3).
- **Community score**: backed by a real SQLite table, but seeded with fictional `.test` demo domains (`quick-cash-loans.test`, `discount-electronics-outlet.test`) since there's no real user base yet. Any other domain starts with zero reports.

## Config

Copy `.env.example` to `.env.local` to enable ToS analysis:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`DB_PATH` controls the SQLite file location; swap `lib/db.ts` for a Postgres/RDS driver when deploying to AWS.

## Docker

```bash
docker build -t locki-web .
docker run -p 3000:3000 -v locki-data:/data -e ANTHROPIC_API_KEY=sk-ant-... locki-web
```

Uses `output: "standalone"`; the container expects a writable `/data` volume for the SQLite file.
