# FO(E)CUSED: the page template of an opportunity

FO(E)CUSED is the life cycle of an opportunity, from the problem to the specs. It combines
*Discovery Discipline* by Tristan Charvillat and Rémi Guyot (Thiga) with Continuous Discovery by
Teresa Torres, with an Explore step added before the claim.

One opportunity is one entry of the roadmap base (`databases.roadmap`); its page body holds the four
phases below. `pos-prd` writes into it; `pos-opportunity` may open it. The property names are those
of the OS roadmap base (`pos-setup`, `references/bases/roadmap.md`).

## The framework

The name is an acronym of the key steps:

- **F**: Frame (frame the problem)
- **O**: Observe (collect the evidence)
- **(E)**: Explore (explore the solutions; optional depending on maturity)
- **C**: Claim (state the promise, the hypothesis kept)
- **U**: Unfold (design the launch and the touchpoints)
- **S**: Steal (benchmark the competitors and references)
- **E**: Execute (mock up, prototype, decide)
- **D**: Delivery (specify for the developers)

It is structured in **four phases** in the page.

## The four phases

### Phase 1: PROBLEM DISCOVERY (Frame and Observe)

**Goal:** understand and frame the problem BEFORE thinking of solutions.

#### FRAME

- **Problem in one sentence:** concise, user-oriented, with a measurable impact. For example: "Account
  managers lose 2 hours a week copy-pasting their data between tools."
- **Non-scope:** what we explicitly decide NOT to do in this iteration.
- **PROJECT AMBITION:**
  - *Success criteria:* indicator, current level, target level. For example: "Completion rate of step
    2: 40% to 70%". The indicator is an event of the Discovery pivot, section 3, or a new event listed
    there as asked for.
  - *Damage control:* an indicator that must not degrade (for example: load time under 2 s).
  - *Timebox:* 1w / 1m / 1q / 1y.

#### OBSERVE

- **Social proof:** the feedback entries linked to this opportunity, from the feedback base
  (`databases.feedback`), through the `Feedback & Insights` relation of the roadmap entry.
- **Key verbatims:** direct quotes from users.
- **Data:** quantitative metrics observed.
- **Empathy map:** what the user thinks, feels, says, does.
- **FIRST USE CASE** (narrative format, mandatory):
  > "I am <persona> and when I <context of use>, what matters to me is <need>. But it turns out that
  > <constraint>, so I have to <workaround>."

  The persona is one of the Discovery pivot, section 1.

**When this phase is complete:** `Status` moves to `Discovery`.

### Phase 2: SOLUTION DISCOVERY (Explore and Claim)

**Goal:** explore the options and choose a hypothesis to validate.

#### EXPLORE

- List every conceivable solution (at least three).
- For each one: pros, cons, effort (`T-shirt size`).
- Include the "do nothing" solution.

#### CLAIM (the promise)

- **The hypothesis:** "If we do X, then Y happens." For example: "If we add a Word import, setup time
  drops by 50%."
- **The solution (concept):** the functional and technical description of the solution kept, in two
  or three lines.
- **Launch tweet:** the value for the user, in marketing words, 280 characters at most.

> **Checkpoint:** at this stage, rename the page title to the name of the feature, and move `Status`
> to `Solutioning / Featuring`.

### Phase 3: SOLUTION DESIGN AND VALIDATION (Unfold, Steal, Execute, Decide)

**Goal:** design, benchmark, prototype and take the GO/NOGO decision.

#### UNFOLD (launch plan)

- **User flow:** the sequence of pages or screens touched to solve the first use case.
- **Multichannel mapping:** which channels are affected (in-app notification or popup, transactional
  email, information or education campaign, marketing site, social posts, help center).
- **Five touchpoints:** the five key moments when the user meets the feature.

#### STEAL (benchmark and inspiration)

- **Decomposition of the problem** into sub-problems.
- **Competitors and references:** how general tools solve this problem (an AI assistant for AI, a
  document tool for content, a project tool for collaboration), and how the tools of the product's own
  sector solve it.
- **Screenshots:** captures of the inspiring solutions.

#### EXECUTE (design)

