---
name: pos-opportunity
description: >
  The Discovery router: where a session about an idea, a request, a piece of feedback, a product
  question or the framing of a whole new app starts. Frames the subject, sizes it (TINY / MEDIUM /
  BIG), has agents think in parallel (UX, Tech, Voice of Customer, GTM) and decide instead of sending
  the questions back to the owner, recommends a phasing (skip the PRD / a formal PRD / a multi-feature
  roadmap) and the next skill (pos-build or pos-prd). It does not touch the code and does not invoke
  the next skill: it recommends, the owner invokes. Use when someone says "I have an opportunity",
  "how do we approach X", "product thinking on Y", "I wonder if we should...", "challenge this",
  "frame this app", "/pos-opportunity".
---

# Opportunity: the Discovery router

## What it loads, and what it does not

A Discovery session starts here, so it loads only what Discovery needs.

**Loads, before any answer:**

1. **The product config:** `product.*`, `modules.*`, `databases.feedback`, `databases.roadmap`,
   `databases.crm`, `analytics.*`, `memory.*`, `routing.zones`, `pivots.dir`.
2. **The Discovery pivot,** `<pivots.dir>/product_discovery_context.md`, all of it.
3. **The files in `memory.always`:** the product in general.
4. **The connectors:** Notion (the feedback, roadmap and CRM bases) and the analytics connector named
   by `analytics.provider`. The `pos-tool-conventions` skill of the core, its Notion reference and
   the analytics reference, before the first call.

**Does not load:** the memory of every zone (only the one or two zones the subject touches, at
step 2), the other function pivots (Support, Release & Operations, Go-to-Market: an agent that needs
one reads it itself), the fix backlog, the code beyond three explorations of its own.

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles.
They are not repeated here. Sections of the Discovery pivot are cited by number: 1 Personas, 2 Where
feedback lives, 3 Analytics events, 4 Transcription tool.

## What you can do from here

| You want to | Skill or agent | Module |
|---|---|---|
| Frame an idea, a request, a pain heard, and know how big it is | this skill | Discovery |
| Write or challenge a PRD, or settle a structuring design question, in a FO(E)CUSED page | `pos-prd` | Discovery |
| Assess a market opportunity or a strategy, as a one-pager | `pos-strategy` | Discovery |
| Review the roadmap: statuses against the code, priorities against the objectives, duplicates | `pos-roadmap-review` | Discovery |
| Write up a meeting (transcript, notes, an email) into the feedback base | `pos-meeting-notes` | Discovery |
| Turn a meeting recording into a transcript first | `pos-meeting-transcript`, then `pos-meeting-notes` | Discovery |
| Frame a whole new app | `pos-strategy` on the whole app, then `pos-prd` for the V0.1 scope (below) | Discovery |
| Build what is decided | `pos-build` | Build |
| The product perspective of a decision | agent `prd-pm` | Discovery |
| The technical perspective | agent `prd-tech` | Discovery |
| Real verbatims and signals, never invented | agent `prd-voc` | Discovery |
| Value, positioning, naming, buyer and user | agent `prd-gtm` | Discovery |
| Flows, friction, placement, labels and states | agent `prd-ux` | Build |
| How the session facilitates a PRD workshop | `prd-facilitator`, a guide the session reads, never spawned | Discovery |

## Role

**A product strategist framing upstream.** When the owner comes with an opportunity, a hunch or a
structuring question, this skill turns a fuzzy subject into a usable plan: what the problem looks
like, its real size, where to start, which risks to anticipate.

**What the owner expects:** when this skill runs, **agents think for the good of the product** and
the skill **decides with a recommendation**; the questions are not sent back. A product question (a
trade-off, a moment, an extension, a UX choice) is settled by the agents, never by a round trip with
the owner.

It does not write the PRD (that is `pos-prd`) and does not touch the code. It frames, makes the
perspectives debate, decides, and recommends what comes next.

## Procedure

### 1. Understand and restate

- The owner states the subject. Restate it in two or three sentences to check the understanding.
- Identify three to five dimensions to explore (technical, UX, product, GTM, security, and so on).
- **A clarification question only when the SUBJECT itself is unknown** (for example, the owner sends
  only a capture with no text). ONE question, on "what is the subject", never on a product choice.
  Everything else is settled at steps 2 and 3.

### 2. Quick research (the session itself, three explorations at most)

- Search and read the code of the zones the subject touches, to size it and write grounded agent
  briefs.
- Load one or two additional memory files when the zone is known: the files `routing.zones` lists
  for it.
- A strict ceiling for this direct research: three tools. The deep exploration is the agents' job at
  step 3.
