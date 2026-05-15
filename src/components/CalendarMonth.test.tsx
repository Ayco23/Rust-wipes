// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CalendarMonth } from "./CalendarMonth";
import type { WipeEvent } from "@/types/wipes";

afterEach(() => {
  cleanup();
});

function makeEvent(overrides: Partial<WipeEvent> & { occursAt: Date }): WipeEvent {
  return {
    serverId: "srv-1",
    serverName: "Test Server",
    hostId: "host-1",
    hostName: "Test Host",
    type: "official",
    playerRestriction: "none",
    region: "us-east",
    kind: "weekly",
    label: null,
    ...overrides,
  };
}

describe("CalendarMonth", () => {
  const month = new Date(2025, 0, 15); // January 2025

  it("renders 7 weekday headers and 42 day cells", () => {
    render(<CalendarMonth month={month} wipes={[]} />);
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
    expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  });

  it("renders a pill for a given event", () => {
    const wipes: WipeEvent[] = [
      makeEvent({
        serverName: "Vital Rust Main",
        occursAt: new Date(2025, 0, 10, 14, 0),
      }),
    ];
    render(<CalendarMonth month={month} wipes={wipes} />);
    expect(screen.getByText("Vital Rust Main")).toBeTruthy();
  });

  it("shows +N more when events exceed cap", () => {
    const day = new Date(2025, 0, 10, 12, 0);
    const wipes: WipeEvent[] = Array.from({ length: 5 }, (_, i) =>
      makeEvent({ serverId: `s-${i}`, serverName: `Server ${i}`, occursAt: day }),
    );
    render(<CalendarMonth month={month} wipes={wipes} />);
    expect(screen.getByText("+2 more")).toBeTruthy();
  });

  it("fires onDayClick when a day cell is clicked", () => {
    const onDayClick = vi.fn();
    render(<CalendarMonth month={month} wipes={[]} onDayClick={onDayClick} />);
    const cell = screen.getByTestId("day-2025-01-15");
    fireEvent.click(cell);
    expect(onDayClick).toHaveBeenCalledTimes(1);
    const arg = onDayClick.mock.calls[0]?.[0] as Date;
    expect(arg.getFullYear()).toBe(2025);
    expect(arg.getMonth()).toBe(0);
    expect(arg.getDate()).toBe(15);
  });
});
