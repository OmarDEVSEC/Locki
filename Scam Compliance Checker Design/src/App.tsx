import { useState } from 'react'
import { Mascot } from './components/Mascot'
import type { Skin, TrustState } from './components/Mascot'

// ── Types ──────────────────────────────────────────────────────────────
type AppTab = 'website' | 'extension'
type Phase  = 'idle' | 'loading' | 'result'

interface Result {
  score:           number
  trustState:      Exclude<TrustState, 'idle'>
  headline:        string
  tosFlags:        string[]
  communityReport: string
}

// ── Mock scan results ─────────────────────────────────────────────────
const MOCK: Record<'green' | 'amber' | 'red', Omit<Result, 'score' | 'trustState'>> = {
  green: {
    headline:        'Looks trustworthy',
    tosFlags:        [],
    communityReport: '142 community checks — 97% rated this site as safe',
  },
  amber: {
    headline: 'Proceed with caution',
    tosFlags: [
      'Terms allow sharing your data with unnamed marketing partners',
      'Subscription renews automatically with no prior email reminder',
    ],
    communityReport: '38 community checks — billing complaints reported by some users',
  },
  red: {
    headline: 'High risk — stop!',
    tosFlags: [
      'No refunds permitted under any circumstances (per the ToS)',
      'No verifiable company address or business registration found',
      'Your data is shared with over 200 third-party advertisers',
    ],
    communityReport: '891 checks — 84% of users report unexpected charges',
  },
}

