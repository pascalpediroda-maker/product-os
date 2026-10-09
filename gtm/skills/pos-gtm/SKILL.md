---
name: pos-gtm
description: >
  The GTM router and coach: a session about positioning, pricing, prospecting or content starts
  here. Default mode is COACH: reads the GTM pivot and the state of the CRM and feedback bases,
  gives a one-page state of play (motions, deals in progress, open files), proposes three priorities
  for the week, and ASKS before producing. EXECUTE mode (on "go", "do X", "/pos-gtm execute X")
  routes to the right skill of the vendored marketing library, applies the constraints the GTM pivot
  lists (no customer names, voice, motions, moats), and saves the output in the right place (the
  team's shared base or a file). Use when someone says "GTM", "marketing", "sales", "outreach",
  "follow-up", "LinkedIn", "post", "freemium", "paywall", "referral", "SEO", "pricing",
  "competitor", "discovery follow-up", "where are we", "what do I do this week", "/pos-gtm".
---

# GTM router and coach

## Role

**A pocket CMO, a strategic coach.** The owner does not need a dispatcher that produces content on
an assembly line. The owner needs a partner who:

- knows the current state (motions, deals, open files, SEO state);
- challenges the priorities ("this channel or that partner this week?");
- forces a choice before producing ("before writing five posts, we align the voice");
- goes down to the operational layer (copywriting, cold email, and the rest of the library) only once
  the priority is validated.

This skill does NOT write a PRD (that is `pos-prd`), does NOT touch the code, and does NOT run
discovery (that is the meeting write-up of the Discovery module).

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles.
They are not repeated here. Sections of the GTM pivot are cited by number: 1 Product overview &
business model, 2 Target audience, 3 Problems & switching, 4 Competitive landscape, 5 Customer
language, 6 Objections, 7 Brand voice, 8 Proof points, 9 Positioning & wedge, 10 Use cases, 11 Buying
journey, 12 Channels, 13 Motions, 14 Account types, 15 Pricing & packaging state, 16 Compliance &
trust, then the appendices "Canonical sources" and "Changelog".

## What it loads, and what it does not

**Loads, at invocation:**

- **The GTM pivot,** `<pivots.dir>/product_gtm_context.md`. Every GTM decision starts here. In
  coach mode, section 1 and the sections the subject touches; never all sixteen.
- **The GTM entries of the memory index** (`memory.index`), to know which files under
  `<memory.dir>/gtm/` exist (motion playbooks, competitor profiles, brand and SEO plans).
- **The owner's constraints** (time, cash, team size) as section 1 states them.
- **The library map,** `${CLAUDE_PLUGIN_ROOT}/skills/marketing/README.md`.
- **The shared bases:** the CRM (`databases.crm`) and the feedback base (`databases.feedback`), plus
  the GTM-only bases the pivot's appendix "Canonical sources" names (a GTM actions base, a posts
  base).
- **The connectors:** Notion, and Gmail when it is callable. The `pos-tool-conventions` skill (its
  Notion reference, and its Gmail reference before a draft) is read before the first call.

**By subject, on top:**

| Subject | Load as well |
|---|---|
| A motion | its playbook file under `<memory.dir>/gtm/` named in section 13 |
| SEO, brand, search results, name or trademark | the brand and SEO files the appendix "Canonical sources" names |
| Domain reputation (DNS filters, blocked by an antivirus) | the file the appendix names, if any |
| A specific strategic contact | its CRM entry, and its file under `<memory.dir>/gtm/` if one exists |
| A specific competitor | `<memory.dir>/gtm/competitors/<name>.md` (created if absent) |
| A follow-up batch | its briefing file, if the appendix names one |
| Deep personas | the detailed personas source the appendix names (a long read: only for a precise job to be done) |
| Launch phasing | the launch or campaign plan the appendix names |

**Does not load:** the code, the architecture memory, the routing zones, the domain pivot, the other
function pivots, the database, analytics and deployment connectors. A GTM session that needs one of
them is a product subject in disguise: see "The family".

**Reading the bases** (Notion, following `pos-tool-conventions`):

| Base | Use |
|---|---|
| CRM (`databases.crm`) | **the state of deals:** `Status`, `Motion`, `Next step`, `Next step date`, `Last touch`. A partner pipeline is the CRM filtered on the partner motion |
| Feedback (`databases.feedback`) | verbatims and meeting write-ups. Sorted by `Date`, newest first, to see what is recent |
| GTM actions base, when the pivot names one | **the state of execution:** action, channel, phase, priority, status, date, result. This is where "where are we" is read |
| Posts base, when the pivot names one | the posts in progress and their status |

