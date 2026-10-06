---
name: pos-domain
description: >
  Integrate a new unit of the users' trade into the product by a protocol, never by ad-hoc code. A
  unit is a self-contained piece of the domain with its own official sources, rules and judges: a
  regulatory regime, an archive corpus, a certification scheme. Three phases: Analyse (a lead and four
  analysts produce a gap analysis against the product's current model, then stop on missing
  documents), Integrate (understand, configure, evaluate: the LLM drafts, the human does the QA, a QA
  script on the configuration blocks), then Calibrate against real verdicts and Activate. Produces
  data (configuration, knowledge base entries, pivot updates, ground truth), never code per unit. Use
  when someone says "onboard this unit", "support X", "add X to the product", "gap analysis for X",
  "can we cover X", drops official documents meaning to cover them, or when a unit's official sources
  change version. "/pos-domain".
---

# Skill: Domain onboarding

## Role

The product captures the knowledge of its users' trade once, in the domain pivot, and integrates each
new unit of that trade through this protocol. A unit is a self-contained piece of the domain with its
own official sources, its own rules and its own judges: in a grant-writing product, a unit is a
funding programme; in a genealogy product, a corpus of records from one archive service; in a
compliance product, a regulatory regime.

What the protocol guarantees:

- **A unit enters as data**: configuration, knowledge base entries, pivot lines, ground-truth pairs.
  When a unit needs code, that code is a ticket for Delivery, built once for every future unit, never
  written for this unit alone.
- **Nothing the product says about the unit rests on anything but its official sources.**
- **No capability that judges work is switched on before it has been compared with real verdicts.**
- **Every limit of the product found on the way is kept as a ticket**, never hidden inside the unit's
  configuration.

**The main session is the lead.** A lead spawned as a sub-agent stalls between events, and its
analysts wait for a signal that never comes. The session reads `agents/unit-analysis-lead.md` as its
operating guide, spawns the analysts itself, and keeps the dialogue with the human.

## Read first

Before anything else, in this order:

1. **The product config** (`.claude/product/product.config.json`): `modules.*`, `databases.*`,
   `pivots.*`, `memory.*`, `git.*`, `product.team_language`.
2. **The domain pivot**, `<pivots.dir>/<pivots.domain>`, all of it. It says what the domain is, how a
   unit lives in the product (section 5), which units exist and where they stand (section 6), and
   where the ground truth lives (section 8).
