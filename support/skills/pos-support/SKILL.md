---
name: pos-support
description: >
  The support router: a session about one customer signal starts here. Handles a customer report, a
  bug, a user who is stuck, a help center gap or an outdated article, an AI agent of the product that
  drifts, or the tuning of an existing agent. Loads only what support needs (the Support pivot, the
  fix backlog, the memory of the area the signal touches, and the Notion, product database, analytics
  and Gmail connectors), triages the exact scope, routes to the right specialist (a targeted AI or
  security audit, front-end, back-end, database, AI engineer, QA) or to `pos-kb-article`, and follows
  RED -> GREEN -> REFACTOR (reproduce, fix at the root, leave a regression test). A bug not fixed now
  goes to the fix backlog through `pos-fix-backlog`, emptied later by `pos-bug-kill`. A missing
  function is not support: it goes to the build. Never a full audit. Use when someone says "I have a
  customer report", "this bug...", "a user is stuck", "agent X drifts", "the help article on Y is
  missing", "tune agent Z", "/pos-support".
---

# Support

## What this skill loads, and what it does not

A support session handles one signal. It loads what that signal needs and nothing more, so the
context stays on the problem.

| Loads | Does not load |
|---|---|
| the product config and `memory.always` | the other function pivots (discovery, marketing, release), unless the signal is about them |
| the Support pivot, `<pivots.dir>/product_support_context.md`, all of it | the whole memory: only the files `routing.zones` lists for the area the signal touches (Support pivot section 3) |
| the fix backlog (`databases.fix_backlog`), through `pos-fix-backlog` | the roadmap and the CRM, except the CRM record of the customer to notify |
| the memory of the area the signal touches, once | a full audit, the build workflow of a feature |
| the connectors: Notion, the product's database (Supabase), analytics (Amplitude), Gmail. Each through its `pos-tool-conventions` reference, before its first call | the domain pivot, except its glossary when an AI output confuses two terms of the trade |

## The Support family

| Skill or agent | When | Relation to this skill |
|---|---|---|
| `pos-support` | one signal: a report, a bug, a stuck user, a drift, a tuning, a help center gap | this skill: triage, then RED -> GREEN -> REFACTOR |
| `pos-fix-backlog` | a bug not fixed now | called by this skill; its "File an entry" and "Move and close an entry" are the contract for every backlog write here |
| `pos-bug-kill` | empty the backlog in batches into a minor fix release | takes over what this skill files |
| `pos-kb-article` | an article missing or outdated, or the help content of a fix a user can see | called by this skill |
| `pos-user-activity-report` | who signed up lately and how they use the product | same sources (database and analytics), another purpose |
| The build agents, when the Build module (`pos-build`) is installed | the fix itself | `frontend-dev`, `backend-dev`, `db-engineer`, `ai-engineer`, with `qa-engineer` for the test; `audit-ai` and `audit-security` in targeted mode (the Assurance module). When the session offers no agent of a role, the session does the work itself and says so |
| The Build module's build skill (`pos-build`) | a missing function, an evolution, an L | receives what is not support |

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles.
They are not repeated here. Sections of the Support pivot are cited by number: 1 Channels, 2 In-app
reports, 3 Areas, 4 The team, 5 Customers to notify, 6 Priority rule, 7 Fix releases, 8 Test space,
9 Help center, 10 Activity. `<main>` is `git.main_branch`. `<prefix>-n` is a fix backlog entry's ID,
with this product's prefix (section 3).

## Role

**Keep the product's operational quality in production:** fix the bugs users report, adjust the AI
agents that drift or invent, tune existing prompts when a behaviour has become sub-optimal, update the
help content when it is outdated or incomplete.

For each signal: **reproduce before fixing** (RED), **fix at the root** without patching the symptom
(GREEN), **prevent the regression** with a test or an evaluation (REFACTOR). Pick the right specialist
for the exact scope; never over-orchestrate.

**Support fixes the SaaS product; it does not tinker with an account.** A blocked user is the symptom
of a missing path. Unblocking happens THROUGH the product fixed (or through an existing product path,
for example an invitation link), never through a hand-written insert or update on their account.
Manual SQL is not a support proposal. **Exception: an operation the owner explicitly hands over**
(preparing a space for a prospect, attaching someone) is done directly, in the database when the
screen does not allow it, without sending the owner back to the interface. A customer's space still
needs the owner's go before any write (rule 32).

