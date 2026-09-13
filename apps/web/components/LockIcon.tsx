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

const COLOR: Record<LockState, string> = {
  idle: "#0d9488",
  trustworthy: "#16a34a",
  caution: "#ca8a04",
  high_risk: "#dc2626",
};
const COLOR_LIGHT: Record<LockState, string> = {
  idle: "#5eead4",
  trustworthy: "#86efac",
  caution: "#fde68a",
  high_risk: "#fca5a5",
};
const COLOR_DARK: Record<LockState, string> = {
  idle: "#0f766e",
  trustworthy: "#0f7c37",
  caution: "#8a5e02",
  high_risk: "#a31d1d",
};

const REACTION: Record<LockState, "safe" | "caution" | "risk"> = {
  idle: "safe",
  trustworthy: "safe",
  caution: "caution",
  high_risk: "risk",
};

const BLUSH = "#ff8a80";

function GlossyEyes({
  leftX,
  rightX,
  y,
  r,
  ink,
}: {
  leftX: number;
  rightX: number;
  y: number;
  r: number;
  ink: string;
}) {
  const pr = r * 0.5;
  return (
    <g className="lock-eyes">
      <circle cx={leftX} cy={y} r={r} fill="white" />
      <circle cx={rightX} cy={y} r={r} fill="white" />
      <circle cx={leftX + r * 0.05} cy={y + r * 0.05} r={pr} fill={ink} />
      <circle cx={rightX + r * 0.05} cy={y + r * 0.05} r={pr} fill={ink} />
      <circle cx={leftX - r * 0.18} cy={y - r * 0.22} r={pr * 0.32} fill="white" />
      <circle cx={rightX - r * 0.18} cy={y - r * 0.22} r={pr * 0.32} fill="white" />
    </g>
  );
}

// Named per the character-select exploration (see locki-design.md §4.1):
// Locki (big-eyed greeter), Socki (sturdy guardian, brows over arms),
// Pocki (near-limbless blob, all personality in the mouth). All three
// share the same color/state logic and the same shared blink/reveal/
// mount animations — only the body rig and reaction motion differ.
export function LockIcon({
  character = "locki",
  rating,
  open,
  size = 32,
  className,
}: LockIconProps) {
  const uid = useId();
  const color = COLOR[rating];
  const colorLight = COLOR_LIGHT[rating];
  const colorDark = COLOR_DARK[rating];
  const gradId = `lock-grad-${uid}`;

  const label =
    rating === "idle"
      ? `${character[0].toUpperCase()}${character.slice(1)}, ready to check a site`
      : `${character[0].toUpperCase()}${character.slice(1)}, ${rating.replace("_", " ")} rating`;

  return (
    <svg
      viewBox="0 0 160 168"
      width={size}
      height={(size * 168) / 160}
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="28%" r="75%">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="158" rx="34" ry="7" fill="black" opacity=".13" />

      {character === "locki" && (
        <LockiFigure rating={rating} open={open} fill={`url(#${gradId})`} colorDark={colorDark} />
      )}
      {character === "socki" && (
        <SockiFigure rating={rating} fill={`url(#${gradId})`} colorDark={colorDark} />
      )}
      {character === "pocki" && (
        <PockiFigure rating={rating} fill={`url(#${gradId})`} colorDark={colorDark} />
      )}
    </svg>
  );
}

interface FigureProps {
  rating: LockState;
  fill: string;
  colorDark: string;
}

// Mouth curves use the "bowl holds water" rule: a control point below the
// endpoints reads as a smile, above reads as a frown.
const LOCKI_MOUTH: Record<LockState, string> = {
  idle: "M58 112 Q80 130 102 112",
  trustworthy: "M58 112 Q80 132 102 112",
  caution: "M58 116 q11 6 22 0 q11 -6 22 0",
  high_risk: "M58 122 Q80 102 102 122",
};