function scoreUrl(raw: string): Result {
  const url = raw.toLowerCase().replace(/^https?:\/\//, '')
  if (/free.?prize|winner|claim.?now|urgent.?offer|lucky.?draw|get.?reward/.test(url))
    return { score: 17, trustState: 'red', ...MOCK.red }
  if (/amazon\.|google\.|github\.|\.gov\b|bbc\.|wikipedia\.|apple\.com|nhs\.uk/.test(url))
    return { score: 93, trustState: 'green', ...MOCK.green }
  if (/deal|shop|buy|offer|store|sale/.test(url))
    return { score: 61, trustState: 'amber', ...MOCK.amber }
  return { score: 67, trustState: 'amber', ...MOCK.amber }
}

// ── Trust color tokens ────────────────────────────────────────────────
interface TrustColors { txt: string; bg: string; ring: string; label: string }

const TC: Record<TrustState, TrustColors> = {
  idle:  { txt: '#0D9488', bg: '#F0FDFA', ring: '#99F6E4', label: 'Checking…'   },
  green: { txt: '#16A34A', bg: '#F0FDF4', ring: '#86EFAC', label: 'Trustworthy' },
  amber: { txt: '#D97706', bg: '#FFFBEB', ring: '#FCD34D', label: 'Caution'     },
  red:   { txt: '#DC2626', bg: '#FFF5F5', ring: '#FCA5A5', label: 'High Risk'   },
}

const tc = (s: TrustState): TrustColors => TC[s] ?? TC.idle

// ── Skin registry ──────────────────────────────────────────────────────
const SKINS: { id: Skin; label: string; desc: string }[] = [
  { id: 'locki', label: 'Locki', desc: 'Original' },
  { id: 'socki', label: 'Socki', desc: 'Expert'   },
  { id: 'pocki', label: 'Pocki', desc: 'Blob'     },
]

// ── Extension demo URL map ─────────────────────────────────────────────
const EXT_URL: Record<TrustState, string> = {
  idle:  'example.com',
  green: 'amazon.co.uk/products/headphones',
  amber: 'bestshopdeals.net/checkout',
  red:   'free-prize-claim-now.com/winner',
}

// ══════════════════════════════════════════════════════════════════════
// Root App
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,       setTab]       = useState<AppTab>('website')
  const [skin,      setSkin]      = useState<Skin>('locki')
  const [phase,     setPhase]     = useState<Phase>('idle')
  const [url,       setUrl]       = useState('')
  const [result,    setResult]    = useState<Result | null>(null)
  const [badgeOpen, setBadgeOpen] = useState(false)

  const trustState: TrustState =
    phase === 'result' && result ? result.trustState : 'idle'

  const mascotAnim =
    phase === 'loading'                                        ? 'anim-scan'
    : phase === 'result' && result?.trustState === 'green'   ? 'anim-hop'
    : phase === 'result' && result?.trustState === 'amber'   ? 'anim-wobble'
    : phase === 'result' && result?.trustState === 'red'     ? 'anim-flinch'
    : 'anim-float'

  const bubble =
    phase === 'idle'    ? "Hi! Paste a website address and I'll check it for you."
    : phase === 'loading' ? 'Scanning security, terms of service, and community reports…'
    : result?.headline ?? ''

  function handleScan() {
    const trimmed = url.trim()
    if (!trimmed) return
    setPhase('loading')
    setResult(null)
    setTimeout(() => {
      setResult(scoreUrl(trimmed))
      setPhase('result')
    }, 2400)
  }

  function handleReset() {
    setPhase('idle')
    setResult(null)
    setUrl('')
  }

  const colors    = tc(trustState)
  const extResult: Result = result ?? { score: 61, trustState: 'amber', ...MOCK.amber }

  return (
    <div className="min-h-screen flex flex-col font-body bg-cream text-bark">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-cream border-b border-parchment px-6 py-3
                         flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-orange" style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>
            Locki
          </span>
          <span className="bg-orange-light text-orange rounded-full px-2 py-0.5 font-bold"
            style={{ fontSize: '0.62rem', letterSpacing: '0.06em' }}>
            BETA
          </span>
        </div>

        {/* Tab switcher */}
        <nav className="flex gap-1 bg-parchment rounded-xl p-1">
          {(['website', 'extension'] as AppTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={tab === t
                ? { background: 'white', color: 'var(--color-bark)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }
                : { color: 'var(--color-clay)' }}>
              {t === 'website' ? 'Website Lookup' : 'Extension Demo'}
            </button>
          ))}
        </nav>

        <div style={{ width: '9rem' }} />
      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1">
        {tab === 'website' && (
          <WebsiteView
            skin={skin} setSkin={setSkin}
            phase={phase} url={url} setUrl={setUrl}
            result={result} trustState={trustState}
            mascotAnim={mascotAnim} bubble={bubble} colors={colors}
            onScan={handleScan} onReset={handleReset}
          />
        )}
        {tab === 'extension' && (
          <ExtensionView
            skin={skin} extResult={extResult}
            badgeOpen={badgeOpen} setBadgeOpen={setBadgeOpen}
          />
        )}
      </main>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// Website View — landing, loading, result
// ══════════════════════════════════════════════════════════════════════
interface WebsiteViewProps {
  skin: Skin; setSkin: (s: Skin) => void
  phase: Phase; url: string; setUrl: (v: string) => void
  result: Result | null; trustState: TrustState
  mascotAnim: string; bubble: string; colors: TrustColors
  onScan: () => void; onReset: () => void
}

function WebsiteView({
  skin, setSkin, phase, url, setUrl,
  result, trustState, mascotAnim, bubble, colors, onScan, onReset,
}: WebsiteViewProps) {
  const isLoading = phase === 'loading'
  const isResult  = phase === 'result'

  return (
    <div className="max-w-xl mx-auto px-4 py-10 flex flex-col items-center gap-8">

      {/* Page headline — idle only */}
      {phase === 'idle' && (
        <div className="text-center">
          <h1 className="font-display text-bark"
            style={{ fontSize: '2.3rem', fontWeight: 600, lineHeight: 1.15 }}>
            Protection for everyone.<br />
            <span className="text-orange">Even your gran.</span>
          </h1>
          <p className="text-clay font-semibold mt-2 text-sm">
            Paste any website below — Locki reads the fine print so you don't have to.
          </p>
        </div>
      )}

      {/* Mascot + speech bubble */}
      <div className="flex flex-col items-center">

        {/* Speech bubble (above mascot, tail points down) */}
        <div className="relative mb-5" style={{ maxWidth: '290px' }}>
          <div className="px-5 py-3 text-center text-sm font-semibold bg-white rounded-2xl"
            style={{ border: `2px solid ${colors.ring}`, lineHeight: 1.45,
                     color: 'var(--color-bark)',
                     boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            {bubble}
          </div>
          {/* Outer triangle (ring color) */}
          <div className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '-13px', width: 0, height: 0,
              borderLeft: '11px solid transparent', borderRight: '11px solid transparent',
              borderTop: `13px solid ${colors.ring}` }} />
          {/* Inner triangle (white fill) */}
          <div className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '-9px', width: 0, height: 0,
              borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
              borderTop: '10px solid white' }} />
        </div>

        {/* Mascot */}
        <Mascot
          skin={skin}
          trustState={trustState}
          size={isResult ? 130 : 158}
          className={mascotAnim}
        />

        {/* Scanning progress dots */}
        {isLoading && (
          <div className="flex gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-full bg-orange anim-pulse"
                style={{ width: 8, height: 8, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* URL input row — visible when not showing a result */}
      {!isResult && (
        <div className="w-full flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onScan()}
            disabled={isLoading}
            placeholder="e.g. suspicious-offers.com"
            className="url-input flex-1 px-5 py-3.5 text-sm font-semibold bg-white
                       rounded-2xl border-2 border-parchment text-bark
                       disabled:opacity-50 transition-all"
            style={{ outline: 'none' }}
          />
          <button
            onClick={onScan}
            disabled={isLoading || !url.trim()}
            className="font-display font-semibold text-base px-6 py-3.5 bg-orange text-white
                       rounded-2xl transition-all hover:brightness-110 active:scale-95
                       disabled:opacity-40 whitespace-nowrap">
            Check it →
          </button>
        </div>
      )}

      {/* Result card */}
      {isResult && result && (
        <div key={`result-${result.score}-${result.trustState}`}
          className="anim-reveal w-full rounded-3xl overflow-hidden"
          style={{ border: `2px solid ${colors.ring}`, background: colors.bg }}>

          {/* Score + mascot header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <p className="font-bold uppercase tracking-widest mb-1"
                style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: colors.txt }}>
                Trust Score
              </p>
              <p className="font-display leading-none"
                style={{ fontSize: '4.2rem', fontWeight: 700, color: colors.txt }}>
                {result.score}
              </p>
              <p className="font-bold mt-1" style={{ fontSize: '1rem', color: colors.txt }}>
                {result.headline}
              </p>
              {/* Score bar */}
              <div className="mt-3" style={{ width: 148, height: 6,
                background: 'rgba(0,0,0,0.08)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${result.score}%`,
                  background: colors.txt, borderRadius: 3,
                  transition: 'width 0.9s ease-out' }} />
              </div>
            </div>
            <Mascot skin={skin} trustState={result.trustState} size={90} className={mascotAnim} />
          </div>

          {/* ToS red flags */}
          {result.tosFlags.length > 0 && (
            <div className="px-6 pb-4" style={{ borderTop: '1px solid var(--color-parchment)' }}>
              <p className="font-bold uppercase tracking-widest mt-4 mb-3"
                style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--color-clay)' }}>
                Terms of Service — Red Flags
              </p>
              <ul className="flex flex-col gap-2.5">
                {result.tosFlags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span style={{ color: colors.txt, fontSize: '1rem',
                      lineHeight: 1.45, flexShrink: 0 }}>⚠</span>
                    <span className="text-sm font-semibold text-bark leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Community report */}
          <div className="px-6 py-4" style={{ borderTop: '1px solid var(--color-parchment)' }}>
            <p className="font-bold uppercase tracking-widest mb-1"
              style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--color-clay)' }}>
              Community Reports
            </p>
            <p className="text-sm font-semibold text-bark">👥 {result.communityReport}</p>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-6 flex gap-3 flex-wrap"
            style={{ borderTop: '1px solid var(--color-parchment)', paddingTop: '1rem' }}>
            <button className="font-display font-semibold text-sm px-5 py-2.5 bg-orange
                               text-white rounded-xl transition-all hover:brightness-110
                               active:scale-95">
              🚩 Report this site
            </button>
            <button onClick={onReset}
              className="font-body font-bold text-sm px-5 py-2.5 bg-white text-clay
                         rounded-xl border-2 border-parchment transition-all
                         hover:bg-orange-light active:scale-95">
              ← Check another
            </button>
          </div>
        </div>
      )}

      {/* How it works — idle only */}
      {phase === 'idle' && (
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { icon: '🔒', title: 'Security check', body: 'HTTPS, headers, cookies, and known vulnerabilities' },
            { icon: '📜', title: 'Terms of Service', body: 'We read the small print and flag risky clauses' },
            { icon: '👥', title: 'Community reports', body: 'Scam and billing reports from real users worldwide' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl p-4 text-center"
              style={{ border: '1.5px solid var(--color-parchment)' }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-display font-semibold text-bark mb-1" style={{ fontSize: '0.88rem' }}>
                {item.title}
              </p>
              <p className="text-clay font-semibold" style={{ fontSize: '0.7rem', lineHeight: 1.45 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Character picker */}
      <div className="w-full">
        <p className="text-center font-bold uppercase tracking-widest mb-4 text-clay"
          style={{ fontSize: '0.62rem', letterSpacing: '0.1em' }}>
          Choose your guide
        </p>
        <div className="flex gap-3 justify-center">
          {SKINS.map(s => (
            <button key={s.id} onClick={() => setSkin(s.id)}
              className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl
                         transition-all hover:scale-105 active:scale-95"
              style={skin === s.id
                ? { background: 'var(--color-orange)', color: 'white',
                    border: '2px solid var(--color-orange)',
                    boxShadow: '0 4px 20px rgba(255,107,53,0.38)' }
                : { background: 'white', color: 'var(--color-clay)',
                    border: '2px solid var(--color-parchment)' }}>
              <Mascot skin={s.id} trustState="idle" size={52} className="anim-float" />
              <span className="font-display font-semibold" style={{ fontSize: '0.9rem' }}>
                {s.label}
              </span>
              <span className="text-xs font-medium opacity-70">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// Extension View — browser simulation with floating badge + panel
// ══════════════════════════════════════════════════════════════════════
interface ExtensionViewProps {
  skin: Skin
  extResult: Result
  badgeOpen: boolean
  setBadgeOpen: (v: boolean | ((p: boolean) => boolean)) => void
}

function ExtensionView({ skin, extResult, badgeOpen, setBadgeOpen }: ExtensionViewProps) {
  const colors = tc(extResult.trustState)
  const badgeAnim =
    extResult.trustState === 'green' ? 'anim-hop'
    : extResult.trustState === 'red' ? 'anim-flinch'
    : 'anim-float'

  return (
    <div className="p-6 lg:p-10 flex flex-col lg:flex-row items-start justify-center gap-8">

      {/* Sidebar callout */}
      <div className="w-full lg:w-52 shrink-0">
        <p className="font-bold uppercase tracking-widest text-clay mb-3"
          style={{ fontSize: '0.62rem', letterSpacing: '0.1em' }}>
          Extension Demo
        </p>
        <p className="text-sm font-semibold text-bark leading-snug mb-2">
          This is how Locki floats in the corner of every page you visit.
        </p>
        <p className="text-sm text-clay leading-snug">
          Click the badge to open the full report panel.
        </p>

        {/* State indicator */}
        <div className="mt-5 p-4 rounded-2xl bg-white"
          style={{ border: '1.5px solid var(--color-parchment)' }}>
          <p className="font-bold uppercase tracking-widest mb-2 text-clay"
            style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>
            Demo scenario
          </p>
          <p className="font-bold" style={{ fontSize: '0.9rem', color: colors.txt }}>
            {colors.label} site
          </p>
          <p className="text-clay text-xs font-semibold mt-0.5">
            {extResult.score}/100 trust score
          </p>
          <p className="text-clay text-xs font-medium mt-2 leading-snug">
            Scan a URL on the Website tab to change this scenario.
          </p>
        </div>
      </div>

      {/* Browser frame */}
      <div style={{ width: '680px', maxWidth: '100%', borderRadius: '12px',
        overflow: 'hidden', flexShrink: 0,
        border: '1px solid var(--color-parchment)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

        {/* Chrome bar */}
        <div style={{ background: '#EFE9E1',
          borderBottom: '1px solid var(--color-parchment)', padding: '10px 14px' }}>
          <div className="flex items-center gap-4">
            {/* macOS traffic lights */}
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
            </div>
            {/* URL bar */}
            <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-1.5"
              style={{ border: '1px solid var(--color-parchment)' }}>
              <span style={{ fontSize: '0.75rem' }}>
                {extResult.trustState === 'green' ? '🔒' : '⚠️'}
              </span>
              <span className="text-clay font-semibold" style={{ fontSize: '0.75rem' }}>
                {EXT_URL[extResult.trustState]}
              </span>
            </div>
          </div>
        </div>

        {/* Browser viewport */}
        <div className="relative" style={{ height: '400px', background: '#FAF9F7', overflow: 'visible' }}>

          {/* Mock page skeleton */}
          <div className="p-8 flex flex-col gap-4">
            <div className="rounded-md" style={{ height: 24, width: 180, background: '#E5DDD4' }} />
            <div className="rounded" style={{ height: 14, width: 320, background: '#EDE7DF' }} />
            <div className="rounded" style={{ height: 14, width: 250, background: '#EDE7DF' }} />
            <div className="flex gap-4 mt-3">
              {[148, 116, 148].map((w, i) => (
                <div key={i} className="rounded-xl"
                  style={{ width: w, height: 108, background: '#E0D8CE' }} />
              ))}
            </div>
            <div className="rounded" style={{ height: 14, width: 200, background: '#EDE7DF' }} />
            <div className="rounded-xl flex items-center justify-center"
              style={{ width: 140, height: 40,
                background: extResult.trustState === 'green'
                  ? 'rgba(22,163,74,0.12)' : 'rgba(255,107,53,0.12)' }}>
              <span className="font-semibold" style={{ fontSize: '0.75rem',
                color: extResult.trustState === 'green' ? '#16A34A' : '#FF6B35' }}>
                {extResult.trustState === 'green' ? 'Add to cart' : 'Claim now →'}
              </span>
            </div>
          </div>

          {/* ── Floating Locki badge ─────────────────────────── */}
          <div className="absolute" style={{ top: 12, right: 12, zIndex: 20 }}>

            {/* Badge button */}
            <button
              onClick={() => setBadgeOpen(o => !o)}
              className="flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ width: 54, height: 54, borderRadius: 16, background: 'white', cursor: 'pointer',
                border: `2.5px solid ${colors.ring}`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.15), 0 0 0 ${badgeOpen ? '3px' : '0px'} ${colors.ring}` }}
              aria-label="Open Locki security report"
              aria-expanded={badgeOpen}>
              <Mascot skin={skin} trustState={extResult.trustState} size={34} className={badgeAnim} />
            </button>

            {/* Expanded panel */}
            {badgeOpen && (
              <div className="anim-slide absolute right-0 mt-2 rounded-2xl overflow-hidden"
                style={{ width: 300, background: 'white',
                  border: `1.5px solid ${colors.ring}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>

                {/* Panel header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3"
                  style={{ background: colors.bg }}>
                  <div className="flex items-center gap-3">
                    <Mascot skin={skin} trustState={extResult.trustState} size={46} className={badgeAnim} />
                    <div>
                      <p className="font-display leading-none"
                        style={{ fontSize: '1.65rem', fontWeight: 700, color: colors.txt }}>
                        {extResult.score}
                      </p>
                      <p className="font-bold uppercase"
                        style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: colors.txt }}>
                        {extResult.headline}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setBadgeOpen(false)}
                    className="text-clay hover:text-bark transition-colors font-bold text-lg px-1 leading-none">
                    ✕
                  </button>
                </div>

                {/* Scrollable body */}
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>

                  {/* ToS flags */}
                  {extResult.tosFlags.length > 0 && (
                    <div className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--color-parchment)' }}>
                      <p className="font-bold uppercase mb-2"
                        style={{ fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--color-clay)' }}>
                        Terms — Red Flags
                      </p>
                      {extResult.tosFlags.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                          <span style={{ color: colors.txt, fontSize: '0.8rem', flexShrink: 0 }}>⚠</span>
                          <span className="font-semibold text-bark"
                            style={{ fontSize: '0.71rem', lineHeight: 1.45 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Community */}
                  <div className="px-4 py-3"
                    style={{ borderBottom: '1px solid var(--color-parchment)' }}>
                    <p className="font-semibold text-bark" style={{ fontSize: '0.71rem' }}>
                      👥 {extResult.communityReport}
                    </p>
                  </div>

                </div>

                {/* Report action */}
                <div className="px-4 py-3">
                  <button className="w-full font-display font-semibold text-white bg-orange
                                     rounded-xl py-2.5 text-sm transition-all
                                     hover:brightness-110 active:scale-95">
                    🚩 Report this site
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
