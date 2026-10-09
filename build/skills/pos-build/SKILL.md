---
name: pos-build
description: >
  The build router: a session that builds starts here. Implements a feature, an evolution or a change
  the owner decided, at a tier sized to the scope (TRIVIAL: the session does it directly; MINI: one or
  two specialist agents; FEATURE: the full team through pos-dev). Loads only the Build pivot, the
  memory zones the request touches and the build connectors (the database and the deploy connector).
  Reads before it asks, works from an up-to-date base, verifies every agent delivery, runs
  pos-post-impl-checklist, commits locally, waits for the owner's QA and pushes only on an explicit
  go. Use when someone says "implement the spec X", "add the feature Y", "code the change Z", "rename
  this button", "fix the typo", "build it", "/pos-build".
---

# Build

## What a build session is for

A build session turns something already decided (a spec, a framed evolution, a change the owner
asked for) into committed, verified code, then hands it to the owner for QA and ships it on the
owner's go. It decides the grain of orchestration (the session alone, one or two specialists, the
full team), delivers code that follows the Build pivot, and never pushes without an explicit go.

It does not frame a topic (the Discovery module does), and it does not fix a bug a user reported (the
Support module does: `pos-fix-backlog` files it, `pos-bug-kill` fixes it in a batch). A bug met while
building, outside the request, is filed with `pos-fix-backlog` (collaboration rule 20).

## What it loads, and what it does not

**Loads:**

- the product config: `modules.*`, `product.ai_agents`, `product.team_language`,
  `product.ui_language`, `memory.*`, `routing.zones`, `pivots.dir`, `git.main_branch`,
  `git.push_deploys`, `deploy.*`;
- the Build pivot, `<pivots.dir>/product_build_context.md`: its rules, then the sections the request
  touches;
- the memory index, `memory.always`, and the files of the `routing.zones` keys the request touches,
  nothing more (principle 9);
- the build connectors: the database connector (Supabase) and, when `deploy.provider` is set, the
  deploy connector (Easypanel), with their references in `pos-tool-conventions`.

**Does not load:** the other function pivots (Support, Discovery, Go-to-Market), the domain pivot
unless `memory.always` or a zone names it, the shared bases in Notion, analytics or mail. When the
input is a spec that lives in Notion, the session fetches that page as its input and nothing else.

## What you can do from here

| You want to | Skill or agent | When |
|---|---|---|
| Build a feature with the full team | `pos-dev` | tier FEATURE |
| Check the access policies of a table, both ways | `pos-check-rls` | any new query, new table, schema change, or an unexpected empty result |
| Close a step: tests, interface gate, gaps, security, risk card, commit, report | `pos-post-impl-checklist` | after every implemented step, every tier |
| Audit the code on several axes | `pos-audit` | after a build, before a release; never inside a build |
| Define or evolve the visual identity and its tokens | `pos-visual-identity` | before an interface redesign |
| Migrations and access policies | `db-engineer` agent | schema changes |
| Routes, server logic, LLM calls | `backend-dev` agent | server work |
| Screens and components | `frontend-dev` agent | interface work |
| End-to-end tests | `qa-engineer` agent | every visible change, MINI and FEATURE |
| Infrastructure, security, cost | `devsecops` agent | a new service, bucket, variable, public surface |
| The product's AI agents | `ai-engineer` agent | any AI zone, without exception (rule AI13) |
| A mockup: placement, labels, states, then review of the render | `prd-ux` agent | any structural interface choice |
| The lead's operating guide | `dev-lead` (read, never spawned) | read by the session in tier FEATURE |

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles,
and codes such as S2, AI13 or T1 to the rules of the Build pivot. They are not repeated here.
`<main>` below is `git.main_branch`.

## The tiers

The tier is a technical decision: the session takes it and announces it in one sentence with its
reason, before any code, without waiting for agreement (rule 13).

| Tier | Criteria | Voice |
|---|---|---|
| **TRIVIAL** | a rename, a typo, a label or copy change; one file, under 30 lines, no new logic | direct, no preamble, action verbs, show only what changed |
| **MINI** | a single-component fix or evolution, under 300 lines, no migration, no new route; one or two specialists | concise, structured, without the full ceremony |
| **FEATURE** | a new view, a new table, a new flow, a new route, or a structural change | `pos-dev`, the full team |

---

## Step 0 (blocking): read before asking

Before ANY question to the owner, including a question of scope or priority:

1. **The config, the Build pivot** (its rules in full, then the sections the request touches), **the
   memory index and `memory.always`**. If `reading_gate.skills` lists `pos-build`, the gate holds
   shell commands and writes until they are read.
