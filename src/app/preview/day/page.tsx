import { DayDetailPreviewClient } from "./preview-client";
import type { WipeEvent } from "@/types/wipes";

const sampleDate = new Date("2025-06-15T00:00:00Z");

const mockWipes: WipeEvent[] = [
  {
    serverId: "s1",
    serverName: "Rusty Moose US Main",
    hostId: "h1",
    hostName: "Rusty Moose",
    type: "community",
    playerRestriction: "solo",
    region: "us-east",
    occursAt: new Date("2025-06-15T13:00:00Z"),
    kind: "weekly",
    label: "Main wipe",
  },
  {
    serverId: "s2",
    serverName: "Rustafied Long II",
    hostId: "h2",
    hostName: "Rustafied",
    type: "community",
    playerRestriction: "duo",
    region: "us-west",
    occursAt: new Date("2025-06-15T15:00:00Z"),
    kind: "biweekly",
    label: null,
  },
  {
    serverId: "s3",
    serverName: "Facepunch Official EU",
    hostId: "h3",
    hostName: "Facepunch",
    type: "official",
    playerRestriction: "none",
    region: "eu",
    occursAt: new Date("2025-06-15T18:00:00Z"),
    kind: "forced",
    label: "Forced wipe",
  },
  {
    serverId: "s4",
    serverName: "Modded Madness",
    hostId: "h4",
    hostName: "ModHost",
    type: "modded",
    playerRestriction: "trio",
    region: "us-east",
    occursAt: new Date("2025-06-15T20:00:00Z"),
    kind: "weekly",
    label: null,
  },
  {
    serverId: "s5",
    serverName: "Quad Only Vanilla",
    hostId: "h5",
    hostName: "VanillaHost",
    type: "community",
    playerRestriction: "quad",
    region: "eu",
    occursAt: new Date("2025-06-15T22:30:00Z"),
    kind: "custom",
    label: "Late night",
  },
];

export default function DayDetailPreviewPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Day detail preview</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Drawer rendered open with mock wipe data for a sample date.
      </p>
      <button type="button" className="mt-4 rounded border px-3 py-1 text-sm">
        Close
      </button>
      <DayDetailPreviewClient date={sampleDate} wipes={mockWipes} />
    </main>
  );
}
