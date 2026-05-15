import { describe, it, expect } from "vitest";
import { GET } from "./route";
import { WipeEventSchema } from "@/types/wipes";

function makeRequest(qs: string): Request {
  return new Request(`http://localhost/api/wipes?${qs}`);
}

describe("GET /api/wipes", () => {
  it("returns 400 for missing/invalid query", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(400);
  });

  it("returns events array for the seeded server in a valid window", async () => {
    const res = await GET(
      makeRequest("from=2026-01-01&to=2026-03-01"),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { events: unknown[] };
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.events.length).toBeGreaterThan(0);

    // Validate schema and sort order.
    const parsed = WipeEventSchema.array().parse(body.events);
    for (let i = 1; i < parsed.length; i++) {
      expect(
        parsed[i].occursAt.getTime() >= parsed[i - 1].occursAt.getTime(),
      ).toBe(true);
    }

    // At least one event should belong to the seeded Rustoria server.
    const rustoria = parsed.find((e) => e.serverId === "seed-rustoria-trio");
    expect(rustoria).toBeDefined();
    expect(rustoria?.hostName).toBe("Rustoria");
    expect(rustoria?.kind).toBe("weekly");
  });

  it("filters by serverIds", async () => {
    const res = await GET(
      makeRequest(
        "from=2026-01-01&to=2026-03-01&serverIds=does-not-exist",
      ),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { events: unknown[] };
    expect(body.events).toEqual([]);
  });

  it("rejects when `to` is before `from`", async () => {
    const res = await GET(
      makeRequest("from=2026-03-01&to=2026-01-01"),
    );
    expect(res.status).toBe(400);
  });
});
