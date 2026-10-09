---
name: pos-audit
description: >
  Run a full audit of the product's codebase. The main session acts as the audit orchestrator and
  coordinates seven specialised auditors directly (Security, Performance, Tests, UI Consistency, AI
  Agents, Code Quality, Architecture & Observability), always on the deployed reference, then
  produces one consolidated report with prioritised findings and an action plan. Use when someone
  wants to audit the code, check quality, prepare a release, or says "audit", "check the code", "is
  it clean", "code quality", "global review", "/pos-audit".
---

# Audit

## Why this skill exists

A quality audit covers seven independent axes (security, performance, tests, UI, AI quality, code
quality, architecture and observability compliance), each needing a different expertise. One agent
cannot cover them all in depth. This skill has **the main session itself** orchestrate seven auditors
in parallel, then consolidate their reports into one prioritised action plan.

Rule numbers refer to the collaboration rules of `pos-core` (`core/rules/collaboration.md`),
principles to its working principles. They are not repeated here. `<main>` below is
`git.main_branch`.

## Architectural principle: the main session is the audit orchestrator

**The main session orchestrates directly** (principle 1). It spawns the seven auditors, receives
their reports, consolidates, prioritises, delivers. No orchestrator sub-agent.

## The seven auditors

| Agent | Role | Model (default) |
|---|---|---|
| `audit-security` | OWASP Top 10, auth, row-level security, XSS, headers | **opus** |
| `audit-performance` | Bundle, queries, front-end patterns, API | sonnet |
| `audit-tests` | Coverage, quality, critical zones | sonnet |
| `audit-ui` | Consistency with the design system, UI language | sonnet |
| `audit-ai` | Prompts, temperature, tool choice, tool config, anti-hallucination, compliance | **opus** |
| `audit-code-quality` | Dead code, refactoring candidates, duplication (reuse and unicity), inconsistencies | sonnet |
| `audit-architecture` | Multi-tenant isolation (LLM context included), realtime, API conventions, server/client, logging | **opus** |

All seven are agents of this plugin.

### Model tiering: delegate the mechanical, keep judgement high

Cost is not uniform. Three axes are **reasoning** (security exploit chains, multi-tenant isolation,
prompt design quality) where a false negative is expensive: **opus**. Four are mostly **sweeping and
patterns** (test inventory, design system lint, dead code search, queries and bundle) where sonnet is
enough: **sonnet**. `effort: high` by default on all seven (an audit's accuracy comes first); the
consolidation runs on the session's model.

**Overrides the owner may ask for:** "audit in opus everywhere" (more expensive, maximum recall on
every axis); "one axis in fable" for a single very hard pass. Beware: the cyber classifier of that
model may refuse the Security axis (a false positive on OWASP content); keep it for the non-security
axes. A model given as an argument (for example "/pos-audit opus") wins over this table.

## Step 0: read, then choose the audit base (mandatory before spawning)

### Read

1. **The product config:** `git.main_branch`, `modules.*`, `product.ai_agents`, `product.ui_language`,
   `product.team_language`, `databases.fix_backlog`, `pivots.dir`, `memory.*`.
2. **The build pivot,** `<pivots.dir>/product_build_context.md`: the stack, the key paths, the API
   conventions, multi-tenancy, permissions, security, UI states, performance, the AI agent rules,
   and the name of the design system file. It is what the auditors read in place of any value
   written in this skill.
3. **The memory index** and every file in `memory.always`.

### Choose the base

An audit is only worth its base. **The reference code is `origin/<main>`** (principle 7). Never audit
the current branch blindly: it may be stale and/or full of uncommitted work, which produces false
findings (files moved since, or local scratch files absent from production).

Before Step 1, check:

```
git -C <repo> fetch origin --quiet
git -C <repo> rev-list --left-right --count origin/<main>...HEAD   # left = behind, right = ahead
git -C <repo> status --porcelain | wc -l                           # uncommitted files
```

- **Branch level and clean** (behind about 0, little uncommitted): audit the current branch.
- **Stale branch (behind more than a few commits) OR dirty working tree (dozens of uncommitted
  files):** **do NOT** check out `<main>` (risk of losing work in progress, rule 28). Create a **clean
  worktree on `origin/<main>`** and point the seven auditors at it (absolute path of the worktree in
  every prompt). Remove the worktree afterwards (rule 42).
- If the owner explicitly wants a specific branch or pull request audited (for example before a
  merge), audit that one, and say so.

**Always tell the owner which base (branch and commit) the audit ran on,** in the final report.

## Step 1: spawn the seven auditors in parallel

In **one single message** with seven agent calls (rule 36). Pass `model` per the tiering above (unless
the owner overrides), and restate in each prompt **the audit base decided at Step 0** (the worktree
path when auditing `origin/<main>`), the path of the build pivot and of the design system file, and
the language to report in (`product.team_language`):

```
Agent(subagent_type: "audit-security",     model: "opus",   prompt: "[base + audit scope]")
Agent(subagent_type: "audit-architecture", model: "opus",   prompt: "[same]")
Agent(subagent_type: "audit-ai",           model: "opus",   prompt: "[same]")
Agent(subagent_type: "audit-performance",  model: "sonnet", prompt: "[same]")
Agent(subagent_type: "audit-tests",        model: "sonnet", prompt: "[same]")
Agent(subagent_type: "audit-ui",           model: "sonnet", prompt: "[same]")
Agent(subagent_type: "audit-code-quality", model: "sonnet", prompt: "[same]")
```

## Step 2: consolidation (main session)

The main session receives the seven reports and consolidates them into one report:

- **Executive summary** (findings by severity CRITICAL / WARNING / INFO)
- **Top 10 priority actions** (all axes combined)
- **Detail by axis** (security / performance / tests / UI / AI / code quality / architecture and
  observability)
- **Action plan in waves** (security first, then performance and UI, then tests)

## Step 3: present the result

Present the consolidated report to the owner. STOP. Wait for the owner's decision.

**Findings not handled at once** go to the fix backlog through the `pos-fix-backlog` skill of the
`pos-support` plugin ("File an entry", `Source` = `Audit`), never left in the conversation
(principle 8).

## Modes

### Mode 1: full audit (default)

Launches the seven auditors. Takes 5 to 10 minutes. Exhaustive report.

### Mode 2: targeted audit

If the request names one axis ("security audit", "perf audit"), launch ONLY that auditor and produce
a single-axis report.

### Mode 3: audit and fix

If the request is "audit and fix", chain:

1. Audit phase (as Mode 1).
2. Fix phase: the Build module's build skill implements the corrections wave by wave (security
   first).

## When something is missing

Say it in one line, continue with what exists, and never invent what the missing piece would have
brought (principle 10).

| Missing | What the audit does |
|---|---|
| the build pivot, or one of its parts | names it; the auditors read the product's `CLAUDE.md` and the memory index for the same conventions, and flag every check they could not ground |
| the design system file | `audit-ui` reports only on what the code itself makes consistent or not, and says it had no reference |
| `product.ai_agents` false | `audit-ai` is not spawned; the report says "no product AI agents" |
| `pos-support` not installed, or `databases.fix_backlog` empty | untreated findings go into the handoff (core `pos-handoff`) instead of the backlog |
| `modules.build` false (Mode 3) | the main session does the fixes itself, wave by wave, and says so |

## Conventions

- Report in `product.team_language`.
- Act, do not ask, when the correction is obvious (rule 14).
- Never a client, institution or person name in a report (rule 41).
