import { RRule, RRuleSet, rrulestr } from "rrule";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type {
  Host,
  Server,
  WipeEvent,
  WipeEventOverride,
  WipeScheduleRule,
} from "@/types/wipes";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Project a single rule into concrete UTC Date occurrences within [from, to].
 *
 * BYHOUR / BYMINUTE in the RRULE are interpreted in the rule's IANA timezone.
 * The trick: rrule itself is timezone-agnostic and treats dtstart/until naively.
 * We feed it a dtstart that, when read as a wall-clock time, equals the wall-
 * clock time of the rule's dtstart in its target timezone. After expansion we
 * convert each wall-clock occurrence back to UTC via fromZonedTime, which makes
 * "every Thursday 7PM America/New_York" correctly shift across DST.
 */
export function projectRule(
  rule: WipeScheduleRule,
  _server: Server,
  _host: Host,
  from: Date,
  to: Date,
): Date[] {
  const tz = rule.timezone || "UTC";

  const parsed: RRule | RRuleSet = rrulestr(rule.rrule, { forceset: false });
  const baseOpts =
    parsed instanceof RRuleSet
      ? (parsed.rrules()[0]?.origOptions ?? {})
      : parsed.origOptions;

  const rrule = new RRule({
    ...baseOpts,
    dtstart: toNaiveUtc(rule.dtstart, tz),
  });

  // Widen the search window by one day on each side to account for tz offset.
  const naiveFrom = toNaiveUtc(new Date(from.getTime() - 24 * ONE_HOUR_MS), tz);
  const naiveTo = toNaiveUtc(new Date(to.getTime() + 24 * ONE_HOUR_MS), tz);

  const result: Date[] = [];
  for (const naive of rrule.between(naiveFrom, naiveTo, true)) {
    const utc = fromNaiveUtc(naive, tz);
    if (utc.getTime() >= from.getTime() && utc.getTime() <= to.getTime()) {
      result.push(utc);
    }
  }
  return result;
}

/** Convert a real UTC Date into a "naive" Date whose UTC fields match the
 *  wall-clock time in `tz`. Lets us feed timezone-aware times to rrule, which
 *  itself is tz-agnostic. */
function toNaiveUtc(utc: Date, tz: string): Date {
  const z = toZonedTime(utc, tz);
  return new Date(Date.UTC(
    z.getFullYear(), z.getMonth(), z.getDate(),
    z.getHours(), z.getMinutes(), z.getSeconds(),
  ));
}

/** Inverse of toNaiveUtc: read a naive Date's UTC fields as a wall clock in
 *  `tz` and return the real UTC instant. */
function fromNaiveUtc(naive: Date, tz: string): Date {
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const wall =
    `${pad(naive.getUTCFullYear(), 4)}-${pad(naive.getUTCMonth() + 1)}-` +
    `${pad(naive.getUTCDate())}T${pad(naive.getUTCHours())}:` +
    `${pad(naive.getUTCMinutes())}:${pad(naive.getUTCSeconds())}`;
  return fromZonedTime(wall, tz);
}

export interface ProjectWipesInput {
  server: Server;
  host: Host;
  rules: WipeScheduleRule[];
  overrides: WipeEventOverride[];
  from: Date;
  to: Date;
}

/**
 * Project all rules + overrides for one server into WipeEvent[].
 *
 * Override semantics:
 *  - skip:true suppresses any rule-generated occurrence within ±1h.
 *  - skip:false adds an explicit event at occursAt (if inside window).
 */
export function projectWipes(input: ProjectWipesInput): WipeEvent[] {
  const { server, host, rules, overrides, from, to } = input;
  const events: WipeEvent[] = [];

  const skipOverrides = overrides.filter((o) => o.skip);
  const addOverrides = overrides.filter((o) => !o.skip);

  for (const rule of rules) {
    const occurrences = projectRule(rule, server, host, from, to);
    for (const occursAt of occurrences) {
      const suppressed = skipOverrides.some(
        (o) => Math.abs(o.occursAt.getTime() - occursAt.getTime()) <= ONE_HOUR_MS,
      );
      if (suppressed) continue;
      events.push(buildEvent(server, host, occursAt, rule.kind, rule.label ?? null));
    }
  }

  for (const ov of addOverrides) {
    if (ov.occursAt.getTime() < from.getTime() || ov.occursAt.getTime() > to.getTime()) {
      continue;
    }
    events.push(buildEvent(server, host, ov.occursAt, "custom", ov.label ?? null));
  }

  events.sort((a, b) => a.occursAt.getTime() - b.occursAt.getTime());
  return events;
}

function buildEvent(
  server: Server,
  host: Host,
  occursAt: Date,
  kind: WipeEvent["kind"],
  label: string | null,
): WipeEvent {
  return {
    serverId: server.id,
    serverName: server.name,
    hostId: host.id,
    hostName: host.name,
    type: server.type,
    playerRestriction: server.playerRestriction,
    region: server.region ?? null,
    occursAt,
    kind,
    label,
    connectUrl: server.connectUrl ?? null,
  };
}