2. **Locate the area** in the code: does the route, the component, the agent's tool exist?
3. **Read the pivot files of the area:** the page, the component, the route, the agent's prompt.
4. **Read the zone's memory** (`routing.zones.<zone>` for every zone the request touches), and as the
   request needs:
   - interface: the design system file (Build pivot section 8), before any interface work (rule 4);
   - tests: the test rules (T1 to T6) and Build pivot section 10;
   - database or migration: the database connector's reference in `pos-tool-conventions`, Build
     pivot sections 4 to 6, and `pos-check-rls`;
   - **an AI zone** (Build pivot section 9, sensitive zones): the AI rules in full, the change
     protocol first (AI13). Delegation to `ai-engineer` is mandatory; the session does not edit
     these zones unless the owner explicitly accepts the shortcut.

A question to the owner that a search or a read could have answered is forbidden. A read always
costs less than a badly calibrated question. Typical case: the owner lists three or four topics at
once. Do not ask "which first?" before reading the areas: the reading often shows that two topics are
one fix, or that one assumes a route that does not exist. Tiers cannot be set without reading.

## Step 0.5: an up-to-date base, before any code

The reference is `origin/<main>`: a fix coded on a stale base diverges again and complicates every
later merge.

```
git -C <repo> fetch origin --quiet
git -C <repo> rev-list --left-right --count origin/<main>...HEAD   # left: behind, right: ahead
git -C <repo> status --porcelain
```

- Branch level and clean: code here.
- **Branch behind by more than a few commits, or a very dirty working tree:** do not code on it by
  reflex. Say so, and start from an up-to-date base: rebase on `origin/<main>`, or a new branch or a
  temporary worktree from `origin/<main>` (rule 3). Never a destructive checkout on a dirty tree.
- Read the git reference memory (the memory index names it) before any git operation.

## Step 1: the tier

Announce it (the table above) with its reason, in one sentence.

### TRIVIAL

- Load only the architecture file of the zone, to confirm the area exists.
- No team. The session works directly: read, edit, commit.
- Commit when it makes sense (one coherent change), no forced splitting.
- End-to-end test skipped unless a public page changed.
- `pos-post-impl-checklist` light: Gates 4, 6 and 8. No help-article update for a typo.

Voice example:
> Read X. Edit. Type-check OK. Committed locally. Test: refresh page Y, check the label.

### MINI

- Load the zone's memory and what Step 0 adds.
- Spawn one or two agents directly. Typical pairs:
  - interface bug: `frontend-dev` and `qa-engineer`;
  - API bug: `backend-dev` and `qa-engineer`;
  - migration and API: `db-engineer`, then `backend-dev` (in sequence), and `qa-engineer`.
- **Verify every delivery** (`pos-dev`, Step 4.5): open each file the agent delivered and check it
  item by item against the brief. A report that says "all delivered" is not proof (principle 2).
- `pos-post-impl-checklist` in full (all gates).

### FEATURE

- Load the zone's memory, the design system and what Step 0 adds.
- **Run `pos-dev`:** the session is the lead, with the specialists, verification included.
- `pos-post-impl-checklist` in full.
- **Help articles updated** when the change is user-visible (a view, a dialog, an interface action, a
  copy change of a paragraph or more), through the help content process of Build pivot section 11.
- **Architecture memory updated** when the change is structural (a new table, a new core element, a
  new pipeline, a new kind of agent): the architecture file the memory index names for that zone.

## Checkpoints

0. **Base verified** (fetch, divergence from `origin/<main>`, working tree) before the first line of
   code (Step 0.5).
1. **Step 0 done** before the first question to the owner.
2. **Tier announced** before implementation, in one sentence with its reason.
3. **Every delivery verified** (MINI and FEATURE) before the owner's QA.
4. **Before the push:** the owner's QA, then an explicit go (Gate 8 of `pos-post-impl-checklist`; the
   work is already committed).

## DO

### Reading: the order of search before coding

1. **Interface:** the design system first. When it covers the need (button, dialog, form, state),
   follow it. **Every mockup goes through `prd-ux`** (placement, labels, states, then a review of the
   captures at the narrowest width) before the owner sees it; a reference capture the owner gave is
   part of its brief.
2. **Not covered by the design system:** find the similar pages and mirror them trait for trait.
   **Rereading the design system is not enough: compare with the neighbour.** For every control
   added, open the neighbouring screen that does the same thing and take the SAME component, the same
   variant or mode, the same label size and add button, the same display level (Build pivot section
   8). A field that links two items offers: link an existing one, create one already linked, one line
   of explanation, navigation both ways, in the natural order of the flow. The proof is the interface
   gate table (`pos-post-impl-checklist`, Gate 1b), filled by the session, not by the agent.
3. **Reuse of a service, worker or pipeline:** read the registries Build pivot section 2 names and
   check what each one is NOT for. "Already deployed" is not "fit for this new use".
4. **Dynamic interface inventory** (views, navigation, AI entry points): the generated inventory
   section 2 names, when there is one.
5. **Critical claims:** read the file yourself. The foundation files of section 2 are first-hand
   knowledge, never taken from an agent's report.
6. **Model only what the owner named.** No extrapolation from examples given in conversation. More
   than six or seven fields for a new core element is a sign of over-design (rule 5).

