> Committed as-is, unedited, per Phase 0 kickoff brief deliverable #1. This is the ground-truth product spec — see `PHASE0_KICKOFF_BRIEF_PLAIN.md` for the execution plan built on top of it, and `docs/STATE.md` for current status.

---

# MASTER DEVELOPMENT PROMPT

## Personal Chief of Staff / Commitment Intelligence System

You are acting as a:

* Principal Software Architect
* Senior Backend Engineer
* Senior Android Engineer
* Desktop Application Engineer
* AI/ML Engineer
* Security Engineer
* DevOps Engineer
* Product Designer
* Automation Engineer
* QA Architect
* Privacy Engineer

Your job is to research, architect, implement, test, optimize and document a production-grade **Personal Chief of Staff and Commitment Intelligence System**.

This is NOT simply another task manager.

Do not immediately start generating UI screens or random application code.

First understand the product, validate technical assumptions against current official documentation, create the architecture, identify risks, and then implement the system incrementally.

Current research must be performed against up-to-date documentation before selecting frameworks, APIs, models or dependencies.

Prefer:

1. Official documentation
2. Official repositories
3. Maintainer documentation
4. Mature open-source projects

over blogs, tutorials and unverified examples.

---

# 1. PRODUCT VISION

I want an intelligent system that understands almost everything relevant to my work commitments.

Today my responsibilities are scattered across:

* Gmail
* Google Meet
* WhatsApp
* calls
* meetings
* conversations with employees/team members
* conversations with clients
* personal conversations
* calendar events
* verbal promises
* personal goals
* follow-ups
* approvals
* feedback requests
* documents
* tasks stored elsewhere
* things I simply remember in my head

The central problem is NOT that I lack a to-do application.

The problem is that commitments are created everywhere and captured inconsistently.

The system must therefore automatically answer:

**Who promised what to whom, by when, based on which conversation, and what needs to happen next?**

The application should act like a highly reliable **personal Chief of Staff**.

It should:

* capture commitments;
* understand context;
* organize tasks;
* track promises;
* watch deadlines;
* follow up;
* detect things I am waiting for;
* warn about workload collisions;
* draft updates;
* maintain accountability history;
* generate a personalized calendar;
* remind me across devices;
* learn how I work;
* and help me decide what should happen next.

---

# 2. CORE PRODUCT PRINCIPLE

The fundamental object is not a generic task.

It is a:

# COMMITMENT

A Commitment answers:

* What was promised?
* Who promised it?
* Who is responsible?
* Who expects it?
* Which client/project does it belong to?
* When was the promise made?
* Where was it made?
* What was the exact original wording?
* What is the promised deadline?
* Has the deadline changed?
* Who changed it?
* Why did it change?
* What execution tasks are required?
* Is it blocked internally?
* Is it waiting on somebody externally?
* Does it fit available capacity?
* When should a reminder happen?
* When should a follow-up happen?
* Is the commitment at risk?
* Has a status update been sent?
* How confident is AI about its interpretation?

Tasks exist underneath or alongside commitments.

Example:

Commitment:

"Deliver revised website to ABC Corp by Friday."

Execution tasks:

* finish responsive layout
* integrate API
* test mobile
* deploy staging
* client review
* production deployment

The promise is the commitment.

The work required to fulfil it consists of tasks.

Do not collapse these concepts unnecessarily.

---

# 3. FAILURE MODES THIS PRODUCT MUST FIX

The current workflow causes several failures simultaneously:

1. A deadline is verbally promised and forgotten.

2. Tasks exist across email, WhatsApp, calls and memory instead of one system.

3. There is no unified picture of obligations across all clients.

4. Team members repeatedly ask:

   "Where is X?"

5. Client approvals are forgotten.

6. Client feedback is delayed but nobody follows up.

7. Clients move their own deadlines but later responsibility for delays becomes unclear.

8. There is no reliable evidence showing who moved which date.

9. Deadlines are promised without considering actual workload.

10. Team availability is ignored.

11. Personal obligations are ignored.

12. AI/tool limits may be ignored even when they are required to complete the work.

13. People remember the deliverable but forget the follow-up.

14. Meetings generate action points which disappear afterwards.

15. Email replies contain commitments which never become tasks.

16. Verbal conversations never reach any project-management system.

The application must specifically solve these problems.

---

# 4. HARD PRODUCT PRINCIPLES

These principles are architectural requirements.

## 4.1 Provenance first

Every extracted commitment must retain its source.

Never show:

"Send prototype Friday"

without being able to show:

Source:
Google Meet

Meeting:
Weekly Client Review

Date:
September 12

Speaker:
Me

Evidence:

"I'll send the prototype before Friday afternoon."

Timestamp:
00:34:27

AI confidence:
96%

Users must be able to open the task or commitment and immediately inspect its origin.

---

# 4.2 Never silently invent deadlines

Relative dates must never enter the trusted database without being converted to absolute dates.

Store BOTH:

raw expression:

"next Friday"

and:

resolved timestamp.

The AI must resolve the date.

A deterministic date-resolution engine must independently resolve it again.

If they disagree:

DO NOT GUESS.

Send the candidate to Review.

Special attention is required for phrases like:

* tomorrow
* next Monday
* this weekend
* before the meeting
* later this week
* next week
* EOD
* COB
* first thing Monday
* end of month
* beginning of next month
* after launch
* once they approve

Timezone must always be explicit.

---

# 4.3 Human-controlled external communication

The AI may:

* prepare
* summarize
* recommend
* draft

but must NEVER automatically send a client communication by default.

Client-facing output requires approval.

This includes:

* email
* WhatsApp
* Slack
* SMS
* external chat
* proposal updates
* deadline changes

Create automation permission levels later, but the default must be Draft.

---

# 4.4 Never hide uncertainty

Every AI-derived object has:

* confidence
* source
* model
* extraction timestamp
* evidence
* review state

If the system does not know something, it must say so.

---

# 4.5 Capture before automation

Do not build autonomous execution before extraction accuracy is proven.

The order is:

Capture

→ Normalize

→ Understand

→ Review

→ Trust

→ Nudge

→ Plan

→ Automate selected actions

not:

AI agent → everything.

---

# 5. WHAT THE PRODUCT IS NOT

Do not accidentally turn this into another enterprise project management suite.

Initially it is NOT:

* Jira
* Asana
* ClickUp
* Monday.com
* a Gantt tool
* a sprint management system
* an employee surveillance platform
* a timesheet
* a productivity scoring tool
* an automatic employee dispatcher
* an unrestricted autonomous agent

Do not introduce:

* story points
* sprint velocity
* employee ranking
* actual-hours surveillance
* automatic staff performance scoring

unless a future explicit requirement adds them.

---

# 6. SCHEDULING PHILOSOPHY

There is an important distinction between:

## Commitment management

and

## Work planning.

The system MUST perform commitment management.

The system MAY provide intelligent planning.

Do not silently reassign employee work or restructure entire project plans.

Implement scheduling in three permission modes.

### MODE 1 — Advisory

Default.

The application recommends:

"You have 5 hours of committed work due Thursday but only 3 hours available."

or:

"Move internal documentation to Friday?"

Nothing changes automatically.

---

### MODE 2 — Approval-based planning

The AI proposes calendar blocks.

Example:

Tuesday 10:00–12:00
ABC proposal

Tuesday 15:30–16:30
Testing

The user approves the proposed schedule.

---

### MODE 3 — Flexible auto-planning

Optional.

Only blocks explicitly marked:

`AI_MANAGED`

may automatically move.

Never move:

* client meetings
* personal appointments
* manually locked blocks
* flights
* medical appointments
* external events

