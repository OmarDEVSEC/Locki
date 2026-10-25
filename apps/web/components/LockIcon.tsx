import type { Rating } from "@/lib/types";

export type LockState = Rating | "idle";

interface LockIconProps {
  rating: LockState;
  size?: number;
  className?: string;
}

const LABEL: Record<LockState, string> = {
  idle: "Locki, ready to check a site",
  trustworthy: "Locki, trustworthy rating",
  caution: "Locki, caution rating",
  high_risk: "Locki, high risk rating",
};

// Locki is a friendly hooded guardian with a small glowing light-saber. The
// saber glow and eyes take the current rating color (via --rating-color, set
// by data-state); everything else is warm and neutral. Expression is carried
// by eye AND mouth shape too, not color alone.
const glow = { fill: "var(--rating-color)" };
const outline = "var(--color-figure-outline)";
const robe = { fill: "var(--color-figure-robe)", stroke: outline };

function Eyes({ rating }: { rating: LockState }) {
  if (rating === "high_risk") {
    return (
      <g style={glow}>
        <path d="M59 62 L75 57.5 L75 65 Z" />
        <path d="M101 62 L85 57.5 L85 65 Z" />
      </g>
    );
  }
  if (rating === "caution") {
    return (
      <g style={glow}>
        <ellipse cx="68" cy="63" rx="6" ry="2.8" transform="rotate(-8 68 63)" />
        <ellipse cx="92" cy="63" rx="6" ry="2.8" transform="rotate(8 92 63)" />
      </g>
    );
  }
  return (
    <g style={glow}>
      <circle cx="68" cy="63" r="4.6" />
      <circle cx="92" cy="63" r="4.6" />
    </g>
  );
}

function Mouth({ rating }: { rating: LockState }) {
  const d =
    rating === "high_risk"
      ? "M70 83 Q80 76 90 83"
      : rating === "caution"
        ? "M72 80 L88 80"
        : "M69 77 Q80 87 91 77";
  return <path d={d} fill="none" stroke={outline} strokeWidth="3.5" strokeLinecap="round" />;
}

export function LockIcon({ rating, size = 96, className }: LockIconProps) {
  const smiling = rating === "idle" || rating === "trustworthy";
  return (
    <svg
      viewBox="0 0 160 192"
      width={size}
      height={(size * 192) / 160}
      className={className}
      data-state={rating}
      role="img"
      aria-label={LABEL[rating]}
    >
      {/* Rounded robe */}
      <path d="M48 94 Q32 150 42 172 Q80 187 118 172 Q128 150 112 94 Z" strokeWidth="2.5" strokeLinejoin="round" style={robe} />
      {/* Big round hood */}
      <ellipse cx="80" cy="60" rx="47" ry="47" strokeWidth="2.5" style={{ fill: "var(--color-figure-hood)", stroke: outline }} />
      {/* Face */}
      <ellipse cx="80" cy="66" rx="33" ry="29" style={{ fill: "var(--color-figure-face)" }} />
      {smiling && (
        <g style={{ fill: "var(--color-figure-blush)" }} opacity="0.7">
          <ellipse cx="55" cy="76" rx="6" ry="4" />
          <ellipse cx="105" cy="76" rx="6" ry="4" />
        </g>
      )}
      <Eyes rating={rating} />
      <Mouth rating={rating} />

      {/* Sleeve, hand, and the small glowing saber */}
      <ellipse cx="110" cy="130" rx="12" ry="10" transform="rotate(-18 110 130)" style={{ fill: "var(--color-figure-robe-dark)" }} />
      <g transform="rotate(15 124 140)">
        <g className="lock-blade">
          <rect x="116" y="94" width="16" height="50" rx="8" opacity="0.28" style={glow} />
          <rect x="120" y="98" width="8" height="44" rx="4" style={glow} />
          <rect x="123" y="102" width="2.5" height="36" rx="1.25" opacity="0.85" style={{ fill: "var(--color-figure-core)" }} />
        </g>
        <rect x="120.5" y="138" width="7" height="18" rx="3" strokeWidth="1.5" style={{ fill: "var(--color-figure-hilt)", stroke: outline }} />
        <circle cx="124" cy="143" r="6" strokeWidth="1.5" style={{ fill: "var(--color-figure-face)", stroke: outline }} />
      </g>
    </svg>
  );
}
