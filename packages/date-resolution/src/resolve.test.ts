import { describe, it, expect } from "vitest";
import { resolveDatePhrase } from "./resolve.js";

const KOLKATA = "Asia/Kolkata";

describe("spec §95 — the exact phrase list", () => {
  // Anchor: Wednesday 2026-09-23T10:00:00 in Asia/Kolkata
  const anchor = "2026-09-23T10:00:00";

  it('"tomorrow" -> next calendar day, default EOD time', () => {
    const r = resolveDatePhrase({ phrase: "tomorrow", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-24T17:00:00")).toBe(true);
      expect(r.timeWasExplicit).toBe(false);
    }
  });

  it('"next Friday" -> Friday of the FOLLOWING week (documented convention), lower confidence', () => {
    const r = resolveDatePhrase({ phrase: "next Friday", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-10-02T17:00:00")).toBe(true);
      expect(r.confidence).toBe("medium");
      expect(r.assumptions.some((a) => a.includes("ambiguous"))).toBe(true);
    }
  });

  it('"this Friday" -> Friday of the current week', () => {
    const r = resolveDatePhrase({ phrase: "this Friday", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-25T17:00:00")).toBe(true);
    }
  });

  it('bare "Friday" -> same as "this Friday" (nearest upcoming occurrence)', () => {
    const r = resolveDatePhrase({ phrase: "Friday", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-25T17:00:00")).toBe(true);
    }
  });

  it('"end of week" -> Friday of the current week', () => {
    const r = resolveDatePhrase({ phrase: "end of week", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-25T17:00:00")).toBe(true);
    }
  });

  it('"next week" -> Monday of next week, coarse/medium confidence', () => {
    const r = resolveDatePhrase({ phrase: "next week", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-28T17:00:00")).toBe(true);
      expect(r.confidence).toBe("medium");
    }
  });

  it('"before Monday" -> the day before the upcoming Monday (Sunday)', () => {
    const r = resolveDatePhrase({ phrase: "before Monday", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-27T17:00:00")).toBe(true);
    }
  });

  it('"EOD tomorrow" -> tomorrow at the EOD time, time marked explicit', () => {
    const r = resolveDatePhrase({ phrase: "EOD tomorrow", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-24T17:00:00")).toBe(true);
      expect(r.timeWasExplicit).toBe(true);
    }
  });

  it('"first thing Monday" -> next Monday at 09:00', () => {
    const r = resolveDatePhrase({ phrase: "first thing Monday", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-28T09:00:00")).toBe(true);
    }
  });

  it('"after launch" -> needs_context, never guessed', () => {
    const r = resolveDatePhrase({ phrase: "after launch", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("needs_context");
  });

  it('"once they approve" -> needs_context, never guessed', () => {
    const r = resolveDatePhrase({ phrase: "once they approve", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("needs_context");
  });

  it('"before the meeting" -> needs_context (event reference, not a weekday)', () => {
    const r = resolveDatePhrase({ phrase: "before the meeting", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("needs_context");
  });

  it('"after the client call" -> needs_context', () => {
    const r = resolveDatePhrase({ phrase: "after the client call", anchor, timezone: KOLKATA });
    expect(r.kind).toBe("needs_context");
  });
});

describe("boundary: Sunday/Monday", () => {
  it('anchor on Sunday, "tomorrow" crosses into Monday correctly', () => {
    const r = resolveDatePhrase({
      phrase: "tomorrow",
      anchor: "2026-09-20T10:00:00", // Sunday
      timezone: KOLKATA,
    });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-09-21T17:00:00")).toBe(true);
    }
  });
});

describe("boundary: month end / year end", () => {
  it('"end of month" from Jan 2026 anchor -> Jan 31', () => {
    const r = resolveDatePhrase({
      phrase: "end of month",
      anchor: "2026-01-15T10:00:00",
      timezone: KOLKATA,
    });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-01-31T17:00:00")).toBe(true);
    }
  });

  it('"beginning of next month" from Jan 2026 anchor -> Feb 1', () => {
    const r = resolveDatePhrase({
      phrase: "beginning of next month",
      anchor: "2026-01-15T10:00:00",
      timezone: KOLKATA,
    });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-02-01T17:00:00")).toBe(true);
    }
  });

  it('"tomorrow" from Dec 30 anchor -> Dec 31, same year', () => {
    const r = resolveDatePhrase({
      phrase: "tomorrow",
      anchor: "2026-12-30T10:00:00",
      timezone: KOLKATA,
    });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2026-12-31T17:00:00")).toBe(true);
    }
  });

  it('"next week" from Dec 30 2026 anchor correctly rolls into January 2027', () => {
    const r = resolveDatePhrase({
      phrase: "next week",
      anchor: "2026-12-30T10:00:00",
      timezone: KOLKATA,
    });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal.startsWith("2027-01-04T17:00:00")).toBe(true);
    }
  });
});

describe("boundary: DST transitions (America/New_York, real 2026 dates)", () => {
  it('spring-forward: "tomorrow" across the Mar 8 2026 transition keeps 17:00 local, offset flips EST->EDT', () => {
    const r = resolveDatePhrase({
      phrase: "tomorrow",
      anchor: "2026-03-07T10:00:00",
      timezone: "America/New_York",
    });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal).toBe("2026-03-08T17:00:00.000-04:00");
      expect(r.resolvedUtc).toBe("2026-03-08T21:00:00.000Z");
    }
  });

  it('fall-back: "tomorrow" across the Nov 1 2026 transition keeps 17:00 local, offset flips EDT->EST', () => {
    const r = resolveDatePhrase({
      phrase: "tomorrow",
      anchor: "2026-10-31T10:00:00",
      timezone: "America/New_York",
    });
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.resolvedLocal).toBe("2026-11-01T17:00:00.000-05:00");
      expect(r.resolvedUtc).toBe("2026-11-01T22:00:00.000Z");
    }
  });
});

describe("boundary: different source/user timezones produce different absolute instants", () => {
  it("same phrase, same anchor date, different zones -> different UTC instants", () => {
    const kolkata = resolveDatePhrase({
      phrase: "tomorrow",
      anchor: "2026-09-23T10:00:00",
      timezone: KOLKATA,
    });
    const newYork = resolveDatePhrase({
      phrase: "tomorrow",
      anchor: "2026-09-23T10:00:00",
      timezone: "America/New_York",
    });
    expect(kolkata.kind).toBe("resolved");
    expect(newYork.kind).toBe("resolved");
    if (kolkata.kind === "resolved" && newYork.kind === "resolved") {
      expect(kolkata.resolvedUtc).toBe("2026-09-24T11:30:00.000Z");
      expect(newYork.resolvedUtc).toBe("2026-09-24T21:00:00.000Z");
      expect(kolkata.resolvedUtc).not.toBe(newYork.resolvedUtc);
    }
  });
});

describe("safety property: never silently guess", () => {
  it("a completely unrecognized phrase returns unrecognized, not a fabricated date", () => {
    const r = resolveDatePhrase({
      phrase: "sometime around the fiscal thing probably",
      anchor: "2026-09-23T10:00:00",
      timezone: KOLKATA,
    });
    expect(r.kind).toBe("unrecognized");
  });

  it("every needs_context result carries a human-readable reason", () => {
    const r = resolveDatePhrase({
      phrase: "after the launch",
      anchor: "2026-09-23T10:00:00",
      timezone: KOLKATA,
    });
    expect(r.kind).toBe("needs_context");
    if (r.kind === "needs_context") {
      expect(r.reason.length).toBeGreaterThan(10);
    }
  });
});
