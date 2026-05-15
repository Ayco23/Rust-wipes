import type { ScheduleKind } from "@/types/wipes";

export interface ScheduleDraft {
  rrule: string;
  timezone: string;
  kind: ScheduleKind;
  label: string;
}

const WEEKDAYS: Record<string, { full: string; byday: string }> = {
  monday: { full: "Monday", byday: "MO" },
  mon: { full: "Monday", byday: "MO" },
  tuesday: { full: "Tuesday", byday: "TU" },
  tue: { full: "Tuesday", byday: "TU" },
  tues: { full: "Tuesday", byday: "TU" },
  wednesday: { full: "Wednesday", byday: "WE" },
  wed: { full: "Wednesday", byday: "WE" },
  thursday: { full: "Thursday", byday: "TH" },
  thu: { full: "Thursday", byday: "TH" },
  thur: { full: "Thursday", byday: "TH" },
  thurs: { full: "Thursday", byday: "TH" },
  friday: { full: "Friday", byday: "FR" },
  fri: { full: "Friday", byday: "FR" },
  saturday: { full: "Saturday", byday: "SA" },
  sat: { full: "Saturday", byday: "SA" },
  sunday: { full: "Sunday", byday: "SU" },
  sun: { full: "Sunday", byday: "SU" },
};

const TIMEZONE_MAP: Record<string, string> = {
  EST: "America/New_York",
  EDT: "America/New_York",
  ET: "America/New_York",
  CST: "America/Chicago",
  CDT: "America/Chicago",
  CT: "America/Chicago",
  MST: "America/Denver",
  MDT: "America/Denver",
  MT: "America/Denver",
  PST: "America/Los_Angeles",
  PDT: "America/Los_Angeles",
  PT: "America/Los_Angeles",
  GMT: "Europe/London",
  BST: "Europe/London",
  UTC: "UTC",
  CET: "Europe/Paris",
  CEST: "Europe/Paris",
  AEST: "Australia/Sydney",
  AEDT: "Australia/Sydney",
};

const ORDINALS: Record<string, number> = {
  "1st": 1,
  first: 1,
  "2nd": 2,
  second: 2,
  "3rd": 3,
  third: 3,
  "4th": 4,
  fourth: 4,
  "5th": 5,
  fifth: 5,
  last: -1,
};

const WEEKDAY_PATTERN =
  "monday|mondays|tuesday|tuesdays|wednesday|wednesdays|thursday|thursdays|friday|fridays|saturday|saturdays|sunday|sundays|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun";

const TZ_PATTERN = Object.keys(TIMEZONE_MAP).join("|");

function normalizeWeekday(raw: string): { full: string; byday: string } | null {
  const key = raw.toLowerCase().replace(/s$/, "");
  return WEEKDAYS[key] ?? null;
}

