import { projectWipes } from "@/lib/recurrence";
import type {
  Host,
  Server,
  WipeEventOverride,
  WipeScheduleRule,
} from "@/types/wipes";

export const dynamic = "force-dynamic";

const host: Host = { id: "host-rustoria", name: "Rustoria" };

const servers: Server[] = [
  {
    id: "srv-weekly-na",
    hostId: host.id,
    name: "Rustoria Main Weekly (NA)",
    type: "community",
    playerRestriction: "duo",
    region: "NA",
    tags: [],
  },
  {
    id: "srv-biweekly-eu",
    hostId: host.id,
    name: "Rustoria Biweekly (EU)",
    type: "community",
    playerRestriction: "trio",
    region: "EU",
    tags: [],
  },
  {
    id: "srv-monthly-official",
    hostId: host.id,
    name: "Facepunch Forced (Monthly)",
    type: "official",
    playerRestriction: "none",
    region: "NA",
    tags: [],
  },
];

const rules: WipeScheduleRule[] = [
  {
    id: "rule-1",
    serverId: "srv-weekly-na",
    rrule: "FREQ=WEEKLY;BYDAY=TH;BYHOUR=19;BYMINUTE=0",
    dtstart: new Date("2025-01-02T00:00:00Z"),
    timezone: "America/New_York",
    kind: "weekly",
    label: "Weekly Thursday 7PM ET",
  },
  {
    id: "rule-2",
    serverId: "srv-biweekly-eu",
    rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=FR;BYHOUR=18;BYMINUTE=0",
    dtstart: new Date("2025-01-03T00:00:00Z"),
    timezone: "Europe/Berlin",
    kind: "biweekly",
    label: "Biweekly Friday 6PM CET",
  },
  {
    id: "rule-3",
    serverId: "srv-monthly-official",
    rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=19;BYMINUTE=0",
    dtstart: new Date("2025-01-02T00:00:00Z"),
    timezone: "UTC",
    kind: "forced",
    label: "Monthly Forced Wipe",
  },
];

const overrides: WipeEventOverride[] = [];

export default function RecurrencePreviewPage() {
  const now = new Date();
  const horizon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const allEvents = servers.flatMap((server) =>
    projectWipes({
      server,
      host,
      rules: rules.filter((r) => r.serverId === server.id),
      overrides,
      from: now,
      to: horizon,
    }),
  );
  allEvents.sort((a, b) => a.occursAt.getTime() - b.occursAt.getTime());

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Recurrence engine preview</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Next 30 days, projected from {now.toISOString()} to {horizon.toISOString()}.
      </p>
      <ul className="mt-6 space-y-2">
        {allEvents.map((e, i) => (
          <li key={`${e.serverId}-${i}`} className="rounded border border-neutral-200 p-3 text-sm">
            <div className="font-mono">{e.occursAt.toISOString()}</div>
            <div>
              <span className="font-semibold">{e.serverName}</span>{" "}
              <span className="text-neutral-500">
                ({e.hostName} / {e.type} / {e.playerRestriction} / {e.kind})
              </span>
            </div>
            {e.label ? <div className="text-neutral-600">{e.label}</div> : null}
          </li>
        ))}
        {allEvents.length === 0 ? (
          <li className="text-neutral-500">No events in window.</li>
        ) : null}
      </ul>
    </main>
  );
}