function LockiFigure({ rating, open, fill, colorDark }: FigureProps & { open: boolean }) {
  const idleTilt = rating === "caution" && !open;
  const shackleClass = `lock-shackle${open || idleTilt ? " lock-shackle-open" : ""}`;

  return (
    <g className="lock-figure char-locki" data-reaction={REACTION[rating]}>
      <ellipse className="lock-arm-l" cx="134" cy="108" rx="13" ry="9" fill={colorDark} transform="rotate(20 134 108)" />
      <ellipse className="lock-arm-r" cx="26" cy="108" rx="13" ry="9" fill={colorDark} transform="rotate(-20 26 108)" />

      <g className={shackleClass} style={{ transformOrigin: "80px 66px" }}>
        <path d="M60 66 V46 A20 20 0 0 1 100 46 V66" fill="none" stroke={colorDark} strokeWidth="10" strokeLinecap="round" />
      </g>

      <rect x="32" y="62" width="96" height="80" rx="36" fill={fill} stroke={colorDark} strokeWidth="3" />

      <ellipse className="blush" cx="46" cy="112" rx="8" ry="5" fill={BLUSH} />
      <ellipse className="blush" cx="114" cy="112" rx="8" ry="5" fill={BLUSH} />

      <circle cx="80" cy="120" r="5" fill="white" opacity=".3" />
      <polygon points="76,124 84,124 80,132" fill="white" opacity=".3" />

      <GlossyEyes leftX={62} rightX={98} y={96} r={14} ink="#4A2F1C" />

      <path className="lock-mouth" d={LOCKI_MOUTH[rating]} fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />

      <ellipse cx="58" cy="148" rx="14" ry="9" fill={colorDark} />
      <ellipse cx="102" cy="148" rx="14" ry="9" fill={colorDark} />
    </g>
  );
}

const SOCKI_MOUTH: Record<LockState, string> = {
  idle: "M68 110 L80 116 L92 110",
  trustworthy: "M68 110 L80 116 L92 110",
  caution: "M68 113 H92",
  high_risk: "M68 114 L80 108 L92 114",
};

function SockiFigure({ rating, fill, colorDark }: FigureProps) {
  return (
    <g className="lock-figure char-socki" data-reaction={REACTION[rating]}>
      <path d="M70 46 V36 A10 10 0 0 1 90 36 V46" fill="none" stroke={colorDark} strokeWidth="7" strokeLinecap="round" />

      <rect x="36" y="54" width="88" height="90" rx="30" fill={fill} stroke={colorDark} strokeWidth="3" />

      <ellipse className="blush" cx="44" cy="104" rx="6" ry="4" fill={BLUSH} />
      <ellipse className="blush" cx="116" cy="104" rx="6" ry="4" fill={BLUSH} />

      <path className="brow brow-l" d="M46 62 L74 57" stroke={colorDark} strokeWidth="8" strokeLinecap="round" />
      <path className="brow brow-r" d="M114 62 L86 57" stroke={colorDark} strokeWidth="8" strokeLinecap="round" />

      <GlossyEyes leftX={62} rightX={98} y={90} r={12} ink="#4A2F1C" />

      <path className="lock-mouth" d={SOCKI_MOUTH[rating]} fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="46" y="134" width="20" height="14" rx="6" fill={colorDark} />
      <rect x="94" y="134" width="20" height="14" rx="6" fill={colorDark} />
    </g>
  );
}

const POCKI_MOUTH: Record<LockState, { d: string; kind: "path" | "circle" | "gasp" }> = {
  idle: { d: "M60 100 Q80 122 100 100", kind: "path" },
  trustworthy: { d: "M60 100 Q80 124 100 100", kind: "path" },
  caution: { d: "M80 106", kind: "circle" },
  high_risk: { d: "M80 108", kind: "gasp" },
};

function PockiFigure({ rating, fill, colorDark }: FigureProps) {
  const mouth = POCKI_MOUTH[rating];

  return (
    <g className="lock-figure char-pocki" data-reaction={REACTION[rating]}>
      <path d="M78 44 Q80 32 84 43" fill="none" stroke={colorDark} strokeWidth="6" strokeLinecap="round" />

      <ellipse cx="80" cy="98" rx="50" ry="54" fill={fill} stroke={colorDark} strokeWidth="3" />

      <ellipse className="blush" cx="52" cy="102" rx="9" ry="5" fill={BLUSH} />
      <ellipse className="blush" cx="108" cy="102" rx="9" ry="5" fill={BLUSH} />

      <circle cx="80" cy="118" r="6" fill="white" opacity=".28" />
      <polygon points="75,123 85,123 80,132" fill="white" opacity=".28" />

      <g className="lock-eyes" fill="#4A2F1C">
        <circle cx="64" cy="88" r="5.5" />
        <circle cx="96" cy="88" r="5.5" />
        <circle cx="61.8" cy="85.6" r="1.6" fill="white" />
        <circle cx="93.8" cy="85.6" r="1.6" fill="white" />
      </g>

      {mouth.kind === "path" && (
        <path className="lock-mouth" d={mouth.d} fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" />
      )}
      {mouth.kind === "circle" && <circle className="lock-mouth" cx="80" cy="106" r="5" fill="white" />}
      {mouth.kind === "gasp" && <ellipse className="lock-mouth" cx="80" cy="110" rx="9" ry="13" fill="white" />}

      <ellipse cx="64" cy="144" rx="8" ry="5" fill={colorDark} />
      <ellipse cx="96" cy="144" rx="8" ry="5" fill={colorDark} />
    </g>
  );
}