**Support puts the user back in working order, not only the data.** Every data fix for a given user
comes with what they will see at their next sign-in (where they land, how they switch) and the
message to send them (and to their colleague when it is a team story). A row added to the database
that leaves the user lost is not a fix.

**A bug not fixed now never stays in the conversation.** It goes to the fix backlog through
`pos-fix-backlog`, with enough to pick it up without rediscovering it. A bug noted in a thread or in a
todo is a bug lost. An entry being fixed here stays `In progress` with `Commit` filled once committed;
it moves to `Released` with its `Version` once live, then the customer in `Customer to notify` gets a
draft message. The commit message cites `<prefix>-n`.

---

## Step 0 (blocking): load memory before anything

**The first action of every support session, without exception.** No search and no read of the code
before the files below are read. The code only CONFIRMS a hypothesis born from memory, never steers
the triage: memory already documents the architecture, the rails, the entry points and the routine
operations, so searching the code first means re-deriving (often wrongly) what is written.

> **Bypass detection:** if your very first action on a support signal is a search or a read of the
> source code instead of a read of `memory.dir`, you are bypassing this skill. Stop, come back here,
> load memory, then announce Checkpoint 0.

- **Always:** the product config, the memory index and every file in `memory.always`, the Support
  pivot.
- **The area the signal touches:** the files `routing.zones` lists for the zone or zones section 3
  gives that area, and the area rule of section 3.
- **The signal touches the evaluation or the quality of an AI output** (a score judged too low or too
  high, a false remark, a gap not detected, comments that repeat, a comparison with another tool):
  read the evaluation bench reference that the area's memory names BEFORE any hypothesis. It says how
  it is measured (the bench, three runs at least, the traces), on what (the test corpus already
  loaded, with its IDs), and what has already been refuted. Two sessions in a row reopened such a
  subject without knowing the bench existed.
- **The signal comes from the fix backlog** (`<prefix>-n`): fetch the entry in full (reproduction,
  source, customer to notify, its page body) before the triage.
- **The signal is about a real user's journey** (sign-up, onboarding, invitation, "they did X", a
  user lost, engagement): read section 10 and the analytics memory the index names (what is in the
  analytics, what is in the database), and **read the analytics timeline** of each user concerned
  (Step 2). The database alone does not see navigation.
- **Help center gap:** follow `pos-kb-article` (the work center is the page section 9 names).
- **Tests:** the end-to-end testing memory the index names.
- **Drift or tuning of an AI agent of the product** (an assistant, its tools, its stream route, a
  pipeline of agents): the product's AI change protocol and the references it cites, plus the memory
  of that agent. **Delegation to the AI engineer role is mandatory** on this zone; no direct fix by
  the main session unless the owner explicitly shortcuts it.

## Step 1: triage (decide the exact scope)

Announce the triage to the owner BEFORE starting. The possible cases:

| Case | Symptom | Who |
|---|---|---|
| **UI code bug** | a button with no effect, a broken view, a dialog that does not open, a route that fails | `frontend-dev` + `qa-engineer` (or `backend-dev` depending on the zone) |
| **Data, row-level security or migration bug** | missing rows, a policy that blocks, a failed migration | `db-engineer` + `qa-engineer` |
| **Suspected security bug on one route** | a permission that seems to leak, data visible across tenants | `audit-security` in targeted mode (one file, never the whole codebase), then `backend-dev` + `qa-engineer` for the fix |
| **AI agent drift** | wrong output, invented content, a broken format, divergence from the ground truth | `audit-ai` in targeted mode (one agent, not all), then `ai-engineer` + `qa-engineer` |
| **Tuning of an existing agent** | the owner already knows what to change (a setting, a wording, a tool) | `ai-engineer` + `qa-engineer` directly, no audit first |
| **Help center gap or outdated article** | an article missing, information out of date, a broken screenshot | `pos-kb-article` directly, **no dev team** |

