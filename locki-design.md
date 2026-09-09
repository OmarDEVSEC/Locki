# Locki — Design Document

## 1. Overview

Locki protects users — especially elderly and less tech-savvy users — from online scams and predatory websites. It works by:

1. Reading a site's Terms of Service / Privacy Policy and flagging risky clauses in plain language.
2. Passively assessing the site's technical security posture (loosely mapped to OWASP Top 10 concerns).
3. Aggregating crowdsourced user reports of scams, billing issues, and non-delivery.
4. Surfacing all of this as a single, simple warning the moment the user loads the site.

Primary delivery mechanism: a browser extension. Secondary: a standalone lookup site for manual URL checks.

---

## 2. Data Model

```
Site
├─ domain (key)
├─ first_seen_at
├─ whois: { registrar, created_date, registrant_country, privacy_protected }
├─ tls: { valid, protocol, cipher_strength, issuer }
├─ headers: { csp, hsts, x_frame_options, x_content_type_options }
├─ cookies: { secure_flag_pct, httponly_pct, samesite_pct }
├─ fingerprint: { cms, framework, known_cves[] }
├─ tos_summary: { url, exists, red_flags[], plain_summary, last_analyzed_at }
├─ community_reports[]:
│   ├─ report_id, category (scam/billing/non-delivery/data-misuse/other)
│   ├─ description, submitted_at, reporter_trust_score
│   └─ status (pending/verified/dismissed)
└─ computed: { security_score, tos_score, community_score, overall_rating }
```

Raw signals and computed scores are stored separately so the scoring formula can be re-tuned without re-scanning sites.

---

## 3. Scoring Logic

Three sub-scores (0–100), blended into one overall rating.

**Security score** — starts at 100, deducts per missing/weak signal:
- No HTTPS: −40
- Missing CSP: −10
- Insecure cookies (no Secure/HttpOnly/SameSite): −10
- Known-CVE framework/CMS version: −20
- Exposed `.env` / `.git` / admin paths: −30

**ToS score** — LLM classifies flagged clauses by severity (minor/moderate/major), score = 100 minus weighted sum. No ToS found = flagged as "unknown," never treated as automatically safe.

**Community score** — `100 − (verified_reports × severity_weight)`, weighted by reporter trust history and decayed by recency so old resolved issues don't permanently sink a site.

**Blend:**
```
overall = (security_score × 0.35) + (tos_score × 0.35) + (community_score × 0.30)
```

**Rating buckets:**
| Score | Rating |
|---|---|
| 80–100 | 🟢 Trustworthy |
| 50–79 | 🟡 Caution |
| 0–49 | 🔴 High risk |

Override: 3+ verified scam reports forces 🔴 regardless of other scores.

---

## 4. UI / Animation Spec

### 4.1 The Lock Icon (persistent indicator)

- Appears **top-right of the browser viewport** as a small floating badge (extension-injected overlay, not a native browser UI element — works across all browsers uniformly).
- Idle state: a simple closed-lock glyph, color-coded to the site's current rating (green/yellow/red outline or fill).
- **Face**: the lock body doubles as a face — it smiles for 🟢, stays neutral (flat mouth) for 🟡, and frowns for 🔴, arms raised in a guard pose. This is a third independent signal alongside color and shackle shape, and it's the one most legible at a glance to a rushed or less tech-savvy user (a facial expression reads faster than parsing an icon shape).
- **Named "Locki"** — the mascot shares the product's own name, deliberately. Explored alongside two other directions ("Socki," a sturdier guardian whose shackle doubled as an eyebrow, and "Pocki," a near-limbless blob whose personality lived entirely in squash-and-stretch breathing); Locki's big-eyed, stubby-armed cuteness won out as the friendliest read even mid-flinch on a risky site.
- The one-shot hop/shimmy/flinch reaction plays once per scan (the badge/panel remount per result), not as a perpetual idle loop — a persistent corner badge that never stops moving would fight the "no distracting motion" rule below. The one exception is a slow ambient blink (~every 4.6s): brief enough not to read as ambient motion, and it's the specific bit of "alive" charm the friendlier direction was chosen for.
- **Load-in animation:** on page load, the lock icon animates in with a short "snap shut" motion — scales from 0 → 105% → 100% (~300ms, ease-out) — drawing the eye without being jarring. For 🔴 sites, add a subtle pulse (opacity 100%→70%→100%, 1.2s loop, 2 cycles then settle) to draw attention without being alarming/flashing.
- Hover/tap: gentle lift (translateY -2px + soft shadow) to signal interactivity.
- **Lookup-site variant**: the standalone site (`apps/web`) doesn't float a small corner badge like the extension will — it shows Locki large (140px) as a greeting host above the input, visible from first load in a fourth "idle" appearance (teal, never one of the three rating colors, so it can't be mistaken for a verdict) with a speech-bubble greeting. After a scan the same character swaps into the rated color/expression and the bubble copy changes to a short first-person reaction ("Whoa, hold up! This one's risky."), before the compact rating chip + detail panel appear below. Same component (`LockIcon`), same one-shot reaction animation — the extension's small persistent badge and the site's large greeting avatar are two skins on one character, not two designs.

### 4.2 Expand Animation (click/tap the lock)

- Lock "unlocks" — shackle rotates open (~200ms) — as a visual metaphor for "revealing what's inside this site."
- A card panel slides/fades down from the icon's position (transform-origin: top-right), ~250ms ease-out, avoiding layout shift on the underlying page (overlay, not injected DOM in page flow).

