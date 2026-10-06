# Domain context

Skeleton version 1, maintained by `pos-core`.

Copy this file to `<pivots.dir>/<pivots.domain>` (by default `.claude/product/product_domain_context.md`)
and fill it before running any skill. It is the domain pivot: the knowledge of the users' trade,
written once, then read by product decisions, by the configuration of each unit and by the product's
AI. The skill `pos-domain` reads it first and updates it at the end of every unit it integrates.

## Who reads it

| Reader | What it takes from here |
|---|---|
| Every session, before domain work | the domain in one page, the glossary, the phases of the user's work |
| `pos-domain` and its analysts | how a unit lives in the product, the units and their coverage, the references, the ground truth |
| Product decisions (Discovery, Design) | the phases of the user's work, the judges' criteria, the coverage map |
| Configuration work (Delivery) | the glossary, how a unit lives in the product |
| The product's AI (prompts, knowledge base) | the glossary, the judges' criteria, the knowledge base document types |

## Rules for everything below the separation line

1. **An official source beats a third-party guide.** An official source is published by the body that
   defines the unit or judges the work. A guide, a summary, a course or a blog post is third-party:
   useful, never normative. When the two disagree, the official source wins, and any use of the
   third-party one is written down with its reason.
2. **Definitions are quoted verbatim**, between quotation marks, in the language of their source, with
   the issuer, the document, its version, the section or page, and the date it was read. A paraphrase
   is an opinion with quotation marks on it: it goes in a note, never in a definition.
3. **A number is copied from its source**, with its location. Never from memory, never from a
   neighbouring unit "because it is the same family".
4. **One fact, one place.** This page stays short: a reader should get the domain in ten minutes. When
   a section outgrows a screen, its detail moves to a reference file in `memory.dir`, listed in the
   memory index, and this page keeps a one-line pointer.
5. **A thin section is honest.** "Not known yet" is a finding. A plausible guess becomes a fact nobody
   re-examines.
6. **No customer, institution or person names.** This file is read by tools that write public
   material and by the product's AI. Describe by type ("a regional archive service", "a mid-size
   operator").
7. **Language.** Headings and table columns stay in English, so skills find them. Content is written
   in `product.team_language`. Quotes stay in the language of their source.
8. **Section names are a contract.** Skills find sections by the names below. Keep them; add the
   product's own sections after section 8.

## The sections

| # | Section | What it must answer |
|---|---|---|
| 1 | Domain in one page | whose trade this is, what they produce, who judges it, what a unit is, what makes the trade hard |
| 2 | Glossary | every term that matters, defined verbatim from an official source, mapped to the product's concepts and to the names other units use |
| 3 | Phases of the user's work | the real workflow, in the user's order, and what the product must not do in each phase |
| 4 | Judges' criteria | who the real judges are, how they reach a verdict, their criteria verbatim, the four kinds of requirement |
| 5 | How a unit lives in the product | the capabilities a unit can get, the model, the configuration artefacts and their consumers, the registries, attachment, the QA script |
| 6 | Units and coverage | every unit the product knows of, its state, its capabilities, its calibration, its tickets, its onboarding record |
| 7 | References and knowledge base | the index of references, and the document types of the product AI's knowledge base |
| 8 | Ground truth | where the pairs of submitted work and real verdict live, how calibration re-runs them |

## Coverage states (used in section 6)

| State | Meaning |
|---|---|
| `listed` | known, not analysed |
| `analysed` | Phase 1 done; the human's decision (go, not now, declined) is in the onboarding record |
| `integrating` | Phase 2 in progress, or back in progress because the official sources changed version |
| `integrated` | configuration written, QA green, attached to its instances; nothing switched on yet |
| `calibrated` | the capabilities that judge were compared with real verdicts |
| `active` | the capabilities the human switched on are live (see "Capabilities on") |
| `declined` | decided not to cover, with the reason |
| `retired` | no longer offered |

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

# Product content

## 1. Domain in one page

<!--
Guidance: half a page, plain words, for a newcomer to the team or a fresh session.
- Whose trade is this? The users, their role, the kinds of organisation they work in (types, never names).
- What they produce, and who decides whether it is good enough (the real judges, section 4).
- What a unit is in this domain, with two or three examples by type. For example, in a genealogy
  product a unit is a corpus of records from one archive service; in a compliance product, a
  regulatory regime.
- What makes the trade hard: the two or three things users get wrong most often.
- What the product does in this trade, and what it deliberately does not do.
-->

**Users:**

**What they produce:**

**Who judges it:**

**A unit is:**

**What makes the trade hard:**

**What the product does, and does not do:**

