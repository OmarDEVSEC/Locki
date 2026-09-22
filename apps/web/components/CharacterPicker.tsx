import { CHARACTERS, type CharacterId } from "@/lib/characters";
import { LockIcon } from "@/components/LockIcon";

interface CharacterPickerProps {
  selected: CharacterId;
  onSelect: (id: CharacterId) => void;
}

export function CharacterPicker({ selected, onSelect }: CharacterPickerProps) {
  return (
    <div className="w-full">
      <p
        className="mb-4 text-center font-bold uppercase tracking-widest text-muted"
        style={{ fontSize: "0.62rem", letterSpacing: "0.1em" }}
      >
        Choose your guide
      </p>
      <div className="flex justify-center gap-3">
        {CHARACTERS.map((c) => {
          const isSelected = c.id === selected;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-pressed={isSelected}
              className="flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 transition-all hover:scale-105 active:scale-95"
              style={
                isSelected
                  ? {
                      background: "var(--color-void-deep)",
                      color: "var(--color-ink)",
                      border: "1.5px solid var(--color-ink)",
                      boxShadow: "0 0 20px rgba(244,245,247,0.25)",
                    }
                  : {
                      background: "var(--color-panel)",
                      color: "var(--color-muted)",
                      border: "1.5px solid var(--color-border)",
                    }
              }
            >
              <LockIcon character={c.id} rating="idle" open={false} size={44} />
              <span className="font-display font-semibold" style={{ fontSize: "0.9rem" }}>
                {c.name}
              </span>
              <span className="text-xs font-medium opacity-70">{c.tagline}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
