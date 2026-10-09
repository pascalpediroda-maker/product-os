---
name: pos-dev
description: >
  The full build team, for the FEATURE tier of pos-build. The main session is the dev lead and
  coordinates six specialist agents itself (db-engineer, backend-dev, devsecops, ai-engineer,
  frontend-dev, qa-engineer) in dependency order, and verifies every delivery item by item before
  the next phase. Use when pos-build sizes a request as FEATURE, or when someone says "build it with
  the team", "full dev team", "do it properly", "/pos-dev", or hands over a spec to implement.
---

# Dev team

## Why this skill exists

A feature must be, at once:

- **faithful to the design system** (no drift);
- **architecturally clean** (real-time, abstractions, the patterns already in place);
- **secure** (access policies, authentication, tenant isolation, confidentiality);
- **tested** (end to end);
- **deployable** (services, environment variables).

One agent cannot master all of it. The main session orchestrates six specialists, each carrying the
quality rules of its trade.

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles,
and codes such as S9 or AI13 to the rules of the Build pivot, `<pivots.dir>/product_build_context.md`.

## The main session is the dev lead

A lead launched as a sub-agent stalled between two events and never woke its specialists
(principle 1). The session that talks with the owner **is** the dev lead: it spawns the specialists
itself, receives their outputs, consolidates and delivers. No intermediate agent.

The `dev-lead` agent file of this plugin is the lead's **operating guide** (its rules, its sources of
truth, its posture), read by the session. It is never spawned.

## The team

| Agent | Role | Model |
|---|---|---|
| `db-engineer` | migrations, access policies, schemas | sonnet |
| `backend-dev` | routes, server logic, LLM calls | sonnet |
| `frontend-dev` | components, pages, real-time, design system | sonnet |
| `qa-engineer` | end-to-end tests, regressions, validation | sonnet |
| `devsecops` | infrastructure, security, services, monitoring, cost | sonnet |
| `ai-engineer` | the product's AI agents: prompts, tools, calibration | sonnet |

`ai-engineer` is called only when `product.ai_agents` is true.

## Workflow

### Step 0: preparation (the session)

Before touching code:

1. Read the `dev-lead` agent file of this plugin, to take the role.
2. Read what `pos-build` Step 0 requires: the config, the Build pivot (its rules in full, then the
   sections the request touches), the memory index, `memory.always`, the zones the request touches,
   the design system when there is interface work.
3. Explore the existing code (search, read) to understand the patterns already in place.
4. Split the request into tasks by specialty.
5. Identify the dependencies (what must finish before something else starts).

### Step 1: `db-engineer` (when the schema changes)

Spawned **first** when the feature needs a migration or access policies:

```
Agent(subagent_type: "db-engineer", description: "...",
      prompt: "[tables to create or change, access policies, constraints, integration with what exists]")
```

Wait for its result before the back end: the back end codes against the new schema.

### Step 2: `backend-dev`, `devsecops`, `ai-engineer` (in parallel, after the database)

The three in one message, with several agent calls:

```
Agent(subagent_type: "backend-dev", prompt: "[routes, request and response format, business logic]")
Agent(subagent_type: "devsecops",  prompt: "[infrastructure and security implications]")
Agent(subagent_type: "ai-engineer", prompt: "[agent prompts, calibration]")
```

Agents that are not needed are skipped (partial mode).

### Step 3: `frontend-dev` (after the back end)

It needs the routes: in sequence after the back end.

```
Agent(subagent_type: "frontend-dev",
      prompt: "[components, routes available, interface spec; the design system file is MANDATORY reading]")
```

### Step 4: `qa-engineer` (after the front end)

End-to-end tests once the integration can run:

```
Agent(subagent_type: "qa-engineer", prompt: "[flows to test, happy path, error cases]")
```

### Step 4.5: verify every delivery (the session; non-negotiable)

**An agent's report saying "all delivered" is not proof of delivery** (principle 2). The session
checks item by item BEFORE marking a phase complete and moving to the next.

**For each agent spawned, the session keeps an explicit checklist taken from the brief:**

```
The back-end brief contained:
[ ] Worker pipeline: enrichment step A
[ ] Worker pipeline: enrichment step B
[ ] Route POST /api/<items>/[id]/activate
[ ] Route GET /api/<items>/[id]
[ ] Migration script for the existing rows
```

**After the agent answers, the session OPENS every delivered file and CHECKS by search or read:**

