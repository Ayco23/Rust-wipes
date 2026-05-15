"use client";

import {
  addDays,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo } from "react";
import { cn } from "@/lib/cn";
import type { ServerType, WipeEvent } from "@/types/wipes";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const MAX_PILLS_PER_CELL = 3;
const TOTAL_CELLS = 42;

const TYPE_PILL_CLASSES: Record<ServerType, string> = {
  official: "bg-sky-600/90 text-white",
  community: "bg-emerald-600/90 text-white",
  modded: "bg-violet-600/90 text-white",
};

export interface CalendarMonthProps {
  month: Date;
  wipes: WipeEvent[];
  onDayClick?: (date: Date) => void;
  selectedDay?: Date | null;
}

interface DayCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isForceWipe: boolean;
  events: WipeEvent[];
}

// Facepunch's monthly force wipe lands on the 1st Thursday of every month.
function isForceWipeDay(d: Date): boolean {
  return d.getDay() === 4 && d.getDate() <= 7;
}

function buildCells(month: Date, wipes: WipeEvent[]): DayCell[] {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const today = startOfDay(new Date());

  const eventsByDay = new Map<number, WipeEvent[]>();
  for (const wipe of wipes) {
    const key = startOfDay(wipe.occursAt).getTime();
    const bucket = eventsByDay.get(key);
    if (bucket) bucket.push(wipe);
    else eventsByDay.set(key, [wipe]);
  }
  for (const bucket of eventsByDay.values()) {
    bucket.sort((a, b) => a.occursAt.getTime() - b.occursAt.getTime());
  }

  const cells: DayCell[] = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const date = addDays(gridStart, i);
    cells.push({
      date,
      inMonth: isSameMonth(date, month),
      isToday: isSameDay(date, today),
      isForceWipe: isForceWipeDay(date),
      events: eventsByDay.get(startOfDay(date).getTime()) ?? [],
    });
  }
  return cells;
}

export function CalendarMonth({
  month,
  wipes,
  onDayClick,
  selectedDay,
}: CalendarMonthProps) {
  const cells = useMemo(() => buildCells(month, wipes), [month, wipes]);

  return (
    <div
      className="w-full select-none"
      role="grid"
      aria-label="Wipe calendar month"
    >
      <div
        className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800"
        role="row"
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            role="columnheader"
            className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {cells.map((cell) => {
          const isSelected =
            selectedDay != null && isSameDay(cell.date, selectedDay);
          const overflow = cell.events.length - MAX_PILLS_PER_CELL;
          return (
            <button
              key={cell.date.toISOString()}
              type="button"
              onClick={() => onDayClick?.(cell.date)}
              role="gridcell"
              aria-selected={isSelected}
              data-testid={`day-${cell.date.toISOString().slice(0, 10)}`}
              className={cn(
                "flex min-h-[6rem] flex-col gap-1 border-b border-r border-neutral-200 p-1 text-left transition-colors dark:border-neutral-800",
                "hover:bg-neutral-100/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-neutral-900/70",
                !cell.inMonth && "bg-neutral-50/60 text-neutral-400 dark:bg-neutral-950/40 dark:text-neutral-600",
                cell.isForceWipe && cell.inMonth && "bg-red-50/70 dark:bg-red-950/30",
                isSelected && "ring-2 ring-sky-500",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    cell.isToday && "bg-sky-600 text-white",
                  )}
                >
                  {cell.date.getDate()}
                </span>
                {cell.isForceWipe && (
                  <span
                    title="Facepunch monthly force wipe (1st Thursday)"
                    className="rounded bg-red-600 px-1 text-[9px] font-bold uppercase tracking-wide text-white"
                  >
                    Force
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-0.5">
                {cell.events.slice(0, MAX_PILLS_PER_CELL).map((event, idx) => (
                  <li
                    key={`${event.serverId}-${event.occursAt.toISOString()}-${idx}`}
                    title={event.serverName}
                    className={cn(
                      "truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
                      TYPE_PILL_CLASSES[event.type],
                    )}
                  >
                    {event.serverName}
                  </li>
                ))}
                {overflow > 0 && (
                  <li className="px-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    +{overflow} more
                  </li>
                )}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarMonth;
