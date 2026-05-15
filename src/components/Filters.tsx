"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { PlayerRestriction, ServerType } from "@/types/wipes";

export type FilterState = {
  types: ServerType[];
  restrictions: PlayerRestriction[];
  hostIds: string[];
  regions: string[];
};

export type FiltersProps = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  hosts: { id: string; name: string }[];
  regions: string[];
};

const TYPE_OPTIONS: { value: ServerType; label: string }[] = [
  { value: "official", label: "Official" },
  { value: "community", label: "Community" },
  { value: "modded", label: "Modded" },
];

const RESTRICTION_OPTIONS: { value: PlayerRestriction; label: string }[] = [
  { value: "none", label: "None" },
  { value: "solo", label: "Solo" },
  { value: "duo", label: "Duo" },
  { value: "trio", label: "Trio" },
  { value: "quad", label: "Quad" },
  { value: "quintet", label: "Quintet" },
  { value: "other", label: "Other" },
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item];
}

function Chip({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}): React.JSX.Element {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-rust-600 bg-rust-600 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800",
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={active}
        onChange={onClick}
        aria-label={ariaLabel}
      />
      {children}
    </label>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Filters({ value, onChange, hosts, regions }: FiltersProps): React.JSX.Element {
  const empty: FilterState = { types: [], restrictions: [], hostIds: [], regions: [] };
  const totalSelected =
    value.types.length + value.restrictions.length + value.hostIds.length + value.regions.length;

  return (
    <section
      aria-label="Filters"
      className={cn(
        "space-y-5 rounded-lg border border-neutral-200 bg-white p-4",
        "dark:border-neutral-800 dark:bg-neutral-900",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        <button
          type="button"
          onClick={() => onChange(empty)}
          disabled={totalSelected === 0}
          className={cn(
            "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
            totalSelected === 0
              ? "cursor-not-allowed border-neutral-200 text-neutral-400 dark:border-neutral-800 dark:text-neutral-600"
              : "border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800",
          )}
        >
          Clear all
        </button>
      </div>

      <Group title="Type">
        {TYPE_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            active={value.types.includes(opt.value)}
            ariaLabel={`type-${opt.value}`}
            onClick={() => onChange({ ...value, types: toggle(value.types, opt.value) })}
          >
            {opt.label}
          </Chip>
        ))}
      </Group>

      <Group title="Player Restriction">
        {RESTRICTION_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            active={value.restrictions.includes(opt.value)}
            ariaLabel={`restriction-${opt.value}`}
            onClick={() =>
              onChange({
                ...value,
                restrictions: toggle(value.restrictions, opt.value),
              })
            }
          >
            {opt.label}
          </Chip>
        ))}
      </Group>

      {hosts.length > 0 && (
        <Group title="Host">
          {hosts.map((h) => (
            <Chip
              key={h.id}
              active={value.hostIds.includes(h.id)}
              ariaLabel={`host-${h.id}`}
              onClick={() =>
                onChange({ ...value, hostIds: toggle(value.hostIds, h.id) })
              }
            >
              {h.name}
            </Chip>
          ))}
        </Group>
      )}

      <Group title="Region">
        {regions.length === 0 ? (
          <span className="text-sm text-neutral-400 dark:text-neutral-500">No regions available</span>
        ) : (
          regions.map((r) => (
            <Chip
              key={r}
              active={value.regions.includes(r)}
              ariaLabel={`region-${r}`}
              onClick={() =>
                onChange({ ...value, regions: toggle(value.regions, r) })
              }
            >
              {r}
            </Chip>
          ))
        )}
      </Group>
    </section>
  );
}

export default Filters;
