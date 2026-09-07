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

// Mouth curves are drawn with the "bowl holds water" rule: a control
// point below the endpoints reads as a smile, above reads as a frown.
const MOUTH_PATH: Record<Rating, string> = {
  trustworthy: "M9 16.5 Q12 18.5 15 16.5",
  caution: "M9.5 17.5 L14.5 17.5",
  high_risk: "M9 18 Q12 16 15 18",
};

// Shackle rotates open on click, and rests half-open for "caution" even
// when idle, so color is never the only signal (per design spec §4.4).
// The face underneath is a second, independent signal on top of that:
// it smiles, stays neutral, or frowns depending on the rating.
export function LockIcon({ rating, open, size = 32, className }: LockIconProps) {
  const color = RATING_COLOR[rating];
  const idleTilt = rating === "caution" && !open;
  const shackleClass = `lock-shackle${open || idleTilt ? " lock-shackle-open" : ""}`;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${rating.replace("_", " ")} rating`}
    >
      <g className={shackleClass} style={{ transformOrigin: "12px 10px" }}>
        <path
          d="M8 10V7a4 4 0 0 1 8 0v3"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <rect x="5" y="10" width="14" height="10" rx="4" fill={color} />

      {rating === "high_risk" && (
        <g stroke="white" strokeWidth="1" strokeLinecap="round">
          <path d="M8 12.6 L10 13.6" />
          <path d="M16 12.6 L14 13.6" />
        </g>
      )}

      <g className="face-eyes-enter" fill="white">
        <circle cx="9.5" cy="14.5" r="1.15" />
        <circle cx="14.5" cy="14.5" r="1.15" />
      </g>

      <path
        className="face-mouth-enter"
        d={MOUTH_PATH[rating]}
        fill="none"
        stroke="white"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
