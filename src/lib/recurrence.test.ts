import { describe, it, expect } from "vitest";
import { projectRule, projectWipes } from "./recurrence";
import type {
  Host,
  Server,
  WipeEventOverride,
  WipeScheduleRule,
} from "@/types/wipes";

const host: Host = { id: "h1", name: "TestHost" };

const server: Server = {
  id: "s1",
  hostId: "h1",
  name: "Test Server",
  type: "community",
  playerRestriction: "duo",
  region: "NA",
  tags: [],
};

function rule(partial: Partial<WipeScheduleRule>): WipeScheduleRule {
  return {
    id: "r1",
    serverId: "s1",
    rrule: "FREQ=WEEKLY;BYDAY=TH;BYHOUR=19;BYMINUTE=0",
    dtstart: new Date("2025-01-02T00:00:00Z"),
    timezone: "UTC",
    kind: "weekly",
    label: null,
    ...partial,
  };
}

describe("projectRule", () => {
  it("expands a weekly rule in UTC", () => {
    const r = rule({});
    const occ = projectRule(
      r,
      server,
      host,
      new Date("2025-01-01T00:00:00Z"),
      new Date("2025-01-31T23:59:59Z"),
    );
    // Thursdays in Jan 2025 at 19:00Z: 2,9,16,23,30
    expect(occ).toHaveLength(5);
    expect(occ[0].toISOString()).toBe("2025-01-02T19:00:00.000Z");
    expect(occ[4].toISOString()).toBe("2025-01-30T19:00:00.000Z");
  });

  it("expands biweekly rule", () => {
    const r = rule({
      rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TH;BYHOUR=19;BYMINUTE=0",
    });
    const occ = projectRule(
      r,
      server,
      host,
      new Date("2025-01-01T00:00:00Z"),
      new Date("2025-02-28T23:59:59Z"),
    );
    // Every other Thursday starting 2025-01-02: 2, 16, 30, 13-Feb, 27-Feb
    expect(occ.map((d) => d.toISOString())).toEqual([
      "2025-01-02T19:00:00.000Z",
      "2025-01-16T19:00:00.000Z",
      "2025-01-30T19:00:00.000Z",
      "2025-02-13T19:00:00.000Z",
      "2025-02-27T19:00:00.000Z",
    ]);
  });

  it("handles BYHOUR in tz correctly across DST (America/New_York)", () => {
    // 7PM Thursday New York. Before DST (March 9, 2025), 7PM EST = 00:00 UTC Fri.
    // After DST, 7PM EDT = 23:00 UTC Thu.
    const r = rule({
      rrule: "FREQ=WEEKLY;BYDAY=TH;BYHOUR=19;BYMINUTE=0",
      dtstart: new Date("2025-02-27T00:00:00Z"),
      timezone: "America/New_York",
    });
    const occ = projectRule(
      r,
      server,
      host,
      new Date("2025-03-01T00:00:00Z"),
      new Date("2025-03-31T23:59:59Z"),
    );
    // Thursdays March 6, 13, 20, 27. March 9 is DST switch.
    // Mar 6 (EST): 7PM = 00:00 UTC Mar 7
    // Mar 13 (EDT): 7PM = 23:00 UTC Mar 13
    // Mar 20 (EDT): 23:00 UTC
    // Mar 27 (EDT): 23:00 UTC
    expect(occ.map((d) => d.toISOString())).toEqual([
      "2025-03-07T00:00:00.000Z",
      "2025-03-13T23:00:00.000Z",
      "2025-03-20T23:00:00.000Z",
      "2025-03-27T23:00:00.000Z",
    ]);
  });

  it("expands monthly forced wipe (FREQ=MONTHLY;BYDAY=1TH)", () => {
    const r = rule({
      rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=19;BYMINUTE=0",
      dtstart: new Date("2025-01-02T00:00:00Z"),
      kind: "forced",
    });
    const occ = projectRule(
      r,
      server,
      host,
      new Date("2025-01-01T00:00:00Z"),
      new Date("2025-06-30T23:59:59Z"),
    );
    // First Thursdays: Jan 2, Feb 6, Mar 6, Apr 3, May 1, Jun 5
    expect(occ.map((d) => d.toISOString())).toEqual([
      "2025-01-02T19:00:00.000Z",
      "2025-02-06T19:00:00.000Z",
      "2025-03-06T19:00:00.000Z",
      "2025-04-03T19:00:00.000Z",
      "2025-05-01T19:00:00.000Z",
      "2025-06-05T19:00:00.000Z",
    ]);
  });
});

describe("projectWipes", () => {
  it("suppresses occurrence with skip override within ±1h", () => {
    const r = rule({});
    const overrides: WipeEventOverride[] = [
      {
        id: "o1",
        serverId: "s1",
        // 30 min off from the 2025-01-16 19:00Z occurrence
        occursAt: new Date("2025-01-16T19:30:00Z"),
        skip: true,
        label: null,
      },
    ];
    const events = projectWipes({
      server,
      host,
      rules: [r],
      overrides,
      from: new Date("2025-01-01T00:00:00Z"),
      to: new Date("2025-01-31T23:59:59Z"),
    });
    const isoTimes = events.map((e) => e.occursAt.toISOString());
    expect(isoTimes).not.toContain("2025-01-16T19:00:00.000Z");
    expect(isoTimes).toHaveLength(4);
  });

  it("adds explicit override event (skip:false)", () => {
    const r = rule({});
    const overrides: WipeEventOverride[] = [
      {
        id: "o2",
        serverId: "s1",
        occursAt: new Date("2025-01-05T12:00:00Z"),
        skip: false,
        label: "Surprise wipe",
      },
    ];
    const events = projectWipes({
      server,
      host,
      rules: [r],
      overrides,
      from: new Date("2025-01-01T00:00:00Z"),
      to: new Date("2025-01-31T23:59:59Z"),
    });
    const explicit = events.find(
      (e) => e.occursAt.toISOString() === "2025-01-05T12:00:00.000Z",
    );
    expect(explicit).toBeDefined();
    expect(explicit?.label).toBe("Surprise wipe");
    expect(explicit?.kind).toBe("custom");
  });
});