3. **The memory index**, `<memory.dir>/<memory.index>`, then the files in `memory.always` and the files
   `routing.zones` lists for the zones a unit touches (typically the configuration subsystem and the
   product's AI).

If `reading_gate.skills` lists `pos-domain`, the reading gate holds shell commands and writes
until `memory.always` and that entry's `require` files have been read. List the pivot and the config
there as `pivot:<pivots.domain>` and `pivot:product.config.json`, so the gate enforces this reading
order instead of trusting it.

**If the pivot is missing or still empty, stop there.** The first job is to fill it from
`templates/product/product_domain_context.md`, drafted from what exists (official sources, existing
notes, the code) and corrected by the human. Without it, a gap analysis has nothing to compare against.

**If section 5 of the pivot does not name the configuration artefacts, their consumers and the QA
script**, Phase 1 can run but Phase 2 cannot. Say so, and make filling section 5 the first step of
Phase 2.

Memory first, code confirms: the pivot and the memory say where things are; the code is opened to
confirm them, and always before any negative claim.

## Invocation

```
/pos-domain <unit-id> --sources <path> [--reference <unit-id>] [--from analyse|integrate|calibrate]
```

- `unit-id`: the ID the product's catalogue already gives this unit, when there is a catalogue. Never a
  second name for the same unit: a new identifier next to an existing catalogue entry creates an
  orphan that nothing displays. A variant (a shorter first round, a lighter version of the same unit)
  is its own unit and carries the variant in its ID.
- `sources`: the folder holding the official documents.
- `reference`: the closest existing unit. The lead finds it when it is not given.
- `from`: resume at a phase. Resuming needs the onboarding record of the previous phase, with the
  human's decision written in it.

## The onboarding record

One record per unit, where section 6 of the pivot says records live (default
`<pivots.dir>/units/<unit-id>.md`; if the pivot names no place, use the default and add it to the
pivot). Every phase writes into it, and it is the only place the unit's decisions live. Headings in
English, content in `product.team_language`.

```markdown
# <unit name> (<unit-id>): onboarding
## 0. Missing documents          (Phase 1)
## 1. Verdict                    (Phase 1: Easy, Medium or Hard, and why)
## 2. Gap analysis               (Phase 1: model, configuration, product AI, knowledge base)
## 3. Decisions                  (every phase: doubt, decision, action, who, date)
## 4. Artefacts                  (Phase 2: what was written, where, validated when)
## 5. Product limits             (every phase: ticket ID, one line, blocking or not)
## 6. Non-official sources used  (every phase: what, where, why)
## 7. Calibration                (Phase 3: pairs, runs, results, decision)
## 8. Coverage cards             (end of each phase)
```

## Phase 1: Analyse

**Goal:** know what the unit needs, what the product already has, the gap between the two, and
whether to go. This phase writes nothing but the onboarding record.

1. **Compare against production.** The gap is measured against what production runs. Fetch
   `git.main_branch` from origin; if the working branch is behind, analyse in a clean, up-to-date
   worktree, never through a destructive checkout of a dirty tree. Configuration that lives in a
   database is read from the database, not from a file that may be an old draft.
2. **Intake**, by the session, following the lead guide: list every source file, classify each as
   official or third-party, read the official ones in full, extract the unit's profile, choose the
   reference unit.
3. **Checkpoint: missing documents.** List what is missing, which analyst needs it, where to find it,
   and its impact (blocking, degraded, minor). Ground-truth pairs belong on this list already, even
   though only Phase 3 uses them. Ask the human: continue with what is there, or fetch the rest? Do
   not start partial work without that answer.
4. **Four analysts**, spawned in parallel, in one message, in the background:

   | Analyst | Question it settles | Model |
   |---|---|---|
   | `unit-analyst-model` | Can the product's model carry the unit, element by element? Verdict Easy, Medium or Hard | strongest (judgment) |
   | `unit-analyst-configuration` | What configuration does the unit need, compared with the reference unit? A complete draft | faster (comparison) |
   | `unit-analyst-ai` | Which product AI agents, checks and scores work as they are, and can the product judge like the real judges? | strongest (judgment) |
   | `unit-analyst-knowledge` | What must the product's AI know? Knowledge base plan, unit sheet, pivot updates | faster (mapping) |

   Each brief carries all its context in the spawn prompt: a message sent later to an idle agent is
   not reliable. A model named by the human overrides the tiering. Tell the human in three lines who
   runs on what, then wait; never predict the results.
5. **Collect and verify.** A report is not proof: open the files behind every load-bearing claim.
   Resolve divergences between analysts (one says an element is new, another mapped it to an existing
   one) and write each resolution in Decisions: who said what, what was decided, why. An analyst that
   does not return is consolidated without, and the gap is flagged.
6. **Write** sections 0, 1, 2 and 5 of the record. Product limits are drafts at this stage; they are
   filed once the human has decided to go, since the decision can change them.
7. **Checkpoint: go.** Present the verdict first, then the gap, the product limits and the plan.
   **Stop.** The human decides: go, not now, or declined. Record the decision, set the unit to
   `analysed` in pivot section 6. Never chain into Phase 2 without that go.

**Verdict scale:**

| Verdict | When |
|---|---|
| Easy | configuration only; the reference unit is close; no new model element; the product's AI works as it is or with scope changes |
| Medium | configuration plus reframing of existing concepts or prompt changes; tickets, if any, are not blocking |
| Hard | new model elements, or a capability the product lacks in code; at least one blocking ticket |

## Phase 2: Integrate

**Goal:** the unit exists in the product as data, checked by the QA script, validated by the human,
attached to its instances. The main session leads this phase in dialogue with the human. Analysts
are not needed; read-only helpers may verify things in parallel.

File the tickets drafted in Phase 1 before starting (see the rules on product limits).

### The working loop: the LLM drafts, the human does the QA

For every artefact:

1. **Draft.** From the official sources, through the product's own extraction pipeline if it has one,
   otherwise by the session. The draft is written against its consumer's interface (pivot section 5),
   field by field, and every field left empty says why.
2. **Doubt map.** The session reads the draft against the sources and lists its doubts in three groups:
   - **Critical**: systemic. A convention broken, an incomplete list, a pattern that will recur on
     the next unit.
   - **Important**: one-off. A number misread, one item missing.
   - **Strategic**: a product question. A new convention, an extension of the schema.
3. **The human decides each doubt**: patch the draft (one-off errors); improve the one extraction step
   that produced it (systemic errors, since the fix serves every later unit); discuss (strategic); or
   accept the residue, written down. Improve one step at a time. If three or more steps show systemic
   doubts, stop and escalate: the inputs are more likely at fault than the steps.
4. **Present before writing.** Every artefact is shown as a table with one line of justification per
   row, followed by: "OK, or adjust before I write it?" Never "I set X" after the fact: the human
   cannot review what they did not see.
5. **QA script, blocking.** Run the QA script named in pivot section 5. Two exits only:
   - no blocking failure: write;
   - stuck (the same failure on the same element after two corrections, or a failure that needs a
     product decision): escalate in the format below.

   Nothing is written with a blocking failure, and nothing is "fixed by hand afterwards". Read the
   report correctly: a check that reports it skipped is mute, not passed. Count mute checks before
   calling the result green. If the product has no QA script yet, say so, file the ticket that asks for
   one, and treat the human's row-by-row review as the only gate.
6. **Write, announced.** Before each write, one sentence: what it writes, where, and whether users see
   it at once. An artefact marked "live on write" in pivot section 5 changes production the moment it
   is written: it goes in after the QA and after the human's explicit go. If the product has a
   staging environment, it goes there first.

```markdown
Escalation: <unit-id>, <artefact>
1. <element or failure category>
   - QA says: <the line of the report>
   - Why it blocks: <the decision that is missing>
   - Option A: <what it does, its effect>
   - Option B: <what it does, its effect>
   - Recommendation: <option, and one line why>
Rest of the QA: N passed, N warnings, N blocking, N mute
```

### 2a. Understand

The unit's facts and the analysis the product keeps about it.

- **Facts** (identity, dates, sizes, who may take part) are copied verbatim from the official source
  with their location, and stored where the product reads facts from, usually its catalogue: one
  fact, one owner. A fact kept only inside an analysis displays nowhere.
- **Numbers are read in their exact wording.** "Exactly N", "up to N" and "between X and Y" are three
  different settings: fixed, maximum, range. When one official statement surprises, look for another
  document from the same issuer before concluding it is a mistake.
- **Every requirement is classified by kind** (pivot section 4): who may take part, whether a
  submission is receivable, what the work must address, what applies after the verdict. The wrong
  kind produces a line nothing can ever satisfy.
- **Compare with the reference units.** Every divergence is either by nature (this unit really
  differs: keep it) or by omission (fill it).
- **Every term the unit defines** goes to pivot section 2, verbatim, with source, location and date.

### 2b. Configure

- **Map the official structure before drafting.** One row per part of the official form or
  structure: its title verbatim with its location, the configuration element that represents it, its
  kind, the pattern reused.
- **The kind follows what the source requires**: structured content fed by the model; narrative; a
  required table with no model behind it (reproduced faithfully as an editable structure, never forced
  onto a model element); fixed text; a questionnaire the user must answer (editable, never static).
- **An element is shown only when both conditions hold**: (a) the user designs it before producing
  their work; (b) a part of the unit's output consumes it. Prove (b) with a table naming, for each
  shown element, the output part that consumes it. The same holds field by field: shown but not
  consumed wastes the user's work; consumed but hidden asks for what the screen cannot give. A field
  hidden from the user is hidden from the product's AI too, or it will suggest values nobody can see.
- **Map by definition, not by word.** A unit can require a concept under another name. Check the
  verbatim definitions and the "Other names by unit" column of pivot section 2 before calling an
  element absent.
- **When the official form has no place for a concept** that the judges' criteria only imply, the
  official form wins: no custom section. The user covers it in the narrative; if the product should
  support it better, that is a ticket.
- **Tables:** every column header and row label is copied verbatim from the official form. Map each
  column to an entity and field of the model before binding it. No phantom field: a column with no
  field is escalated.
- **Reuse:** a close existing name or pattern is reused. A new name says what the thing is for, never
  which unit it came from, so the next unit can reuse it.
- **Registries:** read them before drafting (pivot section 5). A reference to a registry is an
  existing identifier, never an invented string: invented identifiers are ignored in silence.
- **Derived settings are derived.** Whatever the product documents as following from the model
  decisions (which checks or agents are off) is computed with that mapping, not chosen. A derogation
  goes in Decisions with its reason.
- **Engine vocabulary.** A slot read by one of the product's engines takes the engine's keys, never
  the unit's words; the unit's own criteria go in the slots meant for them. A dimension that stays
  constant for this unit is removed, not left to inflate a score.
- **Filters orient.** A list restricted for this unit names values that exist, in the key the code
  reads. It keeps what the unit really produces, not everything it is allowed to produce, and it keeps
  the "other" escape if the product has one. An "other" that becomes the majority is a hole in the
  reference data: a product decision, not a local fix.
- **One fact, one slot.** A value the product stores in one place is not copied into another slot for
  convenience.
- **The strictest consumer decides.** A value the preview accepts can still break another consumer (an
  export, an import). Check against all of them.
- **Attach.** A family of units that share a configuration gets one rule in data, not a patch per
  instance: every match value proven on real data, with the proof in the rule's note; the narrowest
  match; a dry run read before applying. Automatic rules fill only empty values and never overwrite a
  human's choice. Instances no rule resolves are shown to a human, never guessed. Then the product's
  own resolver must return this configuration for a real instance of the unit. A configuration that
  nothing points to is an orphan, and the unit is not integrated.

### 2c. Evaluate

Only when the product has a capability that judges (pivot section 5).

- The judges' criteria, weights, thresholds and scale are copied verbatim into the evaluation
  configuration. The scale is handled by the product's engine, never written into a prompt for one
  unit.
- **Every declared criterion has an executor that resolves for this unit, and exactly one per role.**
  Two matches resolve by chance. A criterion or a check declared without its executor never runs, and
  nothing says so: after the first run, confirm that each one ran.
- The judges' criteria are never mapped by force onto evaluators built for another unit's criteria:
  that produces scores that mean nothing. A missing evaluator is a ticket.
- What can be computed is computed in code, not asked of a model. A spot check asked of a model is a
  factual question answered with a verbatim quote ("does the text contain X? quote it"), not one more
  judgment the evaluators already make.
- Checks on who may take part and whether a submission is receivable are configuration or code,
  never a model's opinion.
- A shared evaluator's prompt serves every unit and is live at once. When this unit's calibration
  diverges, the unit gets its own scoped copy (and leaves the shared one), rather than an edit of the
  shared prompt. A prompt that needs a new variable waits until the code that fills it is deployed.
  Prompt changes follow the AI Engineering change protocol when Delivery provides one.

### Coverage card

At the end of Phase 2, into the record:

- **Checked by the session**: what ran, with its results.
- **Holes left**: residues accepted, checks that stayed mute.
- **For the human to test**: an end-to-end list on a test instance in the team's own space (create an
  instance of the unit, work through it, produce its output). Never in a customer's space, never on a
  customer's real document, not even a copy made inside their space.

