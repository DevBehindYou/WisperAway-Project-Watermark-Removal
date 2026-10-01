import { DateTime } from "luxon";

/**
 * Deterministic date-resolution engine.
 *
 * Spec §4.2: relative dates must never enter the trusted database without
 * being converted to absolute dates. The AI resolves the phrase; this module
 * resolves it AGAIN, independently, with no knowledge of what the AI said.
 * If the two disagree, the caller routes to human review — this module does
 * not know about or care what the AI produced.
 *
 * Spec §26's extraction philosophy applies here too: prefer returning
 * `needs_context` over guessing. A wrong silent guess is worse than an
 * honest "I can't resolve this from text alone."
 *
 * This is intentionally a narrow, high-precision parser, not a general NLP
 * date parser. It covers the phrase set in spec §95 plus close variants.
 * Anything it doesn't recognize returns `unrecognized`, not a guess.
 */

export interface ResolveInput {
  /** The raw phrase as it appeared in the source text, e.g. "next Friday". */
  phrase: string;
  /** ISO 8601 local timestamp of the moment the promise was made, e.g. "2026-09-24T14:00:00". No offset — timezone is supplied separately, explicitly, per spec §4.2. */
  anchor: string;
  /** IANA timezone of the anchor moment, e.g. "Asia/Kolkata". Required — never defaulted. */
  timezone: string;
  /** Default time-of-day (24h "HH:mm") applied when a phrase has no explicit time. Defaults to end-of-business. */
  defaultTimeOfDay?: string;
  /** Time-of-day used for EOD/COB modifiers. Defaults to "17:00". */
  eodTimeOfDay?: string;
  /** Time-of-day used for "first thing" modifiers. Defaults to "09:00". */
  firstThingTimeOfDay?: string;
}

export type ResolveResult =
  | {
      kind: "resolved";
      raw: string;
      resolvedUtc: string;
      resolvedLocal: string;
      timezone: string;
      timeWasExplicit: boolean;
      confidence: "high" | "medium";
      assumptions: string[];
    }
  | {
      kind: "needs_context";
      raw: string;
      reason: string;
    }
  | {
      kind: "unrecognized";
      raw: string;
    };

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type Weekday = (typeof WEEKDAYS)[number];

function weekdayIndex(name: string): number | null {
  const i = WEEKDAYS.indexOf(name.toLowerCase() as Weekday);
  return i === -1 ? null : i;
}

/** Unconditional context-dependent markers — checked before anything else.
 * "Once they approve" depends on an external event with no fixed date,
 * full stop, regardless of what follows. */
const NEEDS_CONTEXT_PATTERNS: { re: RegExp; reason: string }[] = [
  {
    re: /\bonce\s+(they|it|we|he|she|the\s+\w+)\s+\w+/i,
    reason: "Depends on an external event with no fixed date ('once ... ').",
  },
];

function checkNeedsContext(phrase: string): string | null {
  for (const { re, reason } of NEEDS_CONTEXT_PATTERNS) {
    if (re.test(phrase)) return reason;
  }
  return null;
}

/** "before"/"after" are handled as a FALLBACK, not an upfront pattern match:
 * try the deterministic weekday case first ("before Monday"), and only if
 * that fails, treat any remaining "after X" / "before X" as context-dependent
 * ("before the meeting", "after launch", "after the client call"). This
 * avoids having to enumerate every possible event noun. */
function isAfterBeforeFallback(phraseLower: string): string | null {
  if (/^(after|before)\b/.test(phraseLower)) {
    return "Depends on the timing of a referenced event (a meeting, call, launch, approval, etc.) that this parser cannot resolve from text alone — needs the event's actual date from elsewhere in the system, or a human.";
  }
  return null;
}

interface ParsedTimeModifier {
  timeOfDay?: string;
  label?: string;
}

/** Strips a known time-modifier (EOD, COB, "first thing") from the phrase
 * and returns the remaining day-phrase plus which time to apply. */
function extractTimeModifier(
  phraseLower: string,
  opts: Required<Pick<ResolveInput, "eodTimeOfDay" | "firstThingTimeOfDay">>
): { rest: string; modifier: ParsedTimeModifier } {
  if (/\b(eod|end of day|cob|close of business)\b/.test(phraseLower)) {
    return {
      rest: phraseLower.replace(/\b(eod|end of day|cob|close of business)\b/g, "").trim(),
      modifier: { timeOfDay: opts.eodTimeOfDay, label: "EOD/COB" },
    };
  }
  if (/\bfirst thing\b/.test(phraseLower)) {
    return {
      rest: phraseLower.replace(/\bfirst thing\b/g, "").trim(),
      modifier: { timeOfDay: opts.firstThingTimeOfDay, label: "first thing" },
    };
  }
  return { rest: phraseLower.trim(), modifier: {} };
}

