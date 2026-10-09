# pos-gtm: Go-to-Market

The Go-to-Market function of the product OS. It depends on `pos-core` and is switched on by
`modules.gtm: true` in the product config.

## Install

```
claude plugin marketplace add pascalpediroda-maker/product-os --scope project
claude plugin install pos-gtm@product-os --scope project
```

The core is installed with it if it is not there yet. Then open a new session in the product
repository and run `/pos-setup`: it sets `modules.gtm`, connects Notion and Gmail, and creates the
CRM and the feedback base when the owner wants them. `marketplace update` only works once the
marketplace has been added. The full sequence and the choice of scope are in the
[root README](../README.md).

## What it guarantees

- **A GTM session starts from one source of truth.** Every GTM skill reads the GTM pivot first, and
  the pivot wins over any other document that contradicts it.
- **Nothing is produced before the priority is validated.** The default mode coaches: a state of
  play, three priorities, the questions. Content comes on the owner's go.
- **Every output respects the constraints the pivot lists:** no customer name in public copy, the
  brand voice, the real verbatims, one motion per copy, the pricing state, what the product really
  covers.
- **Nothing reaches the public or a prospect without the owner.** Posts and emails are replies and
  drafts; the owner publishes and sends.

## What it contains

| Piece | Where | What it does |
|---|---|---|
| GTM pivot | `templates/product_gtm_context.md` | the product's go-to-market in sixteen sections: product and business model, audience, pains, competition and moats, customer language, objections, voice (and the owner's own voice), proof, positioning and wedges, use cases, buying journey, channels, motions, account types, pricing state, compliance and trust; then the canonical sources and the changelog |
| `pos-gtm` | `skills/pos-gtm/` | the GTM router and coach: coach mode (state of play, three priorities, questions), execute mode (routes to the marketing library, applies the pivot's constraints, saves each output in its place), reading and synthesis mode; hands product subjects to Discovery |
| `pos-social-visual` | `skills/pos-social-visual/` | the method for post visuals: the image as the Attention of AIDA, legibility floors for a phone feed, every image looked at before delivery, captures anonymised, carousels assembled to PDF, the post delivered ready to publish in the posts base |
| Marketing library | `skills/marketing/` | the upstream marketingskills library (MIT, `skills/marketing/LICENSE`), vendored as is: 40 skills nested so they are not auto-discovered, read inline by `pos-gtm` |

## Fill these first

| What | Where | How |
|---|---|---|
| The GTM pivot | `<pivots.dir>/product_gtm_context.md` (by default `.claude/product/`) | copy `templates/product_gtm_context.md` and fill it below the separation line. The library's skills look for a `product-marketing-context.md`: `pos-gtm` points them to this pivot, so no copy is made at the library's default path |
| The module switch | `modules.gtm: true` | in the product config |
| The library switch | `libraries."coreyhaines31/marketingskills": true` | in the product config: the library ships inside this plugin |

Worth filling too:

- `databases.crm`: without it, the state of play has no deals.
- `databases.feedback`: without it, verbatims come from the pivot only.
- In the pivot's appendix "Canonical sources": the posts base, a GTM actions base if the product keeps
  one, the visuals folder, the competitor watch and campaign pages.

The pivot carries the core's separation line. Above it: the skeleton, which an update of this plugin
may change. Below it: the product's content, which an update never overwrites.

## Connectors

| Connector | Needed for |
|---|---|
| Notion | the CRM, the feedback base, the posts base and the GTM pages; required |
| Gmail, optional | outreach drafts in the owner's mailbox, never sent; without it, drafts come as text |

The core `pos-setup` skill connects them; the core `pos-tool-conventions` skill says how each is used.

## How it fits with the core

- **`pos-setup` creates the shared bases.** The CRM and the feedback base are OS bases, created by
  setup and named in `databases.crm` and `databases.feedback`. The bases only GTM uses are named in
  the pivot.
- **`pos-orient` lists open handoffs.** A GTM session that stops mid-way writes a handoff through the
  core `pos-handoff` skill, whose line 1 names `pos-gtm`.
- **The collaboration rules and principles of the core apply everywhere here.** The skills cite them
  by number and do not repeat them; rules 40 and 41 (copy for its reader, no customer name in
  anything public) carry most of the GTM constraints.

## With the other modules

| Module | What it brings to GTM | When it is missing |
|---|---|---|
| Discovery | `pos-opportunity` for a GTM subject that is a product subject in disguise; the meeting write-up that feeds the feedback base; the GTM perspective agent `prd-gtm`, which reads the same pivot | the hand-over is said as uncovered; verbatims come from the pivot and the bases |
| Design | `pos-prd` for a GTM subject that needs a multi-perspective decision; the design system that gives `pos-social-visual` its tokens | the tokens are read from wherever the memory index names the brand; a PRD is asked of the owner |
| Support & Success | the help content process for an argument that becomes a help article | the argument stays in the reply |

A missing module is said, and the work continues without it. Nothing it would have brought is
invented.
