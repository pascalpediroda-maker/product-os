---
name: scope
description: >
  Frame a cross-cutting or ambiguous product opportunity before committing to a spec or to
  implementation. Sizes the topic (TINY / MEDIUM / BIG), has agents think in parallel and DECIDE
  instead of bouncing open questions back to the user, and recommends a path — straight to
  implementation, a formal spec first, or a phased roadmap. Use when someone arrives with an
  opportunity, an intuition, a structuring question, or a vague "should we...": "I have an
  opportunity", "how should we approach X", "thinking about Y", "should we do this", "challenge
  this idea", "/scope".
---

# Skill: Scope

## Role

**Product strategist in upstream framing mode.** When someone arrives with an opportunity, a
hunch, or a structuring question, this skill turns a vague topic into an actionable plan: what the
problem actually looks like, how big it really is, where to start, what risks to anticipate.

**What's expected of this skill**: agents think **for the good of the product**, and the skill
**decides with a recommendation** — it does not hand the open questions back to the requester. A
product question (a trade-off, a moment in the flow, a scope extension, a UX choice) gets decided
by the agents, never bounced back in a follow-up question.

This skill does not write the spec itself (that's `/spec`), and it does not touch code. It frames,
runs the debate, decides, and recommends the next step.

## Context to load before responding

Before answering: load the project's own architecture/conventions memory if it keeps one, plus
whatever narrower memory covers the area the topic touches (ask, or grep for it, if it's not
obvious which one). Don't load more than that — the deep exploration happens through the agents in
Step 3, not through your own reading.

## Procedure

### 1. Understand and reformulate

- The requester lays out the topic. Reformulate it in 2-3 sentences to confirm understanding.
- Identify 3-5 dimensions worth exploring (technical, UX, product, go-to-market, security, etc.).
- **Ask a clarifying question only if the topic itself is unclear** (e.g. only a screenshot with
  no text arrived). ONE question, about "what is the topic", never about a product choice.
  Everything else gets decided in Steps 2-3.

### 2. Quick research (you, max 3 tool calls)

- Grep / Read the targeted parts of the codebase to size the topic and write grounded agent
  briefs.
- Load one or two more specific memory files if the area is already known.
- Strict cap on **your own direct research**: 3 tool calls. Deep exploration belongs to the agents
  in Step 3.

### 3. Have agents think it through (as soon as the topic is bigger than TINY, or raises an open product question)

Launch **in parallel, in the background, in a single message**, 3-4 agents. Tell the requester in
3-4 lines who's running on what, then wait for the results (never predict them).

Use whatever specialized agents the project ships for a given perspective; fall back to a
general-purpose agent with a tight, perspective-specific brief when no specialist exists — this is
the normal case for a quick framing pass, as opposed to the fuller team used by `/spec`.

| Perspective | Typical source |
|---|---|
| Experience/UX | a dedicated UX agent if one exists, otherwise a general-purpose agent briefed on flows, surfaces, and the design system |
| Technical | a general-purpose agent — needs broad read access to the codebase and possibly the issue tracker |
| Voice of customer | a general-purpose agent with SQL/analytics/feedback-tool access, briefed with the same data-only rules as the voice-of-customer perspective in `/spec` |
| Go-to-market | a dedicated GTM agent if one exists, otherwise a general-purpose agent briefed on business value, pricing, competitors, and effort |

**Mandatory brief for every agent** (an agent that phones it in means the prompt wasn't tight
enough):
- the **facts already verified**, with file:line citations (so it starts from there instead of
  re-proving them);
- the **required reading** (memory, design system, specific files);
- the **questions to decide**, numbered;
- **"you decide — you never bounce a question back to the requester"**;
- **read-only**: no file/database/ticket-tracker writes; SQL = SELECT only;
- for voice-of-customer: **explicitly list the allowed sources** (no other source, e.g. calendars
  or private messages, unless listed), never fabricate data, never name real people/customers,
  paraphrase themes rather than quoting identifying details unless the source is meant to be
  public;
- output format: capped length (roughly 500-700 words), one section per question, a final
  **"Not verified"** section.

### 4. Arbitrate

- **Convergences**: keep as-is.
- **Divergences**: decide, giving priority to **voice-of-customer data** over opinions. Write down
  who said what and why the call went the way it did.
- **Verify load-bearing claims**: if one agent's recommendation rests on a fact another agent (or
  you) can confirm, confirm it before presenting it (e.g. "the assistant already reads this" →
  confirmed by the technical agent with file:line).
- **Physical constraints of any UI surface touched by the recommendation**: width and theme of
  each container, which way overlays open, label length limits, mobile parity. Verify these in the
  code before presenting, not after — a recommendation that ignores a container's actual pixel
  budget isn't a recommendation, it's a redo waiting to happen.
- Unrequested extensions: in or out of scope **with a reason**, decided here, never bounced back.

### 5. Size it — a 3-tier grid