without explicit approval.

---

# 7. HIGH-LEVEL SYSTEM ARCHITECTURE

Use a stable core surrounded by adapters.

Conceptually:

```
            INGEST ADAPTERS

                   ↓
```

Identity → Normalize → Source Events

```
                   ↓

          EXTRACTION CORE

                   ↓
```

Candidate → Review → Commitment/Task

```
                   ↓

  ┌────────────┬────────────┐
  ↓            ↓            ↓
```

NUDGES       CAPACITY      PLANNER

```
  ↓            ↓            ↓

         DELIVERY

             +

           SYNC
```

Adapters must not contain business logic.

The core must never depend directly on one vendor.

---

# 8. ADAPTER FAMILIES

Create at least these adapter categories.

## IngestAdapter

Reads information.

Examples:

* Gmail
* IMAP forwarding mailbox
* Google Meet transcript
* microphone transcript
* Android Share
* browser extension
* manual capture
* WhatsApp handoff
* experimental computer-use reader

---

## ModelAdapter

Processes information.

Examples:

* Ollama
* llama.cpp-compatible server
* LM Studio
* OpenAI-compatible endpoints
* OpenAI
* Anthropic
* Gemini
* Groq
* future providers

---

## DeliveryAdapter

Delivers reminders.

Examples:

* Web Push
* Android notification
* desktop notification
* email
* Telegram
* WhatsApp handoff
* WhatsApp Business
* future Slack/Teams

---

## SyncAdapter

Synchronizes with external task/project systems.

Examples:

* Notion
* Todoist
* GitHub
* Jira
* ClickUp
* future tools

---

# 9. SERVER AUTHORITY + LOCAL CAPABILITIES

Use a server-authoritative model for commitments and synchronization.

The central database is the durable source of truth.

However, clients must retain enough local state to:

* open quickly;
* work during temporary network loss;
* capture tasks offline;
* view cached schedule;
* acknowledge reminders;
* queue edits;
* queue recordings/transcripts awaiting synchronization.

Do NOT make the entire product dependent on local files existing on one laptop.

Likewise, do NOT make every UI interaction require a server round trip.

Use optimistic local updates.

Reconcile with the server asynchronously.

---

# 10. TARGET APPLICATIONS

The system consists of several cooperating components.

## A. Core Backend

Responsibilities:

* authentication
* tenant isolation
* database
* identity resolution
* ingestion
* extraction orchestration
* review queue
* commitment creation
* nudges
* follow-up logic
* capacity calculations
* calendar intelligence
* synchronization
* API
* audit logs

---

## B. Web/PWA Dashboard

Responsibilities:

* dashboard
* review queue
* calendar
* search
* commitment management
* account settings
* client views
* capacity view
* reports
* integration management

The PWA should be installable.

---

## C. Desktop Companion

The desktop companion handles things browsers should not be trusted to do continuously.

Responsibilities:

* system tray
* global quick capture
* microphone session
* local transcription
* local AI if configured
* Chrome extension bridge
* desktop notifications
* local health state
* optional computer-use isolation
* auto-start
* secure credential handling

Evaluate:

* Tauri
* Electron
* native Windows service + web UI

based on:

* installer quality
* auto-update
* microphone reliability
* local sidecars
* CPU/RAM
* security
* Windows integration

Do not choose based solely on developer convenience.

---

## D. Android Companion

A PWA alone is insufficient for the entire desired mobile experience.

Build a proper Android companion if Android is a supported primary platform.

Responsibilities:

* push notifications
* quick task capture
* share-to-app
* voice capture
* explicit microphone sessions
* notification actions
* widgets
* offline cache
* background sync
* foreground recording service
* biometric lock
* secure token storage

Research current Android restrictions before implementation.

Never silently start microphone recording from the background.

The user must explicitly initiate listening.

Display a persistent notification throughout microphone capture.

---

## E. Browser Extension

Manifest V3.

Responsibilities:

* quick page capture
* Google Meet assistant
* tab audio capture after explicit invocation
* bookmark important moments
* create tasks from selected text
* communicate securely with desktop/backend

The extension must visibly indicate when capture is active.

---

# 11. DATA MODEL

Use PostgreSQL.

Every multi-user table must carry a tenant/workspace reference.

Multi-tenancy should exist from day one even if the first deployment has one organization.

Core entities should include:

Tenant

User

Device

Person

PersonIdentity

Organization

ClientAccount

Project

Goal

SourceEvent

SourceEvidence

CommitmentCandidate

Commitment

Task

TaskDependency

WaitingItem

CommitmentChange

CapacityPool

CapacityException

CapacityDraw

CalendarEvent

PlanningBlock

Meeting

MeetingParticipant

Transcript

TranscriptSegment

EmailThread

EmailMessage

FollowUp

Nudge

Notification

Integration

IntegrationCursor

AdapterHealth

SyncLink

LearnedFact

AutomationRule

AIInference

AuditLog

RetentionPolicy

---

# 12. PERSON IDENTITY RESOLUTION

A single real person may appear as:

email:

raj@example.com

phone:

+91...

Google Meet:

Raj Kumar

WhatsApp:

Raj

transcript:

Speaker 2

These must eventually resolve to one Person.

PersonIdentity should contain:

* channel
* identifier
* confidence
* verification state

Identity resolution should happen BEFORE final commitment extraction where practical.

Known people and client names should be passed into extraction context.

This reduces hallucinated aliases.

Unknown identities should become provisional.

The Review UI must support:

Merge with person

Create person

Ignore

---

# 13. SOURCE EVENT MODEL

Every captured item enters the system first as an immutable SourceEvent.

Examples:

EMAIL

MEETING_TRANSCRIPT

AUDIO_TRANSCRIPT

WHATSAPP_IMPORT

SHARED_TEXT

MANUAL_NOTE

CALENDAR_EVENT

WEB_CAPTURE

SourceEvent contains:

id
tenant_id
kind
external_id
occurred_at
ingested_at
participants
body
metadata
retention_until
source_adapter
checksum

Never overwrite original source text.

Corrections are separate records.

---

# 14. EVIDENCE

Do not store only one origin pointer.

A commitment can accumulate evidence from multiple sources.

Example:

Monday Meet:
"I'll send this Friday."

Tuesday email:
"As discussed, Friday works."

Thursday WhatsApp:
"Still expecting this tomorrow."

All three should attach to one commitment.

Create a SourceEvidence table containing:

commitment_id
source_event_id
candidate_id
start_offset
end_offset
evidence_text
speaker
timestamp
confidence

---

# 15. COMMITMENT CANDIDATES

AI extraction does NOT immediately create trusted commitments.

It creates candidates.

Candidate fields include:

title
description
owner_hint
promised_to_hint
client_hint
project_hint
raw_date_phrase
model_resolved_due_at
deterministic_resolved_due_at
estimated_duration
evidence
confidence
model_provider
model_name
state
possible_duplicate_of

States:

PENDING

AUTO_ACCEPTED

ACCEPTED

REJECTED

MERGED

NEEDS_DATE_REVIEW

NEEDS_IDENTITY_REVIEW

---

# 16. COMMITMENT MODEL

Commitment fields should include:

id
tenant_id
title
detail
owner_id
promised_to_id
client_account_id
project_id
created_at
promised_at
due_at
priority
status
risk_level
origin_event_id
confidence
planning_mode
last_status_sent_at
completed_at

Statuses:

OPEN

IN_PROGRESS

WAITING

BLOCKED

DONE

DROPPED

CANCELLED

---

# 17. TASK MODEL

Tasks represent execution work needed to satisfy commitments or goals.

Task fields include:

