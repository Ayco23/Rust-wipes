"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { CalendarMonth } from "@/components/CalendarMonth";
import { DayDetail } from "@/components/DayDetail";
import { Filters, type FilterState } from "@/components/Filters";
import { ServerPicker } from "@/components/ServerPicker";
import { useSelectedServers } from "@/lib/useSelectedServers";
import type { PlayerRestriction, ServerType, WipeEvent } from "@/types/wipes";

type PickerServer = {
  id: string;
  name: string;
  type: ServerType;
  playerRestriction: PlayerRestriction;
  hostName: string;
  region: string | null;
  hostId: string;
};

type ServerListResponse = Array<{
  id: string;
  name: string;
  type: string;
  playerRestriction: string;
  region: string | null;
  hostId: string;
  host?: { id: string; name: string } | null;
}>;

function buildQuery(
  from: Date,
  to: Date,
  filters: FilterState,
  serverIds: string[],
): string {
  const params = new URLSearchParams();
  params.set("from", from.toISOString());
  params.set("to", to.toISOString());
  for (const t of filters.types) params.append("types", t);
  for (const r of filters.restrictions) params.append("restrictions", r);
  for (const h of filters.hostIds) params.append("hostIds", h);
  for (const reg of filters.regions) params.append("regions", reg);
  for (const s of serverIds) params.append("serverIds", s);
  return params.toString();
}

export default function HomePage(): React.JSX.Element {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    restrictions: [],
    hostIds: [],
    regions: [],
  });
  const [servers, setServers] = useState<PickerServer[]>([]);
  const [events, setEvents] = useState<WipeEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { selected: selectedSet, isReady } = useSelectedServers();
  const selectedServerIds = useMemo(() => Array.from(selectedSet), [selectedSet]);

  // Load servers from the CRUD API.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/servers");
        if (!res.ok) return;
        const data = (await res.json()) as ServerListResponse;
        if (cancelled) return;
        setServers(
          data.map((s) => ({
            id: s.id,
            name: s.name,
            type: s.type as ServerType,
            playerRestriction: s.playerRestriction as PlayerRestriction,
            hostName: s.host?.name ?? "Unknown",
            region: s.region ?? null,
            hostId: s.hostId,
          })),
        );
      } catch {
        /* keep empty list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hostsForFilter = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of servers) map.set(s.hostId, s.hostName);
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [servers]);

  const regionsForFilter = useMemo(() => {
    const set = new Set<string>();
    for (const s of servers) if (s.region) set.add(s.region);
    return Array.from(set).sort();
  }, [servers]);

  const fetchWipes = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    try {
      const from = startOfMonth(month);
      const to = endOfMonth(month);
      const qs = buildQuery(from, to, filters, selectedServerIds);
      const res = await fetch(`/api/wipes?${qs}`);
      if (!res.ok) {
        setEvents([]);
        return;
      }
      const json = (await res.json()) as { events?: WipeEvent[] };
      const raw = json.events ?? [];
      setEvents(raw.map((e) => ({ ...e, occursAt: new Date(e.occursAt) })));
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [month, filters, selectedServerIds, isReady]);

  useEffect(() => {
    void fetchWipes();
  }, [fetchWipes]);

  const dayWipes = useMemo(() => {
    if (!selectedDay) return [];
    const d = selectedDay;
    return events.filter(
      (e) =>
        e.occursAt.getFullYear() === d.getFullYear() &&
        e.occursAt.getMonth() === d.getMonth() &&
        e.occursAt.getDate() === d.getDate(),
    );
  }, [events, selectedDay]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rust-600">Rust Wipes</h1>
          <p className="text-sm text-neutral-500">
            Know <strong>before</strong> your favorite server wipes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            aria-label="Previous month"
          >
            ← Prev
          </button>
          <div
            className="min-w-[10rem] text-center text-lg font-medium"
            data-testid="month-label"
          >
            {format(month, "MMMM yyyy")}
          </div>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            aria-label="Next month"
          >
            Next →
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
        <aside className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Servers
            </h2>
            <ServerPicker servers={servers} />
          </section>
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Filters
            </h2>
            <Filters
              value={filters}
              onChange={setFilters}
              hosts={hostsForFilter}
              regions={regionsForFilter}
            />
          </section>
        </aside>

        <section>
          {loading && (
            <div className="mb-2 text-xs text-neutral-500" role="status">
              Loading wipes…
            </div>
          )}
          {!loading && events.length === 0 && (
            <div className="mb-2 text-xs text-neutral-500">
              No wipes match your filters in {format(month, "MMMM yyyy")}.
              {selectedServerIds.length === 0 && servers.length > 0 && (
                <> Select some servers in the sidebar to get started.</>
              )}
            </div>
          )}
          <CalendarMonth
            month={month}
            wipes={events}
            selectedDay={selectedDay}
            onDayClick={(d) => {
              setSelectedDay(d);
              setDrawerOpen(true);
            }}
          />
        </section>
      </div>

      <DayDetail
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        date={selectedDay}
        wipes={dayWipes}
      />
    </div>
  );
}
