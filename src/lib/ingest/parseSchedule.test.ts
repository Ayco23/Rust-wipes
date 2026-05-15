import { describe, it, expect } from "vitest";
import { parseSchedule } from "./parseSchedule";

describe("parseSchedule", () => {
  it("parses weekly + forced from a typical announcement", () => {
    const text =
      "Weekly wipes every Thursday at 2PM EST. Force wipe is the 1st Thursday of every month at 2PM EST.";
    const out = parseSchedule(text);
    expect(out.length).toBeGreaterThanOrEqual(2);
    const weekly = out.find((d) => d.kind === "weekly");
    const forced = out.find((d) => d.kind === "forced");
    expect(weekly?.rrule).toContain("FREQ=WEEKLY");
    expect(weekly?.rrule).toContain("BYDAY=TH");
    expect(weekly?.rrule).toContain("BYHOUR=14");
    expect(weekly?.timezone).toBe("America/New_York");
    expect(forced?.rrule).toBe(
      "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=14;BYMINUTE=0;BYSECOND=0",
    );
    expect(forced?.timezone).toBe("America/New_York");
  });

  it("parses biweekly with every other phrasing", () => {
    const text = "Every other Friday at 6:30 PM PST we wipe.";
    const out = parseSchedule(text);
    const biweekly = out.find((d) => d.kind === "biweekly");
    expect(biweekly).toBeDefined();
    expect(biweekly?.rrule).toContain("FREQ=WEEKLY;INTERVAL=2");
    expect(biweekly?.rrule).toContain("BYDAY=FR");
    expect(biweekly?.rrule).toContain("BYHOUR=18");
    expect(biweekly?.rrule).toContain("BYMINUTE=30");
    expect(biweekly?.timezone).toBe("America/Los_Angeles");
    // Should NOT also emit a plain weekly for Friday
    expect(out.filter((d) => d.kind === "weekly").length).toBe(0);
  });

  it("parses biweekly keyword phrasing", () => {
    const text = "Biweekly Saturday at 12pm UTC";
    const out = parseSchedule(text);
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe("biweekly");
    expect(out[0].rrule).toContain("BYDAY=SA");
    expect(out[0].rrule).toContain("BYHOUR=12");
    expect(out[0].timezone).toBe("UTC");
  });

  it("parses ordinal forced wipe with various phrasings", () => {
    const text =
      "Force wipe: the first Thursday of the month at 3 PM GMT. Otherwise every Sunday at 10am BST.";
    const out = parseSchedule(text);
    const forced = out.find((d) => d.kind === "forced");
    const weekly = out.find((d) => d.kind === "weekly");
    expect(forced?.rrule).toContain("BYDAY=1TH");
    expect(forced?.rrule).toContain("BYHOUR=15");
    expect(forced?.timezone).toBe("Europe/London");
    expect(weekly?.rrule).toContain("BYDAY=SU");
    expect(weekly?.rrule).toContain("BYHOUR=10");
    expect(weekly?.timezone).toBe("Europe/London");
  });

  it("handles 24-hour time without AM/PM and CST tz", () => {
    const text = "Wipes every Wednesday at 19:00 CST.";
    const out = parseSchedule(text);
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe("weekly");
    expect(out[0].rrule).toContain("BYDAY=WE");
    expect(out[0].rrule).toContain("BYHOUR=19");
    expect(out[0].rrule).toContain("BYMINUTE=0");
    expect(out[0].timezone).toBe("America/Chicago");
  });

  it("parses 2nd Tuesday forced cycle", () => {
    const text = "Force wipe occurs the 2nd Tuesday of every month at 8 PM EST.";
    const out = parseSchedule(text);
    const forced = out.find((d) => d.kind === "forced");
    expect(forced).toBeDefined();
    expect(forced?.rrule).toContain("BYDAY=2TU");
    expect(forced?.rrule).toContain("BYHOUR=20");
    expect(forced?.timezone).toBe("America/New_York");
  });

  it("returns empty array for gibberish", () => {
    expect(parseSchedule("hello world this is nonsense !@#$%")).toEqual([]);
    expect(parseSchedule("")).toEqual([]);
  });

  it("dedupes identical rules", () => {
    const text =
      "Every Thursday at 2pm EST. Weekly wipes every Thursday at 2pm EST.";
    const out = parseSchedule(text);
    expect(out.filter((d) => d.kind === "weekly")).toHaveLength(1);
  });
});