commitment_id
goal_id
title
description
owner_id
status
due_at
do_after
estimate_minutes
priority
planning_mode
project_id
client_id

One commitment may have:

zero tasks
one task
many tasks.

---

# 18. WAITING IS DIFFERENT FROM BLOCKED

Treat these as fundamentally different states.

BLOCKED:

We cannot progress because something internally is preventing work.

Examples:

* build failure
* missing internal decision
* another internal task incomplete

WAITING:

Responsibility currently sits with somebody else.

Examples:

* waiting for client approval
* waiting for client assets
* waiting for feedback
* waiting for payment
* waiting for teammate response

Waiting state records:

waiting_on
waiting_since
waiting_reason
follow_up_interval
next_follow_up_at

This matters because:

Blocked work requires unblocking.

Waiting work requires chasing.

---

# 19. ACCOUNTABILITY LEDGER

Implement an append-only commitment change ledger.

Never update historical ledger rows.

Track important changes including:

* due date
* scope
* owner
* status
* promised deliverable

For every change store:

old_value
new_value
initiated_by
initiator_side
source_event
evidence
reason
timestamp

initiator_side:

US

CLIENT

SYSTEM

UNKNOWN

Example:

Original deadline:
September 15

Changed:
September 20

Requested by:
Client

Evidence:

"Can we push delivery to next Friday?"

Source:
WhatsApp conversation

This must become queryable.

Examples:

"Who moved the ABC deadline?"

"How many delays this month were client initiated?"

"Show every deadline modification for Client X."

"Generate client timeline."

The audit history must not be silently editable.

---

# 20. CAPACITY MODEL

The product should warn when a promise appears unrealistic.

Do NOT turn this into employee time tracking.

Use forward-looking capacity.

Possible capacity pools:

PERSON_HOURS

MODEL_CREDITS

TOOL_SEAT

SPECIALIST_AVAILABILITY

Example:

Akash:
30 usable hours/week

Designer:
24 usable hours/week

Claude credits:
cycle limit

Video render machine:
1 concurrent slot

A task may consume multiple pools.

Example:

Website implementation:

8 Akash hours
2 Designer hours
1 deployment window

Capacity exceptions include:

holiday
leave
existing commitments
personal obligations
client escalation
unavailable machine
credit exhaustion

---

# 21. PROMISE-TIME CAPACITY CHECK

This feature is critical.

Capacity must be checked when:

* a deadline is first created;
* a deadline changes;
* scope significantly changes.

Example:

Client:

"Can we have this Tuesday?"

The system determines:

Estimated work:
16 hours

Capacity before Tuesday:
9 hours

Display immediately:

"⚠ This commitment appears over capacity by approximately 7 hours."

Possible actions:

Accept anyway

Suggest Wednesday

Inspect conflicts

Reduce scope

Add capacity

The warning does NOT block the user.

If the user accepts the impossible deadline:

record that decision in the accountability history.

---

# 22. UNIVERSAL CAPTURE

Information should enter through many channels.

Support:

* Gmail
* Google Calendar
* Google Meet
* desktop microphone
* Android voice capture
* browser extension
* manual quick capture
* paste
* share menu
* URLs
* future Slack
* future Teams
* future Notion
* future GitHub
* future project-management adapters

Everything enters the same SourceEvent pipeline.

---

# 23. EXTRACTION PIPELINE

Pipeline:

SourceEvent

→ normalize

→ resolve identities

→ chunk

→ add context

→ model extraction

→ schema validation

→ deterministic date validation

→ duplicate detection

→ confidence calculation

→ review policy

→ CommitmentCandidate

→ human/automatic acceptance

→ Commitment/Task

---

# 24. CHUNKING

Do not send a 2-hour transcript blindly into one model request.

Chunk by:

* speaker turn
* paragraphs
* semantic boundary

Use overlap.

Chunk size must derive from model capability.

Chunking belongs in the CORE.

A model switch must not change ingestion behavior.

---

# 25. EXTRACTION OUTPUT

Models must return structured JSON conforming to a schema.

For each possible commitment extract:

title
deliverable
owner
promised_to
client
project
raw_due_phrase
resolved_due_at
estimated_duration_if_supported
evidence_exact
confidence
reason_for_extraction

Do not parse free-form model prose.

Validate output.

Retry malformed responses only to a configured maximum.

Then record failure.

Never silently invent missing fields.

---

# 26. EXTRACTION STRICTNESS

Precision is extremely important.

This:

"We should probably improve that someday."

is NOT a commitment.

This:

"Raj will send the logo tomorrow."

IS a commitment.

Prefer missing an ambiguous suggestion over flooding the system with fake tasks.

At minimum, a candidate should generally have:

* a clear deliverable
  AND
* an identifiable owner or responsible party

A date may be absent when a strong actionable commitment exists, but date-less candidates should be treated differently from dated promises.

---

# 27. DEDUPLICATION

The same commitment will often appear repeatedly.

Example:

Meet:
"Send proposal Friday."

Email:
"As agreed, proposal Friday."

WhatsApp:
"Looking forward to the proposal tomorrow."

Do not create three commitments.

Compare candidates against existing open commitments using:

client
people
deadline proximity
project
semantic title similarity
evidence

If likely duplicate:

attach additional evidence.

Never permanently hide the merge.

Allow:

Split

Merge

Review evidence

---

# 28. REVIEW QUEUE

Build a first-class review workflow.

Tabs:

High Confidence

Needs Review

Date Conflict

Unknown Person

Possible Duplicate

Rejected

The user should be able to:

Accept

Edit + Accept

Reject

Merge

Change owner

Change client

Change deadline

Resolve person

Accepted corrections become evaluation data.

Do not automatically use private user corrections to train external services.

---

# 29. CONFIDENCE POLICY

Thresholds should differ by input source.

Example sources:

clean email
Meet transcript
locally transcribed audio
WhatsApp import
noisy ambient recording

Do not invent one universal threshold.

Tune against the evaluation corpus.

Possible behavior:

very high confidence:
auto-create

medium:
review queue

low:
discard or retain only in searchable raw source

The threshold must be configurable.

---

# 30. EVALUATION HARNESS

Build this BEFORE trusting extraction.

Create:

/evals
/fixtures
/expected
/runner
/reports

Use genuine anonymized examples.

For every fixture define the correct answer manually.

Measure:

## Task/commitment precision

How many extracted commitments were actually commitments?

## Recall

How many real commitments were missed?

## Date accuracy

Of correctly found commitments, how many deadlines were correct?

## Owner accuracy

Was responsibility assigned correctly?

## Promised-to accuracy

Was the stakeholder correct?

## Client accuracy

Was the account correct?

## Schema failure rate

How often did the provider return unusable output?

## Duplicate rate

How often did the system create duplicate commitments?

Compare models numerically.

Do not select models because they "seem good."

---

# 31. MODEL ARCHITECTURE

Do not hardwire the product to one AI provider.

Create a ModelAdapter interface.

Capabilities should include:

contextTokens
structuredOutputSupport
jsonSchemaSupport
localOrRemote
costClass
requestsPerMinute
privacyClass

Support at minimum:

OpenAI-compatible adapter

Anthropic adapter

Gemini adapter if useful

The OpenAI-compatible adapter should be configurable for:

* Ollama
* LM Studio
* vLLM
* other compatible endpoints

Prefer local models for sensitive conversation extraction when quality is adequate.

---

# 32. MODEL ROUTING

Not every operation needs a premium model.

Example routing:

simple classification:
small/local model

commitment extraction:
best validated local model

complex ambiguous extraction:
stronger provider

email drafting:
configurable stronger model

semantic search:
local embeddings where practical

Schedule feasibility:
deterministic code

