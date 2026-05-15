"use client";

import { ServerPicker, type ServerPickerItem } from "@/components/ServerPicker";

const MOCK_SERVERS: ServerPickerItem[] = [
  {
    id: "srv-1",
    name: "Rustopia US Main",
    type: "community",
    playerRestriction: "none",
    hostName: "Rustopia",
  },
  {
    id: "srv-2",
    name: "Rustafied US Long",
    type: "community",
    playerRestriction: "none",
    hostName: "Rustafied",
  },
  {
    id: "srv-3",
    name: "Reddit Solo/Duo/Trio",
    type: "community",
    playerRestriction: "trio",
    hostName: "Reddit Rust",
  },
  {
    id: "srv-4",
    name: "Facepunch EU 1",
    type: "official",
    playerRestriction: "none",
    hostName: "Facepunch",
  },
  {
    id: "srv-5",
    name: "ZombieZ Modded",
    type: "modded",
    playerRestriction: "quad",
    hostName: "ZombieZ",
  },
];

export default function PickerPreviewPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Server picker preview</h1>
      <ServerPicker servers={MOCK_SERVERS} />
    </main>
  );
}
