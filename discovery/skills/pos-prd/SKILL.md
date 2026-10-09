---
name: pos-prd
description: >
  Challenge, create or evolve a PRD. The session itself plays the Facilitator and coordinates five
  perspectives (PM, GTM, UX/UI, Tech, Voice of Customer) that debate and converge in iterations, then
  writes the result into the opportunity's FO(E)CUSED page in the roadmap base. Use as soon as someone
  wants to work on a PRD, a feature, a functional spec, or challenge a product decision, even without
  saying "PRD". Also when a design question touches several dimensions (technical, UX, business), or
  when a structuring decision needs trade-offs weighed between perspectives. Covers "challenge this",
  "are we forgetting something", "let's think about", "what are the consequences of", "make it
  converge", "/pos-prd".
---

# PRD

## Why this skill exists

Good PRDs are not born from one perspective. A feature that looks obvious to the PM can be a
technical nightmare. An elegant architecture can produce a poor UX. A brilliant GTM argument can
promise something impossible to deliver. And above all: without real user data, we build on
assumptions.

This skill has **the session itself** orchestrate a team of five perspectives that read the code,
each form their own opinion, debate (through the session), and converge on solid recommendations,
with real Voice of Customer data.

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles.
They are not repeated here. Sections of the Discovery pivot are cited by number: 1 Personas, 2 Where
feedback lives, 3 Analytics events, 4 Transcription tool.

## Architectural principle: the session is the Facilitator

A spawned facilitator agent orchestrating the five perspectives did not work: it fell asleep between
phases, and the agents waited for a signal that never came (principle 1).

**So the main session is the Facilitator.** It frames the subject, spawns the five agents in
parallel, consolidates their positions, detects the divergences, relaunches the agents concerned when
needed, forces the convergence, and delivers.

The file `agents/prd-facilitator.md` of this plugin is the session's **operating guide** (the
four-phase protocol, neutrality, the convergence rules), not a prompt for a spawned agent.

**Why the session and not the PM?** When the PM frames the debate, there is a structural bias towards
its concerns. A neutral Facilitator gives the GTM "wow factor" as much weight as the PM's
"completeness". The PM can then be a real advocate of its position, with no conflict of interest.

## The five perspectives

| Agent | Role | Model | Plugin |
|---|---|---|---|
| **PM** | functional completeness, personas, prioritisation | sonnet | `prd-pm`, this plugin |
| **GTM** | value proposition, positioning, wow factor | sonnet | `prd-gtm`, this plugin |
| **UX/UI** | flows, friction, cognitive load, UI patterns | sonnet | `prd-ux`, `pos-build` |
| **Tech** | architecture, feasibility, technical risks | sonnet | `prd-tech`, this plugin |
| **VoC** | real verbatims, user signals, personas | sonnet | `prd-voc`, this plugin |

## Before Phase 0: read

1. **The product config:** `product.*`, `modules.*`, `databases.feedback`, `databases.roadmap`,
   `analytics.*`, `memory.*`, `routing.zones`, `pivots.dir`.
2. **The Discovery pivot,** `<pivots.dir>/product_discovery_context.md`, all of it.
3. **The files in `memory.always`,** and the product's `CLAUDE.md` (its conventions, and where its
   specs live).
4. **The FO(E)CUSED template,** `${CLAUDE_PLUGIN_ROOT}/skills/pos-prd/references/focused-template.md`.
5. **The `pos-tool-conventions` skill of the core,** its Notion reference, before the first Notion
   call.

## Workflow: what the session does (four-phase protocol)

### Phase 0: framing (the session)

1. Read `${CLAUDE_PLUGIN_ROOT}/agents/prd-facilitator.md` for the mindset and the protocol.
2. Read the relevant code and the product documents (the roadmap entry in `databases.roadmap` when
   one exists, the existing specs).
3. Write a **Brief** that frames the subject: the precise question, the known constraints, the
   relevant product context, the list of angles to explore, and the personas of pivot section 1.
4. When the subject is too fuzzy, ask the owner one question before spawning the five agents.

### Phase 1: discovery in parallel

Spawn the five agents **in one message** with the common Brief:

```
Agent(subagent_type: "prd-pm",   prompt: "[full Brief + PM angle]")
Agent(subagent_type: "prd-gtm",  prompt: "[full Brief + GTM angle]")
Agent(subagent_type: "prd-ux",   prompt: "[full Brief + UX angle]")
Agent(subagent_type: "prd-tech", prompt: "[full Brief + Tech angle]")
Agent(subagent_type: "prd-voc",  prompt: "[full Brief + VoC angle, the sources of pivot section 2]")
```

Each agent reads the code independently and forms its own argued position.

### Phase 2: debate (the session arbitrates)

The session receives the five positions and identifies the **divergences**:

- Where do PM and Tech disagree?
- Where do UX and GTM diverge?
- What does the VoC contradict?

It **relaunches one or two agents, targeted** (through `SendMessage`, or a new `Agent` with the other
positions as context) to dig into the hot points. No more than two rounds: converge fast.

### Phase 3: convergence (the session delivers)

The session synthesises into a structured FO(E)CUSED deliverable, following the template:

- **FRAME:** question and constraints
- **OBSERVE:** current state (code, VoC, blind spots)
- **EXPLORE:** options studied (argued by the five perspectives)
- **CLAIM:** recommendation, with each decision classified:
  - DECIDED: consensus of the five (or unanimity)
  - DECIDED-WITH-DISSENT: decision kept, with the argued dissent (one or two agents)
  - ESCALATED: an irreducible disagreement; the owner arbitrates
- **UNFOLD:** implications (tech, UX, GTM)
- **STEAL:** relevant external inspirations, when applicable
- **EXECUTE:** implementation sequence (the input of `pos-build`)
- **DELIVERY:** product validation criteria, and the tracking events (pivot section 3)

### Phase 4: present the result

Present the synthesis to the owner. The ESCALATED points are highlighted for decision. The page in
the roadmap base is written as the template says (its "Writing to the roadmap base" section).

## Modes

### Mode 1: create a PRD from scratch

The session frames, five agents explore, debate, convergence. The deliverable is FO(E)CUSED, ready to
be written into its roadmap page.

### Mode 2: challenge an existing PRD

The session fetches the existing roadmap page and gives it to the five agents. Each one puts it
through its sieve. The deliverable is a list of argued corrections and improvements, from several
perspectives.

### Mode 3: a structuring design question

For example: "should the agents modify the core elements?". The session opens the subject, the agents
debate. The deliverable is an argued recommendation with its trade-off analysis.

## How it fits with the FO(E)CUSED template

- **`references/focused-template.md`** is the template and the structure of a PRD page in the roadmap
  base.
- **`pos-prd`** is the team that thinks to fill that template.

The session uses the FO(E)CUSED structure to organise the final deliverable.

## The Voice of Customer agent: the only one with real data

The VoC fetches data from the sources of pivot section 2, in their order: by default the personas
document, the feedback base (`databases.feedback`), the in-app reports.

It produces a structured **VoC file**:

- personas concerned, and level of impact;
- real verbatims (never invented);
- quantitative signals (count of feedback);
- observed patterns (labelled as inference);
- contradictions with the team's proposals;
- personas NOT represented in the data.

**Golden rule:** when the VoC has no data on a subject, it says "No verbatim covers this subject." It
NEVER speculates.

## Principles (inherited, carried by the agents or by the session)

| Principle | Carried by |
|---|---|
| Read the code BEFORE reasoning | All, and the session |
| Make every perspective speak | The session (Facilitator) |
| Converge and recommend | The session |
| Detect the blind spots | PM, and the session |
| Detect over-specification | PM and Tech |
| Treat challenges as EXPLORE | The session |

## Working conventions

- Write the documentation as a product manager: functional, not implementation (rule 41).
- Act, don't ask, when the correction is obvious.
- No customer names in shared documents (rule 41).
- Answer in `product.team_language`; code references stay in English.

## When something is missing

Say it in one line, continue with what exists, and never invent what the missing piece would have
brought (principle 10).

| Missing | What the skill does |
|---|---|
| `databases.roadmap` empty | the deliverable is given in the report; no page is created |
| `databases.feedback` empty | the VoC reads the other sources of section 2 and says the base is not configured |
| the Discovery pivot, or section 1 | the agents work without personas and say so; the first use case names the user by role |
| `analytics.provider` empty, or section 3 empty | the success criteria name the indicator, and the tracking lists the events to create |