Do not use LLMs for arithmetic and constraint enforcement when deterministic logic is better.

---

# 33. LEARN ABOUT ME

Create an explicit Personal Intelligence layer.

The system may gradually learn:

* client names
* project names
* team members
* relationships
* preferred working hours
* typical meeting times
* recurring commitments
* preferred reminders
* typical follow-up delays
* important clients
* communication preferences
* recurring personal goals
* task duration patterns
* focus preferences
* common deadline language
* common aliases
* frequently delayed commitments

But learned information must never become hidden magic.

Create:

# What My Assistant Knows

Each learned fact displays:

Fact
Source
Confidence
Last confirmed
Scope

Actions:

Confirm

Edit

Reject

Forget

Do not infer sensitive personal attributes unless required and explicitly authorized.

---

# 34. LEARNED FACT MODEL

Example:

Fact:

"ABC Corp weekly meeting normally occurs Tuesday afternoon."

Type:
schedule_pattern

Confidence:
0.83

Evidence:
8 calendar events

Fact:

"Raj is the lead designer on Project Orion."

Type:
role_relationship

Confidence:
0.98

Evidence:
multiple conversations

All learned facts must have provenance.

---

# 35. MICROPHONE INTELLIGENCE

This system must never implement covert surveillance.

Provide explicit modes.

## OFF

No listening.

## QUICK CAPTURE

Tap:

"Remember that I need to send invoice Monday."

## MEETING MODE

Explicitly record/transcribe a meeting.

## FOCUS/AMBIENT SESSION

Explicitly start a longer listening session.

A visible indicator remains active for the entire session.

Provide one-tap STOP.

---

# 36. LOCAL AUDIO PIPELINE

Preferred architecture:

Microphone

→ VAD

→ temporary audio segments

→ local Whisper-compatible transcription

→ speaker segmentation/diarization if practical

→ transcript

→ extraction

→ candidate

Raw audio should remain local by default.

Research and benchmark:

whisper.cpp

faster-whisper where hardware allows

ONNX alternatives

appropriate VAD

speaker diarization options

Choose based on:

speed
RAM
CPU
GPU
accuracy
licence
Windows support
Android support

---

# 37. AUDIO RETENTION

Configurable options:

Delete raw audio immediately after transcription

1 hour

1 day

7 days

Keep manually

Transcript retention also configurable.

Support per-client exclusions.

Example:

Never record Client X.

Never analyze private meetings.

Pause for 30 minutes.

Disable microphone until tomorrow.

Implement actual deletion rather than just setting `hidden=true`.

---

# 38. ANDROID MICROPHONE

Research current Android foreground-service restrictions.

Requirements:

* explicit user initiation;
* RECORD_AUDIO permission;
* proper microphone foreground service type;
* persistent notification;
* visible Stop;
* no silent boot-time recording;
* handle battery optimisation gracefully;
* restore application state without secretly restarting capture.

If Android platform policies change, follow current official documentation rather than assumptions in this specification.

---

# 39. GOOGLE MEET

Implement two ingestion strategies.

## Strategy A — Google Meet API

Where authorized and artifacts exist, retrieve:

conference records
participants
participant sessions
recordings metadata
transcripts
transcript entries
smart notes

Preserve speaker and timing information.

---

## Strategy B — Browser companion

For meetings where API artifacts are unavailable:

Chrome extension

→ explicit Start Assistant

→ tab capture

→ desktop/local transcription

→ extraction

Controls:

Start

Pause

Stop

Create Task

Mark Important

Bookmark Moment

Chrome tab audio capture must only begin after the required user interaction.

Do not attempt hidden capture.

---

# 40. GMAIL

Use official integration first.

Research current OAuth policies and request minimum scopes.

Preferred strategy:

Gmail API

rather than screenshot/computer-use polling.

Functions:

* ingest selected email;
* understand threads;
* detect commitments;
* detect outstanding replies;
* detect approval requests;
* identify deadlines;
* draft follow-ups;
* link email to client/project;
* search supporting evidence.

Use Gmail history/watch where suitable.

Renew watches correctly.

Maintain synchronization cursors.

Reconcile periodically.

Never assume notifications are perfectly reliable.

---

# 41. IMPORTANT GMAIL AUTH RULE

Do not assume that Gmail IMAP magically avoids restricted Google permissions.

If Gmail IMAP is used through OAuth, research the scopes it requires.

If avoiding Gmail restricted scopes is a requirement, evaluate a genuinely independent forwarding mailbox architecture:

Gmail

→ user-created forwarding rule

→ dedicated non-Gmail mailbox

→ IMAP ingestion

This may reduce Google OAuth complexity but introduces other trade-offs.

Document them.

Never fake this distinction.

---

# 42. GOOGLE WORKSPACE AUTHENTICATION

Detect deployment scenario.

## Scenario A

Internal application entirely within one Google Workspace organization.

Research current Internal OAuth behavior and administrator controls.

## Scenario B

Personal/free Google accounts.

## Scenario C

External commercial application.

Document:

verification requirements
sensitive scopes
restricted scopes
security assessment implications
user caps
admin controls

Never hardcode the assumption that refresh credentials live forever.

Implement robust:

refresh
reauthorization
revocation handling
integration health monitoring.

---

# 43. EMAIL FOLLOW-UP ENGINE

Example:

I send:

"Please approve the final design by Wednesday."

Create:

Waiting Item:
Final design approval

Waiting on:
Client

Expected:
Wednesday

If Wednesday passes:

generate nudge.

Suggested action:

Draft follow-up.

Draft:

"Hi ..., just following up regarding the final design approval..."

The system must not send it automatically by default.

---

# 44. GOOGLE CALENDAR

Support:

* read events
* free/busy
* multiple calendars
* create app planning blocks
* update app-created planning blocks
* meeting buffers
* deadline overlays
* focus blocks

Use supported push/watch mechanisms where appropriate.

Persist sync tokens/cursors.

Implement reconciliation.

Handle:

duplicate notifications
expired channels
missed webhooks
timezone changes
deleted events
recurring events

---

# 45. CUSTOM CALENDAR

Create a unified application calendar.

Views:

Today

3 Day

Week

Month

Agenda

Timeline

Display:

Meetings

Commitments

Tasks

Deadlines

Follow-ups

Waiting items

Personal goals

AI planning blocks

Risk warnings

Use visual differentiation without becoming cluttered.

---

# 46. PLANNING ENGINE

Separate planning from promise tracking.

Inputs:

deadline
priority
estimate
existing meetings
working hours
locked events
personal commitments
dependencies
capacity
focus preference
client priority
task age
risk

Outputs:

Suggested working blocks.

The planning engine may say:

"Complete ABC Proposal Tuesday 10:00–12:00."

The Commitment remains:

"Deliver ABC Proposal Friday."

Do date != Due date.

This distinction is essential.

---

# 47. DETERMINISTIC SCHEDULING

Investigate a constraint solver such as OR-Tools if useful.

Do not use an LLM as the only scheduler.

AI interprets intent.

Deterministic code checks:

time
capacity
overlap
availability
constraints

Possible task constraints:

duration
earliest_start
deadline
split_allowed
minimum_block
maximum_block
preferred_period
required_person
required_tool

---

# 48. FOLLOW-UP ENGINE

Create first-class follow-ups.

Detect:

* unanswered email
* outstanding approval
* outstanding client feedback
* delegated task overdue
* promised document not received
* proposal with no response
* meeting action item awaiting someone else
* payment outstanding if explicitly integrated

States:

WAITING

DUE_SOON

FOLLOW_UP_TODAY

OVERDUE

ESCALATED

RESOLVED

---

