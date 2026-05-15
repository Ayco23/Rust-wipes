// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response(JSON.stringify({ events: [] }), { status: 200 }))),
  );
});

describe("HomePage", () => {
  it("renders heading and a month name", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: /Rust Wipes/i })).toBeTruthy();
    const monthRe =
      /January|February|March|April|May|June|July|August|September|October|November|December/;
    expect(screen.getByTestId("month-label").textContent ?? "").toMatch(monthRe);
  });
});
