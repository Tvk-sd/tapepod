import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Tape } from './types';
import { emptyTape, addTrack, removeTrack, isFull } from './tape';

// useTape — the Tape Curation aggregate as a React hook. Holds the loaded tape,
// applies the pure curation rules, and persists across restarts (PRD 17).
// Works on web (localStorage) and iOS via AsyncStorage's unified API.

const STORAGE_KEY = 'tapepod.tape.v1';

export function useTape() {
  const [tape, setTape] = useState<Tape>(emptyTape());
  const [hydrated, setHydrated] = useState(false);

  // Load the last-saved tape once on mount.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setTape(JSON.parse(raw) as Tape);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Persist on every change, but only after the initial load (don't clobber it).
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tape)).catch(() => {});
  }, [tape, hydrated]);

  const add = useCallback((track: Track) => setTape((t) => addTrack(t, track)), []);
  const remove = useCallback((id: string) => setTape((t) => removeTrack(t, id)), []);
  const clear = useCallback(() => setTape(emptyTape()), []);

  return { tape, add, remove, clear, full: isFull(tape), hydrated };
}
