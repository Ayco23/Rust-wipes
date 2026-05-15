"use client";

import { useEffect, useState } from "react";

export const SELECTED_SERVERS_KEY = "rw:selectedServers";

interface ServerOption {
  id: string;
  name: string;
}

interface InlinePickerProps {
  servers: ServerOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function InlinePicker({ servers, selected, onChange }: InlinePickerProps): React.JSX.Element {
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(SELECTED_SERVERS_KEY, JSON.stringify(selected));
    } catch {
      // ignore storage failures (e.g. quota, private mode)
    }
  }, [selected]);

  const filtered = servers.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (id: string): void => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div data-testid="inline-picker" className="space-y-2">
      <input
        type="search"
        placeholder="Search servers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
        {filtered.length === 0 && (
          <li className="text-xs text-neutral-500">No servers</li>
        )}
        {filtered.map((s) => (
          <li key={s.id}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => toggle(s.id)}
              />
              <span className="truncate">{s.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function loadSelectedServers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SELECTED_SERVERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}
