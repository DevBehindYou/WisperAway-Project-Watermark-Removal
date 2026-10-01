import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Phase 1 schema — spec §98: "Postgres schema, tenancy, people, identity,
 * source events, evidence, candidates, commitments, tasks, review queue,
 * accountability ledger, manual capture, basic dashboard."
 *
 * Per ADR 0004 (docs/adr/0004-tenancy-scope.md): every table still carries
 * tenant_id, but Row-Level Security is NOT implemented yet — this is the
 * "reserved but unenforced" middle ground the ADR proposed, not the full
 * day-one multi-tenancy spec §11 originally asked for. If that ADR is
 * rejected in favor of the original instruction, RLS policies need adding
 * before this goes anywhere near a second user.
 *
 * Entities out of scope for Phase 1 (per spec §98) and deliberately not
 * modeled here yet: Device, Goal, CalendarEvent, PlanningBlock, Meeting,
 * Transcript, EmailThread, FollowUp, Nudge, Notification, Integration,
 * LearnedFact, AutomationRule, AuditLog, RetentionPolicy. Those arrive in
 * Phase 2+.
 */

// ---- enums, matching the states defined in spec §15/§16/§18 exactly ----

export const candidateStateEnum = pgEnum("candidate_state", [
  "PENDING",
  "AUTO_ACCEPTED",
  "ACCEPTED",
  "REJECTED",
  "MERGED",
  "NEEDS_DATE_REVIEW",
  "NEEDS_IDENTITY_REVIEW",
]);

export const commitmentStatusEnum = pgEnum("commitment_status", [
  "OPEN",
  "IN_PROGRESS",
  "WAITING",
  "BLOCKED",
  "DONE",
  "DROPPED",
  "CANCELLED",
]);

export const initiatorSideEnum = pgEnum("initiator_side", [
  "US",
  "CLIENT",
  "SYSTEM",
  "UNKNOWN",
]);

