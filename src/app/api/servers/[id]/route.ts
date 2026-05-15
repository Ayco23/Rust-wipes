import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { PlayerRestriction, ServerType } from "@/types/wipes";

const UpdateServerInput = z
  .object({
    hostId: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    type: ServerType.optional(),
    playerRestriction: PlayerRestriction.optional(),
    region: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    battlemetricsId: z.string().nullable().optional(),
    lastWipeAt: z.coerce.date().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch" });

type Ctx = { params: Promise<{ id: string }> };

function deserializeTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    /* noop */
  }
  return [];
}

export async function GET(_req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const server = await db.server.findUnique({
    where: { id },
    include: { host: true, schedules: true, overrides: true },
  });
  if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...server, tags: deserializeTags(server.tags) });
}

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = UpdateServerInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const existing = await db.server.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.hostId) {
    const host = await db.host.findUnique({ where: { id: parsed.data.hostId } });
    if (!host) return NextResponse.json({ error: "Host not found" }, { status: 404 });
  }

  const { tags, ...rest } = parsed.data;
  const updated = await db.server.update({
    where: { id },
    data: { ...rest, ...(tags ? { tags: JSON.stringify(tags) } : {}) },
  });
  return NextResponse.json({ ...updated, tags: deserializeTags(updated.tags) });
}

export async function DELETE(_req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const existing = await db.server.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.server.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
