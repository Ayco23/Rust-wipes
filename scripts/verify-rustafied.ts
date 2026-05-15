/* eslint-disable no-console */
// One-shot: cross-check every Rustafied server in DB against BattleMetrics.
// Reports: BM id, IP:port, last_wipe, rust_description (schedule blurb).
//
// Run: npx tsx scripts/verify-rustafied.ts

import { PrismaClient } from "@prisma/client";
import { searchByName } from "../src/lib/battlemetrics";

const db = new PrismaClient();

interface BMDetail {
  id: string;
  name: string;
  ip: string;
  port: number;
  lastWipe: string | null;
  nextWipe: string | null;
  description: string;
}

async function fetchDetail(id: string): Promise<BMDetail | null> {
  const r = await fetch(`https://api.battlemetrics.com/servers/${id}`);
  if (!r.ok) return null;
  const j = await r.json();
  const a = j?.data?.attributes;
  if (!a) return null;
  return {
    id,
    name: a.name,
    ip: a.ip,
    port: a.port,
    lastWipe: a.details?.rust_last_wipe ?? null,
    nextWipe: a.details?.rust_next_wipe ?? null,
    description: (a.details?.rust_description ?? "").replace(/\s+/g, " ").slice(0, 200),
  };
}

async function main() {
  const servers = await db.server.findMany({
    where: { host: { name: "Rustafied" } },
    include: { schedules: true },
    orderBy: { name: "asc" },
  });

  console.log(`Checking ${servers.length} Rustafied servers against BattleMetrics…\n`);

  for (const s of servers) {
    const matches = await searchByName(s.name);
    // pick best by exact-ish name match
    const candidates = matches.slice(0, 5);
    let pick: BMDetail | null = null;
    for (const m of candidates) {
      const detail = await fetchDetail(m.id);
      if (!detail) continue;
      // Match the official Rustafied naming pattern "Rustafied.com - <suffix>"
      const want = s.name.replace(/^Rustafied\s+/i, "").toLowerCase();
      if (detail.name.toLowerCase().includes(want)) {
        pick = detail;
        break;
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    if (!pick && candidates[0]) pick = await fetchDetail(candidates[0].id);

    console.log(`\n[${s.id}]  ${s.name}`);
    if (!pick) {
      console.log("  BM: no match");
      continue;
    }
    console.log(`  BM name:    ${pick.name}`);
    console.log(`  BM id/ip:   ${pick.id}  ${pick.ip}:${pick.port}`);
    console.log(`  Last wipe:  ${pick.lastWipe}`);
    console.log(`  Next wipe:  ${pick.nextWipe}`);
    console.log(`  Schedule:   ${pick.description.slice(0, 160)}`);
    console.log(`  Our rrule:  ${s.schedules[0]?.rrule}  tz=${s.schedules[0]?.timezone}`);
    console.log(`  Our connect: ${s.connectUrl ?? "—"}`);
    await new Promise((r) => setTimeout(r, 250));
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
