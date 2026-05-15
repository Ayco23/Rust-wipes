import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { PlayerRestriction, ServerType } from "@/types/wipes";

const CreateServerInput = z.object({
  hostId: z.string().min(1),
  name: z.string().min(1),
  type: ServerType,
  playerRestriction: PlayerRestriction,
  region: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  battlemetricsId: z.string().nullable().optional(),
  lastWipeAt: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

function serializeServer<T extends { tags: string }>(s: T): Omit<T, "tags"> & { tags: string[] } {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(s.tags) as unknown;
    if (Array.isArray(parsed)) tags = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    tags = [];
  }
  return { ...s, tags };
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const hostId = url.searchParams.get("hostId") ?? undefined;
  const typeParam = url.searchParams.get("type");
  const restrictionParam = url.searchParams.get("restriction");

  const where: {
    hostId?: string;
    type?: string;
    playerRestriction?: string;
  } = {};
  if (hostId) where.hostId = hostId;
  if (typeParam) {
    const t = ServerType.safeParse(typeParam);
    if (!t.success) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    where.type = t.data;
  }
  if (restrictionParam) {
    const r = PlayerRestriction.safeParse(restrictionParam);
    if (!r.success) return NextResponse.json({ error: "Invalid restriction" }, { status: 400 });
    where.playerRestriction = r.data;
  }

  const servers = await db.server.findMany({
    where,
    orderBy: { name: "asc" },
    include: { host: { select: { id: true, name: true } } },
  });
  return NextResponse.json(servers.map(serializeServer));
}

export async function POST(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = CreateServerInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const host = await db.host.findUnique({ where: { id: parsed.data.hostId } });
  if (!host) return NextResponse.json({ error: "Host not found" }, { status: 404 });

  const { tags, ...rest } = parsed.data;
  const created = await db.server.create({
    data: { ...rest, tags: JSON.stringify(tags) },
  });
  return NextResponse.json(serializeServer(created), { status: 201 });
}
