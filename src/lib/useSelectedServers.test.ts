// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSelectedServers } from "./useSelectedServers";

const STORAGE_KEY = "rw:selectedServers";

describe("useSelectedServers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("toggle adds and removes ids", async () => {
    const { result } = renderHook(() => useSelectedServers());

    // After mount effect, isReady should be true.
    expect(result.current.isReady).toBe(true);
    expect(result.current.selected.size).toBe(0);

    act(() => {
      result.current.toggle("a");
    });
    expect(result.current.selected.has("a")).toBe(true);

    act(() => {
      result.current.toggle("b");
      result.current.toggle("a");
    });
    expect(result.current.selected.has("a")).toBe(false);
    expect(result.current.selected.has("b")).toBe(true);

    const stored: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    expect(Array.isArray(stored) ? stored : []).toEqual(["b"]);
  });

  it("clear empties the selection", () => {
    const { result } = renderHook(() => useSelectedServers());
    act(() => {
      result.current.setMany(["x", "y", "z"]);
    });
    expect(result.current.selected.size).toBe(3);

    act(() => {
      result.current.clear();
    });
    expect(result.current.selected.size).toBe(0);

    const stored: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    expect(stored).toEqual([]);
  });

  it("rehydrates from pre-populated localStorage", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["s1", "s2"]));
    const { result } = renderHook(() => useSelectedServers());
    expect(result.current.isReady).toBe(true);
    expect(result.current.selected.has("s1")).toBe(true);
    expect(result.current.selected.has("s2")).toBe(true);
    expect(result.current.selected.size).toBe(2);
  });
});
