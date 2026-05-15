import { addDays, setHours, startOfMonth } from "date-fns";
import { CalendarMonth } from "@/components/CalendarMonth";
import type { ServerType, WipeEvent } from "@/types/wipes";

function buildMockWipes(month: Date): WipeEvent[] {
  const monthStart = startOfMonth(month);
  const seeds: Array<{
    name: string;
    host: string;
    type: ServerType;
    dayOffset: number;
    hour: number;
  }> = [
    { name: "Vital Rust Main", host: "Vital", type: "official", dayOffset: 2, hour: 14 },
    { name: "Rustafied US Long", host: "Rustafied", type: "community", dayOffset: 5, hour: 18 },
    { name: "Rusty Moose EU", host: "Rusty Moose", type: "community", dayOffset: 9, hour: 19 },
    { name: "Reddit Mainforce", host: "Reddit", type: "official", dayOffset: 12, hour: 20 },
    { name: "Pickle 2x Solo", host: "Pickle", type: "modded", dayOffset: 12, hour: 21 },
    { name: "Oxide Trio", host: "Oxide", type: "modded", dayOffset: 17, hour: 14 },
    { name: "Facepunch Hapis", host: "Facepunch", type: "official", dayOffset: 22, hour: 15 },
    { name: "Salty Solo Duo", host: "Salty", type: "community", dayOffset: 26, hour: 17 },
  ];

  return seeds.map((s, i) => ({
    serverId: `srv-${i}`,
    serverName: s.name,
    hostId: `host-${s.host}`,
    hostName: s.host,
    type: s.type,
    playerRestriction: "none",
    region: "us-east",
    occursAt: setHours(addDays(monthStart, s.dayOffset), s.hour),
    kind: "weekly",
    label: null,
  }));
}

export default function CalendarPreviewPage() {
  const month = new Date();
  const wipes = buildMockWipes(month);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Calendar month preview</h1>
      <CalendarMonth month={month} wipes={wipes} />
    </main>
  );
}
