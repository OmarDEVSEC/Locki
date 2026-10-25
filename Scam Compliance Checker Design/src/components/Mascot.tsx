import { useId } from 'react'

export type Skin       = 'locki' | 'socki' | 'pocki'
export type TrustState = 'idle'  | 'green' | 'amber' | 'red'

export interface MascotProps {
  skin?:       Skin
  trustState?: TrustState
  size?:       number
  className?:  string
}

const PAL: Record<TrustState, { light: string; mid: string; dark: string; shackle: string }> = {
  idle:  { light: '#5EEAD4', mid: '#2DD4BF', dark: '#0D9488', shackle: '#0F766E' },
  green: { light: '#86EFAC', mid: '#4ADE80', dark: '#16A34A', shackle: '#14532D' },
  amber: { light: '#FDE68A', mid: '#FCD34D', dark: '#D97706', shackle: '#78350F' },
  red:   { light: '#FCA5A5', mid: '#F87171', dark: '#DC2626', shackle: '#7F1D1D' },
}

// Shackle path variants (the U-shaped bow of the padlock)
const SHACKLE: Record<'closed' | 'half' | 'open', string> = {
  closed: 'M 34 53 L 34 29 Q 34 12 50 12 Q 66 12 66 29 L 66 53',
  half:   'M 34 53 L 34 29 Q 34 12 50 12 Q 66 12 66 24 L 66 38',
  open:   'M 34 38 L 34 22 Q 34 6  50 6  Q 66 6  66 22 L 66 38',
}

