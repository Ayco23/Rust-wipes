/* eslint-disable no-console */
// Drift checker: compare projected last wipe vs BattleMetrics' real last_wipe
// for every server in the database. Exits non-zero if any server drifts beyond
// the tolerance, so CI can fail and alert.
//
// Usage:
//   npx tsx scripts/verify.ts              # all hosts
//   npx tsx scripts/verify.ts BestRust     # one host

import { PrismaClient } from "@prisma/client";
import { searchByName } from "../src/lib/battlemetrics";
import { projectWipes } from "../src/lib/recurrence";
import { PlayerRestriction, ScheduleKind, ServerType } from "../src/types/wipes";

const db = new PrismaClient();

const TOLERANCE_MS = 6 * 60 * 60 * 1000; // ±6 hours
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function fmt(d: Date | null): string {
  if (!d) return "—";
  return d.toISOString().replace("T", " ").slice(0, 16) + "Z";
}

function bestNameMatch(query: string, candidates: { id: string; name: string; lastWipeAt: Date | null }[]) {
  if (candidates.length === 0) return null;
  const q = query.toLowerCase();
  // Prefer matches whose name contains the host-stripped query tail.
  const tail = q.replace(/^[a-z]+\s*\|?\s*/, "").slice(0, 25);
  return (
    candidates.find((c) => c.name.toLowerCase().includes(tail)) ?? candidates[0] ?? null
  );
}

async function main() {
  const hostFilter = process.argv[2];
  const servers = await db.server.findMany({
    where: hostFilter ? { host: { name: hostFilter } } : undefined,
    include: { host: true, schedules: true, overrides: true },
    orderBy: [{ host: { name: "asc" } }, { name: "asc" }],
  });

  const now = new Date();
  const from = new Date(now.getTime() - 40 * DAY);

  console.log(`Checking ${servers.length} server${servers.length === 1 ? "" : "s"}` +
    (hostFilter ? ` for host "${hostFilter}"` : "") + " against BattleMetrics…\n");

  let ok = 0;
  let drift = 0;
  let miss = 0;
  const drifts: { server: string; ours: string; bm: string; deltaMin: number }[] = [];

  for (const s of servers) {
    const projected = projectWipes({
      server: {
        id: s.id, hostId: s.hostId, name: s.name,
        type: ServerType.parse(s.type),
        playerRestriction: PlayerRestriction.parse(s.playerRestriction),
        region: s.region, tags: [], connectUrl: s.connectUrl,
      },
      host: { id: s.host.id, name: s.host.name },
      rules: s.schedules.map((r) => ({
        id: r.id, serverId: r.serverId, rrule: r.rrule,
        dtstart: r.dtstart, timezone: r.timezone,
        kind: ScheduleKind.parse(r.kind), label: r.label,
      })),
      overrides: s.overrides.map((o) => ({
        id: o.id, serverId: o.serverId, occursAt: o.occursAt,
        skip: o.skip, label: o.label,
      })),
      from, to: now,
    });

    const ours = projected.length > 0 ? projected[projected.length - 1].occursAt : null;
    const matches = await searchByName(s.name);
    const bm = bestNameMatch(s.name, matches);

    if (!bm?.lastWipeAt || !ours) {
      miss++;
      console.log(`  ${"·".padEnd(2)} ${s.name.padEnd(50)} ours=${fmt(ours)} bm=${fmt(bm?.lastWipeAt ?? null)}`);
      continue;
    }

    const delta = Math.abs(bm.lastWipeAt.getTime() - ours.getTime());
    const deltaMin = Math.round(delta / (60 * 1000));
    if (delta <= TOLERANCE_MS) {
      ok++;
    } else {
      drift++;
      drifts.push({ server: s.name, ours: fmt(ours), bm: fmt(bm.lastWipeAt), deltaMin });
      console.log(`  ⚠  ${s.name.padEnd(50)} ours=${fmt(ours)} bm=${fmt(bm.lastWipeAt)} Δ=${deltaMin}m`);
    }
    await new Promise((r) => setTimeout(r, 200)); // gentle rate-limit
  }

  console.log(`\nResult: ${ok} ok / ${drift} drift / ${miss} unmatched`);

  // Only fail CI on confirmed drift, not on unmatched (BM search is best-effort).
  if (drift > 0) {
    console.log("\nDrift detail (verify against host's Discord pin):");
    for (const d of drifts) console.log(`  - ${d.server}: ours=${d.ours}, bm=${d.bm}, off by ${d.deltaMin}m`);
    process.exit(1);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(2); })
  .finally(() => db.$disconnect());
