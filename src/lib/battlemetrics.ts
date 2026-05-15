import { z } from "zod";

const BM_BASE = "https://api.battlemetrics.com";

const ServerAttributesSchema = z.object({
  name: z.string(),
  details: z
    .object({
      rust_last_wipe: z.string().nullable().optional(),
    })
    .passthrough()
    .optional(),
});

const ServerResourceSchema = z.object({
  type: z.literal("server"),
  id: z.string(),
  attributes: ServerAttributesSchema,
});

const SingleServerResponseSchema = z.object({
  data: ServerResourceSchema,
});

const ListServerResponseSchema = z.object({
  data: z.array(ServerResourceSchema),
});

export type BattleMetricsServer = {
  id: string;
  name: string;
  lastWipeAt: Date | null;
};

function authHeaders(): Record<string, string> {
  const token = process.env.BATTLEMETRICS_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toServer(resource: z.infer<typeof ServerResourceSchema>): BattleMetricsServer {
  const raw = resource.attributes.details?.rust_last_wipe;
  let lastWipeAt: Date | null = null;
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) lastWipeAt = parsed;
  }
  return { id: resource.id, name: resource.attributes.name, lastWipeAt };
}

async function safeFetch(url: string): Promise<Response | null> {
  try {
    return await fetch(url, { headers: authHeaders() });
  } catch {
    return null;
  }
}

export async function getServer(id: string): Promise<BattleMetricsServer | null> {
  const res = await safeFetch(`${BM_BASE}/servers/${encodeURIComponent(id)}`);
  if (!res || !res.ok) return null;
  const parsed = SingleServerResponseSchema.safeParse(await res.json().catch(() => null));
  return parsed.success ? toServer(parsed.data.data) : null;
}

export async function getLastWipe(id: string): Promise<Date | null> {
  const server = await getServer(id);
  return server?.lastWipeAt ?? null;
}

export async function searchByName(q: string): Promise<BattleMetricsServer[]> {
  const url = `${BM_BASE}/servers?filter[game]=rust&filter[search]=${encodeURIComponent(q)}`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return [];
  const parsed = ListServerResponseSchema.safeParse(await res.json().catch(() => null));
  return parsed.success ? parsed.data.data.map(toServer) : [];
}
