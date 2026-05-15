"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/cn";
import type { WipeEvent } from "@/types/wipes";

interface InlineCalendarProps {
  month: Date;
  events: WipeEvent[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function InlineCalendar({ month, events }: InlineCalendarProps): React.JSX.Element {
  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div data-testid="inline-calendar" className="rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-100 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
        {WEEKDAYS.map((w) => (
          <div key={w} className="p-2 text-center">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.occursAt), d));
          const inMonth = isSameMonth(d, month);
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "min-h-[96px] border-b border-r border-neutral-200 p-1 text-xs dark:border-neutral-800",
                !inMonth && "bg-neutral-50 text-neutral-400 dark:bg-neutral-950/40 dark:text-neutral-600",
              )}
            >
              <div className="mb-1 font-medium">{format(d, "d")}</div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e, i) => (
                  <div
                    key={`${e.serverId}-${i}`}
                    className="truncate rounded bg-rust-600/10 px-1 py-0.5 text-rust-600"
                    title={`${e.serverName} (${e.type})`}
                  >
                    {format(new Date(e.occursAt), "HH:mm")} {e.serverName}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-neutral-500">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
