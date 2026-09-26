---
name: debug
description: Investigate and fix something that is reported broken — a bug, a wrong output, a regression, a user complaint. Reproduces before touching code, fixes the cause rather than the symptom, and adds the regression test. Use when something already exists and misbehaves; use /implement when something does not exist yet.
---

# Debug

**RED → GREEN → REFACTOR.** The order is the whole skill. Most of the cost of a bad fix comes
from having started at GREEN.

---

## Step 0 — Load the memory first

Before a single search through the code. This is the step that gets skipped, so notice yourself
skipping it: if you are already grepping and you have not read the project's memory for this
zone, you have bypassed it.

Read what `/orient` says to read, for the zone the report points at.

## Step 1 — Triage

Name the kind of failure before choosing a tool. They do not have the same shape and they do not
have the same specialist:

| Kind | Looks like | Who |
|---|---|---|
| Interface | wrong render, broken layout, stale display | `frontend-dev` |
| Data or access | empty result, forbidden, a write that does not stick | `db-engineer`, and check the access policies in **both** directions |
| Security | something visible that should not be | `audit-security` in targeted mode, then `backend-dev` |
| Model behaviour | wrong output from an AI step, drift, invention | `audit-ai`, then `ai-engineer` |
| Not a bug | expected behaviour, misread documentation | say so, and say what misled them |

`/audit` and the full `/implement` team are **oversized for a bug**. Do not reach for them.

---

## Step 2 — RED: reproduce

**Nothing gets edited before the failure is reproduced.** This is a checkpoint, not a
recommendation.

- Reproduce it yourself, in the same conditions. Not an approximation of them.
- If it cannot be reproduced, say exactly that, say what you tried, and ask for the missing
  piece. A fix applied to a bug you have not seen is a guess wearing a commit message.
- For anything that crosses a tool or an API boundary: **log the exact arguments** that were
  passed. The defect is almost always in the arguments, not in the infrastructure.
- For anything visual: render it and **look at it**. A passing type-check proves nothing about a
  page.

> A layout was delivered as "verified" on a green compiler and a careful reading of the
> components. The reviewer sent back screenshots showing three regressions. Later, on the same
> project: nine screenshots taken, three looked at, all nine sent — and the one that was not
> looked at had text overlapping. **Every screenshot you send is a screenshot you looked at.**

---

## Step 3 — GREEN: fix the cause

Check the working base first (see `/implement`, step 0.5), then fix.

**Go up to the mechanism that produces the whole family of symptoms**, not to the instance that
was reported. The tell that you have not found it yet: your fix is a time window, a heuristic
comparison, a swallowed exception, a regular expression that catches the bad output, or "each
caller handles it".

> A duplicate-event defect was first addressed with a fifteen-second de-duplication window. The
> actual cause was that every call site kept its own copy of the state, its own timer and its own
> writes. The fix was one shared layer, and the window disappeared with the problem.

If the same logic exists in several places, that is the finding — not the bug that happened to
surface in one of them.

---

## Step 4 — REFACTOR: leave the test behind

A fix without a test is a fix that will be made again. Add the smallest thing that fails before
and passes after, and put it where it runs on its own.

**And ask whether the lesson deserves to move up a rung.** If it could recur elsewhere in the
codebase, a test on this one call site is not enough — a lint rule, a hook, or a check in the
build will catch the next one. That is the whole point of this plugin.

---

## Step 5 — Close it with the person who reported it

The `Stop` hook covers the mechanical gates. Two things remain, and they are yours:

- **What to tell whoever reported it** — in their words, not in the vocabulary of the fix, and
  without an apology that invents a cause you have not established.
- **What is still open.** A fix that resolved the report but left a doubt is a fix with a doubt.
  Say it now, not in three weeks.

**Never "fix and forget".** The report is not closed by the commit; it is closed by the answer.
