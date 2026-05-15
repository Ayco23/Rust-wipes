// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DayDetail } from "./DayDetail";
import type { WipeEvent } from "@/types/wipes";

afterEach(() => cleanup());

const sampleDate = new Date("2025-06-15T12:00:00Z");

const wipes: WipeEvent[] = [
  {
    serverId: "s1",
    serverName: "Rusty Moose US Main",
    hostId: "h1",
    hostName: "Rusty Moose",
    type: "community",
    playerRestriction: "solo",
    region: "us-east",
    occursAt: new Date("2025-06-15T14:00:00Z"),
    kind: "weekly",
    label: "Main wipe",
  },
  {
    serverId: "s2",
    serverName: "Forced Wipe Server",
    hostId: "h2",
    hostName: "Facepunch",
    type: "official",
    playerRestriction: "none",
    region: "eu",
    occursAt: new Date("2025-06-15T18:00:00Z"),
    kind: "forced",
    label: null,
  },
];

describe("DayDetail", () => {
  it("renders nothing when open=false", () => {
    const { container } = render(
      <DayDetail open={false} onClose={() => {}} date={sampleDate} wipes={wipes} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders wipes when open", () => {
    render(<DayDetail open={true} onClose={() => {}} date={sampleDate} wipes={wipes} />);
    expect(screen.getByText("Rusty Moose US Main")).toBeTruthy();
    expect(screen.getByText("Forced Wipe Server")).toBeTruthy();
    expect(screen.getByText("Rusty Moose")).toBeTruthy();
  });

  it("shows empty state when no wipes", () => {
    render(<DayDetail open={true} onClose={() => {}} date={sampleDate} wipes={[]} />);
    expect(screen.getByText(/No wipes scheduled this day/i)).toBeTruthy();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<DayDetail open={true} onClose={onClose} date={sampleDate} wipes={wipes} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay clicked", () => {
    const onClose = vi.fn();
    render(<DayDetail open={true} onClose={onClose} date={sampleDate} wipes={wipes} />);
    fireEvent.click(screen.getByLabelText("Close overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
