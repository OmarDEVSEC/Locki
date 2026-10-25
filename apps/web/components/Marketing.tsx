import { LockIcon } from "@/components/LockIcon";
import {
  BankEmailScene,
  CopyLinkScene,
  ParcelTextScene,
  PasteScene,
  PrizePopupScene,
} from "@/components/Illustrations";

const SCENARIOS = [
  {
    scene: <ParcelTextScene />,
    title: "A text says your parcel is waiting",
    body: "It asks you to pay a small fee.",
  },
  {
    scene: <BankEmailScene />,
    title: "An email says your bank account is locked",
    body: "It asks you to click a link to fix it.",
  },
  {
    scene: <PrizePopupScene />,
    title: "A pop-up says you've won a prize",
    body: "It asks you to claim it right now.",
  },
];

const STEPS = [
  { scene: <CopyLinkScene />, title: "Copy the link", body: "Press and hold the link, then choose Copy." },
  { scene: <PasteScene />, title: "Paste it here", body: "Put it in the box at the top of this page." },
  {
    scene: <LockIcon rating="trustworthy" size={56} className="shrink-0" />,
    title: "Locki tells you if it's safe",
    body: "We check the site's security and read its Terms of Service for you.",
  },
];

export function WhenToUse({ onCheckLink }: { onCheckLink: () => void }) {
  return (
    <section aria-labelledby="when-heading" className="flex flex-col gap-4">
      <h2 id="when-heading" className="text-xl font-bold">
        When to use Locki
      </h2>
      <ul className="flex flex-col gap-3">
        {SCENARIOS.map((s) => (
          <li key={s.title} className="card flex items-center gap-4 p-4">
            {s.scene}
            <div className="min-w-0">
              <h3 className="text-base font-bold">{s.title}</h3>
              <p className="text-base text-fg-muted">{s.body}</p>
              <p className="mt-1 text-base font-bold">Paste the link into Locki first.</p>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-secondary w-full" onClick={onCheckLink}>
        Check a link now
      </button>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="flex flex-col gap-4">
      <h2 id="how-heading" className="text-xl font-bold">
        How it works
      </h2>
      <ol className="flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card flex items-center gap-4 p-4">
            <div className="flex w-24 shrink-0 justify-center">{s.scene}</div>
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-base font-bold">
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </span>
              </h3>
              <p className="mt-1 text-base text-fg-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Reassurance() {
  return (
    <p className="border-t-2 border-border pt-5 text-center text-base text-fg-muted">
      Free to use. We never ask for passwords or bank details.
    </p>
  );
}