# 49. NUDGE ENGINE

Nudges should be deterministic rules, not AI guesses.

Rules include:

DUE_SOON

OVERDUE

SILENT_PROMISE

PRE_MEETING

REVIEW_BACKLOG

PERSONAL_GOAL_DRIFT

AWAITING_APPROVAL

SERIAL_RESCHEDULER

OVERCOMMITTED_WINDOW

INTEGRATION_UNHEALTHY

Nudges must be:

inspectable
configurable
deduplicated
acknowledgeable

Acknowledging a nudge should cancel unnecessary successor reminders.

---

# 50. ESCALATION

Example:

48 hours before:
subtle reminder

24 hours:
normal notification

4 hours:
urgent notification

overdue:
dashboard warning

significantly overdue:
escalated nudge

Do not simply repeat the same notification every hour.

Implement notification budgets.

---

# 51. PRE-MEETING BRIEF

Shortly before a client meeting, automatically prepare:

Client:
ABC Corp

Meeting:
Weekly Review

Open commitments:
4

Due soon:
2

Waiting on client:
1

At risk:
1

Last discussion:
summary

Recent deadline changes:
timeline

Suggested questions:
generated

No message is sent externally.

---

# 52. POST-MEETING REVIEW

After a meeting:

1. ingest transcript;
2. extract decisions;
3. extract commitments;
4. identify owners;
5. resolve dates;
6. merge duplicates;
7. create review candidates;
8. generate summary.

Display:

New commitments

Changes to existing commitments

Decisions

Waiting items

Unknown items

---

# 53. MORNING BRIEF

Example:

Good morning.

Today:

4 meetings

7 planned work items

2 client deadlines

3 things waiting on clients

1 overdue commitment

Critical risk:

ABC Proposal is due tomorrow.

Estimated work remaining:
3h

Available focus time:
1h 45m

Suggested action:

Move internal documentation to Friday.

---

# 54. END-OF-DAY REVIEW

Show:

Completed

Still open

Moved

Waiting

Overdue

Promises made today

Promises changed today

Suggested tomorrow focus

Do not shame the user for incomplete work.

Focus on operational usefulness.

---

# 55. WEEKLY REVIEW

Generate insights such as:

* commitments created
* commitments completed
* deadlines moved
* client-initiated delays
* internal delays
* average waiting duration
* overloaded days
* repeatedly postponed work
* personal goals receiving no time
* clients generating the most follow-ups
* extraction review accuracy

Avoid employee surveillance metrics.

---

# 56. PERSONAL GOALS

Support non-work obligations.

Examples:

fitness
learning
reading
family
financial administration
side project
health routines
personal appointments

Personal goals belong in the same time reality as work.

Otherwise the capacity engine will falsely assume personal time is free.

Personal information requires more restrictive privacy defaults.

---

# 57. WHATSAPP — PRODUCT STRATEGY

WhatsApp is important, but do not make unsupported personal-account automation a core dependency.

Build WhatsApp as replaceable modes.

## MODE A — Share Into App

From WhatsApp:

Share message/text

→ Personal Chief of Staff

→ SourceEvent

This is reliable and user initiated.

---

## MODE B — Android notification ingestion

Research whether Android NotificationListenerService can safely and lawfully capture the user's own visible WhatsApp notification content for personal task extraction.

Requirements:

explicit permission
local processing
clear privacy explanation
easy disable

Do not claim it can reconstruct complete conversations.

Treat it only as incremental context.

---

## MODE C — Personal WhatsApp handoff

For outgoing reminders/follow-ups:

prepare message

→ open correct WhatsApp conversation/share target

→ user presses Send

No paid API is required.

---

## MODE D — Experimental WhatsApp Web reader

Only if explicitly enabled.

Read-only.

Isolated browser profile.

Never type.

Never send.

Never mark conversations intentionally.

Computer-use automation must be clearly marked:

EXPERIMENTAL / UNSUPPORTED

Measure reliability before relying on it.

Warn that account/platform enforcement risk cannot be eliminated.

Never make the whole product dependent on this adapter.

---

## MODE E — WhatsApp Business Platform

Optional later.

Use only if fully automated outbound WhatsApp becomes a required business feature.

Keep it behind the same DeliveryAdapter abstraction.

---

# 58. COMPUTER-USE ADAPTER

Some services may have no suitable API.

Build computer use as a LAST-RESORT IngestAdapter.

It must be structurally READ ONLY.

Reading and writing must be separate components.

A read agent should never inherit send permission.

Use:

dedicated profile
preferably separate virtual desktop/machine
watchdog
health monitoring

---

# 59. SCREEN-BASED IDEMPOTENCY

Screens do not expose reliable API IDs.

Generate fingerprints from attributes such as:

surface
account
sender
timestamp
message prefix
thread

Hash this data.

Use the hash as a deduplication key.

Design for UI changes.

---

# 60. COMPUTER-USE RELIABILITY BENCHMARK

Before production use measure:

Cycle success rate

Silent failure rate

Duplicate rate

Recovery behavior

Vision/model cost

UI change fragility

The most important metric is:

SILENT FAILURE RATE.

If the system reports:

"nothing new"

when it actually failed to read the UI, it is unacceptable.

Adapter states must distinguish:

HEALTHY_NO_NEW_DATA

HEALTHY_NEW_DATA

FAILED_TO_READ

LOGGED_OUT

UI_CHANGED

UNKNOWN

---

# 61. DELIVERY CHANNELS

Support:

Web Push

Android push/local notifications

Desktop notifications

Email

Telegram optional

WhatsApp handoff

Future providers

Delivery must be provider-independent.

---

# 62. EMAIL FROM MY OWN ACCOUNT

Where authorized, use the user's Gmail account to:

create drafts

and optionally:

send messages after explicit approval.

Prefer Draft-first behavior.

Keep sent message ID associated with the relevant follow-up or commitment.

---

# 63. PLUG-AND-PLAY EXPERIENCE

The product should not feel like deploying an infrastructure project.

First-run experience:

1. Install.

2. Sign in.

3. Create workspace.

4. Connect Google account.

5. Select Gmail permissions.

6. Select calendars.

7. Detect Google Meet capability.

8. Install browser extension if desired.

9. Pair phone.

10. Configure microphone privacy.

11. Set work hours.

12. Add team/client identities.

13. Choose notification rules.

14. Import recent context.

15. Review first extracted candidates.

16. Show first unified dashboard.

The user should reach value quickly.

---

# 64. DEVICE PAIRING

Allow QR pairing.

Desktop shows QR.

Mobile scans.

Establish:

device identity
public/private key where appropriate
workspace authorization

Device screen should show:

Windows Laptop
last seen
permissions
sync status

Android Phone
last seen
permissions
sync status

Allow remote revoke.

---

# 65. DASHBOARD

The dashboard should answer:

What should I care about right now?

Sections:

# NOW

Current/next work.

# TODAY

Today's commitments/tasks.

# AT RISK

Potential deadline failures.

# WAITING ON

Things others owe me.

# PEOPLE WAITING ON ME

My outstanding promises.

# FOLLOW UPS

People to chase.

# REVIEW

AI-detected candidates.

# CALENDAR

Unified schedule.

# UPCOMING

Future commitments.

# PERSONAL GOALS

Protected personal commitments.

---

# 66. CLIENT VIEW

For each client show:

Client name

Active projects

Open commitments

Waiting on client

Waiting on us

Recent meetings

Recent emails

Deadline changes

Risk

Timeline

Follow-ups

Search

The timeline should make disputes easy to resolve.

Example:

Sep 1
Original launch date agreed: Sep 15

Sep 5
Client requested additional checkout flow

