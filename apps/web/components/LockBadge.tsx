"use client";

import { useState } from "react";
import type { Rating } from "@/lib/types";
import { LockIcon } from "@/components/LockIcon";

const RATING_LABEL: Record<Rating, string> = {
  trustworthy: "Trustworthy",
  caution: "Proceed with caution",
  high_risk: "High risk",
};

const RATING_BG: Record<Rating, string> = {
  trustworthy: "bg-green-50 border-green-600",
  caution: "bg-yellow-50 border-yellow-600",
  high_risk: "bg-red-50 border-red-600",
};

interface LockBadgeProps {
  rating: Rating;
  open: boolean;
  onToggle: () => void;
}

export function LockBadge({ rating, open, onToggle }: LockBadgeProps) {
  const [mounted] = useState(true);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`lock-badge-hover flex h-11 items-center gap-2 rounded-full border-2 px-5 ${RATING_BG[rating]}`}
      aria-expanded={open}
    >
      <span
        className={`inline-flex ${mounted ? "lock-badge-enter" : ""} ${
          rating === "high_risk" && !open ? "lock-badge-pulse" : ""
        }`}
      >
        <LockIcon rating={rating} open={open} />
      </span>
      <span className="text-base font-semibold text-stone-800">
        {RATING_LABEL[rating]}
      </span>
    </button>
  );
}
