# Keystone — UI/UX Design System
### Personal Chief of Staff / Commitment Intelligence System

*A handoff document for the design team. Built on Material 3 (Expressive), with a distinct visual and motion identity layered on top. Where this document makes a creative call, it says so explicitly — treat those as a strong starting point, not a locked decision.*

---

## 1. Design philosophy

**The name: Keystone.** A commitment is the piece that holds a working relationship together — the thing everything else rests on. Miss it, misplace it, or forget where it came from, and the structure above it is at risk. That idea — something is either soundly set in place or it isn't yet — is the design's organizing metaphor. It shows up structurally (shape language, status color) rather than decoratively (no literal stone textures, no skeuomorphism).

**What the product is not, visually:** not a task-manager SaaS dashboard, not a chat-first AI product, not a surveillance/analytics tool. It should feel closer to a well-run private office than a startup dashboard — calm, a little formal where it matters (evidence, dates, money), warm and quick everywhere else.

**Three principles:**
1. **Evidence is never decoration.** A source quote, a timestamp, a confidence score — these are load-bearing content, always visible or one tap away, never buried in a tooltip.
2. **Certainty has a visual language.** Something newly extracted and unreviewed should *look* provisional. Something confirmed should look settled. This is carried by shape and color, not just by a badge.
3. **One bold moment, not twelve small ones.** The product's single signature interaction is evidence unfurling from a commitment (Section 3.3). Everywhere else, motion is quiet and answers a direct action — nothing animates just to be noticed.

---

## 2. Foundations

### 2.1 Color

Material 3's color system generates full tonal palettes from seed colors via HCT (Hue-Chroma-Tone). Give the design team these five seeds and let the M3 Theme Builder (or the Compose/Web `dynamicColorScheme` generators) derive the full 13-stop ramps and light/dark pairs — don't hand-author 60+ individual hex values.

| Role | Seed | Hex | Why |
|---|---|---|---|
| Primary | Quarry Teal | `#2E5E60` | Deep, mineral, calm — the "settled" color. Used for confirmed commitments, primary actions, active nav. |
| Secondary | Mortar | `#7A7267` | Warm stone-grey. Structural, recessive — filter chips, secondary buttons, dividers. |
| Tertiary | Ember | `#C08A2E` | Warm amber-gold. Used for anything awaiting a person — waiting states, confidence highlights, evidence markers. |
| Error / Risk | Rust | `#A6472F` | Muted red-orange rather than a stock alarm red — matches the calm palette while staying unambiguous. |
| Neutral | Warm Grey | seed `#6E6A66` | Surfaces lean warm, never stark cold grey — this is most of what the eye actually sees. |

**Extended semantic roles**, mapped directly to the commitment state model (spec §16, §18) rather than invented separately — build these as M3 "extended colors" alongside the standard roles:

| Commitment state | Color role | Feel |
|---|---|---|
| `OPEN` | Neutral / Outline | Plain, not yet acted on |
| `IN_PROGRESS` | Primary (Quarry Teal) | Active, moving |
| `WAITING` | Tertiary (Ember) | Warm, attention without alarm |
| `BLOCKED` | New extended role — **Slate Violet** `#6B5B73` | Deliberately *not* red — internal friction reads differently from external risk |
| `AT_RISK` | Error (Rust) | The one place red-family color appears |
| `DONE` | New extended role — **Moss** `#4F7A5B` | Resolved, settled |
| `DROPPED` / `CANCELLED` | Low-emphasis neutral, strikethrough text | Deliberately colorless — it shouldn't compete for attention |

Use M3's tone-based surface roles (`surface`, `surfaceDim`, `surfaceBright`, `surfaceContainerLowest` → `surfaceContainerHighest`) for elevation rather than `background`/`surfaceVariant`, which M3 has deprecated in favor of this set. Depth comes from tonal elevation (a translucent primary-tinted overlay) plus a light shadow as a secondary cue — not from heavy drop shadows or blur.

### 2.2 Typography

Two families, clearly distinct roles — not the default Roboto-everywhere, and not three fonts competing for attention.

| Role | Typeface | Notes |
|---|---|---|
| Display / Headline | **Fraunces** (variable, soft optical size) | A serif with real character but a calm, rounded warmth rather than high-contrast drama — carries the "carved, settled" feeling at low weights. Used sparingly: page titles, the one hero number on the dashboard, empty-state headlines. |
| Title / Body / Label | **IBM Plex Sans** | Workhorse text. Slightly more structural/technical character than a default humanist sans, stays legible down to Label-Small, pairs cleanly against Fraunces. Used for everything else, including evidence text and timestamps — no third monospace face for "data," which reads as decoration rather than function. |

