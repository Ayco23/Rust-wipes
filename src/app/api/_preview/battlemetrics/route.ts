import { NextResponse } from "next/server";
import { searchByName } from "@/lib/battlemetrics";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });
  const results = await searchByName(q);
  return NextResponse.json({ results });
}
