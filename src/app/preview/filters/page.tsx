"use client";

import * as React from "react";
import { useState } from "react";
import { Filters, type FilterState } from "@/components/Filters";

const SAMPLE_HOSTS = [
  { id: "rustafied", name: "Rustafied" },
  { id: "rusticated", name: "Rusticated" },
  { id: "reddit", name: "Reddit.com" },
];

const SAMPLE_REGIONS = ["us-east", "us-west", "eu-west", "eu-central", "oceania"];

export default function FiltersPreviewPage(): React.JSX.Element {
  const [state, setState] = useState<FilterState>({
    types: [],
    restrictions: [],
    hostIds: [],
    regions: [],
  });

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">Filters preview</h1>
      <Filters
        value={state}
        onChange={setState}
        hosts={SAMPLE_HOSTS}
        regions={SAMPLE_REGIONS}
      />
      <pre className="overflow-auto rounded-md bg-neutral-100 p-4 text-xs">
        {JSON.stringify(state, null, 2)}
      </pre>
    </main>
  );
}