## 2. Glossary

<!--
Guidance:
- One row per term that the users, the official sources or the product's AI rely on.
- Official definition: verbatim, between quotation marks, in the language of the source. If only a
  third-party definition exists, say so in the Source column ("third-party, non-normative") and keep
  looking for the official one.
- Source: issuer, document title, version, section or page. Retrieved: the date you read it.
- Product concept: the entity or field of the product that carries the concept, if any.
- Other names by unit: the words other units use for the same concept. A unit can require a concept
  without ever using its word: map by definition, not by word.
- When the table grows past a screen, move it to a reference file in `memory.dir` and keep the ten
  most used terms here.
-->

| Term | Official definition (verbatim) | Source (issuer, document, version, location) | Retrieved | Product concept | Other names by unit |
|---|---|---|---|---|---|
| | | | | | |

### Pairs that are often confused

<!--
Two terms that users, sessions or the product's AI mix up, and the one-line test that separates them.
Shape of a good test: "X is what is produced; Y is the change that happens when someone uses X."
Every test cites the definitions it rests on.
-->

| Term A | Term B | The test that separates them | Source |
|---|---|---|---|
| | | | |

## 3. Phases of the user's work

<!--
Guidance: the real workflow of a user, in their order, not the product's screens.
- The user's question: what they are asking themselves in this phase, in their words.
- What the product must not do here: for example, talk about the final judgment while the user is
  still building their material, or explain a concept to someone who has already defined ten of them.
- Novice and expert: a novice needs the trade explained; an expert wants the gaps shown.
- If the Discovery module keeps personas, link them; do not copy them here.
-->

| # | Phase | The user's question | What they produce | What the product must not do here | Novice and expert |
|---|---|---|---|---|---|
| 1 | | | | | |

## 4. Judges' criteria

<!--
Guidance:
- Who judges: roles, never names. How many per submission.
- How a verdict is reached: alone, then a consensus? A rapporteur who writes it up? Can a judge
  override the others?
- The verdict document: what it contains, whether the product's users ever receive it (if they do,
  it is ground truth, section 8).
- Criteria verbatim from the official source, with weights, thresholds and the scale exactly as
  written, including its direction (is a lower score better?).
- What judges look for under each criterion: from the judges' own guide first, then from real
  verdicts. Say which is which.
- When criteria differ by unit, keep here what is common and point to the unit's onboarding record
  for the rest.
-->

**Who judges:**

**How a verdict is reached:**

**The verdict document:**

| Criterion (verbatim) | Weight | Threshold | Scale | What judges look for | Source |
|---|---|---|---|---|---|
| | | | | | |

### Kinds of requirement

<!--
A unit's requirements come in four kinds, and each goes to a different place in the product. Putting a
requirement in the wrong kind produces a line nothing can ever satisfy (for example, an obligation that
applies after the verdict shown as something the work must "cover"). Record the words this domain uses
for each kind, and one real example.
- Who may take part: derived from the data the user enters; the product checks it.
- Whether a submission is receivable: completeness, size, format, declarations; a deterministic check
  or the user's explicit confirmation.
- What the work must address: answered by something the user plans or writes.
- What applies after the verdict: cannot be judged at submission; at most an instruction to the user.
-->

| Kind | This domain's words | Checked by | Example |
|---|---|---|---|
| Who may take part | | | |
| Whether a submission is receivable | | | |
| What the work must address | | | |
| What applies after the verdict | | | |

## 5. How a unit lives in the product

<!--
Guidance: this section is what lets the onboarding protocol run without inventing anything. Name
things and point to the architecture memory for their internals; do not copy the internals here.
-->

### Capabilities per unit

<!--
What the product can offer for one unit, each switched on separately. A typical split:
- knowledge: the product knows the unit's facts and rules, and its assistant can answer about them;
- work: users can produce their work for this unit inside the product;
- judgment: the product evaluates work the way the real judges would.
Mark the capabilities that judge: only those need calibration against real verdicts before activation.
Activation switch: what makes the capability live for a unit. Prefer a switch derived from the
configuration being present over a separate flag that can drift.
-->

| Capability | What the user gets | Judges? | Activation switch (derived from) |
|---|---|---|---|
| | | | |

### Model

<!-- The product's core concepts that carry the domain: entities, their key fields, their relations.
One line each, with the memory file that documents it. -->

| Concept | Carries (glossary term) | Documented in |
|---|---|---|
| | | |

### Configuration of a unit

