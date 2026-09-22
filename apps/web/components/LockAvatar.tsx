import { LockIcon, type LockState } from "@/components/LockIcon";
import type { CharacterId } from "@/lib/characters";

export type BubbleState = LockState | "loading";

// Each character keeps its own voice from the original character-select
// exploration — same underlying verdict, different personality saying it.
const MESSAGE: Record<CharacterId, Record<BubbleState, string>> = {
  locki: {
    idle: "I sense a link needs checking. Show me the way.",
    loading: "Reaching out through the Force to check this one…",
    trustworthy: "Balance confirmed. This site walks the light.",
    caution: "Something feels... uncertain here.",
    high_risk: "The dark side is strong with this one.",
  },
  socki: {
    idle: "Bring me a link. I'll stand watch.",
    loading: "Scanning for signs of the dark side…",
    trustworthy: "Cleared. The light holds steady here.",
    caution: "My instincts are unsettled. Proceed carefully.",
    high_risk: "Corrupted. Stand back.",
  },
  pocki: {
    idle: "A link, please? I'll take a careful look.",
    loading: "Focusing... this may take a moment…",
    trustworthy: "It's safe! I can feel the light in this one.",
    caution: "Hmm... something's off, I think.",
    high_risk: "It's turned! Get away from this one!",
  },
};

// Bubble ring color matches the mascot's current lightsaber glow — idle
// and loading share the neutral dormant grey so a not-yet-scored site
// can't be mistaken for a verdict.
const RING: Record<BubbleState, string> = {
  idle: "#6B7280",
  loading: "#6B7280",
  trustworthy: "#38BDF8",
  caution: "#FBBF24",
  high_risk: "#EF4444",
};

// The greeting host of the page — visible from first load, not just after
// a scan, so the companion reads as a host rather than a decoration that
// only shows up once there's a verdict to render.
export function LockAvatar({
  character,
  state,
  size = 140,
}: {
  character: CharacterId;
  state: BubbleState;
  size?: number;
}) {
  const ring = RING[state];
  const iconState: LockState = state === "loading" ? "idle" : state;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4" style={{ maxWidth: 290 }}>
        <div
          className="rounded-2xl bg-panel px-5 py-3 text-center text-sm font-semibold text-ink"
          style={{
            border: `1.5px solid ${ring}`,
            lineHeight: 1.45,
            boxShadow: `0 0 16px ${ring}33`,
          }}
        >
          {MESSAGE[character][state]}
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -13,
            width: 0,
            height: 0,
            borderLeft: "11px solid transparent",
            borderRight: "11px solid transparent",
            borderTop: `13px solid ${ring}`,
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -9,
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid var(--color-panel)",
          }}
        />
      </div>
      <LockIcon character={character} rating={iconState} open size={size} />
    </div>
  );
}