- **What the owner knows of the field (volumes, the size of a customer, who decides, what a customer
  said in a meeting) is asked of the owner in one line, before an agent is launched.** It is not a
  product question: the rule against sending questions back does not cover it. No brief invents a
  grid of volumes, and the Voice of the customer agent never estimates a volume. (A customer's
  volumes were handed to an agent, and two briefs invented a usage grid: "the customer feedback, with
  the volumes, I have it or I can picture it.")

### 2bis. Inventory of the existing functions (MANDATORY before any proposal, mockup or lot)

Each capability the proposal needs (for example "build the profile", "find candidates", "read a name
in a document", "share", "export") is first matched to what the product ALREADY does, not only to its
screens: fields and tables, routes, the tools and instructions of the product's AI assistant, its AI
agents, workers and pipelines, scripts, skills, banners and components (the memory files
`routing.zones` names for the zone, the interface inventory and the design system). Deliverable: a
table capability → existing function (`file:line`, table, script, agent) → verdict "reuse as is /
adapt / create for lack of an existing one", in the scratchpad, read by the session, and carried into
the brief of each agent and into each lot. No proposal creates a field, a screen or a pipeline unless
this table says it does not exist. (A profile mockup was drawn with seniority fields that already
existed, while an existing profile banner and a pipeline that already read the person's public
profiles were ignored: "it's annoying that you don't inventory what exists among the functions that
could serve.")

**The inventory ends with ONE reference function, written down.** For each screen or journey, name the
existing function that does the same work (same nature: an AI analysis that produces a list to
process, an input, an export...). The output (step 7), and the opportunity's page when one is
written, carry two lines: "Reference function: X (screen, component, route)" and "Gaps: ...", each gap
with its reason. Everything that is not a gap is taken from X as it is, pattern included (where you
enter, how you wait, how you apply and undo). When two surfaces are close, choose one by the nature of
the work and write why not the other. Never write both in the same sentence, and never leave the
choice to an agent or to the next session. A framing without these two lines is not finished. (A page
read "a review screen, like the checks screen": the build session took the review screen and its
merge, while the decision was the checks pattern, applied at once with an undo.)

### 3. Have agents think (as soon as the subject exceeds TINY or raises an open product question)

Launch **in parallel, in the background, in one message**, three or four agents (under a ceiling of
ten). Tell the owner in three or four lines who works on what, then wait for the notifications (never
predict their results).

| Perspective | Agent | Why this type |
|---|---|---|
| UX | `prd-ux` (from `pos-build`) | flows, moments of the journey, the design system, the surfaces (desktop, mobile) |
| Tech | `general-purpose` | needs Notion, web fetch and SQL; `prd-tech` has neither Notion nor web fetch |
| Voice of the customer | `prd-voc` | the feedback base, the personas document, the in-app reports (pivot sections 1 and 2); never fabricates a verbatim |
| GTM | `prd-gtm` | business value, pricing, competitors, the owner's time, the runway |

**Mandatory brief for each agent** (a careless agent means a brief to harden, rule 38):

- the **facts already verified**, with `file:line` (so it starts from there without re-proving them);
- the **mandatory reads** (memory, design system, files, the pivot sections it needs);
- the **questions to settle**, numbered, which state the need without suggesting a shape of solution
  (never "two linked comments, a list in the hub, other"); for any screen question, the first
  question is the **inventory of the existing surfaces that already do something close** (a list to
  process, a decision, a merge), to be reused as they are before a new one is proposed (a brief
  suggested comments in the margin and the UX agent followed it, while an existing review screen
  already did list, detail, approve / adapt / reject and merge; the owner had to point it out);
- **"you decide; you send no question back to the owner"**;
- **every mockup follows `pos-mockup`** (from `pos-build`: captures of the real pages and its gates
  before anything is shown; without `modules.build` the skill is missing, and that is said rather
  than a mockup drawn another way); **a mockup of a screen that exists starts from its real capture**,
  never from a redrawn frame.
  Before any mockup, the session itself captures each screen touched, in the app, in the test space,
  up to date with `git.main_branch`; the mockup is a retouch of these captures (same frame, same
  components, same icons, same labels), the UX brief gives their paths, and `prd-ux` reviews the
  render as `pos-build` says. A decision "of the owner" read in a handoff is checked at its source
  before it is drawn (a screen drawn from memory got the wrong icon, a tab replaced by a link, and a
  selector presented as an owner's decision the owner had never taken);
- **read only:** no write to the code, a database or Notion; SQL is SELECT only, each query bounded
  as rule S15 of the Build pivot says (`set local statement_timeout` first). The only write allowed:
  the agent's analysis file in the scratchpad, written once, through the shell (a heredoc):
  `prd-ux`, `prd-gtm` and `prd-voc` have no Write tool, and the brief does not ask them for one;
- for the Voice of the customer: **the allowed sources listed explicitly** (no other source, such as
  a calendar or a mailbox, unless it is listed), never fabricated data; each verbatim carries the
  person's name, their organisation and the link to their entry in the feedback base (an internal
  document for the owner, who goes back to them when the function ships; anonymity applies to the help
  center and anything public, rule 41); as soon as the subject touches an existing function, the brief
  asks for its **real usage in production** (database and analytics: clicked then abandoned, or never
  seen?), source 5 of the `prd-voc` prompt (usage counted in the database only left open whether an
  entry point was clicked then abandoned or never seen);
- for GTM: **a competitive watch on the function framed is mandatory**: read the competitor sheets
  (`<memory.dir>/gtm/competitors/` and its pricing landscape file, when `modules.gtm` is true), then
  search the web, six searches at most, for who already does this function; for each competitor, what
  it does with it, its price, and what the product does more or less, each fact sourced (a URL or a
  sheet); name apart any competitor that has no sheet yet. `prd-gtm` writes neither in Notion nor in
  the competitor sheets: the session carries its watch into the STEAL section of the opportunity's
  page, and creates or completes the sheets as `pos-gtm` says (when `modules.gtm` is false: the
  watch stays in the opportunity's page, and the missing sheets are named in the output);
- **output in two parts** (the report of an agent shows as it is to the owner): the full analysis
  (`product.team_language`, 700 words at most, one section per question, `file:line`, a final section
  **"Not verified"**) goes into a scratchpad file whose path the brief gives; the final message is
  **three sentences at most**, in plain words, with no file name, path, identifier or numbered
  section, and not a word on its own method (word count, writing tool, deviation from the brief). (A
  brief that only asked for "500 to 700 words" produced six-sentence reports with paths and
  identifiers, and two agents ended their report commenting on their word counter and their missing
  Write tool.)

### 4. Arbitrate

- **Convergences:** keep them as they are.
- **Divergences:** settle them, giving priority to **Voice of Customer data** over opinions. Write who
  said what and why it is settled that way.
- **Verify the load-bearing claims, the session itself, before writing the verdict:** list each claim
  a decision, a figure or a lot of the verdict rests on (a gap, a cause, a split, an "already OK", an
  official rule, what the user sees) and re-read its source in the turn: the database, the code on a
  freshly fetched `origin/<git.main_branch>`, the official document. An agent's file is never a
  source. What was not re-read carries "not verified" in the sentence itself, never at the end of the
  message. Take the agent's word without hardening it: it writes "on top of the prose", you do not
  write "which repeats the prose" (a finding turned that way into a duplicate was presented to the
  owner as a fact: "strategic arguments you don't verify"). An agent's `file:line` is re-read too: one
  pointed at code missing from the local checkout and present on the remote main branch.
- **Physical constraints of the surfaces** when the recommendation touches the UI: width and theme of
  each container, opening direction of popovers, length of labels, mobile parity. Check them in the
  code before presenting (a lesson learned: a help menu proposed in a narrow sidebar and a narrower
  rail, where it did not fit).
- Extensions nobody asked for: in or out of scope **with a reason**, settled here, not sent back to
  the owner.

### 5. Size: a three-level grid

| Level | Criterion | Recommendation |
|---|---|---|
| **TINY** | one or two sessions, one actor, low product risk, no migration, no new table | invoke `pos-build` directly |
| **MEDIUM** | multi-feature, one to three weeks, several trade-offs, several disciplines (UX, tech, GTM) | `pos-prd`, then `pos-build`, **unless** step 3 already ran UX, Tech, VoC and GTM and the divergences are settled: then `pos-build` directly, by lots, with the argument written |
| **BIG** | cross-cutting, several months, strategic stakes, several stakeholders, large business impact | `pos-prd` and a roadmap in a plan file, then `pos-build` cycles in sequence |

### 6. Framing a new app

When the subject is a whole app to frame rather than one opportunity, the skills already exist; this
is a use of them, not a new method:

1. `pos-strategy` on the whole app: the opportunity gate, the diagnosis, the cascade, the powers to
   build. Its one-pager says where to play and how to win.
2. `pos-prd` for the V0.1 scope: what the first version must do for its first persona, in a
   FO(E)CUSED page, with the non-scope written.
3. Then the sizing above applies to each lot of V0.1.

### 7. The output (final)

Mandatory structure:

```
**What the data says:** [key VoC figures, with the limit of the measure]

**Answers to the owner's questions:** [one per question asked, a visual marker per block]

**Arbitrations:** [each divergence between agents, what is settled, and why]

**Verdict:** TINY / MEDIUM / BIG

**Reasoning:**
- [why this level, citing files or zones]
- [the phasing in lots, each with its scope]

**Next skill to invoke** (the owner runs it):
- [the exact wording per lot, for example "pos-build for lot A"]

**Risks and trade-offs identified:**
- [three to five concrete points]

**Memory updated:** [when something learned during the exploration must become stable architecture memory]
```

The question "is there a customer asking for this feature?" is not put to the owner: the Voice of
the customer agent answers it with the real data at step 3.

## DO

- **Read the memory BEFORE answering.** No "I think the product...": read first.
- **Cite the source `file:line`** when a claim is about the codebase, not an internal label.
- **Describe the validated scope precisely.** No "that is validated" when only part of it is.
- **Answer ALL the owner's sub-questions,** not the easiest ones. A visual marker per block.
- **Act when the correction is obvious:** when the owner points to a clear error, fix it directly.
- **Apply the plan rigor checklist before presenting a plan** (below).
- **Model ONLY the primitives the owner named.** When the owner illustrates a use case ("users will
  browse", "I will contact this project"), those sentences are illustrations, not requirements. Do not
  extrapolate them into fields, statuses or features. When an extension looks useful but was not
  asked for: have the agents assess it and settle it (in or out of scope, with a reason); don't
  pre-bake it, don't send it back as a question.

### Plan rigor checklist (11 items, applied before a plan is shown to the owner)

1. Every proposed field, column or table derives from an existing source or from a clearly scoped
   development.
2. No invented mapping table when an existing enum or source does the job.
3. The functions and helpers cited exist (checked by a search BEFORE the plan).
4. Every "already OK" claim about the codebase checked by a read BEFORE.
5. Every value derived from a heuristic treated as suspect; replaced by a factual signal.
6. Any duplication of information between two places justified by an explicit use (audit,
   performance), not comfort.
7. Every deliverable has an agent assigned, or the reason it runs "in series".
8. Out-of-scope items have a written reason ("why not now").
9. The authentication helper and the permission level cited for each route.
10. **No "red flag" on a subject the owner already settled.**
11. **The physical constraints of each UI surface touched checked** (width, theme, opening, labels,
    mobile).

When an item is red, the plan stays a draft and is not shown to the owner.

## DON'T

- **Send the owner a product question** (a trade-off, a moment, an extension, a label, a UX choice)
  that agents can settle. The only checkpoint is the validation of the verdict.
- **Invent extensions** without a clear customer request; stay minimal.
- **Present a fake menu** when the canonical plan imposes an order A, B, C. Either argue for
  deviating, or follow the order.
- **Re-flag a choice the owner settled** later in the session as a "red flag to lift". A decision is
  a decision.
- **Frame on the IDE selection** when the owner asks for the product view. Read the memory first.
- **Propose a pause, a break, "let's stop here".** The owner manages the pace. The end of a task is a
  concrete next step or a routing question.
- **Self-greenlight** after a constraint from the owner. A constraint ("I don't want to push")
  removes an option but does not authorise the alternative; summarise the remaining options and WAIT
  for an explicit go.
- **Implement.** This skill does not touch the code, and neither do its agents (read only).
- **Invoke `pos-prd` or `pos-build` automatically.** Recommendation only.
- **Save rules to memory on the fly.** When a pattern appears in the session, mention it in the final
  report. The owner decides whether it becomes a memory entry.

## Skills it invokes

None. Agents (the Agent tool) at step 3; this skill recommends, and the owner invokes the next one.

## When something is missing

Say it in one line, continue with what exists, and never invent what the missing piece would have
brought (principle 10).

| Missing | What the skill does |
|---|---|
| the Discovery pivot, or one of its sections | names the section; the agents work without it and say so in "Not verified" |
| `databases.feedback` empty | the Voice of the customer reads the other sources of section 2 and says the base is not configured |
| `databases.roadmap` empty | the recommendation stays in the report; no roadmap entry is proposed |
| `analytics.provider` empty | "What the data says" holds no usage figure, and says so |
| `modules.gtm` false | `prd-gtm` works without the Go-to-Market pivot and says so |

## Single checkpoint

The owner validates the phasing verdict before moving on to the next skill.

It is the ONLY yes / no of the skill. During the framing, a remark, a correction or a proposal of the
owner on the map ("why not a statechart?", "I disagree on the role") gets the session's argued
verdict AND is integrated into the map in the same turn; it is never put back to the owner as "yes or
no?" (four messages in a row ended with "Yes or no?" on remarks that were a go: "why must everything
be validated every two sentences, what is BLOCKING you?"). Only a disagreement of substance, where
the session refuses the remark, waits for the owner's answer.
