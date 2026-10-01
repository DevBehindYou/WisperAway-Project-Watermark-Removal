import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "./Dashboard";
import type { Commitment, WaitingItemRow } from "../api/client";

const commitments: Commitment[] = [
  {
    id: "cm1",
    title: "Send revised homepage mockups",
    detail: null,
    status: "OPEN",
    dueAt: "2026-09-25T11:30:00.000Z",
    promisedAt: "2026-09-23T10:00:00.000Z",
    confidence: 0.94,
  },
  {
    id: "cm2",
    title: "Archived old commitment",
    detail: null,
    status: "DONE",
    dueAt: null,
    promisedAt: "2026-08-01T10:00:00.000Z",
    confidence: 0.9,
  },
];

const waitingItems: WaitingItemRow[] = [
  {
    id: "w1",
    commitmentId: "cm3",
    commitmentTitle: "Staging credentials",
    waitingOn: "Rahul Mehta",
    waitingSince: new Date().toISOString(),
    waitingReason: "Needs staging environment details.",
  },
];

function mockFetch() {
  return vi.fn((url: string) => {
    if (url.includes("/commitments?")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(commitments) } as Response);
    }
    if (url.includes("/waiting-items")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(waitingItems) } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
  });
}

describe("Dashboard", () => {
  beforeEach(() => {
    global.fetch = mockFetch() as unknown as typeof fetch;
  });

  it("shows only OPEN/IN_PROGRESS commitments in the Open zone, not DONE ones", async () => {
    render(<Dashboard tenantId="t1" />);
    expect(await screen.findByText("Send revised homepage mockups")).toBeInTheDocument();
    expect(screen.queryByText("Archived old commitment")).not.toBeInTheDocument();
    expect(screen.getByText("Open (1)")).toBeInTheDocument();
  });

  it("shows real waiting items, not a placeholder", async () => {
    render(<Dashboard tenantId="t1" />);
    expect(await screen.findByText(/Waiting on Rahul Mehta/)).toBeInTheDocument();
  });

  it("is honest that At Risk and Personal Goals are not built, rather than showing empty fake sections", async () => {
    render(<Dashboard tenantId="t1" />);
    await screen.findByText("Send revised homepage mockups");
    expect(screen.queryByText(/at risk/i)).not.toBeNull(); // appears only in the honesty note
    expect(screen.queryByRole("heading", { name: /at risk/i })).not.toBeInTheDocument(); // never as its own section heading
  });
});
