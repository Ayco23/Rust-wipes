import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ScheduleKind } from "@/types/wipes";

const CreateScheduleInput = z.object({
  serverId: z.string().min(1),
  rrule: z.string().min(1),
  dtstart: z.coerce.date(),
  timezone: z.string().default("UTC"),
  kind: ScheduleKind,
  label: z.string().nullable().optional(),
});

export async function POST(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = CreateScheduleInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const server = await db.server.findUnique({ where: { id: parsed.data.serverId } });
  if (!server) return NextResponse.json({ error: "Server not found" }, { status: 404 });

  const rule = await db.wipeScheduleRule.create({ data: parsed.data });
  return NextResponse.json(rule, { status: 201 });
}

export async function DELETE(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = await db.wipeScheduleRule.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.wipeScheduleRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
