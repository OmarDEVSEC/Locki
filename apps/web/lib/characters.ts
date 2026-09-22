import { useSyncExternalStore } from "react";

export type CharacterId = "locki" | "socki" | "pocki";

export interface CharacterMeta {
  id: CharacterId;
  name: string;
  tagline: string;
}

export const CHARACTERS: CharacterMeta[] = [
  { id: "locki", name: "Locki", tagline: "The watchful guardian" },
  { id: "socki", name: "Socki", tagline: "The steady sentinel" },
  { id: "pocki", name: "Pocki", tagline: "The small apprentice" },
];

export const DEFAULT_CHARACTER: CharacterId = "locki";
export const CHARACTER_STORAGE_KEY = "locki:character";

function isCharacterId(value: string | null): value is CharacterId {
  return value === "locki" || value === "socki" || value === "pocki";
}

// The saved preference is an external store (localStorage), not React
// state, so it's synced with useSyncExternalStore rather than read in a
// useEffect — that avoids both the SSR/hydration mismatch (localStorage
// doesn't exist on the server) and the "setState-in-effect" anti-pattern
// a plain read-then-setState effect would otherwise be.
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): CharacterId {
  const saved = localStorage.getItem(CHARACTER_STORAGE_KEY);
  return isCharacterId(saved) ? saved : DEFAULT_CHARACTER;
}

function getServerSnapshot(): CharacterId {
  return DEFAULT_CHARACTER;
}

export function useCharacterPreference(): [CharacterId, (id: CharacterId) => void] {
  const character = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setCharacter(id: CharacterId) {
    localStorage.setItem(CHARACTER_STORAGE_KEY, id);
    listeners.forEach((listener) => listener());
  }

  return [character, setCharacter];
}
