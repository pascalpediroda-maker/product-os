# Product marketing context (GTM pivot)

Skeleton version 2, maintained by `pos-gtm`.

Copy this file to `<pivots.dir>/product_gtm_context.md` (by default
`.claude/product/product_gtm_context.md`) and fill it before running a skill of the
Go-to-Market module. It is the GTM pivot: the single source of truth for go-to-market. Every GTM
skill reads it before acting: `pos-gtm`, `pos-campaign`, `pos-social-visual`, and every skill of the
vendored marketing library, which expects a `product-marketing-context.md` file and is pointed here
instead. `pos-gtm` and `pos-campaign` read it in full at every launch, the persona sheets of section 2
included: a skill that read only some sections wrote emails without knowing the personas.

## Why it exists

Without it, GTM knowledge is scattered across personas documents, launch plans, business plans and
fragments of memory. Every action (a post, an email, a deck) rebuilds the context, which costs time
and produces inconsistent messages. This pivot is read first by every GTM skill, and consulted by the
owner before a meeting or a decision.

## Who reads it

| Reader | What it takes from here |
|---|---|
| `pos-gtm`, coach mode | the whole pivot; its state of play draws on section 1 and the sections the subject touches (for example 13 for a motion), the motions (13), the channels (12), the open pricing topics (15), the sources (appendix) |
| `pos-gtm`, execute and campaign plan modes | the constraints it enforces on every output: confidentiality (16), voice and lexicon (7), verbatims (5), motions (13), moats by audience (4), pricing state (15), what the product covers (1), the channel anti-patterns (12), the positioning (9); the prospecting plan, the campaigns page and the claims reference (appendix) |
| `pos-campaign` | the whole pivot: the persona sheets and the adoption profile (2), the verbatims (5), the voice, the lexicon and the cold-mail rules (7), the chain of work (9); the campaigns base, the sending tool, the sequence texts, the feature sheet and the claims reference (appendix) |
| The persona avatars (built by `pos-gtm`) | the persona sheets and the adoption profile (2), the verbatims (5) |
| `pos-social-visual` | the personas (2), the pains (3), the voice (7), the proof points and how a figure is hedged (8), the posts base (appendix) |
| The marketing library | everything a `product-marketing-context.md` holds: product, audience, pains, competition, language, objections, voice, proof, positioning |
| The GTM perspective (`prd-gtm`, in `pos-discovery`) | positioning, personas, competition and pricing, when a product decision has a GTM side |

## Governance

1. **This document wins on conflict.** Any inconsistency found between this pivot and another
   document: this pivot wins, and the other document is updated.
2. **Update trigger.** Every major GTM decision updates it in the same session: a motion switched on
   or off, a pricing change, an ICP extended, a competitor threat reclassified. At least every 30
   days otherwise.
3. **Changelog.** Every update adds one dated line at the top of the appendix "Changelog": the
   version, the sections changed, what changed, and the trigger. A wrong summary is fixed at the
   source, here, never with a note elsewhere.

## Rules for everything below the separation line

1. **One fact, one place.** The OS bases stay in the product config (`databases.crm`,
   `databases.feedback`) and are never copied here. Bases that only GTM uses (a GTM actions base, a
   posts base, a campaigns base) are named in the appendix "Canonical sources" with their data source URL. A detailed
   source (a personas document, a competitive analysis, a launch plan) is pointed to, not copied. A
   section that outgrows a screen moves to a file under `<memory.dir>/gtm/`, listed in the memory
   index, and this page keeps a one-line pointer.
2. **Names.** This is an internal document: verbatims may carry who said them, and accounts may be
   named. Nothing from it reaches public copy with a customer, institution or person name (rule 41):
   the skills anonymise on the way out.
3. **No secret.** No key, token, password or connection string.
4. **A thin section is honest.** "None" and "not known yet" are findings. A skill that reads an empty
   section says so and continues without inventing what it would have held.
5. **Language.** Headings and table columns stay in English, so skills find them. Content is written
   in `product.team_language`; verbatims stay in the language they were said in.