**A missing function is not support.** When the signal comes down to "a field, a link, a button, a
relation between elements or a screen is missing", it is not a bug but an evolution: it goes to the
build (`pos-build`, with a mockup, the owner's go, then code). Support fixes what existed and broke.
Observed: missing links between three kinds of elements were handled here as a fix, shipped without a
mockup, with a grey "+", a field of the detailed level visible at the overview level, no creation
button and no explanation. Test: **did it ever work?** If not, it is not support. Without the Delivery
module, file it with `pos-fix-backlog` as `Requalified dev`, its analysis and the prompt for its build
session in the page body.

**Every fix that touches a screen passes the UI gate:** a table element / neighbouring screen / gap,
every state rendered and opened (rules 4 and 10; the interface gate of `pos-post-impl-checklist` when
the build plugin is installed). The
brief to `frontend-dev` names the neighbouring screens to mirror (`file:line`) and forbids any
component, mode or size they do not use.

**When the owner decides not to fix now** (or the bug is outside the session's scope): file the entry
with `pos-fix-backlog`, give the owner its title, `<prefix>-n` and its link, and stop there for that
bug.

## Step 2: RED, reproduce (the owner agrees)

- **A user's journey in production:** rebuild the real journey by crossing **three sources**, and cite
  the source of each fact:
  1. **Analytics** (`pos-tool-conventions`, Amplitude reference): the user's timeline with event
     properties, project `analytics.project_id`, the user identified by the product's user id (the
     join key of section 10), never by email. It gives the exact URLs (page location, the redirect
     parameter, the referrer), the clicks, the client events. A large output is summarised by script
     (the automatic SDK events dropped, sorted by time).
  2. **The server event log and the sessions** (section 10): sign-in, confirmation, space created,
     invitation sent.
  3. **The business tables:** the current state (members, projects, what they follow).
  Limit: client events may fire only in production and are dropped by ad blockers (section 10, the
  analytics memory). An empty timeline is not inactivity.
- **An incident or a load bug** (bursts of requests, a client loop, a saturated database): RED does not
  stop at "the mechanism exists". Three deliverables, all three before proposing GREEN. Observed: a RED
  was handed back without the last two, and the owner found them.
  1. **The trigger:** what starts the first cycle, measured in the logs (with Supabase: the edge logs
     by user, by IP, by minute; the realtime logs; the database logs) or by a bench that isolates one
     factor at a time. The mechanism that amplifies is not the cause. When the trigger is not proven,
     the report opens on what is proven, what is not, the measurement that remains and what the
     missing hypothesis would cost. Watch the attributions: a realtime socket opening is anonymous in
     the edge logs (no user, only the IP), and a development behaviour (a framework that mounts twice
     in development) is not production's.
  2. **The scaling figure:** the formula written (requests per cycle x cycles per minute x tabs x
     users), the inputs measured, the saturation threshold observed in the incident, the result for 1,
     2, then N tabs and users.
  3. **The entry's requirements:** reread the backlog entry's body, the handoff it cites and the
     owner's remarks; draw the table requirement x state (handled, deferred with its reason, open) and
     open the report with it. An architecture track the owner set is costed next to the guards, with a
     recommendation, at RED.
- **Code bug:** reproduce locally, with an end-to-end test when possible (a test that fails before the
  fix).
- **Data bug:** reproduce through SQL or the UI; capture the row state before and after.
- **Security bug:** reproduce the inappropriate access, or prove it impossible.
- **AI agent drift:** capture the wrong output with its real inputs. Cross-diff the ground truth
  between units that share the agent when it applies.
- **Tuning:** write the expected output against the current one.
- **Help center gap:** skip RED.
- **Where:** the test space and test copies of section 8, never a customer's space, never a reference
  or an imported item (rules 32 and 33). Probe the dev server; ask before starting one (rule 8).

**Checkpoint 1 (non-negotiable): the owner agrees "reproduction validated" before GREEN starts.** The
RED report opens on the table of the entry's requirements (handled, deferred with its reason, open):
never ask to validate a RED that misses one of the entry's requirements.

## Step 3: GREEN, a targeted fix at the root

- **An up-to-date base first.** The fix must land cleanly on `origin/<main>`. `git fetch origin`, then
  check that the current branch is not behind (more than a few commits) or too dirty; otherwise start
  again from a fresh base (rebase, or a new branch or worktree from `origin/<main>`), **never a
  destructive checkout on a dirty working tree** (rules 3, 28). Never code a fix on a stale branch
  that will diverge again.
- Spawn the agents chosen at Step 1, with a brief that carries what they cannot know (rule 38).
- **Fix at the root, not on the surface.** RED revealed the real cause; GREEN fixes it where it lives
  (rule 18). If you are tempted to short-circuit (a try/catch that swallows, a default value that
  masks, a condition that routes around), it is a red flag: reread RED and find what makes the bug
  appear upstream.
- **A data fix for a user:** reproduce the same writes as the product's own path (joining a space =
  what the product's join does), then check in the code what they will see next (where they land at
  sign-in, how they switch spaces), and deliver the message to send them. A customer's space: the
  owner's explicit go before any write (rule 32).
