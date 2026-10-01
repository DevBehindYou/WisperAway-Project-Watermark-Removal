# AI AGENT — COMPLETE SESSION & PROJECT HANDOVER PROTOCOL

You are preparing a **complete project/session handover for another AI agent**.

Your goal is to preserve enough context that a completely new AI agent, with **zero access to the current conversation/session**, can continue the work accurately without requiring the user to repeat information or rediscover previous work.

The handover must capture:

- Current conversation context
- User requirements
- Project goals
- Architecture
- Project structure
- Work already completed
- Files created or modified
- Decisions made
- Commands executed
- Logs analyzed
- Errors encountered
- Root causes discovered
- Fixes attempted
- Fixes confirmed working
- Failed approaches
- Testing performed
- Current project state
- Pending work
- Known bugs
- Risks
- Important configuration
- Environment information
- Deployment information
- Git/GitHub information
- CI/CD information
- APIs and integrations
- Database/storage information
- Security considerations
- Performance findings
- UI/UX findings
- Important user preferences
- Exact next steps

Do **not** write a vague summary.

This is a **technical continuity document** intended to allow another AI agent to take over immediately.

---

# 1. PRIMARY OBJECTIVE

Create a structured Markdown-based handover package for the current project/session.

The next AI agent should be able to read these files and understand:

1. What the project is.
2. What the user ultimately wants.
3. What has happened so far.
4. What has already been changed.
5. Why those changes were made.
6. What currently works.
7. What currently does not work.
8. Which approaches failed.
9. What still needs to be implemented.
10. What the safest and most logical next action is.

Preserve technical details whenever they could affect future work.

---

# 2. DO NOT LOSE CONTEXT

Before writing the handover, review all available context from:

- Current conversation
- Previous messages available in the session
- Agent scratch/work context that is safe to summarize
- Terminal output
- Build output
- Compiler errors
- Runtime errors
- Stack traces
- CI/CD logs
- GitHub Actions logs
- Deployment logs
- Test output
- Screenshots
- Uploaded files
- Documentation
- Existing README files
- Source code inspected
- Configuration files
- Environment files
- Package manifests
- Gradle/Maven files
- Docker files
- Kubernetes files
- Workflow files
- Database schemas
- API definitions
- User-provided instructions
- User corrections made during the session

Never assume that another agent will have access to the original conversation.

Everything important must therefore be represented in the handover.

---

# 3. OUTPUT FORMAT

Create a handover directory similar to:

```text
docs/
└── ai-handover/
    ├── HANDOVER.md
    ├── PROJECT_CONTEXT.md
    ├── SESSION_HISTORY.md
    ├── CURRENT_STATE.md
    ├── CHANGES_MADE.md
    ├── FILES_CHANGED.md
    ├── ERRORS_AND_FIXES.md
    ├── COMMANDS_AND_LOGS.md
    ├── ARCHITECTURE.md
    ├── DECISIONS.md
    ├── TESTING_STATUS.md
    ├── PENDING_TASKS.md
    ├── NEXT_AGENT_INSTRUCTIONS.md
    └── INDEX.md
```

If the project is small, some files may be combined.

If the project is complex, create additional Markdown documents where useful.

Do not create unnecessary documentation purely to increase file count.

---

# 4. `INDEX.md`

Create an entry-point document.

Include:

```markdown
# AI Project Handover

## Project
<Project Name>

## Last Updated
<Date / session identifier if available>

## Handover Purpose

This directory contains the project state and AI-session context required for another AI agent to continue development without reviewing the entire previous conversation.

## Recommended Reading Order

1. HANDOVER.md
2. PROJECT_CONTEXT.md
3. CURRENT_STATE.md
4. CHANGES_MADE.md
5. ERRORS_AND_FIXES.md
6. PENDING_TASKS.md
7. NEXT_AGENT_INSTRUCTIONS.md

## Documents

| File | Purpose |
|---|---|
| HANDOVER.md | Executive handover |
| PROJECT_CONTEXT.md | Project goals and requirements |
| SESSION_HISTORY.md | Chronological work history |
| CURRENT_STATE.md | Current implementation state |
| CHANGES_MADE.md | Changes performed |
| FILES_CHANGED.md | Important file modifications |
| ERRORS_AND_FIXES.md | Bugs, errors, diagnoses, fixes |
| COMMANDS_AND_LOGS.md | Relevant commands and log excerpts |
| ARCHITECTURE.md | Technical architecture |
| DECISIONS.md | Important technical decisions |
| TESTING_STATUS.md | Testing performed and results |
| PENDING_TASKS.md | Remaining work |
| NEXT_AGENT_INSTRUCTIONS.md | Exact continuation instructions |
```

---

# 5. `HANDOVER.md`

This should be the primary summary.

Use the following structure:

```markdown
# Project Handover

## Project Name

## Current Objective

## User's Final Goal

## Current Status

Example:

- Project builds: YES / NO / PARTIAL
- Application launches: YES / NO / PARTIAL
- Core functionality works: YES / NO / PARTIAL
- Tests passing: X / Y
- CI/CD working: YES / NO / PARTIAL
- Deployment working: YES / NO / PARTIAL

## What Was Completed

## What Is Currently Being Worked On

## Most Important Discoveries

## Major Problems Found

## Fixes Already Applied

## Current Blockers

## Pending Work

## Recommended Next Action

## Critical Warnings for Next Agent

## Files the Next Agent Should Inspect First
```

Keep this document concise enough to read quickly, while preserving critical context.

---

# 6. `PROJECT_CONTEXT.md`

Document the original project intent.

Include:

```markdown
# Project Context

## Project Description

## Main Goal

## User Requirements

## Functional Requirements

## Non-Functional Requirements

### Performance

### Security

### Accessibility

### Reliability

### Compatibility

### Maintainability

### UI/UX

## Platforms

Examples:

- Android
- iOS
- Web
- Desktop
- Backend
- Cloud
- CLI

## Technology Stack

## Frameworks

## Libraries

## Services / APIs

## Database

## Authentication

## Storage

## Deployment

## Minimum Supported Versions

## Known User Preferences

## Explicit User Constraints

## Things the User Specifically Does NOT Want
```

Do not rewrite user requirements into something materially different.

Where wording matters, preserve the user's intent closely.

---

# 7. `SESSION_HISTORY.md`

Create a chronological history of meaningful events.

Example:

```markdown
# Session History

## Session 1

### User Request

### Investigation

### Findings

### Changes

### Result

---

## Session 2

### User Request

### Investigation

### Findings

### Changes

### Result
```

Record meaningful turning points rather than every trivial conversational message.

Important corrections from the user must be preserved.

---

# 8. `CURRENT_STATE.md`

Describe the project exactly as it currently exists.

Include:

```markdown
# Current Project State

## Build Status

## Runtime Status

## Feature Status

| Feature | Status | Notes |
|---|---|---|
| Authentication | Working | ... |
| API integration | Partial | ... |
| Database | Working | ... |
| File operations | Broken | ... |

## Working Components

## Partially Working Components

## Broken Components

## Disabled Components

## Temporary Workarounds

## Current Branch

## Current Commit

## Uncommitted Changes

## Current Deployment State

## Current CI/CD State

## Current Test State
```

Never claim something works unless it has actually been verified.

Use statuses such as:

- `VERIFIED`
- `IMPLEMENTED BUT UNTESTED`
- `PARTIALLY VERIFIED`
- `BROKEN`
- `NOT IMPLEMENTED`
- `UNKNOWN`

---

# 9. `CHANGES_MADE.md`

Record all meaningful changes made during the session.

For each change include:

```markdown
## Change: <Title>

### Problem

### Root Cause

### Solution

### Files Modified

### Key Implementation Details

### Verification

### Remaining Concerns
```

Do not simply say:

