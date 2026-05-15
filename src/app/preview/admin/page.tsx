import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function createHostAction(formData: FormData): Promise<void> {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  if (!name) return;
  await db.host.create({
    data: { name, website: website ? website : null },
  });
  revalidatePath("/preview/admin");
}

async function createServerAction(formData: FormData): Promise<void> {
  "use server";
  const hostId = String(formData.get("hostId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "community").trim();
  const playerRestriction = String(formData.get("playerRestriction") ?? "none").trim();
  const region = String(formData.get("region") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  if (!hostId || !name) return;
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  await db.server.create({
    data: {
      hostId,
      name,
      type,
      playerRestriction,
      region: region || null,
      tags: JSON.stringify(tags),
    },
  });
  revalidatePath("/preview/admin");
}

export default async function AdminPreviewPage() {
  const hosts = await db.host.findMany({
    orderBy: { name: "asc" },
    include: { servers: { orderBy: { name: "asc" } } },
  });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">Admin preview</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Quick CRUD against /api/hosts and /api/servers via server actions.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Hosts ({hosts.length})</h2>
        <ul className="mt-3 space-y-4">
          {hosts.map((h) => (
            <li key={h.id} className="rounded border border-neutral-300 p-3 dark:border-neutral-700">
              <div className="font-medium">{h.name}</div>
              {h.website ? (
                <div className="text-xs text-neutral-500">{h.website}</div>
              ) : null}
              <div className="mt-2 text-xs text-neutral-400">id: {h.id}</div>
              {h.servers.length > 0 ? (
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {h.servers.map((s) => (
                    <li key={s.id}>
                      {s.name}{" "}
                      <span className="text-xs text-neutral-500">
                        ({s.type} / {s.playerRestriction}
                        {s.region ? ` / ${s.region}` : ""})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 text-xs text-neutral-500">No servers yet.</div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Add host</h2>
        <form action={createHostAction} className="mt-3 flex flex-col gap-2">
          <input
            name="name"
            placeholder="Host name"
            required
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input
            name="website"
            placeholder="Website (optional)"
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            className="self-start rounded bg-rust-600 px-3 py-1 text-white"
          >
            Create host
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Add server</h2>
        <form action={createServerAction} className="mt-3 flex flex-col gap-2">
          <select
            name="hostId"
            required
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">— Select host —</option>
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <input
            name="name"
            placeholder="Server name"
            required
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <select
            name="type"
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
            defaultValue="community"
          >
            <option value="official">official</option>
            <option value="community">community</option>
            <option value="modded">modded</option>
          </select>
          <select
            name="playerRestriction"
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
            defaultValue="none"
          >
            <option value="none">none</option>
            <option value="solo">solo</option>
            <option value="duo">duo</option>
            <option value="trio">trio</option>
            <option value="quad">quad</option>
            <option value="quintet">quintet</option>
            <option value="other">other</option>
          </select>
          <input
            name="region"
            placeholder="Region (e.g. EU)"
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input
            name="tags"
            placeholder="Tags (comma separated)"
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            className="self-start rounded bg-rust-600 px-3 py-1 text-white"
          >
            Create server
          </button>
        </form>
      </section>
    </main>
  );
}