| Brief item | Mandatory check |
|---|---|
| "the worker runs enrichment step A" | search the call of step A in the pipeline file |
| "POST /activate inserts a job" | read the route file and find the insert |
| "the migration creates table X" | list the tables through the database connector, or query `information_schema.tables` |
| "the worker logs the error's cause" | search the log line in the pipeline file |

**When an item of the brief is NOT in the delivered code,** escalate:

- do NOT mark the phase complete;
- do NOT spawn the next phase;
- re-spawn the agent with the minimal brief "you missed X; here is what to add", or tell the owner of
  the gap and ask whether to continue in partial mode.

**Anti-pattern:** "The back-end developer confirmed everything was delivered, I move on to DevSecOps."
The report describes the agent's INTENTION, not its real DELIVERY. Always check.

**Incident it comes from:** a back-end agent delivered a worker pipeline WITHOUT two enrichment steps
that were explicitly in its brief. The lead accepted the "all delivered" report without a cross-check.
The product's assistant then answered about publications that were missing from its data. A critical
bug that the checklist would have caught.

**Read each agent's report to its end:** the four closing headings (real benefit, risks and side
effects, mitigation, recommendation) are weighed in the risk card of `pos-post-impl-checklist`
(Gate 5b). A risk the agent wrote and the session did not weigh is the session's failure.

### Step 5: integration and delivery (the session)

1. Read the diffs each specialist produced.
2. Check the coherence (imports, types, the contract between routes and their callers).
3. Fix the integration problems (edit directly).
4. Run `pos-post-impl-checklist`: tests, interface gate, gaps, the owner's test list, type-check,
   security, the risk card, local commits, help articles and architecture memory, the report.
5. Report to the owner what was done (rule 22 and 23: in the user's terms) and what to test by hand.
6. **Push only on the owner's explicit go** (rule 27).

## Modes

- **Full:** every specialist, in order.
- **Partial:** the session drops who is not needed (no migration: no `db-engineer`; no AI change: no
  `ai-engineer`).
- **Fix:** one or two specialists often suffice (a pure front-end bug: `frontend-dev` and
  `qa-engineer`; an API bug: `backend-dev` and `qa-engineer`).

## What each specialist reads, every time

The session puts these sources in the brief of each specialist it spawns, with their paths: the
agent cannot guess them (rule 38).

| Agent | Mandatory sources |
|---|---|
| `db-engineer` | the current schema through the database connector; Build pivot sections 4, 5, 6 and rules S7 to S10, S15, S16; the database connector's reference in `pos-tool-conventions` |
| `backend-dev` | the existing routes of the same area; the route wrapper, the auth helper and the LLM abstraction (Build pivot sections 3 and 9); rules S1 to S10 and S14; the AI rules when it touches an LLM call |
| `frontend-dev` | **the design system file** (mandatory, Build pivot section 8); the existing equivalent components; rules S11 to S14; the front-end traps file when the memory index names one |
| `qa-engineer` | rules T1 to T6 and Build pivot section 10; the existing tests of the area |
| `devsecops` | Build pivot section 7 and rules S2, S8, S10, S14, S15; the deploy reference memory when the memory index names one |
| `ai-engineer` | the AI rules in full, the change protocol first (AI13); Build pivot section 9; the LLM abstraction and the injected constraints it names; the current prompt in full |

Every brief also carries: the target working copy (rule 3), the files that are the agent's own, the
consumers of any shared function it touches (rule 11), the test space, and one line "LIVE <resource>
FORBIDDEN" for each live resource the agent could reach (rule 38).

## Principles

1. **Read before coding.** The session explores first; it does not delegate the reading.
2. **Reuse what exists.** Adapt a component or a pattern before inventing one (rule 4).
3. **No quick fix.** Fix at the source (rule 18).
4. **No over-engineering.** Build what is asked, nothing hypothetical.
5. **Product coherence.** Each feature fits the product; it is not an island.
6. **The session stays awake.** Orchestration is never delegated to a sub-agent that sleeps.

## How it fits

| Skill | When | Relation |
|---|---|---|
| Discovery module | before: a spec | its spec is the input of `pos-dev` |
| `pos-build` | before: sizing | runs `pos-dev` at tier FEATURE |
| `pos-dev` | during: implementation | this skill |
| `pos-check-rls` | during: an access-policy check | used by `db-engineer` |
| `pos-post-impl-checklist` | after each step | the gates of Step 5 |
| `pos-audit` | after: security, performance, interface | inspects what `pos-dev` produced |

## Conventions

- **Language:** the owner is addressed in `product.team_language`; code is in English.
- **Commits:** named files only (rule 28), in the scope of Build pivot section 11. Commit freely once
  the work type-checks; push only on an explicit go (rule 27).