M3 type scale (Display / Headline / Title / Body / Label × Large / Medium / Small — 15 styles total). Reference values, adjust in the type tool of choice:

| Style | Family | Size / Line height |
|---|---|---|
| Display Large | Fraunces | 57/64 |
| Display Medium | Fraunces | 45/52 |
| Display Small | Fraunces | 36/44 |
| Headline Large–Small | Fraunces | 32/40 → 24/32 |
| Title Large–Small | IBM Plex Sans Medium | 22/28 → 14/20 |
| Body Large–Small | IBM Plex Sans | 16/24 → 12/16 |
| Label Large–Small | IBM Plex Sans Medium | 14/20 → 11/16 |

Line length target: under 80 characters for body copy, everywhere — evidence quotes and email drafts included.

### 2.3 Shape

Material 3 Expressive's shape system (five roundedness levels, extra-small → extra-large, plus shape morphing) is used *meaningfully* here, not decoratively:

- **Extra-small / sharp corners** → confirmed, settled states: an accepted Commitment card, a resolved ledger entry. The shape itself reads as "set."
- **Medium rounding** → default UI chrome: nav, buttons, standard cards, inputs.
- **Large / extra-large rounding, or a soft morph on appearance** → provisional states: an unreviewed AI candidate in the Review Queue, a draft message. The shape itself reads as "not yet settled" — and when the user accepts it, the card's corners tighten (a shape morph, not just a color change) as it moves to Commitment status.

This single rule — rounding loosens for uncertainty, tightens for confirmation — is the shape system. Don't introduce a second, unrelated shape convention elsewhere.

### 2.4 Elevation & surfaces

Six tonal elevation levels (0, 1, 3, 6, 8, 12dp per current M3 guidance). Use tonal elevation (primary-tinted overlay) as the primary depth cue; treat drop shadow as a secondary hint, not the main signal — no heavy card shadows, no glassmorphism/blur.

Surface hierarchy, low → high: `surfaceContainerLowest` (page background) → `surfaceContainerLow` (grouped sections) → `surfaceContainer` (cards) → `surfaceContainerHigh` (sheets, popovers) → `surfaceContainerHighest` (dialogs, the Evidence Panel when expanded).

### 2.5 Spacing & layout

8dp base grid (current M3 Expressive spacing system), which also drives the adaptive layout scaffold across breakpoints:

| Breakpoint | Target | Layout |
|---|---|---|
| Compact (< 600dp) | Android phone | Single column, bottom nav bar, FAB for quick capture |
| Medium (600–839dp) | Tablet / small desktop window | Two-pane: list + detail side by side (e.g., Review Queue list + selected candidate) |
| Expanded (≥ 840dp) | Desktop, PWA | Nav rail + list + detail, three-pane where it earns its place (Dashboard) |

Content max-width on Expanded layouts: cap detail panels around 720px so evidence text doesn't stretch into unreadable line lengths.

### 2.6 Iconography

One icon set, one stroke weight, throughout (Material Symbols, Rounded style, to match the shape language above). Two custom marks worth commissioning rather than pulling from the library:

- **Evidence mark** — a small quote/bracket glyph used consistently anywhere sourced text appears (SourceEvidence, spec §14), so "this text came from somewhere real" is recognizable at a glance without reading a label.
- **Confidence mark** — a simple partial-ring indicator (not a percentage badge, not a traffic-light dot) reused everywhere an AI confidence score appears, so it reads as one consistent system rather than a different treatment per screen.

---

## 3. Motion & animation

### 3.1 Principles

Material 3 Expressive replaced fixed-curve easing with spring-based motion (defined by stiffness, damping, mass) as a first-class token, and made motion part of each component's identity rather than a generic transition layer. Use that system, but with restraint: one signature moment, quiet functional motion everywhere else, nothing that animates without the user having just done something.

### 3.2 Motion tokens

| Token | Use | Spec |
|---|---|---|
| `motion.spring.settle` | Card confirms, status changes, shape morph on accept | Spring, moderate stiffness, low overshoot — a small settle, not a bounce |
| `motion.spring.emphasized` | The Evidence Reveal (3.3), dialogs opening | Spring with slight overshoot — the one place motion is allowed to be felt |
| `motion.duration.short` | Micro-feedback (button press, chip toggle) | 50–150ms, context-aware |
| `motion.duration.medium` | Panel expand/collapse, page transitions | 200–400ms, context-aware |
| `motion.reduced` | Any of the above, when the OS reduced-motion setting is on | Cross-fade only, no movement, no spring |

### 3.3 Signature moment: Evidence Reveal

