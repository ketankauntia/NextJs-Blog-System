"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads a JSON value out of localStorage as an external store.
 *
 * useSyncExternalStore is the right primitive here rather than an effect that
 * calls setState: the server snapshot is `null`, the client snapshot is whatever
 * is stored, and React reconciles the two without a hydration mismatch.
 */
export function useStoredValue<T>(key: string): T | null {
  const subscribe = useCallback((onChange: () => void) => {
    // Only cross-tab writes fire `storage`; same-tab writes go through the
    // component that made them, so there is nothing else to listen for.
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);

  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      // Private mode or blocked storage.
      return null;
    }
  }, [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