6. **Section names are a contract.** Skills cite sections by number and name. Keep them; add the
   product's own sections after section 16, before the appendices.

## The sections

| # | Section | What it must answer |
|---|---|---|
| 1 | Product overview & business model | what the product is in one canonical descriptor, its scope along the user's chain of work, its mission, what it is not, the business model and plans, the revenue target, the stack and the single domain, the product state (released, in progress) |
| 2 | Target audience & decision-makers | the persona sheets (who, temperaments, what vexes them, their pains in their words, their SONCAS profile, what makes them reply or close), the adoption profile that crosses the personas, the personas and their GTM priority, the buyer matrix (who buys, who decides, who influences, at which tier), the anti-personas |
| 3 | Problems, pain points, switching dynamics | the dominant pains ranked by recurrence, where prospects come from, what stops them switching |
| 4 | Competitive landscape & differentiation | the categories of competitors and their threat, the structural moats and what is not a moat, which moats to put forward per audience, the argument against each alternative |
| 5 | Customer language | the verbatims to reuse as they are, by theme |
| 6 | Objections & how to handle | each objection heard and the answer |
| 7 | Brand voice | the voice principles, the tone per channel, the signature phrases, the words to avoid, the lexicon (their words, our words), the cold-mail rules learnt from real sends, and the owner's own voice when the owner writes in person |
| 8 | Proof points | the proof available today, and the proof still to acquire |
| 9 | Positioning & wedge | the tagline, the one-liner, the market context, the wedges and their beats along the chain, the core values and value axes, how the product delivers them per persona, the category |
| 10 | Use cases | the flat list of use cases, and the ones deprioritised |
| 11 | Buying journey & trigger events | the triggers per persona, the real sales cycle per tier, the seasonality |
| 12 | Channels of acquisition | each channel with its status, and the anti-patterns that are never used |
| 13 | Motions | each motion: target, vector, cycle, message, channel, pricing, status, KPI |
| 14 | Account types & buying committees | per type of account: champion, user, buyer, blocker, cycle, strategy |
| 15 | Pricing & packaging state | the owner's current pricing decision, the grid and what is published, the market signals, the open topics |
| 16 | Compliance & trust | the trust assets today, the gaps, the confidentiality rule, the pre-sale trust signals |
| Appendix | Canonical sources | where each detailed source and each GTM-only base lives |
| Appendix | Changelog | one dated line per version |

Sections 1 to 12 follow the structure the marketing library expects. Sections 13 to 16 extend it.

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

# Product content

**Version:** <!-- v1, date -->
**Owner:** <!-- the role who decides GTM for the product -->
**Update trigger:** any major GTM decision (a motion switched on or off, a pricing change, an ICP
extended, a competitor threat reclassified), or at least every 30 days.

## 1. Product overview & business model

<!--
Guidance:
- Canonical descriptor: one paragraph to reuse as it is in every summary, pitch or bio. Then a
  guardrail: what a summary must always show (the scope beyond the single most visible feature), so
  no summary shrinks the product to one link of the chain.
- Scope along the chain of work: the stages of the user's work the product covers today, and the ones
  that are emerging.
- Mission: what the product replaces (the status quo stack), across the whole scope.
- What the product is not: the positioning commitment that is also a moat (section 4).
- Business model: the plans, their price and their terms, in a table. Say what is published and what
  is internal (section 15 holds the details).
- Revenue target: the threshold that validates continuation, and the target that makes the product
  viable.
- Stack and domain: what supports trust claims (hosting, model providers), and the single domain the
  copy uses.
- Product state, dated: released, and in progress or prioritised. A feature not listed as released is
  never promised in copy.
- Pointer to the detailed pitch source, if any.
-->

## 2. Target audience & decision-makers

<!--
Guidance:
- The persona sheets below are read in full before any message (`pos-campaign`, step 0). They use the
  same persona codes as the `Persona` property of the CRM and of the feedback base. Pointer to the
  detailed personas source and to the evidence behind each claim (feedback entries).
