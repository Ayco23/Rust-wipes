/* eslint-disable no-console */
// One-shot: compare our projected last wipe vs BattleMetrics' real last_wipe
// for every RustForNoobs server in the database.
//
// Run: npx tsx scripts/verify-rfn.ts

import { PrismaClient } from "@prisma/client";
import { searchByName } from "../src/lib/battlemetrics";
import { projectWipes } from "../src/lib/recurrence";
import { PlayerRestriction, ScheduleKind, ServerType } from "../src/types/wipes";

const db = new PrismaClient();

const TOLERANCE_MS = 6 * 60 * 60 * 1000; // ±6 hours

function fmt(d: Date | null): string {
  if (!d) return "—";
  return d.toISOString().replace("T", " ").slice(0, 16) + "Z";
}

async function main() {
  const servers = await db.server.findMany({
    where: { id: { startsWith: "seed-rfn-" } },
    include: { host: true, schedules: true, overrides: true },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const lookback = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000); // 40 days back

  console.log(`Checking ${servers.length} RustForNoobs servers vs BattleMetrics…\n`);
  console.log(
    [
      "server".padEnd(45),
      "ours (UTC)".padEnd(20),
      "bm (UTC)".padEnd(20),
      "Δ",
      "verdict",
    ].join(" | "),
  );
  console.log("-".repeat(110));

  let ok = 0;
  let warn = 0;
  let miss = 0;

  for (const s of servers) {
    const projected = projectWipes({
      server: {
        id: s.id,
        hostId: s.hostId,
        name: s.name,
        type: ServerType.parse(s.type),
        playerRestriction: PlayerRestriction.parse(s.playerRestriction),
        region: s.region,
        tags: [],
        connectUrl: s.connectUrl,
      },
      host: { id: s.host.id, name: s.host.name },
      rules: s.schedules.map((r) => ({
        id: r.id,
        serverId: r.serverId,
        rrule: r.rrule,
        dtstart: r.dtstart,
        timezone: r.timezone,
        kind: ScheduleKind.parse(r.kind),
        label: r.label,
      })),
      overrides: s.overrides.map((o) => ({
        id: o.id,
        serverId: o.serverId,
        occursAt: o.occursAt,
        skip: o.skip,
        label: o.label,
      })),
      from: lookback,
      to: now,
    });

    const ours = projected.length > 0 ? projected[projected.length - 1].occursAt : null;

    // Match BattleMetrics by exact host:port. RFN runs multiple servers per IP, so
    // host-only matches collide. We pull all candidates for the IP, then filter by
    // port via a second BM lookup per id.
    const [ip, portStr] = (s.connectUrl ?? "").split(":");
    const port = portStr ? parseInt(portStr, 10) : null;
    let best: { id: string; name: string; lastWipeAt: Date | null } | null = null;
    if (ip && port) {
      const matches = await searchByName(ip);
      for (const m of matches) {
        const detail = await fetch(`https://api.battlemetrics.com/servers/${m.id}`).then((r) =>
          r.json(),
        );
        const p = detail?.data?.attributes?.port;
        if (p === port) {
          best = m;
          break;
        }
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    let verdict = "MISS";
    let deltaStr = "—";
    if (best?.lastWipeAt && ours) {
      const dt = Math.abs(best.lastWipeAt.getTime() - ours.getTime());
      deltaStr = `${(dt / 1000 / 60).toFixed(0)}m`;
      if (dt <= TOLERANCE_MS) {
        verdict = "OK";
        ok++;
      } else {
        verdict = "DRIFT";
        warn++;
      }
    } else {
      miss++;
    }

    console.log(
      [
        s.name.slice(0, 45).padEnd(45),
        fmt(ours).padEnd(20),
        fmt(best?.lastWipeAt ?? null).padEnd(20),
        deltaStr.padStart(5),
        verdict,
      ].join(" | "),
    );

    // gentle rate-limit
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("\nResult:", `${ok} ok, ${warn} drift, ${miss} missing`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