- **A bug met on the way, outside the scope:** an entry with `pos-fix-backlog` (`Source` =
  `Dev session`), never an opportunistic fix that grows the diff.
- **Verify each delivery, non-negotiable** (rule 37): open every file the agent delivered and check it
  item by item against the brief.

## Step 4: REFACTOR, the regression test

- **Code bug:** an end-to-end test added for the bug's scenario. It must fail before the fix and pass
  after.
- **Data bug:** an SQL test or a seed snapshot.
- **AI agent drift:** an evaluation added (a judge on each item of a list, not a string match). Check
  for no regression on the other units that share the agent (rule 11).
- **Tuning:** an evaluation added for the target output.
- **Help center gap:** the screenshot captured and looked at, the AI's copy re-ingested
  (`pos-kb-article`).
- **The bug came from the fix backlog:** update the entry (`Status` stays `In progress`, `Commit`
  filled) and cite `<prefix>-n` in the commit message (`pos-fix-backlog`, "Move and close an entry").

## Step 5: after the fix

`pos-post-impl-checklist` when the build plugin is installed: its gates, in full. Otherwise, in this
order:

- **Tests and checks run:** type-check, lint, the area's tests, what ran and with what result.
- **For the owner to test:** a bug a user can see gets the URL, the flow and the expected behaviour.
  Back-end or AI only: say so and continue.
- **Help content:** a fix with a visible effect (a dialog that finally works, a status now shown)
  updates the help content through `pos-kb-article`.
- **Before asking for a push or writing to production, the risk card:** for each change, the benefit
  proven, the plausible worst case, how it would be detected, how it is rolled back. A migration that
  changes what exists (rights, policies, the functions the policies use) is never slipped into the go
  of a code batch.
- **Commits:** named files only (rule 28), local, cite `<prefix>-n`.
- **The final report,** status first, in the owner's terms (rules 22, 23), then wait for the owner's QA.

## Checkpoints

0. **Memory loaded** (Step 0): announce to the owner the EXACT list of files read, BEFORE the triage.
   If the first action was a search or a read of the code, Checkpoint 0 is missed: say so and correct.
1. **Triage announced:** the owner validates the case and the agents, or decides to file the bug in the
   fix backlog.
2. **Reproduction validated** (RED): the owner agrees before GREEN.
3. **Each delivery verified** after each agent: open the delivered files and check them item by item
   against the brief.
4. **Before the push:** the risk card, and the owner's explicit QA and go (rule 27).

## DO

### Triage and reproduction

- **Reproduce BEFORE coding.** Without a reproduction, a fix patches a symptom. RED is
  non-negotiable.
- **Check the documented architecture BEFORE "fixing" a pattern.** When a bug touches a structuring
  decision, search memory and the handoffs to understand the intent. If it is documented and goes
  against your instinct, the bug is in the IMPLEMENTATION, not in the architecture.
- **Read the existing agent prompts** before changing them: the system prompt, the user prompt
  template, the callers and the consumers. Inventing means a regression.

### Quality of AI agents

- **A judge on each item of a list**, not a string match.
- **Cross-diff the ground truth between units** before closing an agent fix. Classify each divergence
  "by nature" (fine) or "by omission" (to fill).
- **Never truncate a source extraction.** Always capture a section whole, from its heading to the
  next. No arbitrary slice.
- **Anti-invention guards:** a low temperature (0.30 at most), explicit no-fabrication instructions,
  grounding on real sources.
- **Compliance check on agents:** the product's rules for what an agent writes (language, names it
  must never show, output format), from the AI change protocol in memory.
- **Agents that reason about the product** are grounded systematically on the real code and the
  architecture memory before reasoning.

### The trade's definitions

- **The official definitions of the trade are not interchangeable.** When an AI output confuses two
  terms of the trade, the glossary of the domain pivot (`pivots.domain`) is the reference, including
  the relabelling a unit applies.
- **What the domain pivot calls the backbone of a unit** is never degraded quietly: a degradation is
  escalated to the owner first, never "to review later".

### Workflow

- **Trace the customer report** so the owner can answer after the fix (`Customer to notify` when the
  bug goes through the fix backlog).
- **Run Step 5** at the end of each fix.
- **Act when the fix is obvious** (a typo the owner flagged, a visible regression).

## DON'T

### Orchestration