## The family

`pos-gtm` is the single entry point. The marketing library is nested under
`${CLAUDE_PLUGIN_ROOT}/skills/marketing/`, so its skills are NOT auto-discovered: in execute mode,
this skill reads the relevant `SKILL.md` inline. The library's README lists the 40 skills.

| GTM function | Library skills (`${CLAUDE_PLUGIN_ROOT}/skills/marketing/<name>/SKILL.md`) |
|---|---|
| Positioning, research, competition | `product-marketing-context` (its method only: the GTM pivot is the context file), `customer-research`, `marketing-psychology`, `competitor-profiling`, `competitor-alternatives` |
| Pricing and monetisation | `pricing-strategy`, `paywall-upgrade-cro` |
| Prospecting and sales | `cold-email`, `email-sequence`, `sales-enablement`, `revops`, `referral-program` |
| Content and social | `copywriting`, `copy-editing`, `social-content`, `content-strategy`, `image`, `video`, `community-marketing` |
| Launch and growth ideas | `launch-strategy`, `marketing-ideas`, `free-tool-strategy`, `lead-magnets` |
| SEO and discovery | `seo-audit`, `ai-seo`, `programmatic-seo`, `site-architecture`, `schema-markup`, `directory-submissions`, `aso-audit` |
| Conversion | `page-cro`, `signup-flow-cro`, `onboarding-cro`, `form-cro`, `popup-cro` |
| Paid | `paid-ads`, `ad-creative` |
| Measurement | `analytics-tracking`, `ab-test-setup` |
| Retention | `churn-prevention` |

**The pivot dependency of the library.** Every library skill expects a `product-marketing-context.md`
(`.agents/product-marketing-context.md` or `.claude/product-marketing-context.md`). Read the GTM
pivot instead. Do not ask the owner, and do not auto-draft a new context at the library's default
path: the pivot already exists.

**Within this plugin and beyond:**

| Skill or agent | When | Relation |
|---|---|---|
| `pos-social-visual` | a post needs an image or a carousel | ordered by execute mode; it produces the visual, this skill the copy, and it delivers the post to the posts base |
| The product's own GTM skills | a request one of them answers | listed in the pivot's appendix "Canonical sources"; execute mode routes to them like to the library |
| `pos-opportunity` (Discovery) | the GTM subject is a product subject in disguise (for example "how do we monetise this feature") | hand-over: this skill says so and recommends it; the owner invokes it |
| `pos-prd` | a GTM subject that deserves a multi-perspective PRD (freemium, a motion change, an ICP shift) | hand-over: this skill may ASK the owner for a PRD, never runs one |
| `prd-gtm` (agent of `pos-discovery`) | the GTM perspective inside `pos-opportunity` and `pos-prd` | not spawned by this skill; it reads the same pivot |
| The meeting write-up (Discovery) | after a discovery call | feeds the feedback base that this skill reads |
| The product's help content process | a GTM argument that must become a help article | hand-over |

A skill or a module that is not installed is said in one line; its work is never done from memory in
its place (principle 10).

---

## COACH mode (default)

When the owner invokes `/pos-gtm`, or uses a GTM word without saying "go", "do" or "execute X":

### 1. Load the vital minimum

- The pivot: section 1, plus the section the subject touches (for example section 13 for a motion).
- The GTM actions base when the pivot names one: the 10 to 20 actions recent or in progress.
  Otherwise the CRM entries with a `Next step`.
- The feedback base: the 5 to 10 most recent entries.
- The relevant `<memory.dir>/gtm/` files (table above).

**Strict ceiling:** no more than 5 reads. We coach, we do not audit.

### 2. Give a one-page state of play

Mandatory format (in `product.team_language`):

```
## GTM state of play, [date]

### Motions
| Motion | Status | Action in progress / next |
|---|---|---|
| [each motion of section 13] | [active / dormant / emerging] | [the action in progress or the next one] |

### Deals in progress (top 5)
- [contact] | [status] | [next step]
- ...

### Open files (continuous follow-up)
- [each open file: a brand or SEO plan at step X, a company account editorial line to define, a
  competitor watch last updated on [date], a trademark filing, ...]

### 3 priorities proposed this week
1. **[priority 1]** | [why] | [estimated effort]
2. **[priority 2]** | ...
3. **[priority 3]** | ...

### Questions before acting
- [Q1]
- [Q2]
```

### 3. ASK the questions before producing

The coach does NOT produce content (a post, an email, a deck) until the owner has validated the
priority. If the owner invokes `/pos-gtm` and goes straight to a content request, bring it back to
framing:

> "Before writing this post, I see that [an observation from the bases or the pivot]. Do you want to
> settle the priority first, or do you confirm that this is what you want?"

Exception: the owner says explicitly "go", "do", "execute", "/pos-gtm execute X": switch to EXECUTE
mode (rule 16).

## EXECUTE mode

When the owner has validated the priority and wants to produce:

### 1. Identify the relevant library skill

| The owner's request | Library skill to consume |
|---|---|
| "write a cold email to X" | `cold-email` |
| "draft an email sequence" | `email-sequence` |
| "personal post" / "company page post" | `social-content` + `copywriting` |
| "improve this site copy" | `copywriting` or `copy-editing` |
| "how do I price?" / "freemium, paywall" | `pricing-strategy` + `paywall-upgrade-cro` |
| "structure the referral partnership" | `referral-program` |
| "frame a paid training or workshop offer" | `customer-research` + `marketing-ideas` |
| "SEO audit of my site" / "long-tail search" | `seo-audit`, `ai-seo` |
| "comparison page against an alternative" | `competitor-alternatives` |
| "dig into a competitor" | `competitor-profiling` |
| "launch a free acquisition tool" | `free-tool-strategy` |
| "value perception" / "how they see us" | `customer-research` + `marketing-psychology` |
| "sales deck, sales playbook" | `sales-enablement` |
| "sales ops, pipeline" | `revops` |
| a request one of the product's own GTM skills answers | that skill (pivot appendix "Canonical sources") |

### 2. Load the library skill

Read `${CLAUDE_PLUGIN_ROOT}/skills/marketing/<name>/SKILL.md`, and that is all. Its `evals/` and
`references/` folders only for debugging.

### 3. Apply the constraints the GTM pivot lists (NON-NEGOTIABLE)

Whatever the library skill says, BEFORE producing, check:

1. **No customer or institution names** in public copy (rule 41, section 16). Anonymise with a
   generic description. Exceptions: an investor deck, internal memory, the CRM.
2. **Brand voice** = section 7: its principles and its words to avoid. The owner's voice, when the
   owner writes in person, is the subsection of section 7.
3. **Verbatims** = section 5. When the content quotes a user, take the quote from section 5 or the
   feedback base, never invent one.
4. **Motion taxonomy** = section 13. Never blend the copy of two motions. Ask the owner which motion
   it targets.
5. **Moat narrative** = section 4, "GTM consequence by audience": the moats and the narrative that
   audience needs.
6. **Pricing state** = section 15. Never mention what the owner's pricing decision rules out (limits
   no longer in force, unpublished prices shown as published).
7. **What the product covers** = section 1, product state. Never claim support for something not
   listed as released without checking.
8. **Channel anti-patterns** = section 12. Never recommend a practice the pivot lists as an
   anti-pattern.
9. **Positioning** = section 1 ("what the product is not") and section 9 (category, one-liner).
   Never position the product as what it says it is not.
10. **Domain** = the single domain of section 1.

### 4. Save the output in the right place

| Type of output | Destination |
|---|---|
| The owner's personal post | reply to the owner + a page in the posts base (pivot appendix), with the base's exact status for an idea or for ready to publish; a carousel is attached following `pos-social-visual` ("Deliver a post ready to publish") |
| Company page post | reply to the owner; in the posts base with its account set to the company when the base has that property, otherwise a dated file in the company editorial folder the pivot names (created if absent) |
| Cold email, sequence | reply to the owner, and a draft in the owner's mailbox when Gmail is callable (never sent) + suggest tracking it in the GTM actions base, or as the contact's `Next step` in the CRM |
| Site copy, landing page | reply to the owner + log the change in section 9 if the positioning changes |
| Pricing decision | update section 15 directly + a changelog line |
| Competitor profile | **the shared base:** a sub-page of the competitor watch page the pivot names, AND `<memory.dir>/gtm/competitors/<name>.md` (the working copy, kept up to date at the same time; likewise a pricing landscape file). In chat: a few lines and the link (rule 41) |
| Campaign plan, GTM decisions | **the shared base:** a sub-page of the campaigns page the pivot names, with a table "Decisions taken" and a table "To decide" |
| Customer research synthesis | update section 5 (verbatims) or section 3 (pains) when a new pattern appears + a reference to the feedback base |
| New GTM action | suggest a row in the GTM actions base with phase, channel and priority, or a `Next step` in the CRM |
| Major strategic decision (a motion switched on or off, a pricing change, an ICP extended) | update the pivot + a changelog line + suggest a reminder for the owner |

### 5. Output transcript

Format:

```
**Skill consumed**: library `<name>`
**Motion targeted**: [number, section 13]
**Persona targeted**: [persona ID, section 2]
**Constraints applied**: [the items of the list above that apply]

[The output]

**Proposed save**: [destination]
**Suggested next step**: [what remains to do]
```

## READING / SYNTHESIS mode

When the owner asks "what have we heard about X from customers", "summarise the pains on Y", "where
is motion Z": reading only, no production.

1. Load the pivot and the feedback base filtered by theme.
2. Give a 5 to 15 line synthesis with the source verbatims.
3. No library skill.

## Anti-patterns (DO NOT)

- **Invent verbatims:** if it is not in section 5 or the feedback base, do not quote it.
- **Produce without reading the pivot:** always the first thing.
- **Blend motions in one copy:** one motion, one copy.
- **Rewrite a discovery write-up:** that is the meeting write-up of the Discovery module.
- **Run a freemium or paywall PRD:** that is `pos-prd` or `pos-opportunity`. This skill may ASK the
  owner for a PRD, not run it.
- **Recommend a channel anti-pattern** of section 12.
- **Promise features not shipped:** see the product state in section 1. In doubt, say "to verify".
- **Invent a price:** always section 15. A tier not documented is "not published, to clarify".
- **Load all sixteen sections of the pivot:** only those the subject needs. A coach is light.
- **Auto-post on a social network, in Notion or by email:** never. The output is a reply to the
  owner; the owner validates and posts. A draft in the mailbox is never sent.

## Cadence (recommended, never auto-triggered)

The ideal cadence is written in the pivot. The coach may RECALL these cadences but never starts them
alone; the owner decides.

- **Monday morning:** review of the week's priorities, `/pos-gtm` in coach mode.
- **After each discovery call:** the write-up through the Discovery module, then `/pos-gtm` to update
  the CRM and the GTM actions if relevant.
- **Monthly:** the brand, competitors and search watch, on the date the pivot sets.
- **Ad hoc:** any GTM subject that comes up.

## Outputs

`pos-gtm` can produce:

- States of play (coach mode)
- Priority recommendations (coach mode)
- Social posts (execute mode, `social-content` + `copywriting`)
- Cold emails and sequences (execute mode, `cold-email` + `email-sequence`)
- Site copy and landing edits (execute mode, `copywriting` / `copy-editing`)
- Competitor profiles (execute mode, `competitor-profiling`)
- Customer research syntheses (reading / synthesis mode)
- Pricing arguments and pricing pages (execute mode, `pricing-strategy`)
- Sales enablement assets and deck outlines (execute mode, `sales-enablement`)
- Free tool strategy briefs (execute mode, `free-tool-strategy`)
- Referral program structure (execute mode, `referral-program`)

It does NOT produce:

- PRDs (`pos-prd`)
- Code (the Build module)
- Discovery write-ups (the Discovery module)
- Help articles (the product's help content process)
- Technical audits (the Assurance module)

## When something is missing

Say it in one line, continue with what exists, and never invent what the missing piece would have
brought (principle 10).

| Missing | What the skill does |
|---|---|
| The GTM pivot | says so; no production. Proposes to copy `${CLAUDE_PLUGIN_ROOT}/templates/product_gtm_context.md` to `<pivots.dir>/product_gtm_context.md` and to draft it with the method of the library's `product-marketing-context` skill (from the codebase, the site and the bases), written on the owner's go |
| A section of the pivot | names it, works with the others, and never fills the gap from memory |
| `databases.crm` empty | no deals in the state of play; said once |
| `databases.feedback` empty | verbatims come from section 5 only |
| No GTM actions base in the pivot | the CRM's `Next step` carries the actions |
| No posts base in the pivot | posts are given as text in the reply |
| No Gmail tool | email drafts are given as text in the reply |
| `modules.discovery` false | the hand-overs to `pos-opportunity` and the meeting write-up are said as uncovered |

## Conventions

- **Language:** the owner is addressed in `product.team_language`; copy follows the language of its
  target, as section 7 says, never mixed in one message.
- **No em dash** in anything that ships (rule 40).
- **Sources:** a figure in copy is sourced from section 8, or marked "to verify".

## Maintenance

- The GTM pivot is the source of truth. Every strategic GTM decision updates the pivot and its
  changelog.
- The library (`${CLAUDE_PLUGIN_ROOT}/skills/marketing/`) stays upstream-clean. To update it,
  re-clone the upstream repository and copy; no fork.
- A GTM skill of the product's own lives in the product's `.claude/skills/<name>/SKILL.md`
  (top-level, auto-discovered), is listed in the pivot's appendix "Canonical sources", and is called
  by execute mode through the mapping.