Set the unit to `integrated` in pivot section 6.

## Phase 3: Calibrate, then Activate

### Calibrate

Needed for every capability that judges. The ground truth is a set of pairs: a piece of submitted work
and the real judge's verdict on that same work (pivot section 8).

- **No pair, no activation of a judging capability.** Ask for pairs from Phase 1 onward.
- **Store each pair first**, where pivot section 8 says, with its unit, its provenance and the right to
  keep it. A pair that exists only in a conversation cannot be re-run.
- **Read the unit of a pair from the verdict document itself.** A catalogue entry or a note can point
  to the wrong unit.
- **Run on copies in the team's test space**, never in a customer's space. Run each pair several times,
  three at least: one run of a model proves nothing.
- **Measure in order**: recall (the weaknesses the judge found that the product also found), then
  expansion (what the product found beyond the judge, not a fault by itself, but read it), then score
  agreement (models tend to be lenient; scores bunched at the top are a signal).
- **Present the change as the human will perceive it**: the product's output next to the verdict,
  before and after, with the side effects on other units. Numbers from a test bench alone are not a go.
- **Adjust through the Phase 2 loop** (draft, QA, present, write), then run again.

### Activate

- **The human decides, capability by capability.** A capability that does not judge can be switched on
  after a green QA and the human's end-to-end test. A capability that judges needs the calibration
  result against the thresholds of pivot section 8. A unit with no pairs yet can be activated for its
  other capabilities, with its judging capability left off and said so.
