# pos-discovery: Product Discovery

The Discovery function of the product OS. It depends on `pos-core` and `pos-build`, and is switched
on by `modules.discovery: true` in the product config.

## Install

```
claude plugin marketplace add pascalpediroda-maker/product-os --scope project
claude plugin install pos-discovery@product-os --scope project
```

The core and `pos-build` are installed with it if they are not there yet. Then open a new session in
the product repository and run `/pos-setup`: it sets `modules.discovery`, connects Notion and the
analytics tool, and creates the feedback, roadmap and CRM bases the owner wants. `marketplace update`
only works once the marketplace has been added. The full sequence and the choice of scope are in the
[root README](../README.md).

## What it guarantees

- **A Discovery session starts in one place and loads only what Discovery needs.** `pos-opportunity`
  reads the Discovery pivot, the feedback, roadmap and CRM bases and the analytics, sizes the subject
  and names the next skill. The owner invokes it.
- **A product question is settled by perspectives, not sent back to the owner.** UX, Tech, Voice of
  Customer and GTM agents work in parallel and decide; the session arbitrates, Voice of Customer data
  first. The owner validates the verdict.
- **No verbatim is invented.** The Voice of Customer agent cites real sources or says that none covers
  the subject.
- **A decision lives where its reader returns.** A PRD is written into its opportunity's FO(E)CUSED
  page in the roadmap base; a meeting is one entry of the feedback base, the write-up in its body.

## What it contains

| Piece | Where | What it does |
|---|---|---|
| Discovery pivot | `templates/product_discovery_context.md` | the product's personas, where feedback lives, the analytics events that measure an opportunity, where the local transcription tool is installed |
| `pos-opportunity` | `skills/pos-opportunity/` | the Discovery router: frames an idea, a request, a piece of feedback or a whole new app, has agents decide, sizes it TINY / MEDIUM / BIG, hands over to `pos-build` (TINY) or `pos-prd` (MEDIUM, BIG) |
| `pos-prd` | `skills/pos-prd/` | the PRD workshop: five perspectives debate and converge, the result written into the FO(E)CUSED page |
| The FO(E)CUSED template | `skills/pos-prd/references/focused-template.md` | the four phases of an opportunity's page, its quality criteria, the roadmap statuses by phase, the page skeleton |
| `pos-strategy` | `skills/pos-strategy/` | an opportunity or a strategy assessed as a one-pager: opportunity gate, diagnosis, cascade, 7 Powers |
| `pos-meeting-notes` | `skills/pos-meeting-notes/` | a transcript, notes or an email turned into one entry of the feedback base |
| `pos-meeting-transcript` | `skills/pos-meeting-transcript/` | a meeting recording transcribed locally, then handed to `pos-meeting-notes` |
| `prd-facilitator` | `agents/prd-facilitator.md` | the guide the session follows to facilitate a PRD workshop. Never spawned |
| `prd-pm`, `prd-tech`, `prd-voc`, `prd-gtm` | `agents/` | the product, technical, Voice of Customer and GTM perspectives |

The UX perspective, `prd-ux`, lives in `pos-build`, which also designs the mock-ups of a build.

FO(E)CUSED combines *Discovery Discipline* by Tristan Charvillat and Rémi Guyot (Thiga) with
Continuous Discovery by Teresa Torres, with an Explore step added before the claim.

## Fill these first

| What | Where | How |
|---|---|---|
| The Discovery pivot | `<pivots.dir>/product_discovery_context.md` (by default `.claude/product/`) | copy `templates/product_discovery_context.md` and fill it below the separation line. Section 4 is filled by `pos-meeting-transcript` the first time it runs |
| The feedback base | `databases.feedback` | created by `pos-setup` with the OS schema; its `Persona` options are the personas of pivot section 1 |
| The roadmap base | `databases.roadmap` | created by `pos-setup` with the OS schema; one entry per opportunity, its body from the FO(E)CUSED template |
| The module switch | `modules.discovery: true` | in the product config |

Worth filling too:

- `databases.crm`: without it, a meeting entry is not linked to its contact.
- `analytics.provider` and `analytics.project_id`: without them, no usage figure backs a decision.
- A reading gate entry, so the router cannot act before it has read its pivot:

  ```json
  "reading_gate": {
    "skills": {
      "pos-opportunity": {
        "require": ["pivot:product_discovery_context.md", "pivot:product.config.json"],
        "min_reads": 3
      }
    }
  }
  ```

The pivot carries the core's separation line. Above it: the skeleton, which an update of this plugin
may change. Below it: the product's content, which an update never overwrites.

## Connectors

| Connector | Needed for |
|---|---|
| Notion | the feedback, roadmap and CRM bases; required |
| Analytics, optional | the usage figures behind a decision |
| The product's database connector (for example Supabase), read only, optional | the in-app reports the Voice of Customer reads, and the schemas the Tech perspective checks |

The core `pos-setup` skill connects them; the core `pos-tool-conventions` skill says how each is used.
The agents' tool lines use the server names `pos-setup` gives (`notion`, `supabase`): a connector
added under another name is not visible to them, and they say what they could not read.

## How it fits with the core

- **`pos-setup` creates the bases.** The feedback, roadmap and CRM schemas are the core's; this
  plugin writes into them with their property names.
- **`pos-orient` lists open handoffs.** A Discovery session that stops writes its handoff through the
  core `pos-handoff` skill.
- **The collaboration rules and principles of the core apply everywhere here.** The skills cite them
  by number and do not repeat them.

## With the other modules

| Module | What it brings to Discovery | When it is missing |
|---|---|---|
| Build (`pos-build`) | the UX perspective `prd-ux`; the build skill that takes a TINY subject or a decided PRD | a declared dependency: it is installed with this plugin |
| Support | the in-app reports query (its pivot's section 2) the Voice of Customer reads; the "bugs" that are product decisions | the Discovery pivot's section 2 holds the in-app reports source |
| Go-to-Market | the pivot the GTM perspective reads: positioning, competitors, pricing | the GTM perspective says so and works from cited sources |

A missing module is said, and the work continues without it. Nothing it would have brought is
invented.