Sep 6
Delivery changed to Sep 19

Sep 10
Waiting for client payment gateway credentials

Sep 13
Credentials received

No rewriting of history.

---

# 67. GLOBAL SEARCH

Natural-language examples:

"What did I promise Rahul last week?"

"What are clients waiting on me for?"

"What am I waiting on from ABC?"

"What deadlines were moved by clients?"

"What happened in yesterday's Orion meeting?"

"What did Raj say about the logo?"

"Which tasks are likely to slip?"

"What did I postpone three times?"

"What do I need before tomorrow's meeting?"

"What promises did I make today?"

Search must cite underlying SourceEvents.

Do not answer confidently when supporting evidence does not exist.

---

# 68. SEARCH ARCHITECTURE

Use hybrid retrieval.

Use SQL for:

dates
statuses
owners
clients
projects
waiting state
deadlines
structured relationships

Use full-text search for:

exact messages
emails
transcripts

Use embeddings only where semantic retrieval materially improves results.

Do not turn every database record into a vector unnecessarily.

---

# 69. KNOWLEDGE GRAPH

Relationships include:

Person

→ Client

→ Project

→ Meeting

→ Decision

→ Commitment

→ Task

→ Evidence

Example:

ABC Corp

→ Website Redesign

→ Sep 12 Meeting

→ New Pricing Flow Decision

→ Revised Proposal Commitment

→ Due Sep 15

This allows contextual AI without constantly asking which project something belongs to.

The implementation may use relational tables rather than a graph database initially.

Do not introduce Neo4j unless it demonstrably solves a problem PostgreSQL cannot reasonably handle.

---

# 70. ZERO-COST GOAL

The target is:

**Near-zero recurring vendor cost for a personal/internal deployment.**

Do NOT promise "permanently free" where external infrastructure, domains, electricity, storage, cloud policies or API pricing can change.

Prefer:

self-hosting
local inference
open-source dependencies
single PostgreSQL
minimal infrastructure
user's existing hardware
free standards

Avoid unnecessary:

Redis
Kafka
RabbitMQ
managed vector database
paid workflow platform
paid transcription provider

for the MVP.

---

# 71. DATABASE AS QUEUE

Investigate a mature PostgreSQL-backed job system.

Candidate architecture:

PostgreSQL

*

Postgres-backed worker queue

instead of:

PostgreSQL
Redis
RabbitMQ

The queue must support:

delayed jobs
retries
job uniqueness
dead-letter behavior
concurrency
transaction safety

Verify maintenance status and license of any selected library.

---

# 72. DEPLOYMENT MODES

Support eventually:

## Personal Local

Backend/database run on user's machine/NAS/server.

## Office Self-hosted

One small always-on office server.

## Cloud VPS

One inexpensive server.

## Managed SaaS

Future.

Architecture must not require SaaS from day one.

---

# 73. SECURITY MODEL

This product contains extremely sensitive information.

Implement:

TLS

OAuth 2.0 / PKCE where appropriate

secure session management

encrypted refresh tokens

OS credential/key store

Android Keystore

desktop credential manager

strong password hashing

device revocation

audit logs

tenant isolation

input validation

rate limiting

CSRF protection where required

secure IPC

secrets outside source control

dependency scanning

log redaction

backup encryption

---

# 74. DATABASE TENANT ISOLATION

Never depend on developers remembering:

`WHERE tenant_id = ?`

everywhere.

Implement enforcement using:

data-access layer

and consider PostgreSQL Row Level Security where appropriate.

Write tests proving cross-tenant access fails.

---

# 75. DATA EXPORT AND DELETION

Provide:

Export my data

Delete workspace

Delete source event

Delete recording

Delete transcript

Delete learned fact

Forget person

Disconnect Google

Revoke device

Reset assistant knowledge

Retention processing must result in real deletion when promised.

---

# 76. AUDIT LOGGING

Track security/action events including:

login

integration connect

integration disconnect

device pair

device revoke

candidate accepted

candidate rejected

commitment changed

external draft created

message sent

automation executed

Never log:

raw OAuth refresh tokens
passwords
API secrets

---

# 77. AI PRIVACY

Every AI provider should show privacy class.

Example:

LOCAL

REMOTE_PRIVATE

REMOTE_PROVIDER_RETENTION

UNKNOWN

User settings:

Always process meeting transcripts locally.

Allow email on cloud AI.

Never send personal conversations to cloud AI.

Use local embeddings.

Respect these routing policies centrally.

---

# 78. AUTOMATION PERMISSION LEVELS

## LEVEL 0 — Observe

Read only.

## LEVEL 1 — Organize

Create candidates/internal records.

## LEVEL 2 — Plan

Create suggested calendar blocks.

## LEVEL 3 — Internal Act

Move AI-managed blocks, send reminders to myself.

## LEVEL 4 — Draft External

Prepare messages.

## LEVEL 5 — External Act

Send communication.

LEVEL 5 must not be default.

Allow policies like:

"Never send to clients automatically."

"Automatically reschedule my own focus blocks."

"Draft client follow-ups."

"Automatically notify only me."

---

# 79. AUTONOMOUS EXECUTION — DEFERRED

Later, selected tasks could have execution runbooks.

Example:

Generate weekly report.

Run test suite.

Build APK.

Produce analytics export.

But autonomous execution must NOT be implemented until commitment extraction has demonstrated reliability.

Future rules:

runbook-bound only

no generic "AI do task"

earn automation permission through reviewed executions

run before deadline

show uncertainty first

human approval before delivery

computer-use writing isolated from computer-use reading

nothing client-facing ships unattended by default

---

# 80. INTEGRATION HEALTH

Every adapter must expose:

status

last successful sync

last attempt

last error

failure streak

next retry

authorization state

Dashboard:

Gmail
Healthy
2 min ago

Calendar
Healthy
1 min ago

Google Meet
Healthy

Desktop microphone
Offline

WhatsApp experimental reader
Logged out

Do not silently stop ingesting.

---

# 81. WATCHDOG

An integration that silently stops is dangerous.

Create watchdog nudges.

Example:

"WhatsApp reader has not completed a successful cycle for 4 hours."

"Google Calendar webhook expired."

"Gmail synchronization requires reauthorization."

---

# 82. RELIABILITY ENGINEERING

Assume these happen:

Internet disappears.

Laptop sleeps.

Phone sleeps.

Server restarts.

Worker crashes.

Webhook delivered twice.

Webhook not delivered.

OAuth expires.

Client deletes calendar event.

Transcript arrives hours later.

Same email processed twice.

User edits task offline.

Timezone changes.

System clock differs.

Design explicitly for them.

---

# 83. IDEMPOTENCY

Every ingestion path needs stable IDs.

Use idempotency constraints.

Examples:

Google message ID

Meet transcript entry ID

Calendar event ID

generated content fingerprint

Deduplicate at the database level when possible.

Do not rely purely on application memory.

---

# 84. OBSERVABILITY

Provide structured monitoring for:

API

worker

database

ingestion adapters

AI providers

notifications

queue

webhooks

device sync

transcription

Track:

latency

failure rate

queue depth

extraction failures

adapter freshness

schema failures

token usage

local inference duration

Do not leak private content into telemetry.

---

# 85. PERFORMANCE

Targets:

Dashboard should open immediately from cache.

Task creation should feel instant.

Calendar scrolling should stay smooth.

Completing a task should update UI optimistically.

Search should respond quickly.

AI work should be background processing.

Transcription must not freeze UI.

Measure:

startup

memory

CPU

battery

database latency

sync volume

model latency

---

# 86. UX DESIGN LANGUAGE

Product should feel:

calm

premium

fast

