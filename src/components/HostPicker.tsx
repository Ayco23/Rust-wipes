"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

export interface HostPickerItem {
  id: string;
  name: string;
  serverCount: number;
}

export interface HostPickerProps {
  hosts: HostPickerItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  isReady: boolean;
}

export function HostPicker({ hosts, selected, onToggle, isReady }: HostPickerProps) {
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hosts;
    return hosts.filter((h) => h.name.toLowerCase().includes(q));
  }, [query, hosts]);

  const selectedCount = isReady ? selected.size : 0;

  return (
    <div className={cn("flex flex-col gap-3 w-full max-w-xl")}>
      <header className={cn("flex items-center justify-between")}>
        <h2 className={cn("text-lg font-semibold")}>Hosts</h2>
        <span className={cn("text-sm text-gray-500")}>
          {selectedCount} of {hosts.length} selected
        </span>
      </header>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search hosts..."
        className={cn(
          "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400",
          "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
        )}
      />
      <ul
        className={cn(
          "flex flex-col divide-y divide-gray-200 rounded border border-gray-200",
          "dark:divide-neutral-700 dark:border-neutral-700",
        )}
      >
        {filtered.length === 0 ? (
          <li className={cn("px-3 py-2 text-sm text-gray-500")}>No hosts match.</li>
        ) : (
          filtered.map((host) => {
            const checked = selected.has(host.id);
            return (
              <li key={host.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm",
                    "hover:bg-gray-50 dark:hover:bg-neutral-800",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(host.id)}
                    disabled={!isReady}
                    className={cn("h-4 w-4")}
                    aria-label={`Toggle ${host.name}`}
                  />
                  <span className={cn("flex flex-1 flex-col")}>
                    <span className={cn("font-medium")}>{host.name}</span>
                    <span className={cn("text-xs text-gray-500")}>
                      {host.serverCount} server{host.serverCount === 1 ? "" : "s"}
                    </span>
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export default HostPicker;
