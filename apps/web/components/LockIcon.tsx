import type { Rating } from "@/lib/types";

interface LockIconProps {
  rating: Rating;
  open: boolean;
  className?: string;
}

const RATING_COLOR: Record<Rating, string> = {
  trustworthy: "#16a34a",
  caution: "#ca8a04",
  high_risk: "#dc2626",
};

// Shackle rotates open on click, and rests half-open for "caution" even
// when idle, so color is never the only signal (per design spec §4.4).
export function LockIcon({ rating, open, className }: LockIconProps) {
  const color = RATING_COLOR[rating];
  const idleTilt = rating === "caution" && !open;
  const shackleClass = `lock-shackle${open || idleTilt ? " lock-shackle-open" : ""}`;

  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      className={className}
      role="img"
      aria-label={`${rating.replace("_", " ")} rating`}
    >
      <g className={shackleClass} style={{ transformOrigin: "12px 10px" }}>
        <path
          d="M8 10V7a4 4 0 0 1 8 0v3"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <rect x="5" y="10" width="14" height="10" rx="2" fill={color} />
    </svg>
  );
}
