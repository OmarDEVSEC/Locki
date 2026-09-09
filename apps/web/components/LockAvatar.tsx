import { LockIcon, type LockState } from "@/components/LockIcon";

const MESSAGE: Record<LockState, string> = {
  idle: "Hi, I'm Locki! Paste a link and I'll check it out for you.",
  trustworthy: "You're all clear! Enjoy the site 🎉",
  caution: "Hmm, a couple things look off. Want the details?",
  high_risk: "Whoa, hold up! This one's risky.",
};

// The greeting host of the page — visible from first load, not just after
// a scan, so Locki reads as a companion rather than a decoration that
// only shows up once there's a verdict to render.
export function LockAvatar({ state }: { state: LockState }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-3 max-w-[19rem] rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-md">
        {MESSAGE[state]}
        <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1.5 rotate-45 bg-white" />
      </div>
      <LockIcon rating={state} open size={140} />
    </div>
  );
}