The one deliberately memorable interaction. Tapping a Commitment card doesn't navigate to a new screen — the card itself expands in place, its corners tightening slightly (shape settle) as the Evidence Panel unfurls beneath it: source icon, quoted text, speaker, timestamp, confidence ring, all arriving together with a single emphasized spring rather than staggered fade-ins. It should feel like the promise physically has a paper trail attached to it, and that trail is now visible. This moment is used consistently everywhere evidence appears — Dashboard, Review Queue, Client View, Search results — so it becomes a recognizable signature rather than a one-off effect.

### 3.4 Everywhere else

- List reordering (Review Queue after an action, Dashboard after a status change): items animate to their new position, they don't just pop.
- Nudges and notifications arrive with a short settle, not a slide-and-bounce.
- Calendar drag-to-reschedule (AI-managed blocks only, per spec §6): follows the pointer directly, no easing lag, then settles on release.
- No hover-triggered motion on cards or list rows beyond a subtle elevation/tone shift — this is a keyboard- and touch-first product as much as a mouse one.

---

## 4. Core component library

| Component | Purpose | Key states / notes |
|---|---|---|
| **Commitment Card** | The primary content unit everywhere | Shape + color driven by status (2.1, 2.3). Shows: title, counterpart, due date, status chip, confidence mark. Tap → Evidence Reveal. |
| **Evidence Panel** | Unfurls from a Commitment Card | Source icon, exact quoted text, speaker, date/time, confidence ring, "view full conversation" link. Never summarized or paraphrased — always the original text. |
| **Confidence mark** | Shows AI certainty | Partial-ring, three visual bands (high / medium / low) mapped to the review-policy thresholds (spec §29) — not a raw percentage as the primary read, though the number is available on tap. |
| **Status chip** | Commitment/task state at a glance | Uses the extended color roles from 2.1. Rounded per 2.3's rule for the underlying state. |
| **Capacity meter** | Promise-time capacity check (spec §21) | A simple filled bar, current commitment load vs. available hours for the relevant window — appears inline wherever a new deadline is being set, not buried in a separate screen. |
| **Review Queue row** | One extraction candidate | Loose shape (2.3), tabbed by confidence/conflict type (spec §28). Swipe or button actions: Accept / Edit / Reject / Merge. |
| **Nudge card** | A deterministic reminder (spec §49) | Compact, dismissible, always names *why* it fired (due soon, overdue, silent promise, etc.) — never a bare "reminder." |
| **Client timeline entry** | One ledger event (spec §19, §66) | Fixed chronological row: what changed, who initiated it (US / CLIENT / SYSTEM), evidence link. Immutable — no edit affordance, ever. |
| **Calendar block** | Distinguishes *Do* date from *Due* date (spec §46) | Commitment deadlines render as a thin marker on their due date; planning blocks render as filled blocks on their working slot. Never visually conflated. |
| **Waiting-item pill** | "Responsibility sits elsewhere" (spec §18) | Ember-colored, shows who it's waiting on and since when, with a one-tap "follow up" action that opens a draft, never sends directly. |
| **Navigation** | Bottom bar (compact) / rail (medium) / rail + labels (expanded) | Five primary destinations max: Dashboard, Review, Calendar, Clients, Search. Everything else lives inside those. |
| **FAB / FAB menu** | Quick capture (spec §87) | Single FAB by default; expands to a FAB menu (M3 Expressive component) only when more than one capture type is offered (text / voice / share). |
| **Buttons, inputs, chips** | Standard M3 components | Use M3 Expressive's updated button groups and split buttons where an action has a clear primary + secondary variant (e.g., "Accept" + a small overflow for Edit/Reject) rather than three equal-weight buttons in a row. |

---

## 5. Pages

Each entry: purpose, key components, and what's non-obvious about the states.

### 5.1 Onboarding & setup
Linear, short — the 16-step first-run flow in the spec (§63) collapses into roughly five *screens*, not sixteen: connect accounts → choose scopes/calendars → set work hours & personal-goal categories → pair a device (QR, §64) → review the first batch of extracted candidates. End on the Dashboard already populated, not empty.

### 5.2 Dashboard (Home)
The answer to "what should I care about right now" (spec §65). Expanded layout: three loose zones, not a rigid grid — **Now** (top, largest, 1–3 items max) → **At Risk / Waiting on me** (left) → **Waiting on others / Follow-ups** (right). Calendar and Upcoming collapse into a slim rail on Expanded, a separate tab on Compact. Personal Goals get a visually distinct, consistently-present strip — never crowded out by work items, per spec §56's point that ignoring personal time breaks the capacity model.