// ---- tenancy & identity ----

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  email: text("email").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const persons = pgTable("persons", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Spec §12 — a person may appear as an email, a phone number, a Meet
// display name, a WhatsApp contact, etc. These all resolve to one Person.
export const personIdentities = pgTable("person_identities", {
  id: uuid("id").defaultRandom().primaryKey(),
  personId: uuid("person_id").notNull().references(() => persons.id),
  channel: text("channel").notNull(), // 'email' | 'phone' | 'meet' | 'whatsapp' | 'transcript_speaker'
  identifier: text("identifier").notNull(),
  confidence: real("confidence").notNull().default(1.0),
  verificationState: text("verification_state").notNull().default("provisional"), // 'provisional' | 'verified'
});

export const clientAccounts = pgTable("client_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  clientAccountId: uuid("client_account_id").references(() => clientAccounts.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- source events & evidence (spec §13, §14) ----

export const sourceEvents = pgTable("source_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  kind: text("kind").notNull(), // EMAIL | MEETING_TRANSCRIPT | AUDIO_TRANSCRIPT | WHATSAPP_IMPORT | SHARED_TEXT | MANUAL_NOTE | CALENDAR_EVENT | WEB_CAPTURE
  externalId: text("external_id"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  participants: jsonb("participants").$type<string[]>().default([]),
  body: text("body").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  retentionUntil: timestamp("retention_until", { withTimezone: true }),
  sourceAdapter: text("source_adapter").notNull(), // spec §106: never a fake adapter name
  checksum: text("checksum").notNull(),
});

// ---- candidates (spec §15) ----

export const commitmentCandidates = pgTable("commitment_candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  title: text("title").notNull(),
  description: text("description"),
  ownerHint: text("owner_hint"),
  promisedToHint: text("promised_to_hint"),
  clientHint: text("client_hint"),
  projectHint: text("project_hint"),
  rawDatePhrase: text("raw_date_phrase"),
  modelResolvedDueAt: timestamp("model_resolved_due_at", { withTimezone: true }),
  deterministicResolvedDueAt: timestamp("deterministic_resolved_due_at", { withTimezone: true }),
  estimatedDurationMinutes: integer("estimated_duration_minutes"),
  confidence: real("confidence").notNull(),
  modelProvider: text("model_provider"),
  modelName: text("model_name"),
  state: candidateStateEnum("state").notNull().default("PENDING"),
  possibleDuplicateOf: uuid("possible_duplicate_of"),
  originEventId: uuid("origin_event_id").notNull().references(() => sourceEvents.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- commitments & tasks (spec §16, §17) ----

export const commitments = pgTable("commitments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  title: text("title").notNull(),
  detail: text("detail"),
  ownerId: uuid("owner_id").references(() => persons.id),
  promisedToId: uuid("promised_to_id").references(() => persons.id),
  clientAccountId: uuid("client_account_id").references(() => clientAccounts.id),
  projectId: uuid("project_id").references(() => projects.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  promisedAt: timestamp("promised_at", { withTimezone: true }).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  priority: integer("priority").default(0),
  status: commitmentStatusEnum("status").notNull().default("OPEN"),
  riskLevel: text("risk_level").default("normal"),
  originEventId: uuid("origin_event_id").references(() => sourceEvents.id),
  confidence: real("confidence"),
  planningMode: text("planning_mode").default("advisory"), // spec §6: advisory | approval | flexible
  lastStatusSentAt: timestamp("last_status_sent_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  commitmentId: uuid("commitment_id").references(() => commitments.id),
  goalId: uuid("goal_id"), // Goal table not modeled until Phase 6 (§33) — FK deliberately not enforced yet
  title: text("title").notNull(),
  description: text("description"),
  ownerId: uuid("owner_id").references(() => persons.id),
  status: text("status").notNull().default("OPEN"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  doAfter: timestamp("do_after", { withTimezone: true }),
  estimateMinutes: integer("estimate_minutes"),
  priority: integer("priority").default(0),
  planningMode: text("planning_mode").default("advisory"),
  projectId: uuid("project_id").references(() => projects.id),
  clientId: uuid("client_id").references(() => clientAccounts.id),
});

// Spec §18: WAITING (external) is a distinct state from BLOCKED (internal).
export const waitingItems = pgTable("waiting_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  commitmentId: uuid("commitment_id").notNull().references(() => commitments.id),
  waitingOn: text("waiting_on").notNull(),
  waitingSince: timestamp("waiting_since", { withTimezone: true }).defaultNow().notNull(),
  waitingReason: text("waiting_reason"),
  followUpIntervalHours: integer("follow_up_interval_hours").default(48),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
});

// ---- evidence (spec §14) — links evidence to a commitment AND/OR a
// still-pending candidate, since evidence starts accumulating before a
// candidate is ever accepted.

export const sourceEvidence = pgTable("source_evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  commitmentId: uuid("commitment_id").references(() => commitments.id),
  candidateId: uuid("candidate_id").references(() => commitmentCandidates.id),
  sourceEventId: uuid("source_event_id").notNull().references(() => sourceEvents.id),
  startOffset: integer("start_offset"),
  endOffset: integer("end_offset"),
  evidenceText: text("evidence_text").notNull(),
  speaker: text("speaker"),
  timestamp: timestamp("timestamp", { withTimezone: true }),
  confidence: real("confidence"),
});

// ---- accountability ledger (spec §19) — append-only, never updated ----

export const commitmentChanges = pgTable("commitment_changes", {
  id: uuid("id").defaultRandom().primaryKey(),
  commitmentId: uuid("commitment_id").notNull().references(() => commitments.id),
  fieldName: text("field_name").notNull(), // 'due_at' | 'scope' | 'owner' | 'status' | 'deliverable'
  oldValue: text("old_value"),
  newValue: text("new_value"),
  initiatedBy: text("initiated_by"),
  initiatorSide: initiatorSideEnum("initiator_side").notNull().default("UNKNOWN"),
  sourceEventId: uuid("source_event_id").references(() => sourceEvents.id),
  evidence: text("evidence"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