- Corrections of earlier persona documents not to repeat: an angle or a figure that hurt a real
  reader, a budget assumption the facts contradicted. One line each, with what happened.
- What makes them reply, what makes them close, from real sends: which message got which reply,
  which line made a reader close. Facts only.
- Quick synthesis: one row per persona (an ID such as P1, P2...).
-->

### Adoption profile: an axis that crosses the personas

<!--
Every person also sits on the diffusion of innovation curve (Rogers): innovators, early adopters,
early majority, late majority, laggards. It is neither a persona nor a temperament: any persona can be
an early adopter or of the majority.
- Who we look for today, and why (early adopters become the references).
- How to recognise them: the signals (they built their own tools, they speak of a problem to solve
  rather than of a tool, they offer to co-build), and which of these signals is a segmentation column
  of the batches.
- The majority: what it needs (peer references, a finished product without risk, its institution's
  validation), and how it will come (through the early adopters' references).
- Consequence for messages: the cold message is the filter. It is written so an early adopter
  recognises themselves and replies, and so a member of the majority ignores it without being vexed.
  The replies tell who is an early adopter.
-->

### Persona sheets

<!-- One subsection per persona that a message targets. These sheets feed the persona avatars
(`.claude/agents/avatar-*.md`, built by `pos-gtm`). -->

#### <!-- persona code and name -->

- **Who:** <!-- the role, the kind of organisation, how their time splits, who they report to, their
  buying power; reference people by name (internal document) -->
- **Temperaments:** <!-- the temperaments seen among them (for example trust and compliance, decisive
  and firm, the one who takes initiatives), each with the person it was seen in -->
- **What they think they know, what vexes them:**
- **Pains, in their words:** <!-- exact quotes, each with who said it -->
- **SONCAS:** <!-- Security, Pride, Novelty, Comfort, Money, Sympathy: strong, medium or weak, each
  with the fact or the quote behind it -->
- **Replies to / closes on:**
- **Angle:** <!-- the angle that fits, and the one never to use -->
- **Unknown:** <!-- what nobody knows yet about them -->

### Quick synthesis

| Persona | Role | GTM priority | Target tier | Budget authority |
|---|---|---|---|---|
| | | | | |

<!-- GTM priority: primary buyer, secondary, user acquired indirectly, influenced user, not a
marketing target (served by the UX), emerging (to validate). -->

### Buyer matrix

| Tier | Typical buyer | Decider | Influencer | Cycle |
|---|---|---|---|---|
| | | | | |

### Anti-personas (do not target)

<!-- One line each: who, and why not (another tool owns them, the cycle is too long, the need is
different). -->

## 3. Problems, pain points, switching dynamics

### Dominant pain points (by recurrence in discovery)

<!-- Ranked list. Each pain: one line, how many independent sources raised it, the personas it
touches, and one emblematic verbatim with its source. -->

### Switching dynamics

<!--
- Where prospects come from: the status quo stacks, with their share when known.
- Frictions to switching: the recurring objections to adoption (a second tool, the end users'
  resistance, the onboarding of outside parties), each with a verbatim.
-->

## 4. Competitive landscape & differentiation

<!-- Pointer to the detailed competitive source, and to `<memory.dir>/gtm/competitors/<name>.md` for
the live watch on each competitor. -->

### Categorisation

| Category | Examples | Threat | How the product differs |
|---|---|---|---|
| | | | |

<!-- Include the status quo (generic tools) as a category: it is often the real competitor. -->

### Structural moats

<!-- A moat is an advantage defended by construction (the product, the model, the data), not by
marketing or execution. Several moats, each aimed at a different type of competitor. -->

| # | Moat | Defends against | Why it is structural |
|---|---|---|---|
| | | | |

**What is not a moat:** <!-- pricing, AI as table stakes, UI, hosting alone... -->

**GTM consequence by audience:** <!-- which moats to put forward for each audience or motion, and
the narrative each audience needs. -->

### Explicit differentiation by alternative

| Alternative | The product's argument |
|---|---|
| | |

## 5. Customer language

<!--
Verbatims to reuse as they are in copy, decks and posts, grouped by theme: the transversal pain, the
frustration with the status quo, product validation, pricing signals, acquisition and trust. Each one
word for word, in its language, with who said it and their persona. Name the sources (CRM notes, the
feedback base, discovery calls). A skill never cites a verbatim that is not here or in the feedback
base.
-->

## 6. Objections & how to handle

| Objection | Answer |
|---|---|
| | |

## 7. Brand voice

<!--
- Voice principles: how the product speaks (for example direct, pain-led, no superlatives,
  credible to an expert audience), and the languages used per contact, never mixed in one message.
- Tone per channel: the owner's personal account, the company account, outreach emails.
- Signature words and phrases to use.
- Words to avoid.
-->

### Their words, our words (lexicon)

<!--
Fed by the feedback base, the replies to mails and the job titles; enriched at each word learnt, and
opened before writing any text.
- Their words, used exactly: the trade words of the readers, with the traps (a word that belongs to
  one sub-domain only).
- The name of their team or office, by country and kind of organisation: take the word of their job
  title or their team's page; when the pool was counted, say which word they use and which they never
  use.
- Our words, never in copy without translating them into what the reader gains: product concepts,
  feature names, AI vocabulary, strategy words (wedge, moat, pivot, GTM).
-->

### Cold-mail rules learnt from real sends

<!-- Each rule with the send that taught it: the subject line (length, case, never accusing), how
the product is named at first mention, one strong figure per mail, numbers in figures, a list of what
the product covers never closed, the salutation of the first mail and of the follow-ups, the
signature. -->

### The owner's voice

<!--
Optional. When the owner writes in person (posts, outreach), the voice that is theirs: rhythm,
evidence density, format rules, post types, the corrections they have made. Leave "none" when the
owner does not write in person: the brand voice above applies.
-->

## 8. Proof points

<!--
- Available today, dated: heritage and discovery volume, power users, testimonials (section 5), first
  release date, compatibility, trust facts, runway when it is a proof of continuity.
- Missing, to acquire: first paying customer, a quantified case study, a logo wall, press, listings.
- How a figure is hedged in public copy (for example "in our tests", an asterisk with the method).
-->

## 9. Positioning & wedge

### Tagline

<!-- The validated tagline, its length, its source. -->

### One-liner

<!-- The validated one-liner, or the candidates to decide between, with what is wrong with the
previous one. -->

### Market context

<!-- The pressure that pushes the whole market to change, and how each persona lives it. It is the
ground the wedges are planted in, not a wedge. -->

### Wedges

<!-- The two or three macro wedges, each with the problem it attacks and what the product does about
it. -->

### Detailed wedges along the chain

<!-- The concrete beats of value along the chain of work, placed under the macro wedges they
instantiate. A beat strong and ownable enough to become a wedge of its own is said. -->

### Core values

<!-- The values every wedge must deliver. -->

### Value axes

| Axis | Promise | Personas served | Wedges that carry it |
|---|---|---|---|
| | | | |

### How the product delivers them, per persona

<!-- One subsection per primary persona: how their time splits today, and what the product
compresses. -->

### Category

<!-- The category the product claims, what it is not, and the word kept for it. -->

## 10. Use cases

<!-- A flat list, one line per use case, with its persona. Which one to push this week is decided at
run time by `pos-gtm`, not here. Then the deprioritised ones, with the reason. -->

## 11. Buying journey & trigger events

### Triggers per persona

<!-- For each persona: the events that make them look for a solution. -->

### Sales cycles

| Tier | Real cycle | Note |
|---|---|---|
| | | |

### Seasonality

<!-- The waves of the year that drive demand, and how far ahead outreach must start. The dead
periods. -->

## 12. Channels of acquisition

<!-- To reassess regularly. Status: active, setup, not yet, killed. An activation channel is said to be
activation, not acquisition. -->

| Channel | Status | Note |
|---|---|---|
| | | |

**Non-negotiable anti-patterns:** <!-- the channels or practices never used, and the precedent that
proves why. -->

## 13. Motions

<!-- The motions the product runs in parallel, each with its own playbook. Every GTM action is tagged
to one motion; there is no "general GTM" action. Number them. One subsection per motion: -->

### Motion 1: <!-- name -->

- **Target:**
- **Vector:**
- **Cycle:**
- **Message:**
- **Channel:**
- **Pricing:**
- **Status:**
- **KPI:**
- **Detail:** <!-- the memory file that holds the playbook, if any -->

## 14. Account types & buying committees

<!-- User is not buyer, nor champion, nor blocker. One subsection per type of account, described by
type. -->

### <!-- account type -->

- **Champion:**
- **User:**
- **Buyer:**
- **Possible blocker:**
- **Cycle:**
- **Strategy:**

## 15. Pricing & packaging state

<!--
- The owner's current pricing decision, dated, and its consequence for copy (what must never be
  mentioned, such as limits no longer in force).