- **Activation is derived from the configuration being present**, not from a separate flag that can
  drift. A capability that is not configured for this unit shows an honest "not available yet for
  this unit" state with a way to ask for it, never a silent degraded mode that looks like the real
  thing.
- **Update the pivot**: section 6 (state, capabilities on, calibration line, sources version, tickets,
  review date) and section 8.
- **Hand over** (below).

## Rules across the three phases

- **An official source beats a third-party guide.** When a third-party structure is used anyway
  (because it helps the user), it is written in record section 6 with its reason.
- **Definitions are quoted verbatim**, with issuer, document, version, location and date.
- **Onboarding produces data, not code per unit.** Configuration, knowledge base entries, pivot lines,
  ground-truth pairs. If the unit needs code, that is a ticket.
- **A limit of the product is a ticket, never a workaround in the unit's configuration.** Forcing the
  unit into a shape the product already has (its criteria onto another unit's evaluators, its concepts
  onto elements that mean something else, invented keys) hides the limit and corrupts the unit.
  - A missing capability goes to `databases.roadmap`; a capability that misbehaves goes to
    `databases.fix_backlog`, with its reproduction. Each ticket carries: a title, what exactly is
    missing, the units it blocks, blocking or not, the effect if it is not done, an effort estimate.
  - If the database is not configured, say "`databases.<key>` is not configured", keep the ticket in
    record section 5, and tell the human.
  - The only interim allowed is an honest, visibly manual stand-in that stays faithful to the official
    source (for example an editable table reproducing a required one verbatim), declared as such in the
    record and linked to its ticket.
