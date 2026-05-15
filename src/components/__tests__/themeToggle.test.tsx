import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { ThemeToggle } from "../ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("toggles the dark class on documentElement when clicked", () => {
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole("button", { name: /toggle dark mode/i });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("rw:theme")).toBe("dark");

    fireEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("rw:theme")).toBe("light");
  });
});