- The grid: plan, price, duration, what is included; and whether it is published or internal.
- Market pricing signals: what prospects said about prices, with their source.
- Open pricing topics, to decide later.
A pricing decision updates this section and the changelog.
-->

## 16. Compliance & trust

### Current assets

<!-- Hosting and processing location, data protection, no training on customer data, signable
agreements, the shareable security document. -->

### Gaps

<!-- What is missing and when it would become necessary (which tier, which prospect). -->

### Confidentiality

<!-- The rule: public content never names a customer or an institution without explicit
agreement; generic descriptions only. Internal copies may. -->

### Pre-sale trust signals

<!-- What can be said or sent before a sale. -->

## Appendix: canonical sources

| Subject | Where it lives |
|---|---|
| Detailed personas | |
| Launch or campaign plan | |
| Competitive analysis (snapshot) | |
| Competitor watch | `<memory.dir>/gtm/competitors/<name>.md` |
| Motion playbooks | `<memory.dir>/gtm/` |
| Brand and SEO plans, trademark | |
| Domain reputation guide | |
| Follow-up batch briefings | |
| Social visuals folder (scripts and outputs) and its reference carousel script | |
| Content backlog | |
| Company page editorial folder | |
| GTM actions base | <!-- data source URL, if the product keeps one --> |
| Posts base | <!-- data source URL, its title property, its status values, its account and axis properties --> |
| Competitor watch pages, campaign pages | <!-- the parent pages in the team's shared base --> |
| Prospecting master plan | <!-- the file under `<memory.dir>/gtm/` and its page under the campaigns page; its annexes (the sending strategy with its exclusion rules, the month plans) are child pages --> |
| Campaigns base | <!-- data source URL; schema in `pos-campaign` (references/campaigns-base.md) --> |
| Campaign handoff in progress | <!-- the handoff of the running wave, written with `pos-handoff` --> |
| Sequence texts | <!-- the file that holds the version in force of each mail, follow-up and 1:1 message, with its date and the sending tool's follow-up procedure --> |
| Contact pool | <!-- where the contacts to segment come from (an export of a former CRM, a list), and the sheet of the current segmentation; never a temp folder --> |
| Sending tool | <!-- its name, its API base URL, where its key lives (an environment variable or the assistant's user-level memory, never this repository), its daily cap --> |
| Address verification tools | <!-- names, where their keys live, the order they are used in --> |
| LinkedIn scripts and browser profile | <!-- the product's scripts, if any (search profiles, invite, withdraw), and the user-level folder of the browser profile --> |
| Persona page | <!-- the page in the shared base that holds the long persona descriptions, if any --> |
| Feature sheet | <!-- what each function of the product does today, in the reader's terms, to set against each pain --> |
| Claims reference | <!-- the table of what each product figure may say, per scope, with its base; read before any figure in copy --> |
| Persona avatars | `.claude/agents/avatar-*.md` |

<!-- The CRM and the feedback base are `databases.crm` and `databases.feedback` in the product
config, not copied here. -->

## Appendix: changelog

<!-- One line per version, newest first: **vN, YYYY-MM-DD**: sections changed, what changed, the
trigger. -->
