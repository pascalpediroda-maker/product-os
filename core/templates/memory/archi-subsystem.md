# Template: subsystem architecture file

Skeleton version 1, maintained by `pos-core`.

**Use.** Copy everything below the separation line into `<memory.dir>/archi-<subsystem>.md`, fill
it, add its line to `<memory.index>`, and list it under its zone in `routing.zones`. The new file
starts with its front matter and belongs entirely to the product. Everything above the line is
guidance, which an OS update may change.

## What this file is for

An archi file tells the next session that must change a subsystem how it is built: what runs, in
what order, reading what, writing where, and what already went wrong. It answers "how is feature X
built in our code". Knowledge that is not our internal architecture (the domain, stack conventions,
gotchas, design rules, catalogues) goes to a `reference_<topic>.md` file instead.

## How to write it

- **Read the code before writing a line.** Every claim about behaviour cites the file, and the
  function, that proves it. A claim you could not verify is marked "unverified".
- **Say where you verified**: the remote main branch (`origin/<git.main_branch>`) at a commit, or a
  named branch. Keep deployed state and work in progress apart, and say which one each paragraph
  describes.
- **Describe the real shape, not the intended one.** When a plan and the code differ, the code wins
  and the plan is linked.
- **Pitfalls are measured, not guessed**: what happened, how it showed up, how to detect it, what to
  do. Put the costliest first. This section exists because sessions lose hours for want of it.
- **Generic incidents only**: no client names, no client content, no personal data.
- **Links, not copies.** An external rule lives in its `reference_` file, a decision record in its
  plan, the domain in the domain pivot (`pivots.domain`). Link to them.
- **Rewrite, don't append.** When the design changes, update the section it changes and delete what
  became false. A later section that contradicts an earlier one misleads the next reader. Keep a
  "superseded" note, with its date, only while the old behaviour still runs somewhere.
- **Re-date on every check.** Update `verified_in_code` here and the date of the file's line in the
  index each time you check the file against the code.
- **Never link to the assistant's auto-memory.** Versioned memory never points to local memory.

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

---
name: <Subsystem> architecture
description: <What the subsystem does, in one sentence. Then when to read this file, e.g. "Read before any change to the export pipeline or its templates.">
metadata:
  type: archi
  zone: <the key of routing.zones that lists this file>
  verified_in_code: <YYYY-MM-DD>, origin/<git.main_branch> at <commit>
---

# <Subsystem>: architecture

**Verified in code on <YYYY-MM-DD>**, against `origin/<git.main_branch>` at `<commit>`.

## What it is

<!-- The feature in functional terms, one paragraph: what the user does, what the system produces,
where it shows up in the product. -->

## Entry points

<!-- Every way into the subsystem: routes, background jobs and workers, scheduled tasks, UI surfaces,
commands and scripts. One row each, with the file that implements it. -->

| Entry point | Kind | File | Notes |
|---|---|---|---|
| | route / job / worker / schedule / UI / script | | |

## Data flow

<!-- What runs when the user does X, in order. For each step: what it reads, what it writes, what it
calls (a service, a model, another subsystem), and where it can fail. Mark each step as deterministic
code or AI call. -->

1. <!-- step: reads, writes, calls -->
2.
3.

## Data model

<!-- Tables or stores, what each holds, who writes it, who reads it, and its access rules (tenant
scoping, row-level policies). Name the columns that carry state (status, timestamps, heartbeats). -->

## Configuration

<!-- Where the configuration of this subsystem lives, who writes it (a skill, an admin screen, a
script), and the type or interface of the code that consumes it. Hand-written configuration conforms
to that interface field by field. Name the registries that resolve identifiers (agents, checks). -->

## Invariants

<!-- What must stay true, one line each, with the test, hook or check that locks it, if any.
Example shape: "Exactly one X per Y: the resolver returns the first match (file:function). Locked by
<test>." -->

## Pitfalls

<!-- Dated and measured. One block each:
- What happened (generic).
- How it showed up (the symptom a user or a session sees).
- How to detect it (a query, a log line, a command).
- What to do.
Costliest first. -->

## Deployed vs in progress

<!-- What production runs today, verified on origin/<git.main_branch> on <date>. What is built on a
branch, committed but not pushed, or waiting for a switch of stored configuration, and the order in
which it must ship (for example: deploy the reader before switching the stored prompt). -->

## Decisions and rejected options

<!-- Choices made, with the reason. What was tried and reverted, with the measure that decided, so
that nobody retries it blind. -->

## Instruments

<!-- The scripts, benchmarks, traces and queries used to check or measure this subsystem, how to run
them, and whether they are faithful to production (same inputs, same context). -->

## Related

<!-- Links to other archi-* and reference_* files in memory.dir, and to plans. Never to the
assistant's auto-memory. -->