export function resolveDatePhrase(input: ResolveInput): ResolveResult {
  const raw = input.phrase;
  const phraseLower = raw.trim().toLowerCase();

  const defaults = {
    defaultTimeOfDay: input.defaultTimeOfDay ?? "17:00",
    eodTimeOfDay: input.eodTimeOfDay ?? "17:00",
    firstThingTimeOfDay: input.firstThingTimeOfDay ?? "09:00",
  };

  const contextReason = checkNeedsContext(phraseLower);
  if (contextReason) {
    return { kind: "needs_context", raw, reason: contextReason };
  }

  const anchor = DateTime.fromISO(input.anchor, { zone: input.timezone });
  if (!anchor.isValid) {
    throw new Error(
      `Invalid anchor/timezone: ${input.anchor} / ${input.timezone} (${anchor.invalidReason})`
    );
  }

  const { rest, modifier } = extractTimeModifier(phraseLower, defaults);
  const assumptions: string[] = [];
  let target: DateTime | null = null;
  let timeWasExplicit = !!modifier.timeOfDay;
  let confidence: "high" | "medium" = "high";

  const applyTime = (dt: DateTime, timeOfDay: string, why: string) => {
    const [h, m] = timeOfDay.split(":").map(Number);
    assumptions.push(why);
    return dt.set({ hour: h, minute: m, second: 0, millisecond: 0 });
  };

  if (rest === "" && modifier.label) {
    // e.g. bare "EOD" with nothing else => today
    target = anchor;
  } else if (rest === "today") {
    target = anchor;
  } else if (rest === "tomorrow") {
    target = anchor.plus({ days: 1 });
  } else if (rest === "this weekend") {
    // Resolve to the nearest Sunday end-of-day as the outer bound.
    const daysToSunday = (7 - anchor.weekday) % 7; // Luxon: Monday=1..Sunday=7
    target = anchor.plus({ days: daysToSunday === 0 ? 0 : daysToSunday });
    confidence = "medium";
  } else if (rest === "end of week" || rest === "end of the week" || rest === "later this week") {
    const friday = 5; // Luxon weekday: Friday = 5
    let diff = friday - anchor.weekday;
    if (diff < 0) diff += 7;
    target = anchor.plus({ days: diff });
    assumptions.push(`"${raw}" resolved to Friday of the current week (business-week convention).`);
    confidence = "medium";
  } else if (rest === "next week") {
    // Coarse: Monday of the following week. No day-of-week specified in
    // the phrase itself, so this is deliberately lower-confidence.
    const daysToNextMonday = ((8 - anchor.weekday) % 7) || 7;
    target = anchor.plus({ days: daysToNextMonday });
    assumptions.push('"Next week" has no specific day — resolved to Monday of next week as a coarse anchor.');
    confidence = "medium";
  } else if (rest === "end of month" || rest === "end of the month") {
    target = anchor.endOf("month").startOf("day");
  } else if (
    rest === "beginning of next month" ||
    rest === "start of next month"
  ) {
    target = anchor.plus({ months: 1 }).startOf("month");
  } else if (rest === "beginning of month" || rest === "start of month") {
    target = anchor.startOf("month");
  } else {
    // "this <weekday>" / "next <weekday>" / "before <weekday>" / bare "<weekday>"
    const thisMatch = rest.match(/^this\s+(\w+)$/);
    const nextMatch = rest.match(/^next\s+(\w+)$/);
    const beforeMatch = rest.match(/^before\s+(\w+)$/);
    const bareMatch = rest.match(/^(\w+)$/);

    const resolveWeekday = (
      name: string,
      mode: "this" | "next" | "before" | "bare"
    ): DateTime | null => {
      const idx = weekdayIndex(name);
      if (idx === null) return null;
      // Luxon weekday: Monday=1 .. Sunday=7. Our WEEKDAYS array is Sun-first (0=Sun).
      const luxonTarget = idx === 0 ? 7 : idx;
      let diff = luxonTarget - anchor.weekday;

      if (mode === "this") {
        if (diff < 0) diff += 7; // past this week -> treat as unresolved-ish, but push to next occurrence
      } else if (mode === "next") {
        if (diff <= 0) diff += 7;
        diff += 7; // skip this week's occurrence entirely, per documented convention
        assumptions.push(
          `"Next ${name}" resolved to the ${name} of the FOLLOWING calendar week, not the nearest upcoming one — this phrase is genuinely ambiguous in English; treat with extra caution / prefer confirming with the user.`
        );
        confidence = "medium";
      } else if (mode === "bare") {
        if (diff < 0) diff += 7;
      } else if (mode === "before") {
        if (diff <= 0) diff += 7;
        return anchor.plus({ days: diff - 1 }); // the day before that weekday
      }
      return anchor.plus({ days: diff });
    };

    if (thisMatch) target = resolveWeekday(thisMatch[1], "this");
    else if (nextMatch) target = resolveWeekday(nextMatch[1], "next");
    else if (beforeMatch) target = resolveWeekday(beforeMatch[1], "before");
    else if (bareMatch) target = resolveWeekday(bareMatch[1], "bare");
  }

  if (!target) {
    const fallbackReason = isAfterBeforeFallback(phraseLower);
    if (fallbackReason) {
      return { kind: "needs_context", raw, reason: fallbackReason };
    }
    return { kind: "unrecognized", raw };
  }

  const timeOfDay = modifier.timeOfDay ?? defaults.defaultTimeOfDay;
  if (!timeWasExplicit) {
    assumptions.push(
      `No explicit time in the phrase — defaulted to ${timeOfDay} local.`
    );
  }
  target = applyTime(target, timeOfDay, `Applied ${modifier.label ?? "default"} time ${timeOfDay}.`);

  return {
    kind: "resolved",
    raw,
    resolvedUtc: target.toUTC().toISO()!,
    resolvedLocal: target.toISO()!,
    timezone: input.timezone,
    timeWasExplicit,
    confidence,
    assumptions,
  };
}
