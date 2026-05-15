// TEMPORARY — will be replaced by src/lib/recurrence.ts once that unit lands.
//
// Minimal projection helper for /api/wipes. Supports weekly RRULEs of the form
// FREQ=WEEKLY;BYDAY=MO,TU,...;BYHOUR=H;BYMINUTE=M (interval optional) plus
// per-server WipeEventOverrides (skip + one-offs). Honors IANA timezone in the
// rule by interpreting BYHOUR/BYMINUTE as wall-clock in that zone.

import { fromZonedTime } from "date-fns-tz";
import type {
  PlayerRestriction,
  ScheduleKind,
  ServerType,
  WipeEvent,
} from "@/types/wipes";

const DAY_CODES: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

type ParsedRule = {
  interval: number;
  byDay: number[];
  byHour: number;
  byMinute: number;
};

function parseRRule(rrule: string): ParsedRule | null {
  const parts = rrule
    .replace(/^RRULE:/i, "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  const map: Record<string, string> = {};
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k && v !== undefined) map[k.toUpperCase()] = v;
  }
  if (map.FREQ !== "WEEKLY") return null;
  const interval = map.INTERVAL ? Math.max(1, parseInt(map.INTERVAL, 10)) : 1;
  const byDay = (map.BYDAY ?? "")
    .split(",")
    .map((d) => DAY_CODES[d.trim().toUpperCase()])
    .filter((n): n is number => typeof n === "number");
  if (byDay.length === 0) return null;
  const byHour = map.BYHOUR ? parseInt(map.BYHOUR, 10) : 0;
  const byMinute = map.BYMINUTE ? parseInt(map.BYMINUTE, 10) : 0;
  return { interval, byDay, byHour, byMinute };
}

/** Add days in UTC. */
function addUTCDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86_400_000);
}

/**
 * Generate weekly occurrences between [from, to] (inclusive).
 * BYHOUR/BYMINUTE are interpreted in `timezone` (IANA).
 */
function generateWeekly(
  rule: ParsedRule,
  dtstart: Date,
  timezone: string,
  from: Date,
  to: Date,
): Date[] {
  const out: Date[] = [];
  // Start scanning from the earlier of dtstart and `from`, but no earlier than dtstart.
  const scanStart = dtstart.getTime() > from.getTime() ? dtstart : from;
  // Walk back to the Sunday (UTC) of the scanStart week.
  const startUTC = new Date(
    Date.UTC(
      scanStart.getUTCFullYear(),
      scanStart.getUTCMonth(),
      scanStart.getUTCDate(),
    ),
  );
  const dow = startUTC.getUTCDay();
  let weekAnchor = addUTCDays(startUTC, -dow); // Sunday 00:00 UTC
  // Move back one extra week in case timezone shift pulls an event earlier.
  weekAnchor = addUTCDays(weekAnchor, -7);

  // Determine the weekly cycle index relative to dtstart so INTERVAL works.
  const dtstartUTC = new Date(
    Date.UTC(
      dtstart.getUTCFullYear(),
      dtstart.getUTCMonth(),
      dtstart.getUTCDate(),
    ),
  );
  const dtstartSunday = addUTCDays(dtstartUTC, -dtstartUTC.getUTCDay());

  const hh = String(rule.byHour).padStart(2, "0");
  const mm = String(rule.byMinute).padStart(2, "0");

  while (weekAnchor.getTime() <= to.getTime() + 7 * 86_400_000) {
    const weeksSinceStart = Math.round(
      (weekAnchor.getTime() - dtstartSunday.getTime()) / (7 * 86_400_000),
    );
    if (
      weeksSinceStart >= 0 &&
      weeksSinceStart % rule.interval === 0
    ) {
      for (const dayIdx of rule.byDay) {
        const dayUTC = addUTCDays(weekAnchor, dayIdx);
        const y = dayUTC.getUTCFullYear();
        const m = String(dayUTC.getUTCMonth() + 1).padStart(2, "0");
        const d = String(dayUTC.getUTCDate()).padStart(2, "0");
        // Local wall-clock in `timezone`, converted to UTC.
        const occursAt = fromZonedTime(
          `${y}-${m}-${d}T${hh}:${mm}:00`,
          timezone,
        );
        if (
          occursAt.getTime() >= dtstart.getTime() &&
          occursAt.getTime() >= from.getTime() &&
          occursAt.getTime() <= to.getTime()
        ) {
          out.push(occursAt);
        }
      }
    }
    weekAnchor = addUTCDays(weekAnchor, 7);
  }
  return out;
}

export type ProjectInput = {
  server: {
    id: string;
    name: string;
    hostId: string;
    type: ServerType;
    playerRestriction: PlayerRestriction;
    region: string | null;
    host: { id: string; name: string };
    schedules: Array<{
      rrule: string;
      dtstart: Date;
      timezone: string;
      kind: ScheduleKind;
      label: string | null;
    }>;
    overrides: Array<{
      occursAt: Date;
      skip: boolean;
      label: string | null;
    }>;
  };
  from: Date;
  to: Date;
};

/** Project events for a single server in a window. */
export function projectStub(input: ProjectInput): WipeEvent[] {
  const { server, from, to } = input;
  const base = {
    serverId: server.id,
    serverName: server.name,
    hostId: server.hostId,
    hostName: server.host.name,
    type: server.type,
    playerRestriction: server.playerRestriction,
    region: server.region ?? null,
  };

  // Collect candidate occurrences from each rule.
  const candidates: Array<{
    occursAt: Date;
    kind: ScheduleKind;
    label: string | null;
  }> = [];
  for (const rule of server.schedules) {
    const parsed = parseRRule(rule.rrule);
    if (!parsed) continue;
    const occs = generateWeekly(parsed, rule.dtstart, rule.timezone, from, to);
    for (const o of occs) {
      candidates.push({ occursAt: o, kind: rule.kind, label: rule.label });
    }
  }

  // Apply skip overrides: suppress any candidate within 12h of a skip override.
  const SKIP_WINDOW_MS = 12 * 60 * 60 * 1000;
  const skipOverrides = server.overrides.filter((o) => o.skip);
  const filtered = candidates.filter((c) => {
    return !skipOverrides.some(
      (s) => Math.abs(s.occursAt.getTime() - c.occursAt.getTime()) <= SKIP_WINDOW_MS,
    );
  });

  // Add one-off (non-skip) overrides as explicit events within the window.
  for (const o of server.overrides) {
    if (o.skip) continue;
    if (o.occursAt.getTime() < from.getTime() || o.occursAt.getTime() > to.getTime()) continue;
    filtered.push({
      occursAt: o.occursAt,
      kind: "forced",
      label: o.label,
    });
  }

  // Deduplicate by occursAt timestamp (override wins over rule by replacing later).
  const seen = new Map<number, { occursAt: Date; kind: ScheduleKind; label: string | null }>();
  for (const c of filtered) {
    seen.set(c.occursAt.getTime(), c);
  }

  return Array.from(seen.values())
    .sort((a, b) => a.occursAt.getTime() - b.occursAt.getTime())
    .map((c) => ({
      ...base,
      occursAt: c.occursAt,
      kind: c.kind,
      label: c.label,
    }));
}
