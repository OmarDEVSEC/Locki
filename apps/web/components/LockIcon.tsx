"use client";

import { useId } from "react";
import type { Rating } from "@/lib/types";
import type { CharacterId } from "@/lib/characters";

export type LockState = Rating | "idle";

interface LockIconProps {
  character?: CharacterId;
  rating: LockState;
  open: boolean;
  size?: number;
  className?: string;
}

// The mascots read as hooded figures wielding a lightsaber whose color is
// the only signal that isn't black/white/grey — idle (unignited, at rest),
// Jedi blue (trustworthy), a wavering amber (caution), or Sith red (high
// risk). Robes stay charcoal/black regardless of state so alignment reads
// entirely through the glow, keeping the rest of the UI monochrome.
const GLOW: Record<LockState, string> = {
  idle: "#8B93A1",
  trustworthy: "#38BDF8",
  caution: "#FBBF24",
  high_risk: "#EF4444",
};

const REACTION: Record<LockState, "safe" | "caution" | "risk"> = {
  idle: "safe",
  trustworthy: "safe",
  caution: "caution",
  high_risk: "risk",
};

const ROBE = "#15171C";
const ROBE_DARK = "#0A0B0E";
const HOOD = "#101216";
const HILT = "#AEB4BF";
const SHADOW_FACE = "#050608";

// Eye shape carries the expression — round & bright when trustworthy,
// narrowed when uncertain, a sharp angry slit once turned.
function Eyes({
  leftX,
  rightX,
  y,
  rating,
  glow,
  glowId,
}: {
  leftX: number;
  rightX: number;
  y: number;
  rating: LockState;
  glow: string;
  glowId: string;
}) {
  if (rating === "high_risk") {
    return (
      <g className="lock-eyes" filter={`url(#${glowId})`}>
        <path d={`M${leftX - 6} ${y} L${leftX + 6} ${y - 2.5} L${leftX + 6} ${y + 2.5} Z`} fill={glow} />
        <path d={`M${rightX + 6} ${y} L${rightX - 6} ${y - 2.5} L${rightX - 6} ${y + 2.5} Z`} fill={glow} />
      </g>
    );
  }
  if (rating === "caution") {
    return (
      <g className="lock-eyes" filter={`url(#${glowId})`}>
        <ellipse cx={leftX} cy={y} rx="5" ry="2.2" fill={glow} transform={`rotate(-8 ${leftX} ${y})`} />
        <ellipse cx={rightX} cy={y} rx="5" ry="2.2" fill={glow} transform={`rotate(8 ${rightX} ${y})`} />
      </g>
    );
  }
  return (
    <g className="lock-eyes" filter={`url(#${glowId})`}>
      <circle cx={leftX} cy={y} r={rating === "idle" ? 3 : 3.6} fill={glow} />
      <circle cx={rightX} cy={y} r={rating === "idle" ? 3 : 3.6} fill={glow} />
    </g>
  );
}

// A held lightsaber — sheathed (hilt only) for the small picker glyphs
// (open=false), ignited to the rating's color for the large display icons.
function Saber({
  hiltX,
  hiltY,
  angle,
  length,
  ignited,
  glow,
  glowId,
}: {
  hiltX: number;
  hiltY: number;
  angle: number;
  length: number;
  ignited: boolean;
  glow: string;
  glowId: string;
}) {
  return (
    <g transform={`rotate(${angle} ${hiltX} ${hiltY})`}>
      <rect x={hiltX - 3} y={hiltY} width="6" height="22" rx="2.5" fill={HILT} stroke="#000" strokeWidth="1.5" />
      <circle cx={hiltX} cy={hiltY} r="3.5" fill="#4B5563" />
      {ignited && (
        <g className="lock-blade" filter={`url(#${glowId})`}>
          <rect x={hiltX - 2.2} y={hiltY - length} width="4.4" height={length + 2} rx="2.2" fill={glow} />
        </g>
      )}
    </g>
  );
}

export function LockIcon({
  character = "locki",
  rating,
  open,
  size = 32,
  className,
}: LockIconProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const glow = GLOW[rating];
  const glowId = `glow-${uid}`;

  const label =
    rating === "idle"
      ? `${character[0].toUpperCase()}${character.slice(1)}, ready to check a site`
      : `${character[0].toUpperCase()}${character.slice(1)}, ${rating.replace("_", " ")} rating`;

  return (
    <svg
      viewBox="0 0 160 192"
      width={size}
      height={(size * 192) / 160}
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <filter id={glowId} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="80" cy="184" rx="28" ry="6" fill={glow} opacity="0.16" />

      {character === "locki" && <LockiFigure rating={rating} open={open} glow={glow} glowId={glowId} />}
      {character === "socki" && <SockiFigure rating={rating} open={open} glow={glow} glowId={glowId} />}
      {character === "pocki" && <PockiFigure rating={rating} open={open} glow={glow} glowId={glowId} />}
    </svg>
  );
}

