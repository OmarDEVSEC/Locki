import { CHARACTERS, type CharacterId } from "@/lib/characters";
import { LockIcon } from "@/components/LockIcon";

interface CharacterPickerProps {
  selected: CharacterId;
  onSelect: (id: CharacterId) => void;
}

export function CharacterPicker({ selected, onSelect }: CharacterPickerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
        Choose your companion
      </p>
      <div className="flex gap-3">
        {CHARACTERS.map((c) => {
          const isSelected = c.id === selected;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-pressed={isSelected}
              title={`${c.name} — ${c.tagline}`}
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:-translate-y-0.5 ${
                isSelected ? "ring-2 ring-orange-500 ring-offset-2" : "ring-1 ring-stone-200"
              }`}
            >
              <LockIcon character={c.id} rating="idle" open={false} size={38} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