export function Mascot({ skin = 'locki', trustState = 'idle', size = 120, className = '' }: MascotProps) {
  const rawId = useId()
  const uid   = rawId.replace(/[^a-zA-Z0-9]/g, '')  // safe for SVG id attrs
  const c     = PAL[trustState]

  const shacklePath = SHACKLE[
    trustState === 'amber' ? 'half'
    : trustState === 'red' ? 'open'
    : 'closed'
  ]

  // Body shape — Pocki is rounder, Socki is taller
  const bRx = skin === 'pocki' ? 34 : skin === 'socki' ? 20 : 16
  const bH  = skin === 'pocki' ? 76 : skin === 'socki' ? 72 : 64

  // Eye vertical position
  const eyeY = skin === 'pocki' ? 81 : 77

  // Mouth expressions
  const mY = skin === 'pocki' ? 97 : 92
  const mouthPath =
    trustState === 'green'
      ? `M 38 ${mY} Q 50 ${mY + 10} 62 ${mY}`                 // smile
      : trustState === 'red' && skin !== 'pocki'
      ? `M 38 ${mY + 4} Q 50 ${mY - 5} 62 ${mY + 4}`          // frown
      : skin === 'pocki' && trustState !== 'red'
      ? `M 40 ${mY} Q 50 ${mY + 5} 60 ${mY}`                  // pocki default slight smile
      : `M 40 ${mY} L 60 ${mY}`                                 // neutral

  const armRaised = skin === 'locki' && trustState === 'red'

  // Socki brows angle inward for worry (V-shape)
  const browAngle = skin !== 'socki' ? 0
    : trustState === 'red'   ? 20
    : trustState === 'amber' ? 10
    : 0

  return (
    <svg
      viewBox="0 0 100 128"
      width={size}
      height={Math.round(size * 1.067)}
      className={className}
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        {/* Body radial gradient — lighter at top-left highlight, darker at bottom-right */}
        <radialGradient id={`bg${uid}`} cx="38%" cy="28%" r="68%">
          <stop offset="0%"   stopColor={c.light} />
          <stop offset="52%"  stopColor={c.mid}   />
          <stop offset="100%" stopColor={c.dark}  />
        </radialGradient>
        {/* Eye iris gradient */}
        <radialGradient id={`ey${uid}`} cx="30%" cy="30%">
          <stop offset="0%"   stopColor={c.mid}  stopOpacity="0.45" />
          <stop offset="100%" stopColor={c.dark} />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="125" rx="26" ry="4" fill="rgba(0,0,0,0.13)" />

      {/* Shackle — rendered behind the body */}
      <path
        d={shacklePath}
        fill="none"
        stroke={c.shackle}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Body */}
      <rect x="10" y="53" width="80" height={bH} rx={bRx} fill={`url(#bg${uid})`} />

      {/* Glossy top-left shine streak */}
      <rect x="19" y="59" width="32" height="11" rx="5.5" fill="white" opacity="0.22" />

      {/* Shackle entry holes */}
      <circle cx="34" cy="53" r="5.5" fill={c.dark} />
      <circle cx="66" cy="53" r="5.5" fill={c.dark} />

      {/* Keyhole detail — Locki and Socki only */}
      {skin !== 'pocki' && (
        <>
          <circle cx="50" cy="83" r="4.5" fill="rgba(0,0,0,0.18)" />
          <rect   x="47.5" y="84" width="5" height="8" rx="2" fill="rgba(0,0,0,0.18)" />
        </>
      )}

      {/* Stubby arms — Locki only */}
      {skin === 'locki' && (
        <>
          <rect
            x="-8" y="75" width="18" height="9" rx="4.5"
            fill={c.dark}
            transform={`rotate(${armRaised ? -55 : 14}, 10, 79)`}
          />
          <rect
            x="90" y="75" width="18" height="9" rx="4.5"
            fill={c.dark}
            transform={`rotate(${armRaised ? 55 : -14}, 90, 79)`}
          />
        </>
      )}

      {/* Cheek blush */}
      <ellipse cx="26" cy={eyeY + 9} rx="8.5" ry="5"   fill="rgba(255,145,115,0.28)" />
      <ellipse cx="74" cy={eyeY + 9} rx="8.5" ry="5"   fill="rgba(255,145,115,0.28)" />

      {/* Expressive brows — Socki only */}
      {skin === 'socki' && (
        <>
          <rect
            x="26" y="61" width="18" height="5" rx="2.5"
            fill={c.shackle}
            transform={`rotate(${browAngle}, 35, 63)`}
          />
          <rect
            x="56" y="61" width="18" height="5" rx="2.5"
            fill={c.shackle}
            transform={`rotate(${-browAngle}, 65, 63)`}
          />
        </>
      )}

      {/* Left eye */}
      <circle cx="37" cy={eyeY}       r="11.5" fill="white" />
      <circle cx="37" cy={eyeY + 1}   r="7.5"  fill={`url(#ey${uid})`} />
      <circle cx="37" cy={eyeY + 1}   r="4.5"  fill="#160900" />
      <circle cx="40" cy={eyeY - 2}   r="2.8"  fill="white" />                         {/* main highlight */}
      <circle cx="34.5" cy={eyeY + 3.5} r="1.3" fill="white" opacity="0.6" />          {/* secondary highlight */}

      {/* Right eye */}
      <circle cx="63" cy={eyeY}       r="11.5" fill="white" />
      <circle cx="63" cy={eyeY + 1}   r="7.5"  fill={`url(#ey${uid})`} />
      <circle cx="63" cy={eyeY + 1}   r="4.5"  fill="#160900" />
      <circle cx="66" cy={eyeY - 2}   r="2.8"  fill="white" />
      <circle cx="60.5" cy={eyeY + 3.5} r="1.3" fill="white" opacity="0.6" />

      {/* Mouth — Pocki gasps wide open on red */}
      {skin === 'pocki' && trustState === 'red' ? (
        <>
          <ellipse cx="50" cy="97" rx="14" ry="11" fill="#160900" />
          <ellipse cx="50" cy="91" rx="10" ry="4"  fill="white"   opacity="0.1" />
        </>
      ) : (
        <path
          d={mouthPath}
          fill="none"
          stroke="#160900"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