### 4.3 Panel Contents (in priority order)

1. **Headline rating** — big color-coded label ("🟡 Proceed with caution") — this is the only thing a rushed/elderly user *needs* to read.
2. **Top 1–3 ToS red flags** — plain language, one line each (e.g., "This site can share your data with third parties without asking again").
3. **Community reports summary** — count + most common category (e.g., "12 users reported billing issues here in the last 6 months").
4. **Compliance history** — if the site was previously flagged/red and has since improved (or worsened), show a small trend indicator (↑ improved / ↓ worsened) rather than raw historical data — keeps it digestible.
5. **"Report this site" button** — always visible, low-friction.

### 4.4 Motion Principles (accessibility-first, given elderly user base)

- No motion faster than ~150ms minimum, nothing longer than ~400ms for primary transitions — fast enough to feel responsive, slow enough to track.
- Respect `prefers-reduced-motion`: fall back to instant state changes, no pulse/loop animations.
- No flashing >3Hz (seizure-safety baseline regardless of reduced-motion setting).
- Color is never the *only* signal — pair every color state with an icon shape change (closed lock/half-open/open), a facial expression, and a text label, for colorblind accessibility.
- The rating colors (green/yellow/red) are reserved exclusively for trust signal — everything else in the UI (buttons, links, focus states, backgrounds) uses a warm tan/amber ground with a vibrant orange accent so the semantic colors keep their meaning instead of competing with decorative ones. (Originally a cooler indigo; moved to warm tones so the page reads as welcoming rather than clinical, matching Locki's own personality.)

### 4.5 Applied Laws of UX

Concrete decisions in the lookup site (`apps/web`), mapped to the psychology principle driving them — recorded here so the reasoning survives past the commit that made the change:

| Change | Law |
|---|---|
| Input auto-focused on load; accepts pasted full URLs, extra whitespace, missing scheme | Jakob's Law, Postel's Law |
| Badge and buttons sized to a 44px-minimum touch target | Fitts's Law |
| "Checking security… / ToS… / community…" cycles during a scan instead of a static spinner | Doherty Threshold, Goal-Gradient Effect |
| Each panel section (ToS/community/security) wrapped in its own bounded card | Law of Common Region, Law of Proximity |
| Headline rating kept largest and first in the panel | Pareto Principle, Serial Position Effect |
| Interface stays a single input + button, no added settings | Hick's Law, Occam's Razor |
| Error states styled as a calm bordered card, not raw red text | Peak-End Rule |

Not forced: Parkinson's Law and the Zeigarnik Effect don't meaningfully apply to a single-shot lookup (no open-ended task to expand, and the "report submitted" state already closes the loop rather than leaving it dangling).

---

## 5. Open Design Questions

- Does the lock badge need a "dismiss for this session" option so it doesn't feel intrusive on trusted, frequently visited sites?
- Should the panel auto-expand (not just on click) for 🔴-rated sites the first time a user visits, given the target audience may not think to click a small icon?
- ~~Family/caregiver notification hooks — future phase, not MVP.~~ Reframed in §6 as the flagship premium feature, not a deferred nice-to-have.

---

## 6. Monetization Model

**Principle: keep the automatable core free forever; charge only for the high-touch layer.**

The scoring/rating pipeline (§3) is cheap to run at scale (scans + cached scores) and *is* the mission — gating it behind a paywall would fail the exact users (elderly, non-technical, lower-income) the product exists to protect. So:

**Free, no limits:**
- Lock badge + overall rating for any site (§4.1–4.2)
- Top ToS red flags (§4.3.2)
- Community report counts/summary (§4.3.3)

**Paid tier ("Locki Family" / "Locki Plus") — reserved for things that need ongoing human attention or personalization, not just a static score:**
- **Caregiver dashboard & alerts** — notify a family member/caregiver when a monitored user visits a 🔴 or newly-flagged site. This is the single highest-value premium feature: it's relationship-based, recurring, and directly serves the "elderly user" persona's actual support network (who has the money and motivation to pay, even if the elderly user themselves wouldn't).
- **Full ToS breakdown** — clause-by-clause AI analysis beyond the free top-3 summary.
- **Personalized AI safety coach** — a chat panel that explains, in plain language, why a specific site is risky *for this user* given their browsing history, and what to do instead.
- **Priority scanning** for newly-submitted/unrecognized URLs (skip the scan queue).

This mirrors a pattern seen in other profitable solo-built apps: the free utility drives trust and reach; the paid tier monetizes the layer that can't be fully automated (community, coaching, family oversight) rather than the commodity scoring itself.

---

## 7. Build & Tech Strategy

- **One shared component library** for the rating/scoring UI, consumed by both the injected extension overlay and the standalone lookup website — every animation/design update in §4 ships to both surfaces at once instead of being built twice.
- **Scope v1 with SLC** (Simple, Lovable, Complete): launch with `security_score` + `tos_score` only — both fully automatable with no cold-start problem. Hold `community_score`/reports for a fast-follow once there's enough registered traffic for crowdsourced data to be meaningful; a "0 reports yet" empty state undermines trust in a safety product on day one.
- **Stripe Billing/Checkout** for the paid tier — handles cancellations/prorations/refunds natively and supports paywall/price A/B testing, avoiding custom-built subscription infrastructure.
- **Keep the coding-agent tooling minimal** while building this (fewer MCP servers/skills wired in) — less context for the agent to filter means faster, more focused iteration on the extension + site.
