import type { ReactElement } from "react";
import Legend from "@/components/Legend";
import type { Host } from "@/types/wipes";

const mockHosts: readonly Host[] = [
  { id: "host-rustafied", name: "Rustafied" },
  { id: "host-rusty-moose", name: "Rusty Moose" },
  { id: "host-rustoria", name: "Rustoria" },
  { id: "host-vital", name: "Vital Rust" },
  { id: "host-reddit", name: "Reddit.com" },
  { id: "host-pickle", name: "Pickle Rust" },
];

export default function LegendPreviewPage(): ReactElement {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">Legend preview</h1>
      <p className="text-sm text-neutral-500">
        Color coding for server types, player restrictions, and hosts.
      </p>
      <Legend hosts={mockHosts} />
    </main>
  );
}