interface FigureProps {
  rating: LockState;
  open: boolean;
  glow: string;
  glowId: string;
}

// Named per the character-select exploration (see locki-design.md §4.1):
// Locki (standard guardian), Socki (tall, hood back, expressive brows),
// Pocki (small, oversized hood, mostly shadow). All three share the same
// color/state logic and the shared blink/reaction animations — only the
// robe silhouette and saber stance differ.
function LockiFigure({ rating, open, glow, glowId }: FigureProps) {
  return (
    <g className="lock-figure char-locki" data-reaction={REACTION[rating]}>
      {/* Robe */}
      <path d="M54 74 L40 170 Q80 182 120 170 L106 74 Z" fill={ROBE} stroke="#000" strokeWidth="2" />
      <path d="M80 78 L74 168 M80 78 L86 168" stroke={ROBE_DARK} strokeWidth="2" opacity="0.6" />
      <rect x="58" y="64" width="44" height="16" rx="7" fill="#1B1E25" />

      {/* Hood */}
      <path d="M42 74 Q42 12 80 12 Q118 12 118 74 Q118 80 112 82 L106 74 Q106 40 80 40 Q54 40 54 74 L48 82 Q42 80 42 74 Z" fill={HOOD} stroke="#000" strokeWidth="2" />
      <ellipse cx="80" cy="58" rx="24" ry="21" fill={SHADOW_FACE} />

      <Eyes leftX={70} rightX={90} y={58} rating={rating} glow={glow} glowId={glowId} />

      {/* Sleeve holding the hilt */}
      <ellipse cx="112" cy="120" rx="11" ry="9" fill={ROBE_DARK} transform="rotate(-18 112 120)" />
      <Saber hiltX={110} hiltY={128} angle={20} length={52} ignited={open} glow={glow} glowId={glowId} />
    </g>
  );
}

function SockiFigure({ rating, open, glow, glowId }: FigureProps) {
  const browAngle = rating === "high_risk" ? 16 : rating === "caution" ? 9 : 0;

  return (
    <g className="lock-figure char-socki" data-reaction={REACTION[rating]}>
      {/* Robe — broader, taller stance */}
      <path d="M46 66 L34 174 Q80 186 126 174 L114 66 Z" fill={ROBE} stroke="#000" strokeWidth="2" />
      <rect x="54" y="56" width="52" height="16" rx="7" fill="#1B1E25" />

      {/* Hood, pushed back to show more of the face */}
      <path d="M38 58 Q38 26 80 26 Q122 26 122 58 L110 66 Q110 42 80 42 Q50 42 50 66 Z" fill={HOOD} stroke="#000" strokeWidth="2" />
      <ellipse cx="80" cy="66" rx="27" ry="23" fill={SHADOW_FACE} />

      <path className="brow brow-l" d="M56 52 L76 46" stroke={GLOW.idle} strokeWidth="4" strokeLinecap="round" opacity="0.55" transform={`rotate(${-browAngle} 66 49)`} />
      <path className="brow brow-r" d="M104 52 L84 46" stroke={GLOW.idle} strokeWidth="4" strokeLinecap="round" opacity="0.55" transform={`rotate(${browAngle} 94 49)`} />

      <Eyes leftX={68} rightX={92} y={66} rating={rating} glow={glow} glowId={glowId} />

      {/* Two-handed saber, held centered */}
      <ellipse cx="66" cy="128" rx="10" ry="8" fill={ROBE_DARK} />
      <ellipse cx="94" cy="128" rx="10" ry="8" fill={ROBE_DARK} />
      <Saber hiltX={80} hiltY={126} angle={0} length={58} ignited={open} glow={glow} glowId={glowId} />
    </g>
  );
}

function PockiFigure({ rating, open, glow, glowId }: FigureProps) {
  return (
    <g className="lock-figure char-pocki" data-reaction={REACTION[rating]}>
      {/* Small, round robe */}
      <ellipse cx="80" cy="128" rx="46" ry="50" fill={ROBE} stroke="#000" strokeWidth="2" />

      {/* Oversized hood, drooping low over the face */}
      <path d="M32 96 Q32 30 80 30 Q128 30 128 96 Q128 108 116 112 Q118 78 80 78 Q42 78 44 112 Q32 108 32 96 Z" fill={HOOD} stroke="#000" strokeWidth="2" />
      <ellipse cx="80" cy="96" rx="30" ry="24" fill={SHADOW_FACE} />

      <Eyes leftX={70} rightX={90} y={98} rating={rating} glow={glow} glowId={glowId} />

      {/* Saber leaning against them, smaller scale */}
      <Saber hiltX={116} hiltY={150} angle={26} length={34} ignited={open} glow={glow} glowId={glowId} />
    </g>
  );
}