professional

minimal

clear

trustworthy

not corporate-bloated.

Desktop:

keyboard efficient.

Mobile:

touch efficient.

Support:

light

dark

responsive layouts

screen readers

keyboard navigation

reduced motion

accessibility contrast

---

# 87. QUICK CAPTURE

Desktop hotkey example:

Ctrl + Space

Input:

"Send Raj APK next Tuesday afternoon."

Instantly create capture event.

Parse asynchronously.

Another example:

"Follow up ABC invoice Monday if payment hasn't arrived."

Interpret as:

conditional follow-up.

Quick capture must be one of the fastest parts of the application.

---

# 88. ANDROID QUICK ACTIONS

Notification:

ABC Website
Due tomorrow

Actions:

DONE

START

SNOOZE

RESCHEDULE

Another:

Waiting on Raj
Logo expected today

Actions:

FOLLOW UP

TOMORROW

RESOLVED

---

# 89. STATUS DRAFTS

The system may produce:

Client status update

Internal status update

Meeting follow-up

Deadline-change explanation

Waiting-on-client reminder

Before generating a draft, gather relevant evidence.

Never fabricate progress.

---

# 90. ACCOUNTABILITY REPORT

Generate a client timeline.

Example:

Project:
ABC Website

Original deadline:
Sep 15

Sep 4:
Client requested checkout redesign.

Sep 5:
New date Sep 18.

Sep 8:
Requested copy still outstanding.

Sep 11:
Copy received.

Sep 12:
New feature requested.

This should be generated from the immutable ledger and evidence.

---

# 91. REPOSITORY STRUCTURE

Research first, but likely monorepo structure:

/apps
/web
/desktop
/android
/browser-extension

/services
/api
/worker
/local-ai-bridge

/packages
/domain
/database
/contracts
/adapters
/extraction
/calendar-engine
/capacity-engine
/nudge-engine
/shared-ui
/date-resolution

/evals
/fixtures
/expected
/runner

/infrastructure
/docker
/database
/deployment
/backups

/docs
ARCHITECTURE.md
ADR.md
DATA_MODEL.md
SECURITY.md
PRIVACY.md
AI_PIPELINE.md
EXTRACTION_EVALUATION.md
GOOGLE_INTEGRATIONS.md
WHATSAPP.md
AUDIO_CAPTURE.md
SYNC.md
CAPACITY.md
SCHEDULING.md
DEPLOYMENT.md
TESTING.md
ROADMAP.md
RISK_REGISTER.md

Change this only when there is a documented architectural reason.

---

# 92. TECHNOLOGY RESEARCH

Before implementation compare:

Backend:

Node.js + TypeScript
Fastify
NestJS
other justified option

Database:

PostgreSQL

Queue:

pg-boss
Graphile Worker
other mature Postgres queue

ORM/query layer:

Drizzle
Kysely
Prisma
direct SQL

Web:

React
Next.js
Vite
other option

PWA:

service worker strategy
offline storage
Web Push

Desktop:

Tauri
Electron
native hybrid

Android:

Kotlin + Jetpack Compose
Flutter
other justified option

Local database/cache:

SQLite
Room
IndexedDB where applicable

Transcription:

whisper.cpp
faster-whisper
ONNX alternative

Local models:

Ollama
llama.cpp
LM Studio

Vector:

pgvector only if necessary

Date parsing:

evaluate deterministic libraries and implement test corpus.

For EVERY selected major dependency document:

version researched

license

maintenance activity

security state

platform support

why selected

alternatives

why rejected

---

# 93. DO NOT INTRODUCE INFRASTRUCTURE WITHOUT NEED

Before adding any service ask:

Can PostgreSQL already handle this?

Can the OS already handle this?

Can the browser already handle this?

Can a local library handle this?

Avoid architecture-by-fashion.

---

# 94. TESTING STRATEGY

Implement:

unit tests

integration tests

database tests

migration tests

tenant-isolation tests

adapter tests

OAuth tests

webhook tests

offline tests

sync tests

notification tests

queue retry tests

timezone tests

DST tests

date parser tests

AI extraction evaluations

deduplication tests

capacity tests

calendar planning tests

security tests

end-to-end tests

---

# 95. CRITICAL DATE TESTS

Test:

"tomorrow"

"next Friday"

"this Friday"

"Friday"

"end of week"

"next week"

"before Monday"

"EOD tomorrow"

"after the client call"

Test around:

Sunday/Monday boundaries

month end

year end

DST

different user timezone

source timezone

meeting timezone

Never trust the parser without tests.

---

# 96. CAPACITY TEST SCENARIO

Monday:

User commits to 20 hours of work due Thursday.

Calendar already contains:

15 hours meetings.

Usable work capacity:

12 hours.

Expected:

Overcapacity warning immediately.

The user chooses:

Accept anyway.

Expected:

Commitment saved.

Warning decision stored.

No silent rescheduling occurs.

---

# 97. FULL SYSTEM TEST SCENARIO

Monday:

Client says during Meet:

"Can you deliver the prototype Friday?"

System:

captures transcript.

extracts commitment.

resolves Friday.

checks capacity.

creates candidate.

user accepts.

Tuesday:

Client emails:

"Please add onboarding."

System:

links email to same project.

detects scope change.

warns estimate increased.

Wednesday:

System detects client still has not supplied assets.

Task becomes:

WAITING.

Thursday:

Client sends assets.

Waiting resolved.

Planner reports only three free hours remain.

User approves rearranging an AI-managed internal block.

Friday:

Prototype delivered.

Commitment marked complete.

Accountability timeline remains queryable.

This scenario must have automated tests at appropriate layers.

---

# 98. PHASED DELIVERY

## PHASE 0 — Research + Evaluation

Do first.

Deliver:

technology research

competitor research

architecture

threat model

database design

evaluation harness

date-resolution test suite

model adapters

sample extraction corpus

computer-use reliability experiment

Do not move on until extraction metrics exist.

---

## PHASE 1 — Commitment Core

Deliver:

Postgres schema

tenancy

people

identity

source events

evidence

candidates

commitments

tasks

review queue

accountability ledger

manual capture

basic dashboard

Outcome:

The application already works as a commitment database.

---

## PHASE 2 — Email + Calendar + Nudges

Deliver:

Google OAuth

Gmail ingestion

Google Calendar

sync cursors

calendar UI

waiting state

follow-ups

nudges

capacity pools

promise-time capacity warnings

Web Push

Outcome:

The system catches real commitments and warns before they slip.

---

## PHASE 3 — Google Meet

Deliver:

Meet integration

transcripts

participants

meeting linking

post-meeting extraction

pre-meeting briefs

Outcome:

Meet conversations become reviewable commitments.

---

## PHASE 4 — Desktop Voice

Deliver:

desktop companion

microphone sessions

Whisper local transcription

VAD

privacy controls

retention

quick capture

Outcome:

Explicit offline conversations can become commitments.

---

## PHASE 5 — Android Companion

Deliver:

native notifications

share-to-app

quick capture

voice sessions

foreground microphone service

widgets

offline cache

device pairing

Outcome:

Laptop and phone operate as one system.

---

## PHASE 6 — Personal Intelligence

Deliver:

learned facts

entity relationships

hybrid search

"What assistant knows"

correction loops

morning brief

weekly review

Outcome:

The system understands recurring context.

---

## PHASE 7 — Planning Engine

Deliver:

Do vs Due distinction

capacity-aware recommendations

calendar block proposals

locked/flexible/AI-managed blocks

approval workflow

optional flexible auto-planning

Outcome:

The assistant helps construct a realistic workday without silently taking control.

---

## PHASE 8 — Additional Integrations