- Design discussions (the product's design system).
- Mock-up, wireframe, prototype.
- **Step and Stretch versions:** the minimal version and the ambitious one.
- First user feedback on the UI and UX trials.

**HAPPY PATH:** the user's ideal flow.

**Prototype:** link to the prototype.

**The three behavioural hypotheses** (to validate in the tests):

1. Hypothesis 1: [expected behaviour]
2. Hypothesis 2: [expected behaviour]
3. Hypothesis 3: [expected behaviour]

#### DECIDE

- Usability tests (links to their entries in the feedback base).
- GO/NOGO checklist:
  - [ ] Are the three hypotheses validated?
  - [ ] Do we move from DISCOVERY to DELIVERY?
- **Decision: GO / NOGO**

**When GO:** `Status` moves to `Ready for development`.

### Phase 4: DELIVERY AND SPECS

**Goal:** specify for the developers, precisely.

#### TECHNICAL SPECS

- **Business rules:** edge cases, error handling, access rights.
- **Data structure:** JSON, database schema, fields.
- **Tracking:** the analytics events to implement to measure the success criteria of Phase 1 (the
  Discovery pivot, section 3, lists those that exist).

#### DEV TASKS

- The development tasks of the feature. Each one has a description, a `T-shirt size` and an assigned
  lot.

**When this phase starts:** `Status` moves to `Under Development`.

## Roadmap properties to update by phase

| Phase | `Status` | `Priority` |
|---|---|---|
| New opportunity | `Unqualified` | `LATER` |
| Problem discovery complete | `Discovery` | `NEXT` or `NOW` |
| Solution discovery complete | `Solutioning / Featuring` | `NOW` |
| GO decided | `Ready for development` | `NOW` |
| In progress | `Under Development` | `NOW` |
| QA | `Under Development` | `NOW` |
| Shipped | `Released` | `DONE` |

## How to use it

### Mode 1: create a new feature or opportunity

When someone says "I have a new idea, feature or problem to dig into":

1. Ask for the discovery context: where does the idea come from (user feedback, observation, data,
   intuition)?
2. Help phrase the **FRAME:** restate the problem in one impact-oriented sentence.
3. Suggest success criteria relevant to the product.
4. Identify the persona and write the **FIRST USE CASE** in its narrative format.
5. Propose to create the page in the roadmap base with the page skeleton below, pre-filled.

### Mode 2: advance an existing phase

When someone shares an existing feature:

1. Fetch the roadmap page.
2. Identify the current phase (through `Status`).
3. Detect what is empty or unfilled in the current phase.
4. Challenge and complete each missing section actively.
5. Propose the update of the properties when a phase is crossed.

### Mode 3: challenge, critical review

When someone wants to challenge a feature:

1. Fetch the page.
2. Assess the quality of each section against the criteria below.
3. Ask PM questions: "What happens if we don't do this?", "Do you have proof this is really the
   problem and not a symptom?", "Is the success criterion really measurable?"

## Quality criteria per section

**FRAME (problem in one sentence):** passes when it

- names a precise persona (not a generic "the user");
- quantifies the impact (time, frequency, rate);
- does NOT mention a solution.

**OBSERVE (verbatims):** passes when it has

- at least two verbatims from real users;
- at least one quantitative data point;
- the first use case in its full narrative format.

**CLAIM (hypothesis):** passes when

- it follows "If X, then Y" with a measurable indicator;
- the solution concept fits in two or three lines at most;
- the launch tweet is understandable by a non-expert.

**EXECUTE (behavioural hypotheses):** passes when there are

- three distinct, testable hypotheses;
- each one observable (not "the user understands better").

**SPECS (tracking):** passes when

- the tracked events match the success criteria of the FRAME;
- the edge cases are covered.

## Writing to the roadmap base

- **A new opportunity** is a new entry in `databases.roadmap`: `Name` = the problem, then the feature
  name once a solution is chosen; `Status` = `Unqualified`; `Priority` = `LATER`; the page body = the
  skeleton below. Feedback entries that support it are linked through `Feedback & Insights`.
- **An existing one** is fetched before any write, and only the sections of the current phase change.
- The `pos-tool-conventions` skill of the core, its Notion reference, is read before the first call.

## Expected behaviour

- **Always fetch** the roadmap page before answering about an existing feature.
- **Never skip** a phase: no technical specs while the problem is not framed.
- **Challenge systematically** the vague phrasings ("improve the UX", "make it simpler").
- **Propose concrete phrasings** rather than lists of questions.
- **Update the roadmap properties** when a step is crossed.
- **Answer in `product.team_language`.**
- **Be direct and pragmatic:** cycles are short.

## Page skeleton

Each phase is a toggle heading; its sections are children of the toggle.

```
# 1. PROBLEM DISCOVERY (Frame & Observe)
## FRAME
- Problem in one sentence: (for example: account managers lose 2 h a week copy-pasting)
- Non-scope (what we don't do): (for example: no PDF import for now)
**PROJECT AMBITION**
- Success criteria: (indicator, current level, target level)
- Damage control: benefit and risk balance: an indicator that could degrade or must be kept
- Timebox: 1w / 1m / 1q / 1y
## OBSERVE
- Social proof: (the linked entries of the feedback base)
- Key verbatims:
- Data: (for example: 40% of sessions stop at step 2)
- Empathy map
**FIRST USE CASE:**
I am <persona> and when I <use case>, what matters to me is <need>. But it turns out that <constraint>, so I have to <workaround>.

# 2. SOLUTION DISCOVERY
## EXPLORE
- List the solutions, compare pros and cons, including the effort (T-shirt size)
## CLAIM (the promise)
- The hypothesis: (for example: "If we add a Word import, setup time drops by 50%.")
- The solution (concept): (for example: a drop zone that parses the Word file)
Launch tweet:
> At this stage: rename the title to the feature name; move Status to "Solutioning / Featuring".

# 3. SOLUTION DESIGN & VALIDATION
## UNFOLD, to launch the new feature or change well and make it understood
- User flow: the pages to change, create or use to solve the first use case
- Multichannel mapping: an in-app notification or popup? an information or education campaign? a transactional email? a change to the marketing site? social posts? a help article?
- The five touchpoints of the user with the feature
## STEAL (inspiration, gold nuggets)
- Decomposition of the problem
- Competitors and benchmarks: how do general tools and the tools of our sector do it?
- Screenshots: paste the captures of other tools here
## EXECUTE (design, mock-ups)
- Design discussions (design system)
- Mock-up and prototype (or a wireframe when quick)
- Trade-offs: Step and Stretch versions
- Trade-offs: first user feedback on the UI and UX trials
- User flow: (a quick diagram)
**HAPPY PATH:**
Prototype: (link)
The three key expected behaviours (hypotheses 1 to 3):
1. Hypothesis 1:
2. Hypothesis 2:
3. Hypothesis 3:
## DECIDE
1. Usability test: links to the entries of the feedback base
2. Decision
- [ ] Do we validate the three hypotheses?
- [ ] Do we move from DISCOVERY to DELIVERY?
GO/NOGO

# 4. DELIVERY & SPECS
## TECHNICAL SPECS
- Business rules: (edge cases, errors, rights)
- Data structure: (JSON, database fields)
- Tracking: (the events to add to measure the success criteria of the Frame)
## DEV TASKS (detailed PRD)
- The tasks of the feature, each with its description, T-shirt size and lot
```
