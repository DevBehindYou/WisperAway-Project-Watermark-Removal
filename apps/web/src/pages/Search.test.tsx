import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SearchPage } from "./Search";
import type { SearchResult } from "../api/client";

const results: SearchResult[] = [
  {
    type: "commitment",
    id: "cm1",
    title: "Send staging server credentials",
    snippet: "Send staging server credentials",
    sourceEventId: "e1",
    sourceEventBody: "Devendra (Jidoka) to send over the staging server credentials by Monday.",
    occurredAt: "2026-09-22T14:00:00.000Z",
  },
];

function mockFetch(hasResults: boolean) {
  return vi.fn((url: string) => {
    if (url.includes("/search")) {
      const decoded = decodeURIComponent(url);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: decoded.includes("staging") && hasResults ? results : [] }),
      } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
  });
}

describe("SearchPage", () => {
  it("shows real results with their source citation, not a synthesized answer", async () => {
    global.fetch = mockFetch(true) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<SearchPage tenantId="t1" />);
    await user.type(screen.getByLabelText("Search"), "staging");
    await user.click(screen.getByRole("button", { name: "Search" }));
    const list = await screen.findByTestId("search-results");
    expect(list.textContent).toContain("Send staging server credentials");
    expect(list.textContent).toContain("Devendra (Jidoka) to send over the staging server credentials by Monday.");
  });

  it("a query with no real match shows an honest empty state, not a fabricated result", async () => {
    global.fetch = mockFetch(false) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<SearchPage tenantId="t1" />);
    await user.type(screen.getByLabelText("Search"), "spaceship");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText(/No matches for "spaceship"/)).toBeInTheDocument();
  });
});
