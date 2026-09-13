import { LockIcon, type LockState } from "@/components/LockIcon";
import type { CharacterId } from "@/lib/characters";

// Each character keeps its own voice from the original character-select
// exploration — same underlying verdict, different personality saying it.
const MESSAGE: Record<CharacterId, Record<LockState, string>> = {
  locki: {
    idle: "Hi, I'm Locki! Paste a link and I'll check it out for you.",
    trustworthy: "You're all clear! Enjoy the site 🎉",
    caution: "Hmm, a couple things look off. Want the details?",
    high_risk: "Whoa, hold up! This one's risky.",
  },
  socki: {
    idle: "I'm Socki. Give me a link and I'll check it over.",
    trustworthy: "Checked and clear. Proceed with confidence.",
    caution: "A few flags here. Worth a closer look.",
    high_risk: "Stand back — this site failed the check.",
  },
  pocki: {
    idle: "Hi, I'm Pocki! Show me a link and I'll take a look.",
    trustworthy: "Aw, this one's a sweetheart. Go ahead!",
    caution: "Mmm, something feels a little off...",
    high_risk: "Eek! I don't like this one at all.",
  },
};

// The greeting host of the page — visible from first load, not just after
// a scan, so the companion reads as a host rather than a decoration that
// only shows up once there's a verdict to render.
export function LockAvatar({ character, state }: { character: CharacterId; state: LockState }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-3 max-w-[19rem] rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-md">
        {MESSAGE[character][state]}
        <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1.5 rotate-45 bg-white" />
      </div>
      <LockIcon character={character} rating={state} open size={140} />
    </div>
  );
}