- **The ground truth is stored where the product can re-run it**, never only in a conversation or a
  personal folder.
- **No negative claim without opening the file.** "The schema does not carry X", "there is no Y", "we
  use Z": each takes thirty seconds to check, and each has been wrong before.
- **A behaviour invoked as a given is checked in the code once per session.** A memory note saying a
  fallback exists does not prove it was built.
- **Read the owner of a subject first**: the memory, plans and handoffs that own it, before searching
  the code. Otherwise the session re-discovers, at a cost, what was already decided, and sometimes decides
  the opposite.
- **Read sources whole.** Never a truncated slice of a section.
- **Generated values come from the product's pipeline.** Correcting a draft before it is written is
  the QA. Typing generated values into the live store afterwards is a one-off that the next run erases
  and the next unit never gets.
- **A customer's space is never driven.** Reading at most; no script, no browser, no write in a
  customer's space. Tests and calibration happen in the team's own space, on copies.
- **No customer, institution or person names** in the pivot, the knowledge base or anything public.
- **Push only on an explicit go** when `git.push_deploys` is true.
- **Every incident moves a rule one rung up.** A defect the human caught that a script could have
  caught becomes a new check in the QA script (a ticket for Delivery), and this protocol names it.

## Checkpoints where the human decides

| # | When | The human decides | Nothing happens before |
|---|---|---|---|
| 1 | After intake | continue despite missing documents, or fetch them | the analysts are spawned |
| 2 | End of Phase 1 | go, not now, or declined | Phase 2 starts |
| 3 | Each doubt of a draft | patch, improve a step, discuss, or accept | the next draft |
| 4 | Each artefact | OK, or adjust | the artefact is written |
| 5 | Each write to a store that is live on write | go | the write |
| 6 | After calibration | which capabilities are switched on | activation |
| 7 | Code or migrations to push | go | the push |

