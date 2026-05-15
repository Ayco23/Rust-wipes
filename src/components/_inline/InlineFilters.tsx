"use client";

import type { PlayerRestriction, ServerType } from "@/types/wipes";
import { cn } from "@/lib/cn";

export interface FilterState {
  types: ServerType[];
  restrictions: PlayerRestriction[];
}

interface InlineFiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
}

const TYPES: ServerType[] = ["official", "community", "modded"];
const RESTRICTIONS: PlayerRestriction[] = [
  "none",
  "solo",
  "duo",
  "trio",
  "quad",
  "quintet",
  "other",
];

export function InlineFilters({ value, onChange }: InlineFiltersProps): React.JSX.Element {
  const toggle = <T extends string>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  return (
    <div data-testid="inline-filters" className="space-y-3">
      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase text-neutral-500">Type</h3>
        <div className="flex flex-wrap gap-1">
          {TYPES.map((t) => {
            const active = value.types.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ ...value, types: toggle(value.types, t) })}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs",
                  active
                    ? "border-rust-600 bg-rust-600 text-white"
                    : "border-neutral-300 dark:border-neutral-700",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase text-neutral-500">Restriction</h3>
        <div className="flex flex-wrap gap-1">
          {RESTRICTIONS.map((r) => {
            const active = value.restrictions.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() =>
                  onChange({ ...value, restrictions: toggle(value.restrictions, r) })
                }
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs",
                  active
                    ? "border-rust-600 bg-rust-600 text-white"
                    : "border-neutral-300 dark:border-neutral-700",
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