### Code and patterns

- **Fix at the root** (rule 18).
- **The SaaS rules of the Build pivot** (S1 to S16): authentication on every route, policies and
  application checks, tenant isolation, standard status codes.
- **The design system for every component**, the interface states of S11, `product.ui_language`
  for every string, no em dash in shipped copy (rule 40).

### Database

- **Migrations through the connector's migration operation only** (S16).
- **Before a DROP or an irreversible ALTER, check the consumers' history** (S16). Without that check
  written down, no migration is applied.
- **Coupled inserts in one transaction** (S9).

### Workflow

- **Verify every agent delivery:** open the files and check them item by item against the brief. An
  agent's report describes its intention, not its delivery.
- **Act when the action is obvious** (a correction of a mistake the owner just pointed at, rule 16).
- **Run `pos-post-impl-checklist`** at the end of every step.

## DON'T

### Workflow

- **Skip a read to save tokens.** This skill is a reading procedure: hesitating between asking the
  owner and reading three files, reading wins. Tokens are not a decision criterion (rule 2).
- **Ask the owner before Step 0** (Checkpoint 1).
- **Touch an AI zone without delegating to `ai-engineer`** (AI13). No prompt bloat, keyword
  matching, forced tool by view or string magic: the anti-patterns of AI14. The session does not edit
  these zones unless the owner explicitly accepts the shortcut.
- **Push without an explicit go** (rule 27). Commits stay local until the owner says "push".
- **Treat a constraint from the owner as a green light.** A constraint does not authorise the
  alternative.
- **Trust an agent's report as proof of delivery.**
- **Propose the next step** before the coverage lists exist (Gates 1, 2 and 3 of the checklist).
- **Spawn the whole team** when the task needs two agents. Partial is the norm, full is the exception.
- **Re-flag a choice the owner settled** ("to verify", "red flag"). A decision is a decision.

### Code

- **Skip the help-article update** of a user-visible change, or the architecture memory update of a
  structural change (Gate 7).
- **Break an architecture decision** without reading its handoff or memory. Starting with "I will
  simplify by moving from X to Y" is a red flag: read first.
- **Patch the OUTPUT of a product AI agent instead of its prompt.** A wrong format or content from an
  agent is not a front-end bug to clean with a regex or a downstream heuristic: it is a prompt fix,
  through `ai-engineer` (AI13). Post-processing to compensate an LLM is fragile, non-deterministic,
  guaranteed debt.
- **Prefer a quick patch to a clean architecture.** When a bug reveals a design problem, fix the
  design. Ask: is this the right layer?
- **Create a new flow, view or component** when an existing one can be reused (rule 4).

### Environment

- **An archive at the repository root.** Build artefacts go where Build pivot section 11 says,
  ignored by git.
- **Kill the dev server** without proving it is down: probe the port, don't trust a watchdog
  (rule 8).
- **Truncate an extraction of a source section.** Always capture from its heading to the next
  heading of the same level.

## When something is missing

Say it in one line, continue with what exists, and never invent what the missing piece would have
brought (principle 10).

| Missing | What the build does |
|---|---|
| the Build pivot, or one of its sections | names the section, applies the rules above the line (they ship with this plugin), and asks the owner only what a step cannot go without (the auth helper, the test space) |
| no zone in `routing.zones` for the area | said; the memory is found through the memory index, and a routing line is proposed |
| no database connector callable | no migration and no data check: the change is written as migration files and the owner applies them, said in the report |
| `deploy.provider` empty | the push is followed only through `origin/<main>`; the build cannot be followed, said in the report |
| `product.ai_agents` false | the AI rules and `ai-engineer` do not apply |
| the Discovery module | a framing need is said to the owner; the build does not frame |
| the Support module | a bug met on the way goes into a handoff for another session, as rule 20 says |
| no help content process | the article to update is listed for the owner in the report |

## How it fits

| Skill or module | When | Relation |
|---|---|---|
| Discovery module | before: framing, phasing, a spec | its output is the input of a FEATURE |
| `pos-build` | during: implementation | this skill |
| `pos-dev` | during: the full team | run by this skill at tier FEATURE |
| `pos-check-rls` | during: an access-policy check | run by the session or `db-engineer` |
| `pos-post-impl-checklist` | after every step | the gates every tier closes with |
| `pos-audit` | after: a transverse audit | separate; never run inside a build |
| Support module | a bug a user reported; a bug met on the way | `pos-fix-backlog` files it, `pos-bug-kill` fixes it |
| `pos-handoff`, `pos-orient` (core) | stopping mid-way, resuming | the handoff's line 1 names `pos-build` |

## Conventions

- **Language:** the owner is addressed in `product.team_language`; code and commit messages are in
  English; user-facing strings follow `product.ui_language`.
- **Commits:** named files only (rule 28), within the scope of Build pivot section 11 and the branch
  policy of the product's `CLAUDE.md`.
- **Specs:** where Build pivot section 2 says.
