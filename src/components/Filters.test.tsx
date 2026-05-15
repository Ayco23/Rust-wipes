// @vitest-environment jsdom
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import { Filters, type FilterState } from "./Filters";

function render(ui: React.ReactElement): { container: HTMLElement; unmount: () => void } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return {
    container,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

const empty: FilterState = { types: [], restrictions: [], hostIds: [], regions: [] };

describe("Filters", () => {
  it("toggling a type calls onChange with updated state", () => {
    const onChange = vi.fn();
    const { container, unmount } = render(
      <Filters
        value={empty}
        onChange={onChange}
        hosts={[{ id: "h1", name: "Host One" }]}
        regions={["us-east"]}
      />,
    );

    const checkbox = container.querySelector<HTMLInputElement>(
      'input[aria-label="type-official"]',
    );
    expect(checkbox).not.toBeNull();
    act(() => {
      checkbox!.click();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      types: ["official"],
      restrictions: [],
      hostIds: [],
      regions: [],
    });

    unmount();
  });

  it("Clear all empties everything", () => {
    const onChange = vi.fn();
    const value: FilterState = {
      types: ["official", "modded"],
      restrictions: ["solo"],
      hostIds: ["h1"],
      regions: ["us-east"],
    };
    const { container, unmount } = render(
      <Filters
        value={value}
        onChange={onChange}
        hosts={[{ id: "h1", name: "Host One" }]}
        regions={["us-east"]}
      />,
    );

    const buttons = Array.from(container.querySelectorAll("button"));
    const clear = buttons.find((b) => b.textContent === "Clear all");
    expect(clear).toBeDefined();
    act(() => {
      clear!.click();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(empty);

    unmount();
  });
});
