import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const UpdateHostInput = z
  .object({
    name: z.string().min(1).optional(),
    website: z.string().url().nullable().optional(),
    discordGuild: z.string().nullable().optional(),
    discordInvite: z.string().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch" });

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const host = await db.host.findUnique({
    where: { id },
    include: { servers: true },
  });
  if (!host) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(host);
}

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = UpdateHostInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const existing = await db.host.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const host = await db.host.update({ where: { id }, data: parsed.data });
  return NextResponse.json(host);
}

export async function DELETE(_req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const existing = await db.host.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.host.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
