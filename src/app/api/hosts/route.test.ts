import { afterAll, describe, expect, it } from "vitest";
import { GET, POST } from "./route";
import { db } from "@/lib/db";

const TEST_NAME = `__vitest_host_${Date.now()}`;

describe("/api/hosts route", () => {
  afterAll(async () => {
    await db.host.deleteMany({ where: { name: { startsWith: "__vitest_host_" } } });
    await db.$disconnect();
  });

  it("POST creates a host and GET returns it", async () => {
    const postReq = new Request("http://localhost/api/hosts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: TEST_NAME, website: "https://example.com" }),
    });
    const postRes = await POST(postReq);
    expect(postRes.status).toBe(201);
    const created = (await postRes.json()) as { id: string; name: string };
    expect(created.name).toBe(TEST_NAME);
    expect(typeof created.id).toBe("string");

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const list = (await getRes.json()) as Array<{ name: string }>;
    expect(list.some((h) => h.name === TEST_NAME)).toBe(true);
  });

  it("POST rejects invalid input with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/hosts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
  });
});