Everything else the protocol decides itself: which analyst, which pattern, which reference unit, how a
doubt is phrased. A question to the human is a decision only they can take, never a choice the sources
already settle.

## Hand-overs

| Signal | Goes to | How |
|---|---|---|
| A capability the product lacks | Delivery (`modules.delivery`) | ticket in `databases.roadmap`; built once, for every unit, through Delivery's build workflow |
| A capability that misbehaves | Support and Success (`modules.support`) | entry in `databases.fix_backlog` with its reproduction |
| A prompt change for a product AI agent | Delivery, AI Engineering | the change, its reason, and the pairs to re-run; applied through its change protocol |
| Calibration pairs and results | Assurance (`modules.assurance`) | the pairs become the unit's evaluations, re-run on every change to a shared evaluator; calibration itself stays here |
| A check missing from the QA script | Delivery, then Assurance owns it | ticket |
| Activation | Release and Operations (`modules.release_ops`) when configuration ships through code; Go-to-Market (`modules.gtm`) to announce; Support and Success for help content | the coverage map line and the record |
| Which unit to onboard next | Discovery (`modules.discovery`) | the coverage map, read next to the demand signals in `databases.feedback` |

When a module is not installed, say "`<module>` is not installed: <what is left undone>", write it in
the record, and continue. Never do the module's work in its place, and never present it as done.

## DO

- Read the pivot, the config and the memory index before the first source document.
- Put the verdict first in every Phase 1 presentation.
- Cite the official source and its location for every fact, number, definition and criterion.
- Prove every "shown" element with the output part that consumes it.
- Fill each consumer's interface field by field, and say why each empty field is empty.
- Count mute checks before declaring a QA green.
- Write the coverage card at the end of each phase: what ran, what is left, what the human must test.
- Update pivot sections 2, 4, 6, 7 and 8 as the unit moves, below the separation line only.

## DON'T

- Invent an identifier, a key, a name or a number.
- Copy a setting or a number from a neighbouring unit because it is "the same family".
- Enrich a shape the consumer expects flat. Nuance goes in the slots made for it.
- Chain one phase into the next without the human's go.
- Write a draft into a live store "to see what it does".
- Improve several extraction steps in a chain.
- Edit a shared, live prompt for the sake of one unit.
- Rewrite the product's extraction pipeline during an onboarding. A failing step is improved in
  isolation; a limit of the pipeline is a ticket.
- Declare a unit integrated on the strength of a gap analysis or a draft.
- Write code for one unit.
- Ask the human a question the sources answer.

## Agents invoked

- Phase 1: `unit-analyst-model`, `unit-analyst-configuration`, `unit-analyst-ai`,
  `unit-analyst-knowledge`, through the Agent tool, read-only.
- Phases 2 and 3: none by default; read-only helpers for parallel verification.
- `unit-analysis-lead` is read by the session as its guide. It is never spawned.
