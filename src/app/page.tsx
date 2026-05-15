"use client";

import { useCallback, useEffect, useState } from "react";
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { InlineCalendar } from "@/components/_inline/InlineCalendar";
import { InlineFilters, type FilterState } from "@/components/_inline/InlineFilters";
import { InlinePicker, loadSelectedServers } from "@/components/_inline/InlinePicker";
import type { WipeEvent } from "@/types/wipes";

const MOCK_SERVERS = [
  { id: "rustafied-eu-main", name: "Rustafied EU Main" },
  { id: "rusty-moose-us-trio", name: "Rusty Moose US Trio" },
  { id: "facepunch-official-1", name: "Facepunch Official 1" },
];

function getWipesMock(month: Date): WipeEvent[] {
  const base = startOfMonth(month);
  const mk = (day: number, hour: number, idx: number): WipeEvent => {
    const d = new Date(base);
    d.setDate(day);
    d.setHours(hour, 0, 0, 0);
    const server = MOCK_SERVERS[idx % MOCK_SERVERS.length]!;
    const type = idx % 3 === 0 ? "official" : idx % 3 === 1 ? "community" : "modded";
    return {
      serverId: server.id,
      serverName: server.name,
      hostId: "mock-host",
      hostName: "Mock Host",
      type,
      playerRestriction: idx % 2 === 0 ? "none" : "trio",
      region: "EU",
      occursAt: d,
      kind: "weekly",
      label: null,
    };
  };
  return [mk(3, 14, 0), mk(10, 14, 1), mk(17, 14, 2), mk(24, 14, 0)];
}

function buildQuery(from: Date, to: Date, filters: FilterState, serverIds: string[]): string {
  const params = new URLSearchParams();
  params.set("from", from.toISOString());
  params.set("to", to.toISOString());
  for (const t of filters.types) params.append("types", t);
  for (const r of filters.restrictions) params.append("restrictions", r);
  for (const s of serverIds) params.append("serverIds", s);
  return params.toString();
}

export default function HomePage(): React.JSX.Element {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [filters, setFilters] = useState<FilterState>({ types: [], restrictions: [] });
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
  const [events, setEvents] = useState<WipeEvent[]>(() => getWipesMock(startOfMonth(new Date())));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedServerIds(loadSelectedServers());
  }, []);

  const fetchWipes = useCallback(async () => {
    setLoading(true);
    try {
      const from = startOfMonth(month);
      const to = endOfMonth(month);
      const qs = buildQuery(from, to, filters, selectedServerIds);
      const res = await fetch(`/api/wipes?${qs}`);
      if (!res.ok) {
        setEvents(getWipesMock(month));
        return;
      }
      const json: unknown = await res.json();
      const rawEvents = Array.isArray(json)
        ? json
        : json && typeof json === "object" && "events" in json && Array.isArray((json as { events: unknown }).events)
          ? (json as { events: unknown[] }).events
          : null;
      if (!rawEvents) {
        setEvents(getWipesMock(month));
        return;
      }
      const parsed: WipeEvent[] = rawEvents.map((e) => {
        const r = e as WipeEvent;
        return { ...r, occursAt: new Date(r.occursAt) };
      });
      setEvents(parsed);
    } catch {
      setEvents(getWipesMock(month));
    } finally {
      setLoading(false);
    }
  }, [month, filters, selectedServerIds]);

  useEffect(() => {
    void fetchWipes();
  }, [fetchWipes]);

  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-rust-600">Rust Wipes</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700"
            aria-label="Previous month"
          >
            Prev
          </button>
          <div className="min-w-[10rem] text-center text-lg font-medium" data-testid="month-label">
            {format(month, "MMMM yyyy")}
          </div>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700"
            aria-label="Next month"
          >
            Next
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold">Servers</h2>
            <InlinePicker
              servers={MOCK_SERVERS}
              selected={selectedServerIds}
              onChange={setSelectedServerIds}
            />
          </section>
          <section>
            <h2 className="mb-2 text-sm font-semibold">Filters</h2>
            <InlineFilters value={filters} onChange={setFilters} />
          </section>
        </aside>

        <section>
          {loading && (
            <div className="mb-2 text-xs text-neutral-500" role="status">
              Loading wipes...
            </div>
          )}
          <InlineCalendar month={month} events={events} />
        </section>
      </div>
    </main>
  );
}
