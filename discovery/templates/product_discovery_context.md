# Discovery context

Skeleton version 1, maintained by `pos-discovery`.

Copy this file to `<pivots.dir>/product_discovery_context.md` (by default
`.claude/product/product_discovery_context.md`) and fill it before running a skill of the Discovery
module. It is the Discovery pivot: who the product's personas are, where what users say and do is
recorded, which analytics events measure an opportunity, and where the local transcription tool is
installed. The `pos-opportunity` skill reads it first and passes what each agent needs.

## Who reads it

| Reader | What it takes from here |
|---|---|
| `pos-opportunity` | all of it: the personas (1), the sources of feedback (2), the events (3) |
| `pos-prd` | the personas (1) for the first use case, the sources (2) for OBSERVE, the events (3) for the success criteria and the tracking of the specs |
| `pos-meeting-notes` | the personas (1), to set `Persona` on the entry |
| `pos-meeting-transcript` | the transcription tool (4); it asks the owner once and writes the answer there |
| `prd-voc` | the personas (1) and the sources (2), in the order section 2 gives |
| `prd-pm`, `prd-tech`, `prd-gtm`, `prd-ux` | the personas (1) |

## Rules for everything below the separation line

1. **One fact, one place.** The IDs of the shared bases stay in the product config
   (`databases.feedback`, `databases.roadmap`, `databases.crm`) and the analytics project in
   `analytics.*`; they are never copied here. What another pivot already states (the in-app reports
   query of the Support pivot, the positioning of the Go-to-Market pivot) is pointed to, not copied. A
   section that outgrows a screen moves to a reference file in `memory.dir`, listed in the memory
   index, and this page keeps a one-line pointer.
2. **No customer, institution or person names.** Personas are archetypes, described by role. A
   verbatim lives in the feedback base, never here.
3. **No secret.** No key, token or password. Name the variable or the file that holds it.
4. **A thin section is honest.** "None" and "not known yet" are findings. A skill that reads an empty
   section says so and continues without inventing what it would have held.
5. **Language.** Headings and table columns stay in English, so skills find them. Content is written
   in `product.team_language`.
6. **Section names are a contract.** Skills cite sections by number and name. Keep them; add the
   product's own sections after section 4.

## The sections

| # | Section | What it must answer |
|---|---|---|
| 1 | Personas | the product's own list: the exact option name each persona has in the `Persona` property of the feedback base and the CRM, who it is, buyer or user, and where the full personas document lives |
| 2 | Where feedback lives | every source of what users say and do, in the order the Voice of Customer reads them, with the read-only way to query each |
| 3 | Analytics events | the events that measure an opportunity's success criteria, and the ones that do not exist yet |
| 4 | Transcription tool | where the local transcription tool is installed on the machine that runs it, and how it is run |

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

# Product content

## 1. Personas

<!--
Guidance: the product's own personas, one row each.
- Option name: exactly as it reads in the `Persona` select of the feedback base and of the CRM. A
  definition that drifts from the option breaks the filtering of feedback by persona.
- Who: role, context of use, what matters to them, in one or two lines. Never a real person.
- Buyer or user: who decides the purchase, who uses the product daily, or both.
- Personas document: when a longer document holds the definitions and the discovery verbatims per
  persona, its path in the repository. It is then the single source of the definitions, and this
  table is its index.
- Anti-personas: who the product is not for, when known.
-->

**Personas document:** <!-- path, or "none: this table is the source" -->

| Option name in `Persona` | Who | Buyer or user |
|---|---|---|
| | | |

**Anti-personas:**

## 2. Where feedback lives

<!--
Guidance: every source of user signal, in the order the Voice of Customer reads them. The defaults:
1. the personas document (section 1), when it holds verbatims;
2. the feedback base, `databases.feedback` in the config (not copied here);
3. the in-app reports: when the Support module is installed, its pivot's section 2 holds the
   read-only query, and this row points to it; otherwise write the store and the read-only query
   here, without any column that identifies a user;
4. the positioning and pain points of the Go-to-Market pivot, when `modules.gtm` is true: context,
   never a raw source; a verbatim taken from it is cited with its origin.
Add the product's own (a support mailbox, a chat, a survey tool), by type, with how it is read.
Mark the ones that hold personal data: their content is paraphrased, never copied with an identity.
-->

| # | Source | How it is read (read only) | Personal data |
|---|---|---|---|
| 1 | Personas document | section 1 | |
| 2 | Feedback base | `databases.feedback` | yes |
| 3 | In-app reports | | yes |

## 3. Analytics events

<!--
Guidance: the provider and project are `analytics.provider` and `analytics.project_id` in the
config. List here the events a success criterion or a damage-control indicator can be measured on:
event name exactly as tracked, what it means, since when it is tracked. Events a PRD asked for and
that are not tracked yet go in the second table, so the next PRD knows the gap.
-->

| Event | What it means | Tracked since |
|---|---|---|
| | | |

**Asked for, not tracked yet:**

| Event | Asked by (roadmap entry) | Measures |
|---|---|---|
| | | |

## 4. Transcription tool

<!--
Guidance: filled by `pos-meeting-transcript` the first time it runs, from the owner's answer. One
machine per block when the team transcribes on several.
- Folder: where the tool is installed (it holds the virtual environment, the script, `input/` and
  `output/`).
- Python: the interpreter inside the virtual environment.
- ffmpeg: the folder of the ffmpeg binary, when it is not on the PATH.
- System: the operating system the procedure runs on.
- Default model: the model used when nothing points to another.
Write "not installed" when the team has no local transcription.
-->

**Folder:**

**Python:**

**ffmpeg:**

**System:**

**Default model:**

## Change log

<!-- One line per change: date, what changed, why. -->
