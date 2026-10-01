import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientView } from "./ClientView";
import type { ClientAccount, ClientView as ClientViewData } from "../api/client";

const clients: ClientAccount[] = [
  { id: "cl1", tenantId: "t1", name: "Ariel Software Solutions", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "cl2", tenantId: "t1", name: "WebOsmotic", createdAt: "2026-09-02T00:00:00.000Z" },
];

const view1: ClientViewData = {
  client: clients[0],
  commitments: [
    {
      id: "cm1",
      title: "Send staging credentials",
      detail: null,
      status: "WAITING",
      dueAt: "2026-10-05T11:30:00.000Z",
      promisedAt: "2026-09-23T10:00:00.000Z",
      confidence: 0.91,
    },
  ],
  timeline: [
    {
      id: "ch1",
      commitmentId: "cm1",
      commitmentTitle: "Send staging credentials",
      fieldName: "status",
      oldValue: null,
      newValue: "OPEN",
      initiatedBy: "me",
      initiatorSide: "US",
      reason: "Commitment captured and accepted from manual note.",
      createdAt: "2026-09-23T10:05:00.000Z",
    },
    {
      id: "ch2",
      commitmentId: "cm1",
      commitmentTitle: "Send staging credentials",
      fieldName: "due_at",
      oldValue: "2026-10-02T11:30:00.000Z",
      newValue: "2026-10-05T11:30:00.000Z",
      initiatedBy: "Rahul Mehta",
      initiatorSide: "CLIENT",
      reason: "Client asked to push to the following week.",
      createdAt: "2026-09-24T09:00:00.000Z",
    },
  ],
};

function mockFetch() {
  return vi.fn((url: string) => {
    if (url.includes("/client-accounts?")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(clients) } as Response);
    }
    if (url.includes("/client-accounts/cl1/view")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(view1) } as Response);
    }
    if (url.includes("/client-accounts/cl2/view")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ client: clients[1], commitments: [], timeline: [] }),
      } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
  });
}

describe("ClientView", () => {
  beforeEach(() => {
    global.fetch = mockFetch() as unknown as typeof fetch;
  });

  it("lists client accounts and defaults to showing the first one's timeline", async () => {
    render(<ClientView tenantId="t1" />);
    expect(await screen.findByText("Ariel Software Solutions")).toBeInTheDocument();
    expect(screen.getByText("WebOsmotic")).toBeInTheDocument();
    expect(await screen.findByTestId("timeline")).toBeInTheDocument();
  });

  it("shows both a US-initiated and a CLIENT-initiated entry with correct attribution", async () => {
    render(<ClientView tenantId="t1" />);
    const timeline = await screen.findByTestId("timeline");
    expect(timeline.textContent).toContain("You");
    expect(timeline.textContent).toContain("Client");
    expect(timeline.textContent).toContain("Client asked to push to the following week.");
  });

  it("switching clients shows an empty-timeline state honestly, not stale data from the previous client", async () => {
    const user = userEvent.setup();
    render(<ClientView tenantId="t1" />);
    await screen.findByTestId("timeline");
    await user.click(screen.getByText("WebOsmotic"));
    expect(await screen.findByText("No changes recorded yet.")).toBeInTheDocument();
  });
});
