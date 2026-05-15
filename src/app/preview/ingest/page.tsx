"use client";

import { useState } from "react";
import { parseSchedule, type ScheduleDraft } from "@/lib/ingest/parseSchedule";

const EXAMPLE = `Weekly wipes every Thursday at 2PM EST.
Force wipe is the 1st Thursday of every month at 2PM EST.
Biweekly side server: every other Friday at 6:30 PM PST.`;

export default function IngestPreviewPage() {
  const [text, setText] = useState<string>(EXAMPLE);
  const [results, setResults] = useState<ScheduleDraft[] | null>(null);

  function onParse() {
    setResults(parseSchedule(text));
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Schedule parser preview</h1>
      <p className="text-sm text-gray-600">
        Paste a Discord announcement below and click Parse to see extracted rule
        drafts.
      </p>
      <textarea
        className="w-full h-40 rounded border border-gray-300 p-3 font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div>
        <button
          type="button"
          onClick={onParse}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Parse
        </button>
      </div>
      {results !== null && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            Results ({results.length})
          </h2>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">No schedule rules detected.</p>
          ) : (
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li
                  key={i}
                  className="rounded border border-gray-200 bg-gray-50 p-3 text-sm"
                >
                  <div>
                    <span className="font-semibold">Kind:</span> {r.kind}
                  </div>
                  <div>
                    <span className="font-semibold">Label:</span> {r.label}
                  </div>
                  <div>
                    <span className="font-semibold">Timezone:</span>{" "}
                    {r.timezone}
                  </div>
                  <div className="font-mono break-all">
                    <span className="font-semibold font-sans">RRULE:</span>{" "}
                    {r.rrule}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