> Fixed build issue.

Instead explain what caused the issue and how it was fixed.

---

# 10. `FILES_CHANGED.md`

Create a file-level record.

Example:

```markdown
# Files Changed

## `app/build.gradle.kts`

### Changes

- Updated minimum SDK.
- Added dependency X.
- Changed signing configuration.

### Reason

...

---

## `.github/workflows/android.yml`

### Changes

...

### Reason

...
```

Include:

- created files
- deleted files
- renamed files
- significantly modified files
- important configuration files

Do not paste entire files unless the full content is important.

Prefer describing modifications and including critical snippets.

---

# 11. `ERRORS_AND_FIXES.md`

This document is extremely important.

For every meaningful error encountered, include:

```markdown
# Errors and Fixes

## Error 1 — <Short title>

### Error Message

```text
<relevant error>
```

### Where It Occurred

### Root Cause

### Investigation

### Fix Attempted

### Result

### Final Fix

### Verification

### Status

RESOLVED / PARTIAL / UNRESOLVED

### Notes for Next Agent
```

Also record approaches that failed.

Example:

```markdown
## Failed Approach

Attempted:

...

Why it failed:

...

Do NOT repeat this approach unless:

...
```

This prevents future agents from wasting time repeating unsuccessful debugging attempts.

---

# 12. `COMMANDS_AND_LOGS.md`

Record important commands executed during development.

Example:

```markdown
# Commands and Logs

## Build Commands

```bash
./gradlew clean
./gradlew assembleRelease
```

## Test Commands

```bash
./gradlew test
```

## Git Commands

```bash
git status
git log --oneline -10
```

## Deployment Commands

...

## Important Log Findings

### Build Log

Relevant excerpt:

```text
...
```

Interpretation:

...

### Runtime Log

...
```

Do not dump thousands of irrelevant log lines.

Preserve:

- exact error lines
- important warnings
- stack traces
- exit codes
- failing tasks
- failing modules
- filenames
- line numbers
- dependency conflicts
- runtime exceptions

---

# 13. `ARCHITECTURE.md`

Document the architecture based on actual inspection.

Include where applicable:

```markdown
# Architecture

## High-Level Architecture

## Application Layers

## Directory Structure

```text
project/
├── ...
```

## Major Modules

## Data Flow

## Authentication Flow

## API Flow

## Database Flow

## File Handling Flow

## State Management

## Background Tasks

## External Integrations

## Dependency Relationships

## Build System

## Deployment Architecture

## Known Architectural Problems

## Recommended Architectural Improvements
```

Separate:

- existing architecture
- proposed architecture

Do not present a proposed redesign as though it already exists.

---

# 14. `DECISIONS.md`

Record important technical decisions.

Use:

```markdown
# Technical Decisions

## Decision 1

### Decision

### Reason

### Alternatives Considered

### Why Alternatives Were Rejected

### Consequences

### Status

ACTIVE / TEMPORARY / REVISIT
```

Examples:

- minimum SDK
- framework selection
- database choice
- architecture pattern
- caching strategy
- API strategy
- authentication method
- deployment provider
- dependency version
- design system

---

# 15. `TESTING_STATUS.md`

Document exactly what has and has not been tested.

Use:

```markdown
# Testing Status

## Build Testing

## Unit Testing

## Integration Testing

## UI Testing

## Device Testing

## API Testing

## Database Testing

## Security Testing

## Performance Testing

## Deployment Testing

## CI/CD Testing

## Compatibility Testing

## Tests Passing

## Tests Failing

## Tests Not Yet Run

## Manual Verification Performed

## Known Testing Gaps
```

Do not state that something is tested when only code inspection was performed.

Clearly differentiate:

- inspected
- implemented
- compiled
- tested
- verified in runtime
- verified on real device
- verified in production

---

# 16. `PENDING_TASKS.md`

Create a prioritized task list.

Use:

```markdown
# Pending Tasks

## P0 — Critical

- [ ] Task
  - Problem:
  - Required action:
  - Relevant files:
  - Dependencies:
  - Verification criteria:

## P1 — High Priority

...

## P2 — Medium Priority

...

## P3 — Optional Improvements

...
```

Tasks should be concrete and executable.

Bad:

```markdown
- Improve app.
```

Good:

```markdown
- [ ] Fix Android release APK installation failure.
  - Inspect generated APK signing.
  - Verify minSdk and targetSdk.
  - Run `adb install`.
  - Capture Package Manager error.
  - Verify ABI compatibility.
```

---

# 17. `NEXT_AGENT_INSTRUCTIONS.md`

This file should explicitly tell the next AI agent what to do.

Example:

```markdown
# Instructions for the Next AI Agent

You are continuing an existing project.

Do NOT restart the project from scratch.

Before making changes, read:

1. HANDOVER.md
2. CURRENT_STATE.md
3. ERRORS_AND_FIXES.md
4. PENDING_TASKS.md
5. DECISIONS.md

## First Objective

...

## Inspect These Files First

1. ...
2. ...
3. ...

## Run These Commands First

```bash
...
```

## Verify

...

## Then Continue With

...

## Do Not Repeat

- ...
- ...
- ...

## Important Constraints

- ...
- ...
- ...

## Definition of Done

The next phase is complete when:

- [ ] ...
- [ ] ...
- [ ] ...
```

This document should allow another agent to begin working immediately.

---

# 18. PRESERVE USER CORRECTIONS

If the user corrected the AI during the session, explicitly record it.

Example:

```markdown
## User Corrections

### Correction 1

Initial interpretation:

...

User correction:

...

Correct requirement going forward:

...
```

User corrections take priority over earlier assumptions.

---

# 19. RECORD ASSUMPTIONS

Create a section wherever appropriate:

```markdown
## Assumptions

### Confirmed

...

### Unconfirmed

...

### Needs Verification

...
```

Never silently convert an assumption into a fact.

---

# 20. RECORD PROJECT ENVIRONMENT

Where available include:

```markdown
## Environment

### Operating System

### IDE

### Language Version

### SDK Versions

### JDK Version

### Node Version

### Package Manager

### Gradle Version

### Android Gradle Plugin

### Docker Version

### Database Version

### Browser / Device

### Target Device

### CI Environment
```

Only document values that are known.

Otherwise write:

`UNKNOWN / NOT VERIFIED`

---

# 21. GIT / GITHUB STATE

If Git is being used include:

```markdown
## Git Status

### Repository

### Branch

### Latest Relevant Commit

### Modified Files

### Untracked Files

### Staged Files

### Local-Only Changes

### Remote Status

### Pull Requests

### Releases

### Tags

### GitHub Actions Status
```

If a workflow is failing, include:

- workflow filename
- job
- step
- error
- root cause
- attempted fixes
- current status

---

# 22. DEPLOYMENT STATE

If deployment is involved, record:

```markdown
## Deployment

### Provider

### Environment

### Production URL

### Staging URL

### Backend

### Frontend

### Database

### DNS

### Environment Variables

### Secrets Required

### Deployment Commands

### Current Deployment Problems
```

Never write secret values.

Instead document secret names:

```text
ANDROID_KEYSTORE_BASE64
DATABASE_URL
API_KEY
```

Write:

`VALUE NOT STORED FOR SECURITY`

---

# 23. SECURITY RULE

Never place the following directly inside handover documents:

- passwords
- private API keys
- access tokens
- refresh tokens
- SSH private keys
- signing key contents
- recovery codes
- database passwords
- authentication cookies

Instead write:

```markdown
Secret required:

`SECRET_NAME`

Location:

GitHub Actions Secrets / .env / deployment provider

Value:

NOT INCLUDED FOR SECURITY
```

---

# 24. LOG COMPRESSION RULE

If logs are extremely large:

Do not paste the entire log.

Instead create:

```markdown
## Log Summary

### Failure

### First Relevant Error

### Root Cause

### Cascading Errors

### Relevant Files

### Recommended Fix
```

Preserve the original log filename so another agent can inspect it if available.

Example:

```markdown
Source log:

`logs_91855151221.zip`
```

---

# 25. CODE SNIPPET RULE

Include code snippets only when they are important for understanding:

- current implementation
- a bug
- a fix
- a configuration
- a workflow
- an architectural decision

Always include the source path.

Example:

```markdown
File:

`app/src/main/java/.../MainActivity.kt`

Relevant section:

```kotlin
...
```
```

---

# 26. DISTINGUISH FACT FROM RECOMMENDATION

Use explicit terminology.

### Existing

What currently exists in the repository.

### Implemented

What was changed during the session.

### Verified

What was actually tested.

### Proposed

What should be implemented later.

### Hypothesis

Possible explanation requiring confirmation.

Do not mix these categories.

---

# 27. CONTINUITY RULE

The most important question your handover must answer is:

> "If the current AI agent disappears right now, can a different AI agent continue the work correctly using only these Markdown files?"

If the answer is no, the handover is incomplete.

---

# 28. FINAL HANDOVER CHECK

Before finishing, verify that the documentation contains:

- [ ] Project goal
- [ ] User requirements
- [ ] Technology stack
- [ ] Current state
- [ ] Work completed
- [ ] Files changed
- [ ] Commands used
- [ ] Important logs
- [ ] Errors found
- [ ] Root causes
- [ ] Fixes applied
- [ ] Failed approaches
- [ ] Current blockers
- [ ] Architecture
- [ ] Technical decisions
- [ ] Test results
- [ ] Deployment state
- [ ] Git state
- [ ] Environment
- [ ] Security considerations
- [ ] Pending tasks
- [ ] User corrections
- [ ] Known assumptions
- [ ] Recommended next steps
- [ ] Exact instructions for the next agent

---

# 29. FINAL RESPONSE

After creating or updating the Markdown handover files, provide a short summary containing:

```markdown
## Handover Completed

Created/updated:

- `docs/ai-handover/HANDOVER.md`
- `docs/ai-handover/PROJECT_CONTEXT.md`
- `docs/ai-handover/CURRENT_STATE.md`
- ...

### Current State

<1–3 sentence summary>

### Highest-Priority Next Task

<task>

### Important Warning

<any major blocker/risk>
```

Do not merely describe what documentation should contain.

Actually inspect the available project/session context and populate the documentation.

---

# 30. UPDATE EXISTING HANDOVER INSTEAD OF RESTARTING

If `docs/ai-handover/` already exists:

1. Read the existing handover.
2. Compare it with the current session.
3. Preserve still-valid information.
4. Update changed information.
5. Add the latest work.
6. Mark resolved tasks as completed.
7. Move obsolete assumptions into historical notes when useful.
8. Update the current state.
9. Update pending tasks.
10. Update next-agent instructions.

Do **not** blindly replace valuable historical context.

---

# 31. MULTI-SESSION HISTORY

For projects being worked on repeatedly, maintain:

```markdown
## Session Timeline

### YYYY-MM-DD — Session N

**Objective**

...

**Completed**

...

**Problems discovered**

...

**Pending**

...
```

The newest session should update `CURRENT_STATE.md`, while `SESSION_HISTORY.md` preserves the historical progression.

---

# 32. AGENT-TO-AGENT HANDOVER PRIORITY

When documentation conflicts, use this priority:

1. Latest explicit user instruction
2. Latest verified project state
3. Latest source code
4. Latest test/build result
5. Existing documentation
6. Earlier assumptions

Explicitly mention any unresolved conflicts.

---

# 33. MOST IMPORTANT RULE

Do not optimize the handover for brevity.

Optimize it for **continuity, accuracy, traceability, and zero-loss transfer of project knowledge**.

A new AI agent should be able to continue the project with minimal rediscovery.