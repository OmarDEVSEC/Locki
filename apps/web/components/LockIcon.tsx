import type { Rating } from "@/lib/types";

interface LockIconProps {
  rating: Rating;
  open: boolean;
  size?: number;
  className?: string;
}

const RATING_COLOR: Record<Rating, string> = {
  trustworthy: "#16a34a",
  caution: "#ca8a04",
  high_risk: "#dc2626",
};
const RATING_COLOR_DARK: Record<Rating, string> = {
  trustworthy: "#0f7c37",
  caution: "#8a5e02",
  high_risk: "#a31d1d",
};

// Mouth curves are drawn with the "bowl holds water" rule: a control
// point below the endpoints reads as a smile, above reads as a frown.
const MOUTH_PATH: Record<Rating, string> = {
  trustworthy: "M58 112 Q80 132 102 112",
  caution: "M58 116 q11 6 22 0 q11 -6 22 0",
  high_risk: "M58 122 Q80 102 102 122",
};

// Named per the character-select exploration (see locki-design.md §4.1) —
// "Locki" was the direction chosen: big eyes, stubby arms, zero chill.
const REACTION: Record<Rating, "safe" | "caution" | "risk"> = {
  trustworthy: "safe",
  caution: "caution",
  high_risk: "risk",
};

// Shackle rotates open on click, and rests half-open for "caution" even
// when idle, so color is never the only signal (per design spec §4.4).
// The reaction (hop/shimmy/flinch) is a one-shot animation, not a
// perpetual idle loop — the badge floats persistently in a corner of the
// viewport, and constant ambient motion there would fight the
// accessibility-first "no distracting motion" principle in §4.4. It
// replays on every scan because the badge/panel remount per result
// (keyed in app/page.tsx), which is also what makes this safe to express
// as a plain CSS mount animation instead of JS-driven retriggering.
export function LockIcon({ rating, open, size = 32, className }: LockIconProps) {
  const color = RATING_COLOR[rating];
  const colorDark = RATING_COLOR_DARK[rating];
  const idleTilt = rating === "caution" && !open;
  const shackleClass = `lock-shackle${open || idleTilt ? " lock-shackle-open" : ""}`;

  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${rating.replace("_", " ")} rating`}
    >
      <g className="lock-figure" data-reaction={REACTION[rating]}>
        <ellipse
          className="lock-arm-l"
          cx="134"
          cy="108"
          rx="13"
          ry="9"
          fill={colorDark}
          transform="rotate(20 134 108)"
        />
        <ellipse
          className="lock-arm-r"
          cx="26"
          cy="108"
          rx="13"
          ry="9"
          fill={colorDark}
          transform="rotate(-20 26 108)"
        />

        <g className={shackleClass} style={{ transformOrigin: "80px 66px" }}>
          <path
            d="M60 66 V46 A20 20 0 0 1 100 46 V66"
            fill="none"
            stroke={colorDark}
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>

        <rect x="32" y="62" width="96" height="80" rx="36" fill={color} stroke={colorDark} strokeWidth="3" />

        <circle cx="80" cy="120" r="5" fill="white" opacity=".3" />
        <polygon points="76,124 84,124 80,132" fill="white" opacity=".3" />

        <g className="lock-eyes">
          <circle cx="62" cy="96" r="14" fill="white" />
          <circle cx="98" cy="96" r="14" fill="white" />
          <circle cx="63" cy="97" r="7" fill="#4A2F1C" />
          <circle cx="99" cy="97" r="7" fill="#4A2F1C" />
          <circle cx="60.5" cy="94.5" r="2.4" fill="white" />
          <circle cx="96.5" cy="94.5" r="2.4" fill="white" />
        </g>

        <path
          className="lock-mouth"
          d={MOUTH_PATH[rating]}
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <ellipse cx="58" cy="148" rx="14" ry="9" fill={colorDark} />
        <ellipse cx="102" cy="148" rx="14" ry="9" fill={colorDark} />
      </g>
    </svg>
  );
}