<!--
Every artefact a unit is made of. Consumer = the code or interface that reads the artefact: it is the
source of truth for the artefact's shape. A draft is written against its consumer, field by field,
never by copying another unit's artefact.
"Live on write" = yes when writing the artefact changes what users see at once (for example a row in
the production database).
-->

| Artefact | Lives in | Consumer (file or interface) | Written by | Live on write |
|---|---|---|---|---|
| | | | | |

### Registries to read before drafting

<!-- Lists of valid identifiers that a configuration may reference: agent names, check identifiers,
reference values. Give the read command or query for each. An invented identifier is silently
ignored at runtime, which is worse than an error. -->

| Registry | Read with |
|---|---|
| | |

### Attachment and recognition

<!--
How an instance of a unit (a new record, document, case) gets attached to its unit's configuration:
by a rule in data for a whole family, or one instance at a time. Where the rules live, how a dry run
is done, and where the instances that no rule resolves are shown to a human.
-->

### QA script

<!--
The command that checks a unit's configuration before it is written, what it checks, and what counts
as blocking. If it does not exist yet, write "none" and link the ticket that asks for it.
List the conditions under which a check skips itself: a skipped check is mute, not passed.
-->

**Command:**

**Blocking when:**

**Checks that can skip silently:**

### Reference units and patterns

<!-- The units that serve as the reference for each family, and where the catalogue of reusable
configuration patterns lives, if there is one. -->

| Family | Reference unit | Why this one |
|---|---|---|
| | | |

## 6. Units and coverage

<!--
Guidance: one row per unit the product knows of, covered or not. States are defined above the
separation line.
- Unit (ID): the product's catalogue ID when there is a catalogue; never a second name for the same
  unit. A variant (a shorter first round, a lighter version) is its own row.
- Family / reference: the existing unit this one was built from.
- Capabilities on: which capabilities of section 5 are live for this unit.
- Calibration: number of ground-truth pairs, and the last result in one line, with its date.
- Sources version: version and date of the official documents the configuration follows. When the
  issuer publishes a new version, the unit goes back to "integrating" for the parts that changed.
- Tickets: the product limits found while integrating it (IDs in the roadmap or the fix backlog).
- Record: link to the unit's onboarding record.
-->

**Onboarding records live in:** <!-- a folder or a database; default `<pivots.dir>/units/<unit-id>.md` -->

| Unit (ID) | Family / reference | State | Capabilities on | Calibration | Sources version | Tickets | Record | Reviewed on |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## 7. References and knowledge base

<!--
Guidance: the index of what is consulted, not its content.
- Official sources first. A third-party guide is listed as third-party and never outranks an official
  source.
- Reference files in `memory.dir` (definitions, method, catalogues of patterns) are listed here and in
  the memory index.
- Read by: which skill, agent or part of the product reads it.
-->

| Reference | Kind (official, third-party, internal) | Units | Where | Version, date | Read by |
|---|---|---|---|---|---|
| | | | | | |

### The product AI's knowledge base

<!--
If the product's AI retrieves domain documents: where the knowledge base lives, the ingestion command,
and the document types. One type per use, so a retrieval can ask for the right kind of document.
Typical types: method guide (how to do the work), form instructions (what the output must contain),
judges' guide (how work is judged), unit rules (scope, dates, sizes, who may take part), definitions.
Write "none" if the product's AI does not retrieve documents.
-->

**Lives in:**

**Ingestion command:**

| Document type | Used for | Example source |
|---|---|---|
| | | |

## 8. Ground truth

<!--
Guidance: pairs of submitted work and the real judge's verdict on that same work. They are the only
evidence that the product judges the way the judges do. For example: in a compliance product, a filing
and the regulator's decision; in a genealogy product, a transcription and its reviewed, validated
version.
- Stored in: a place the product's calibration can re-run (a folder in the repository, a table the
  calibration script reads), never only a chat, a mailbox or a personal folder.
- A pair carries: the work, the verdict, the unit ID, its provenance and the right to keep it, the date.
- The unit of a pair is read from the verdict document itself, not from a note about it.
- Pairs are kept only with the right to keep them, and stripped of what identifies people when they
  leave their owner's space.
- Metrics, in this order: recall (the weaknesses the judge found that the product also found),
  expansion (what the product found beyond the judge, not a fault by itself), score agreement.
- Thresholds for activation: what result, on how many pairs, over how many runs, switches a judging
  capability on.
-->

**Stored in:**

**Calibration command:**

**Metrics and thresholds for activation:**

| Unit (ID) | Pairs | Provenance | Last run | Result | Decision |
|---|---|---|---|---|---|
| | | | | | |

## Change log

<!-- One line per change outside the onboarding protocol's own updates: date, what changed, why. -->
