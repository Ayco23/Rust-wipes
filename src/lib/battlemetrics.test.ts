import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLastWipe, getServer, searchByName } from "./battlemetrics";

type FetchMock = ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json" },
  });
}

function installFetch(impl: (url: string, init?: RequestInit) => Promise<Response>): FetchMock {
  const mock = vi.fn(impl) as FetchMock;
  vi.stubGlobal("fetch", mock);
  return mock;
}

describe("battlemetrics client", () => {
  beforeEach(() => {
    delete process.env.BATTLEMETRICS_TOKEN;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("parses rust_last_wipe on 200", async () => {
    const iso = "2024-09-05T12:34:56.000Z";
    installFetch(async () =>
      jsonResponse({
        data: {
          type: "server",
          id: "123",
          attributes: { name: "Test Server", details: { rust_last_wipe: iso } },
        },
      }),
    );

    const server = await getServer("123");
    expect(server).not.toBeNull();
    expect(server?.id).toBe("123");
    expect(server?.name).toBe("Test Server");
    expect(server?.lastWipeAt?.toISOString()).toBe(iso);

    const last = await getLastWipe("123");
    expect(last?.toISOString()).toBe(iso);
  });

  it("returns null on 404", async () => {
    installFetch(async () => new Response("not found", { status: 404 }));
    expect(await getServer("missing")).toBeNull();
    expect(await getLastWipe("missing")).toBeNull();
  });

  it("includes Authorization header when token is set", async () => {
    process.env.BATTLEMETRICS_TOKEN = "secret-token";
    const fetchMock = installFetch(async () =>
      jsonResponse({
        data: {
          type: "server",
          id: "1",
          attributes: { name: "S", details: { rust_last_wipe: null } },
        },
      }),
    );

    await getServer("1");
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.Authorization).toBe("Bearer secret-token");
  });

  it("omits Authorization header when token is not set", async () => {
    const fetchMock = installFetch(async () =>
      jsonResponse({
        data: {
          type: "server",
          id: "1",
          attributes: { name: "S", details: { rust_last_wipe: null } },
        },
      }),
    );

    await getServer("1");
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.Authorization).toBeUndefined();
  });

  it("searchByName returns array of servers", async () => {
    installFetch(async () =>
      jsonResponse({
        data: [
          {
            type: "server",
            id: "a",
            attributes: { name: "Alpha", details: { rust_last_wipe: "2024-01-01T00:00:00.000Z" } },
          },
          {
            type: "server",
            id: "b",
            attributes: { name: "Bravo", details: { rust_last_wipe: null } },
          },
        ],
      }),
    );

    const results = await searchByName("rust");
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ id: "a", name: "Alpha" });
    expect(results[0]?.lastWipeAt?.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(results[1]?.lastWipeAt).toBeNull();
  });

  it("searchByName returns [] on network failure", async () => {
    installFetch(async () => {
      throw new Error("network down");
    });
    expect(await searchByName("x")).toEqual([]);
  });
});