- **Run a full audit** for a targeted fix. Seven auditors in parallel are oversized. Choose the
  specialist directly (`audit-ai` OR `audit-security` OR another, depending on the scope). The full
  audit stays for cross-cutting audits, not support.
- **Spawn a whole build team** for a single-component bug. One or two agents are enough.

### AI-specific

- **Change an AI agent of the product without reading the AI change protocol** and without delegating
  to `ai-engineer`. The protocol's anti-patterns are forbidden: keyword matching for intent, prompt
  bloat, a tool choice forced per view, magic strings, a field renamed without tracing its consumers.
- **Change an AI agent without a dedicated QA.** AI regressions are silent: an evaluation that does not
  detect the drift is a fix that breaks in production without a signal.
- **Invent a schema, a ground truth or a format** without reading the existing agent and its
  consumers.
- **Confuse two agents with distinct architectures** (for example an assistant scoped to the user's
  space and an assistant scoped to one project, with its agents per view): never apply a fix meant for
  one to the other. Memory says which is which.
- **Truncate** a section extraction to fit a token budget. Capture the whole section.
- **Patch an agent's output downstream with a regex or a string clean-up** instead of fixing the
  prompt. Wrong format or content means a prompt fix (delegated to `ai-engineer`), never a front-end
  post-processing that compensates for the model (fragile, non-deterministic, debt).

### General

- **Leave a bug only in the conversation or in a todo.** It goes to the fix backlog, or it is fixed.
- **Assert an absence from a count of zero.** A row deleted for good leaves no trace; a client event
  can be missing (ad blockers). Every statement about what a user did or did not do cites its source
  (analytics, server event log, table) and crosses at least two sources before it is written as a
  fact.
- **Deliver a data fix without the path that follows** (where the user lands, how they switch, which
  message to send).
- **A quick patch rather than a clean architecture.** A bug that reveals a design problem is fixed at
  the design level, not with a wart. "Is this the right layer to solve it?"
- **Search or read the code BEFORE** loading memory (Step 0) and announcing Checkpoint 0. For a routine
  operation (re-running a pipeline, refreshing a sync), memory already gives the how; going through the
  code means re-deriving the documented architecture.
- **Push** before the owner's QA.
- **Fix and forget:** always note the answer to give the customer.
- **Give yourself the go** after a constraint the owner set.
- **Trust an agent's report** as proof of delivery. Verify each delivery.
- **Skip RED.** Without a reproduction, the fix is cosmetic.
- **Ship a screen without the UI gate:** "the design system was read" is not proof; the comparison
  table with the neighbouring screens is.
- **Treat a missing function as a fix:** a field, a link, a button or a screen to add goes to the
  build, with a mockup.
- **Widen a fix beyond its bug** without a benefit proven for a user ("while we are at it", "for
  consistency"). Observed: a Minor became a migration on dozens of database functions and made an
  outage worse. A useful widening is a separate entry in the fix backlog.
- **Ask for a push without the risk card,** or apply to production before the go a migration that
  changes what exists (rights, policies, the functions the policies use).
- **Ask the owner's go to improve this skill, a brief or an agent's prompt:** do it and say so.

## When something is missing

Say it in one line, continue with what exists, and never invent what the missing piece would have
brought (principle 10).

| Missing | What this skill does |
|---|---|
| `databases.fix_backlog` empty | a deferred bug goes into a handoff (`pos-fix-backlog`, "When the base is not configured"), and the creation of the base is offered |
| the Support pivot, or one of its sections | names the section, runs what does not need it, asks the owner only what a step cannot go without (the test space) |
| `analytics.project_id` empty, or section 10 empty | the journey is rebuilt from the sources that exist, and the report says which source is missing |
| `modules.build` false, or no agent of a role | the main session does the fix and says so; a missing function is filed as `Requalified dev` |
| no `pos-post-impl-checklist` | Step 5 runs from this skill; the regression test stays with the fix |
| no Gmail tool | the message to the customer is given as text in the report |

## Conventions

- **Language:** the owner is addressed in `product.team_language`; code, the UI (`product.ui_language`)
  and the structure of the shared bases in English.
- **Commits:** named files only, within the commit scope and branch policy of the product's
  `CLAUDE.md`. A commit that fixes a backlog entry cites `<prefix>-n`.
- **Dev server:** the port and how it is started are in section 8. Don't stop a running server without
  a reason.
- **Evidence:** the folder named in `CLAUDE.md`, one dated subfolder per topic (rule 25).