Deliver selectively:

Notion

Todoist

GitHub

Slack

Teams

project-management tools

Only when demanded.

---

## PHASE 9 — Production Hardening

Deliver:

packaging

installers

automatic updates

backup/restore

disaster recovery

security audit

performance optimization

OAuth production readiness

privacy documentation

commercial multi-tenancy readiness

---

# 99. EXIT TESTS

Every phase needs measurable exit criteria.

Examples:

Phase 0:

Model precision/recall/date metrics exist.

Phase 1:

Every accepted commitment is traceable to evidence.

Phase 2:

A real deadline produces reminders on laptop and phone.

Phase 3:

A real meeting yields accurate candidates.

Phase 4:

Audio is transcribed locally and raw audio removed according to retention configuration.

Phase 5:

Phone/laptop edits reconcile correctly.

Phase 7:

Planner never overlaps locked events.

No phase is complete merely because the UI exists.

---

# 100. COST ANALYSIS

Calculate expected cost for:

1 user

10 users

100 users

1,000 users

Separate:

software licence cost

hosting

storage

database

AI

transcription

Google API

push

backups

domain

email

monitoring

Do not label third-party free tiers as guaranteed permanent free.

Design the personal version to function with self-hosting and local AI when feasible.

---

# 101. RISK REGISTER

At minimum analyze:

Weak local extraction model

Over-extraction

Missed commitments

Wrong dates

Wrong person resolution

Duplicate commitments

Privacy breach

Audio consent

OAuth verification

Google scope restrictions

Lost refresh token

Failed webhook

WhatsApp account restrictions

Computer-use silent failure

UI redesign breaking automation

Local server outage

Lost database

Sync conflicts

Model provider disappearing

Free-tier pricing changes

Android background restrictions

Battery drain

Schedule suggestions becoming annoying

Notification fatigue

Scope creep

---

# 102. BACKUP

For self-hosted installation implement automatic PostgreSQL backups.

Support:

encrypted backup

retention

second-location copy

restore test

A backup is not considered working until restore has been tested.

---

# 103. DOCUMENTATION

Maintain architecture docs as code evolves.

Required:

README.md

ARCHITECTURE.md

SECURITY.md

PRIVACY.md

DATABASE.md

INTEGRATIONS.md

GOOGLE_AUTH.md

WHATSAPP_LIMITATIONS.md

AUDIO_PRIVACY.md

AI_MODELS.md

EVALUATION.md

CAPACITY.md

PLANNING.md

DEPLOYMENT.md

BACKUPS.md

TROUBLESHOOTING.md

ROADMAP.md

---

# 104. FIRST RESEARCH DELIVERABLE

Before implementing production code, produce:

## 1. Executive Summary

Can this product be built?

Which parts are straightforward?

Which parts are risky?

## 2. Architecture Recommendation

Provide diagram.

## 3. Technology Matrix

Compare candidates.

## 4. Integration Matrix

For each integration include:

API
auth
permissions
webhook/polling
rate limits
cost
policy risk
fallback

## 5. Google OAuth Analysis

Internal Workspace
personal Google
commercial external

## 6. WhatsApp Analysis

personal account
share workflow
Android notification ingestion
experimental Web reader
Business API

## 7. Microphone Analysis

Windows
Android
iOS
Chrome

## 8. Data Architecture

ERD.

## 9. AI Architecture

Models
routing
evaluation
privacy.

## 10. Threat Model

## 11. Cost Model

## 12. Implementation Roadmap

## 13. Risk Register

## 14. Open Decisions

---

# 105. RESEARCH VALIDITY RULE

Whenever this specification says something about:

Google
Android
iOS
Chrome
WhatsApp
OAuth
API availability
background services
browser permissions
pricing
free tier
library support

DO NOT blindly trust this prompt.

Verify against current official documentation first.

If documentation conflicts with this specification:

document the conflict.

Then use the current supported approach.

---

# 106. IMPLEMENTATION RULES

Do not:

create fake integrations.

create buttons that do nothing.

claim a connection works when it does not.

hardcode demo values into production workflows.

hide API errors.

swallow exceptions.

store secrets in source.

log sensitive content unnecessarily.

use AI to hide deterministic bugs.

automatically contact clients.

build unsupported WhatsApp automation and call it reliable.

silently record people.

skip tests because a UI appears functional.

---

# 107. CODE QUALITY

Use:

strict TypeScript

linting

formatting

typed API contracts

runtime schema validation

database migrations

repository/service boundaries where useful

structured error types

idempotent workers

transaction boundaries

clean cancellation

abort signals

dependency injection only where it provides value

Avoid:

massive god services

deep abstraction without need

duplicate domain models

business logic inside React components

provider logic inside core services

---

# 108. PERFORMANCE AUDIT AFTER EACH PHASE

Measure and optimize:

database query count

slow queries

indexes

worker concurrency

API latency

bundle size

desktop memory

Android memory

battery

transcription CPU

model RAM

sync payloads

notification duplication

Do not optimize purely from assumptions.

Profile.

---

# 109. SECURITY AUDIT AFTER EACH PHASE

Check:

dependencies

known CVEs

token handling

auth boundaries

tenant leakage

CSRF

XSS

SQL injection

SSRF

file handling

IPC

webhook authentication

rate limiting

secret exposure

log exposure

backup security

---

# 110. END-OF-PHASE PROCEDURE

At the end of every phase:

1. Compile/build all affected apps.

2. Run tests.

3. Run static analysis.

4. Run security scan.

5. Run database migration test.

6. Run integration tests.

7. Test error states.

8. Profile.

9. Document discovered problems.

10. Fix critical/high issues.

11. Update architecture docs.

12. Commit a phase report.

Do not simply say:

"Implementation complete."

Prove it.

---

# 111. PRODUCT SUCCESS CRITERION

The final product succeeds when I no longer need to remember:

"What did I promise?"

"When did I promise it?"

"Who is waiting on me?"

"Who am I waiting on?"

"Did the client move the deadline?"

"Where did they say that?"

"Can we realistically deliver this?"

"What should I focus on today?"

"What did yesterday's meeting create?"

"What do I need to follow up on?"

The application should answer those questions automatically, reliably and with evidence.

The goal is not an AI that talks impressively.

The goal is:

# NOTHING IMPORTANT FALLS THROUGH THE CRACKS.

The finished product should feel like a trustworthy, private, always-available **personal Chief of Staff** that converts fragmented conversations, promises and responsibilities into a clear operational picture of my work and life.

---

# 112. START NOW

Begin with PHASE 0.

Do not immediately build the entire application.

First:

1. Inspect the existing repository if one exists.

2. Map the current architecture and dependencies.

3. Identify reusable components.

4. Research all major platform assumptions from current primary sources.

5. Produce the technical feasibility report.

6. Produce architecture diagrams.

7. Produce the integration and permission matrix.

8. Produce the database ERD.

9. Produce the threat model.

10. Implement the evaluation harness.

11. Create the initial extraction fixtures.

12. Benchmark at least one local and one remote model when credentials/hardware permit.

13. Build deterministic date-resolution tests.

14. Prototype the core SourceEvent → Candidate pipeline.

15. Measure it.

Only after those results are available should you proceed to the remainder of Phase 1.

When choices are uncertain, do not stall the entire project waiting for trivial clarification.

Make the safest reasonable assumption, document it in an Architecture Decision Record, and build the part that can be validated independently.

Prioritize:

reliability > flashy AI

provenance > automation

precision > noisy extraction

privacy > convenience

human control > autonomous external action

deterministic rules > unnecessary AI

simple infrastructure > fashionable infrastructure

measured evidence > assumptions
