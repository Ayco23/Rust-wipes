"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useSelectedServers } from "@/lib/useSelectedServers";
import type { PlayerRestriction, Server, ServerType } from "@/types/wipes";

export interface ServerPickerItem {
  id: Server["id"];
  name: Server["name"];
  type: ServerType;
  playerRestriction: PlayerRestriction;
  hostName: string;
}

export interface ServerPickerProps {
  servers: ServerPickerItem[];
}

export function ServerPicker({ servers }: ServerPickerProps) {
  const [query, setQuery] = useState<string>("");
  const { selected, toggle, isReady } = useSelectedServers();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return servers;
    return servers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.hostName.toLowerCase().includes(q),
    );
  }, [query, servers]);

  const selectedCount = isReady ? selected.size : 0;

  return (
    <div className={cn("flex flex-col gap-3 w-full max-w-xl")}>
      <header className={cn("flex items-center justify-between")}>
        <h2 className={cn("text-lg font-semibold")}>Servers</h2>
        <span className={cn("text-sm text-gray-500")}>
          {selectedCount} of {servers.length} selected
        </span>
      </header>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search servers..."
        className={cn(
          "w-full rounded border border-gray-300 px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
        )}
      />
      <ul className={cn("flex flex-col divide-y divide-gray-200 rounded border border-gray-200")}>
        {filtered.length === 0 ? (
          <li className={cn("px-3 py-2 text-sm text-gray-500")}>No servers match.</li>
        ) : (
          filtered.map((server) => {
            const checked = selected.has(server.id);
            return (
              <li key={server.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm",
                    "hover:bg-gray-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(server.id)}
                    disabled={!isReady}
                    className={cn("h-4 w-4")}
                    aria-label={`Toggle ${server.name}`}
                  />
                  <span className={cn("flex flex-1 flex-col")}>
                    <span className={cn("font-medium")}>{server.name}</span>
                    <span className={cn("text-xs text-gray-500")}>
                      {server.hostName} - {server.type}
                      {server.playerRestriction !== "none"
                        ? ` - ${server.playerRestriction}`
                        : ""}
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

export default ServerPicker;
