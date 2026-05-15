import { describe, expect, it } from "vitest";
import {
  HOST_PALETTE_COUNT,
  colorForHost,
  colorForRestriction,
  colorForType,
} from "./serverColors";

describe("colorForHost", () => {
  it("returns the same color for the same hostId", () => {
    const a = colorForHost("host-rustafied");
    const b = colorForHost("host-rustafied");
    expect(a).toEqual(b);
  });

  it("spreads different ids across multiple palettes", () => {
    const ids = Array.from({ length: 60 }, (_, i) => `host-${i}`);
    const seen = new Set(ids.map((id) => colorForHost(id).bg));
    // Expect a healthy spread — at least half the palettes used.
    expect(seen.size).toBeGreaterThanOrEqual(Math.ceil(HOST_PALETTE_COUNT / 2));
  });

  it("returns full Tailwind class strings", () => {
    const c = colorForHost("anything");
    expect(c.bg).toMatch(/^bg-[a-z]+-\d+$/);
    expect(c.text).toMatch(/^text-[a-z]+-\d+$/);
    expect(c.ring).toMatch(/^ring-[a-z]+-\d+$/);
  });
});

describe("colorForType", () => {
  it("returns a non-empty string for official", () => {
    expect(colorForType("official")).not.toBe("");
  });
  it("returns distinct classes for each type", () => {
    const classes = new Set([
      colorForType("official"),
      colorForType("community"),
      colorForType("modded"),
    ]);
    expect(classes.size).toBe(3);
  });
});

describe("colorForRestriction", () => {
  it("returns a non-empty string for solo", () => {
    expect(colorForRestriction("solo")).not.toBe("");
  });
});
