"use client";

import { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import type { WipeEvent } from "@/types/wipes";

export interface DayDetailProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  wipes: WipeEvent[];
}

function groupByHour(wipes: WipeEvent[]): Array<[number, WipeEvent[]]> {
  const map = new Map<number, WipeEvent[]>();
  for (const w of wipes) {
    const hour = w.occursAt.getHours();
    const bucket = map.get(hour);
    if (bucket) bucket.push(w);
    else map.set(hour, [w]);
  }
  return [...map.entries()].sort(([a], [b]) => a - b);
}

const typeBadgeClass: Record<WipeEvent["type"], string> = {
  official: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  community: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  modded: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
};

const kindBadgeClass: Record<WipeEvent["kind"], string> = {
  weekly: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  biweekly: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  forced: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  custom: "bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100",
};

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DayDetail({ open, onClose, date, wipes }: DayDetailProps) {
  const grouped = useMemo(() => groupByHour(wipes), [wipes]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Day detail">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900",
          "transition-transform duration-200 translate-x-0",
          "flex flex-col",
        )}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold">
              {date ? format(date, "EEEE, MMM d, yyyy") : "No date selected"}
            </h2>
            <p className="text-sm text-neutral-500">
              {wipes.length} {wipes.length === 1 ? "wipe" : "wipes"} scheduled
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <span aria-hidden="true">X</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {wipes.length === 0 ? (
            <p className="mt-8 text-center text-sm text-neutral-500">
              No wipes scheduled this day.
            </p>
          ) : (
            <ol className="space-y-6">
              {grouped.map(([hour, hourWipes]) => (
                <li key={hour}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {format(new Date().setHours(hour, 0, 0, 0), "h:00 a")}
                  </h3>
                  <ul className="space-y-3">
                    {hourWipes.map((w) => (
                      <li
                        key={`${w.serverId}-${w.occursAt.toISOString()}`}
                        className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium">{w.serverName}</p>
                          <time
                            dateTime={w.occursAt.toISOString()}
                            className="text-xs text-neutral-500"
                          >
                            {format(w.occursAt, "h:mm a")}
                          </time>
                        </div>
                        <p className="text-xs text-neutral-500">{w.hostName}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge className={typeBadgeClass[w.type]}>{w.type}</Badge>
                          {w.playerRestriction !== "none" && (
                            <Badge className="bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100">
                              {w.playerRestriction}
                            </Badge>
                          )}
                          <Badge className={kindBadgeClass[w.kind]}>{w.kind}</Badge>
                          {w.label && (
                            <Badge className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                              {w.label}
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>
    </div>
  );
}

export default DayDetail;