function parseTime(
  hour: string,
  minute: string | undefined,
  ampm: string | undefined,
): { hh: number; mm: number } | null {
  let h = parseInt(hour, 10);
  const m = minute ? parseInt(minute, 10) : 0;
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  if (ampm) {
    const ap = ampm.toLowerCase();
    if (h < 1 || h > 12) return null;
    if (ap === "pm" && h !== 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
  }
  return { hh: h, mm: m };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function dedupe(drafts: ScheduleDraft[]): ScheduleDraft[] {
  const seen = new Set<string>();
  const out: ScheduleDraft[] = [];
  for (const d of drafts) {
    const key = `${d.rrule}|${d.timezone}|${d.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out;
}

/**
 * Parse a free-form Discord schedule announcement into rule drafts.
 * Returns an empty array when nothing recognizable is found.
 */
export function parseSchedule(text: string): ScheduleDraft[] {
  if (!text || typeof text !== "string") return [];
  const drafts: ScheduleDraft[] = [];
  const normalized = text.replace(/\s+/g, " ");

  // 1) Forced / ordinal monthly: "1st Thursday of the month", "first Thursday every month"
  const ordinalRe = new RegExp(
    `(1st|first|2nd|second|3rd|third|4th|fourth|5th|fifth|last)\\s+(${WEEKDAY_PATTERN})\\s+of\\s+(?:the\\s+|every\\s+|each\\s+)?month`,
    "gi",
  );
  for (const m of normalized.matchAll(ordinalRe)) {
    const ord = ORDINALS[m[1].toLowerCase()];
    const wd = normalizeWeekday(m[2]);
    if (!ord || !wd) continue;
    // Look for time + tz nearby (within the same announcement)
    const ctx = normalized.slice(Math.max(0, m.index ?? 0), (m.index ?? 0) + m[0].length + 80);
    const timeMatch = ctx.match(
      new RegExp(`at\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?\\s*(${TZ_PATTERN})?`, "i"),
    );
    let timePart = "";
    let tz = "UTC";
    if (timeMatch) {
      const t = parseTime(timeMatch[1], timeMatch[2], timeMatch[3]);
      if (t) timePart = `;BYHOUR=${t.hh};BYMINUTE=${t.mm};BYSECOND=0`;
      if (timeMatch[4]) tz = TIMEZONE_MAP[timeMatch[4].toUpperCase()] ?? "UTC";
    }
    const rrule = `FREQ=MONTHLY;BYDAY=${ord}${wd.byday}${timePart}`;
    drafts.push({
      rrule,
      timezone: tz,
      kind: "forced",
      label: `Force wipe — ${m[1]} ${wd.full} of the month`,
    });
  }

  // 2) Biweekly: "biweekly ... <Weekday> at <time>" or "every other <Weekday> at <time>"
  const biweeklyRe = new RegExp(
    `(?:biweekly|bi-weekly|every\\s+other)\\s+(?:wipes?\\s+(?:on\\s+|every\\s+)?)?(${WEEKDAY_PATTERN})(?:\\s+(?:at|@)\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?\\s*(${TZ_PATTERN})?)?`,
    "gi",
  );
  for (const m of normalized.matchAll(biweeklyRe)) {
    const wd = normalizeWeekday(m[1]);
    if (!wd) continue;
    const t = m[2] ? parseTime(m[2], m[3], m[4]) : null;
    const timePart = t ? `;BYHOUR=${t.hh};BYMINUTE=${t.mm};BYSECOND=0` : "";
    const tz = m[5] ? (TIMEZONE_MAP[m[5].toUpperCase()] ?? "UTC") : "UTC";
    const rrule = `FREQ=WEEKLY;INTERVAL=2;BYDAY=${wd.byday}${timePart}`;
    const label = t
      ? `Biweekly wipe — ${wd.full} ${pad(t.hh)}:${pad(t.mm)}`
      : `Biweekly wipe — ${wd.full}`;
    drafts.push({ rrule, timezone: tz, kind: "biweekly", label });
  }

  // 3) Weekly: "every <Weekday> at <time> <tz>" or "weekly wipes on <Weekday> at <time> <tz>"
  const weeklyRe = new RegExp(
    `(?:every|weekly\\s+wipes?\\s+(?:on|every)?|wipes?\\s+every)\\s+(${WEEKDAY_PATTERN})(?:\\s+(?:at|@)\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?\\s*(${TZ_PATTERN})?)?`,
    "gi",
  );
  for (const m of normalized.matchAll(weeklyRe)) {
    // skip if this match is actually part of "every other" — biweekly handled above.
    const before = normalized.slice(Math.max(0, (m.index ?? 0) - 6), m.index ?? 0).toLowerCase();
    if (/other\s*$/.test(before)) continue;
    const wd = normalizeWeekday(m[1]);
    if (!wd) continue;
    const t = m[2] ? parseTime(m[2], m[3], m[4]) : null;
    const timePart = t ? `;BYHOUR=${t.hh};BYMINUTE=${t.mm};BYSECOND=0` : "";
    const tz = m[5] ? (TIMEZONE_MAP[m[5].toUpperCase()] ?? "UTC") : "UTC";
    const rrule = `FREQ=WEEKLY;BYDAY=${wd.byday}${timePart}`;
    const label = t
      ? `Weekly wipe — ${wd.full} ${pad(t.hh)}:${pad(t.mm)}`
      : `Weekly wipe — ${wd.full}`;
    drafts.push({ rrule, timezone: tz, kind: "weekly", label });
  }

  return dedupe(drafts);
}