```
┌─────────────────────────────────────────────┐
│  NOW                                         │
│  ┌───────────────┐                           │
│  │ one commitment │  ← largest single card    │
│  └───────────────┘                           │
├───────────────────────┬───────────────────────┤
│ AT RISK / WAITING ON  │ WAITING ON OTHERS      │
│  · card               │  · pill  · pill        │
│  · card                │                       │
├───────────────────────┴───────────────────────┤
│  PERSONAL GOALS  (always visible, own lane)    │
└─────────────────────────────────────────────┘
```

### 5.3 Review Queue
Tabbed (High Confidence / Needs Review / Date Conflict / Unknown Person / Possible Duplicate / Rejected — spec §28). List on the left (or full-width on Compact), selected candidate detail on the right, using loose-shape Review Queue rows throughout since nothing here is confirmed yet. Bulk-accept only enabled inside the High Confidence tab.

### 5.4 Commitment Detail
The Evidence Reveal, expanded to a full view: all accumulated evidence (spec §14, potentially from several sources) in chronological order, the accountability ledger for that commitment (§19) below it, task breakdown if any exist. This is the one screen where the Evidence Panel is permanently open rather than tap-to-reveal.

### 5.5 Calendar
Today / 3-Day / Week / Month / Agenda / Timeline views (§45). Do-date vs. due-date distinction (4.46, component table above) is the single most important visual rule on this screen — get it wrong and the whole "AI didn't silently move my deadline" trust story breaks.

### 5.6 Client view
Client header, then the immutable timeline (5.19 component) as the dominant element — this is the screen most likely to get opened during an actual dispute, so it should read clearly at a glance, printable/exportable without redesign.

### 5.7 Capacity / workload
A single week-at-a-glance capacity meter per pool (spec §20) rather than a dense Gantt-style view — this is meant to answer "am I overcommitted," not to be a resourcing tool for managing other people.

### 5.8 Global search
Search-first, results-second, always showing the SourceEvent citation inline with any answer (spec §67) — never a bare AI-generated summary with no evidence attached.

### 5.9 What my assistant knows
A flat, browsable list of Learned Facts (spec §33–34), each with Confirm / Edit / Reject / Forget inline — deliberately un-mysterious, more like a settings list than an "AI insights" page.

### 5.10 Briefs & digests
One reusable sheet/card pattern, not four separate screens — Morning Brief, Pre-meeting Brief, Post-meeting Review, End-of-Day, Weekly Review (§51–55) all use the same component with different content, surfaced contextually (a sheet before a meeting, a card each morning) rather than as destinations someone has to remember to visit.

### 5.11 Personal goals
Visually distinct from work — a different (but still calm, not garish) accent, kept private by default per spec §56's stricter privacy defaults for this category.

### 5.12 Settings & integration health
Integration status list (spec §80) states plainly, per adapter: Healthy / Needs re-auth / Offline / Error, with last-sync time — this is where the OAuth re-consent flow (a known, expected weekly event for this deployment) should read as routine, not alarming.

---

## 6. Accessibility & responsiveness

- Every color pairing above meets WCAG AA contrast at minimum, checked against both light and dark tonal schemes, not just light.
- All motion in Section 3 respects `prefers-reduced-motion` — falls back to `motion.reduced` (cross-fade only).
- Keyboard focus is visible everywhere, not just on interactive elements that happen to be buttons — Review Queue rows, Commitment cards, and Calendar blocks all need a real focus ring.
- Nothing depends on color alone: status chips carry a label, not just a tint; the confidence mark's bands are also distinguishable by fill pattern, not hue alone.
- Screen-reader labels for the Confidence mark and Evidence mark read their meaning ("72 percent confidence," "sourced from a Google Meet transcript"), not their visual description.

---

## 7. Open questions for the design team

These are calls the design team should make or confirm, not things this document decided unilaterally:

1. **Dark theme parity** — this doc assumes the tonal system handles light/dark automatically; confirm the extended semantic roles (Slate Violet, Moss, Rust) hold up in dark mode without desaturating past legibility.
2. **Data density on the desktop/PWA Dashboard** — the three-zone layout in 5.2 is deliberately loose; if real usage shows people want to see more at once, that's a legitimate reason to tighten it, but resist defaulting to a dense grid as the first move.
3. **Icon commissioning** — the Evidence and Confidence marks (2.6) are described conceptually here; they need an actual designer's hand, not a stock Material Symbol standing in indefinitely.
4. **Client-view exportability** — whether the timeline (5.6) needs a literal PDF/print stylesheet or just needs to read cleanly as-is depends on how it's actually used in a real dispute; worth a real answer before Phase 3 build-out rather than assuming.
