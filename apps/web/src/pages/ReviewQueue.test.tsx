import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewQueue } from "./ReviewQueue";
import type { Candidate } from "../api/client";

const candidates: Candidate[] = [
  {
    id: "c1",
    tenantId: "t1",
    title: "Send revised homepage mockups",
    description: null,
    ownerHint: "Ashu",
    promisedToHint: "Priya",
    clientHint: "WebOsmotic",
    rawDatePhrase: "this Friday",
    deterministicResolvedDueAt: "2026-09-25T11:30:00.000Z",
    confidence: 0.94,
    state: "PENDING",
    originEventId: "e1",
    createdAt: "2026-09-23T10:00:00.000Z",
  },
  {
    id: "c2",
    tenantId: "t1",
    title: "Circle back about the invoice",
    description: null,
    ownerHint: "Ashu",
    promisedToHint: "Rahul",
    clientHint: "Ariel Software Solutions",
    rawDatePhrase: "once he's back from vacation",
    deterministicResolvedDueAt: null,
    confidence: 0.7,
    state: "NEEDS_DATE_REVIEW",
    originEventId: "e2",
    createdAt: "2026-09-25T09:00:00.000Z",
  },
];

function mockFetch() {
  return vi.fn((url: string) => {
    if (url.includes("/candidates?")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(candidates) } as Response);
    }
    if (url.includes("/source-events/e1")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "e1",
            kind: "EMAIL",
            body: "Hi Priya, confirming — I'll get the revised homepage mockups over to you by this Friday.",
            occurredAt: "2026-09-23T10:00:00.000Z",
            sourceAdapter: "manual_capture",
          }),
      } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
  });
}

describe("ReviewQueue", () => {
  beforeEach(() => {
    global.fetch = mockFetch() as unknown as typeof fetch;
  });

  it("lists candidates and shows tab counts", async () => {
    render(<ReviewQueue tenantId="t1" />);
    const list = within(await screen.findByTestId("candidate-list"));
    expect(await list.findByText("Send revised homepage mockups")).toBeInTheDocument();
    expect(list.getByText("Circle back about the invoice")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /All unresolved \(2\)/ })).toBeInTheDocument();
  });

  it("selecting a candidate shows its real evidence text, not a summary", async () => {
    const user = userEvent.setup();
    render(<ReviewQueue tenantId="t1" />);
    const list = within(await screen.findByTestId("candidate-list"));
    const card = await list.findByText("Send revised homepage mockups");
    await user.click(card);

    const quote = await screen.findByTestId("evidence-quote");
    expect(quote.textContent).toContain(
      "I'll get the revised homepage mockups over to you by this Friday"
    );
  });

  it("a candidate with no resolvable date shows the needs-review state and no fabricated date", async () => {
    render(<ReviewQueue tenantId="t1" />);
    const list = within(await screen.findByTestId("candidate-list"));
    const card = await list.findByText("Circle back about the invoice");
    const cardButton = card.closest("button")!;
    expect(within(cardButton).getByText("Date needs review")).toBeInTheDocument();
    // Critically: it must NOT show a resolved date anywhere on the card.
    expect(within(cardButton).queryByText(/→ resolves to/)).not.toBeInTheDocument();
  });

  it("the Date conflict tab only shows candidates needing date review", async () => {
    const user = userEvent.setup();
    render(<ReviewQueue tenantId="t1" />);
    const list = within(await screen.findByTestId("candidate-list"));
    await list.findByText("Send revised homepage mockups");
    await user.click(screen.getByRole("tab", { name: /Date conflict/ }));
    expect(list.queryByText("Send revised homepage mockups")).not.toBeInTheDocument();
    expect(list.getByText("Circle back about the invoice")).toBeInTheDocument();
  });
});
