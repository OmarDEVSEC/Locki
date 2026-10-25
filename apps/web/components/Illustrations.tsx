// Small decorative scenes. One style: 2.5 stroke, round joins, three token fills
// (.fa blue tint, .fb amber tint, .fc neutral). All are aria-hidden: the text
// next to each one carries the meaning.

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 96 72"
      width={96}
      height={72}
      className="ill shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** A text message about a parcel and a small fee. */
export function ParcelTextScene() {
  return (
    <Scene>
      <rect x="26" y="5" width="40" height="62" rx="7" className="fc" />
      <path d="M44 61h4" />
      <rect x="32" y="13" width="28" height="15" rx="4" className="fa" />
      <path d="M37 18h18M37 23h11" />
      <path d="M38 38l10-5 10 5v11l-10 5-10-5z" className="fb" />
      <path d="M38 38l10 5 10-5M48 43v11" />
      <circle cx="76" cy="52" r="10" className="fb" />
      <path d="M76 47v10M72 52h8" />
    </Scene>
  );
}

/** An email saying the bank account is locked. */
export function BankEmailScene() {
  return (
    <Scene>
      <rect x="10" y="14" width="68" height="46" rx="7" className="fc" />
      <path d="M10 22l34 22 34-22" />
      <rect x="56" y="38" width="28" height="24" rx="5" className="fb" />
      <path d="M63 38v-5a7 7 0 0 1 14 0v5" />
      <path d="M70 47v6" />
    </Scene>
  );
}

/** A pop-up window announcing a prize. */
export function PrizePopupScene() {
  return (
    <Scene>
      <rect x="10" y="9" width="76" height="54" rx="7" className="fc" />
      <path d="M10 23h76" />
      <path d="M19 16h.01M26 16h.01M33 16h.01" />
      <path
        d="M48 29l3.6 7.4 8.1 1.1-5.9 5.7 1.4 8.1-7.2-3.9-7.2 3.9 1.4-8.1-5.9-5.7 8.1-1.1z"
        className="fb"
      />
    </Scene>
  );
}

/** Step 1: copy the link. */
export function CopyLinkScene() {
  return (
    <Scene>
      <rect x="22" y="9" width="34" height="42" rx="6" className="fc" />
      <rect x="38" y="22" width="36" height="42" rx="6" className="fa" />
      <path d="M46 36h20M46 45h13" />
    </Scene>
  );
}

/** Step 2: paste it into the box. */
export function PasteScene() {
  return (
    <Scene>
      <path d="M48 6v14M42 15l6 6 6-6" />
      <rect x="10" y="28" width="76" height="30" rx="8" className="fc" />
      <path d="M22 36v14" />
      <path d="M32 43h34" />
    </Scene>
  );
}