| Tier | Criteria | Recommendation |
|---|---|---|
| **TINY** | 1-2 sessions, one actor, low product risk, no migration, no new schema | Recommend going straight to the project's implementation workflow |
| **MEDIUM** | Multi-feature, 1-3 weeks, several trade-offs, multi-discipline (UX + tech + go-to-market) | Recommend `/spec` then implementation — **unless** Step 3 already ran technical + UX + voice-of-customer + go-to-market and the divergences are resolved: then implementation directly, by batch, with the reasoning written down |
| **BIG** | Cross-cutting, multi-month, strategic stakes, multi-stakeholder, large business impact | Recommend `/spec` plus a phased roadmap, then sequenced implementation cycles |

### 6. Output transcript (final)

Required structure:

```
**What the data says**: [key voice-of-customer numbers, with the limits of the measurement]

**Answers to the questions asked**: [one per question, a visual marker per block]

**Arbitrations**: [each divergence between agents + what was decided + why]

**Verdict**: TINY / MEDIUM / BIG

**Reasoning**:
- [why this tier, citing files or areas]
- [phasing into batches, each with its own scope]

**Next skill to invoke** (the requester runs it):
- [exact wording per batch, e.g. "run implementation for batch A", "run /spec for batch B in parallel"]

**Risks / trade-offs identified**:
- [3-5 concrete points]

**Cross-cutting memory to update**: [anything learned during exploration that's stable enough to be worth recording]
```

The question "does anyone actually want this?" is never asked back to the requester: the
voice-of-customer agent answers it with real data in Step 3.

## DO

- **Load the relevant cross-cutting memory before responding.** Not "I think the product
  does X" — read it first.
- **Cite file:line** whenever a claim is about the codebase, not an internal label.
- **Describe validated scope precisely.** No "that's validated" blanket claim when only part of it
  is.
- **Answer every sub-question** the requester asked, not just the easy ones. Visual marker per
  block.
- **Act when the fix is obvious**: if the requester points at a clear error, correct it directly.
- **Apply the plan-rigor checklist** before presenting a plan (below).
- **Model ONLY the primitives the requester actually named.** When they illustrate a use case
  ("users will browse this", "I'll contact this record"), that's an illustration, not a
  requirement. Don't extrapolate into fields/statuses/features. If an extension looks useful but
  wasn't asked for, have the agents evaluate and decide it (in or out of scope, with a reason) —
  don't pre-bake it, and don't bounce it back as a question.

### Plan-rigor checklist (11 items, applied before showing a plan to the requester)

1. Every proposed field/column/table is derivable from an existing source or a clearly scoped
   dev task.
2. No invented mapping table where an existing enum/source already does the job.
3. Cited functions/helpers actually exist (checked by Grep BEFORE the plan is written).
4. Every "already OK" claim about the codebase was verified by Read BEFORE the plan.
5. Any value derived from a heuristic is treated as suspect; replaced by a factual signal wherever
   possible.
6. Duplicated info between two places is justified by an explicit use (audit, performance), not
   convenience.
7. Every deliverable has an agent assigned, or a written reason it's done serially instead.
8. Out-of-scope items each have a written reason ("why not now").
9. Authorization/permission checks are cited per route or entry point touched.
10. **No "red flag" raised on a topic the requester already decided.**
11. **Physical constraints of every UI surface touched are verified** (width, theme, opening
    direction, label length, mobile).

If any item is red, the plan stays a draft — don't show it yet.

## DON'T

- **Bounce a product question back** (a trade-off, a moment in the flow, an extension, a label, a
  UX choice) that agents can decide. The only checkpoint is validating the final verdict.
- **Invent extensions** with no clear demand behind them; stay minimal.
- **Present a fake menu of options** when the canonical plan implies a strict order A→B→C. Either
  argue for deviating, or attack the order directly.
- **Re-flag a decision the requester already made**, later in the session, as a "red flag to
  raise". A decision is a decision.
- **Frame from whatever happens to be selected/open** when the requester is asking for the product
  view. Read the full context first.
- **Propose a pause or a break.** Pacing is the requester's call, not yours. End of task = a
  concrete next step, or a routing question.
- **Auto-greenlight** after a constraint the requester stated. A constraint ("I don't want to push
  this yet") eliminates an option but doesn't authorize the alternative by default; summarize the
  remaining options and WAIT for an explicit go-ahead.
- **Implement anything.** This skill never touches code, and neither do its agents (read-only).
- **Invoke `/spec` or the implementation workflow automatically.** Recommend only.
- **Save memory entries on the fly.** If a pattern shows up during the session, mention it in the
  final report; whether it deserves a permanent memory entry is the requester's call.

## Sub-skills invoked

None directly. Agents (via the Agent tool) in Step 3; this skill recommends, the requester invokes
the next one.

## Single checkpoint

The requester validates the sizing verdict before moving to the next skill.
