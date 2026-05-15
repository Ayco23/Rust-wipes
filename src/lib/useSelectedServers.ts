"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "rw:selectedServers";

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function writeToStorage(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore quota/serialization errors
  }
}

export interface UseSelectedServersResult {
  selected: Set<string>;
  toggle(id: string): void;
  setMany(ids: string[]): void;
  clear(): void;
  isReady: boolean;
}

export function useSelectedServers(): UseSelectedServersResult {
  const [selected, setSelected] = useState<Set<string>>(() => new Set<string>());
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setSelected(new Set(readFromStorage()));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    writeToStorage(selected);
  }, [selected, isReady]);

  const toggle = useCallback((id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setMany = useCallback((ids: string[]): void => {
    setSelected(new Set(ids));
  }, []);

  const clear = useCallback((): void => {
    setSelected(new Set<string>());
  }, []);

  return { selected, toggle, setMany, clear, isReady };
}
