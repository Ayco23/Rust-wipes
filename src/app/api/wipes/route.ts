import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  PlayerRestriction,
  ServerType,
  ScheduleKind,
  WipeEventSchema,
  WipeQuerySchema,
} from "@/types/wipes";
import { projectWipes } from "@/lib/recurrence";

export const dynamic = "force-dynamic";

function parseQuery(url: URL) {
  const sp = url.searchParams;
  const arr = (key: string): string[] | undefined => {
    const all = sp.getAll(key).concat(sp.getAll(`${key}[]`));
    if (all.length === 0) return undefined;
    return all.flatMap((v) => v.split(",")).filter(Boolean);
  };
  return WipeQuerySchema.safeParse({
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    types: arr("types"),
    restrictions: arr("restrictions"),
    hostIds: arr("hostIds"),
    serverIds: arr("serverIds"),
    regions: arr("regions"),
  });
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = parseQuery(url);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const q = parsed.data;
  if (q.to.getTime() < q.from.getTime()) {
    return NextResponse.json(
      { error: "`to` must be after `from`" },
      { status: 400 },
    );
  }

  const servers = await db.server.findMany({
    where: {
      ...(q.types ? { type: { in: q.types } } : {}),
      ...(q.restrictions ? { playerRestriction: { in: q.restrictions } } : {}),
      ...(q.hostIds ? { hostId: { in: q.hostIds } } : {}),
      ...(q.serverIds ? { id: { in: q.serverIds } } : {}),
      ...(q.regions ? { region: { in: q.regions } } : {}),
    },
    include: {
      host: true,
      schedules: true,
      overrides: true,
    },
  });

  const allEvents = servers.flatMap((s) =>
    projectWipes({
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
      from: q.from,
      to: q.to,
    }),
  );

  allEvents.sort((a, b) => a.occursAt.getTime() - b.occursAt.getTime());

  const validated = WipeEventSchema.array().parse(allEvents);
  return NextResponse.json({ events: validated });
}
