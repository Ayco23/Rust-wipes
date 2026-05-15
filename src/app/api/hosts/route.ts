import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const CreateHostInput = z.object({
  name: z.string().min(1),
  website: z.string().url().nullable().optional(),
  discordGuild: z.string().nullable().optional(),
  discordInvite: z.string().nullable().optional(),
});

export async function GET(): Promise<Response> {
  const hosts = await db.host.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(hosts);
}

export async function POST(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = CreateHostInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const host = await db.host.create({ data: parsed.data });
    return NextResponse.json(host, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
