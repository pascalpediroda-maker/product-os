# product-os-support: Customer Support & Success

The Support & Success function of the product OS. It depends on `product-os-core` and is switched on
by `modules.support: true` in the product config.

It guarantees:

- **No bug found is lost.** A bug is fixed in the session that sees it, or it is filed in the fix
  backlog with enough to pick it up cold. Never left in a conversation.
- **A bug kill empties the backlog into a minor fix release, and closes the loop with customers.**
  Every entry is re-verified against what is deployed, fixed with a test that failed first, shipped
  on the owner's go, checked live, and every customer who reported one has a message drafted for the
  owner to send.
- **Nothing reaches a customer or production without the owner.** Messages are drafts, the push
  waits for an explicit go, and the in-app reports store is only read.

## What it contains

| Piece | Where | What it does |
|---|---|---|
| Support pivot | `templates/product_support_context.md` | the product's support facts: channels, in-app reports and the query that lists them, the `Area` list and the memory each area loads, who is the team, how a customer is told, the priority rule, how a fix release ships and is read once live, where bugs are reproduced |
| `fix-backlog` | `skills/fix-backlog/` | creates the fix backlog base in Notion, or checks an existing one; files an entry after searching for a duplicate; moves and closes entries. The base every other support skill reads and writes |
| The schema | `skills/fix-backlog/references/schema.md` | the backlog's properties, statuses, sources, the creation statement, and the Notion traps that bite on creation |
| `bug-kill` | `skills/bug-kill/` | a session that verifies the backlog against the deployed reference, proposes a batch, fixes it area by area in RED -> GREEN -> REFACTOR, ships a minor fix release on a go, and closes the loop |

## Fill these first

| What | Where | How |
|---|---|---|
| The Support pivot | `<pivots.dir>/product_support_context.md` (by default `.claude/product/`) | copy `templates/product_support_context.md` and fill it below the separation line. The pivot of a function is named `product_<function>_context.md` in `pivots.dir` |
| The fix backlog base | `databases.fix_backlog` | run the `fix-backlog` skill: it creates the base with the owner's parent page and Area list, then writes the key through a shown diff. A base that already exists is checked, not recreated |
| The module switch | `modules.support: true` | in the product config |

Worth filling too:

- `databases.crm`: without it, `Customer to notify` does not exist and the customers to tell are only
  listed in the report.
- `databases.feedback`: without it, an entry cannot point to the feedback it came from.
- A reading gate entry, so a bug kill cannot act before it has read its pivot:

  ```json
  "reading_gate": {
    "skills": {
      "bug-kill": {
        "require": ["pivot:product_support_context.md", "pivot:product.config.json"],
        "min_reads": 4
      }
    }
  }
  ```

The pivot carries the core's separation line. Above it: the skeleton, which an update of this plugin
may change. Below it: the product's content, which an update never overwrites.

## Connectors

| Connector | Needed for |
|---|---|
| Notion | the fix backlog; required |
| The product's database connector (for example Supabase), read only | the in-app reports, and the data checks of a verification |
| Gmail, optional | customer drafts in the owner's mailbox; without it, drafts come as text |
| Analytics, optional | a customer's language and a user's real journey |

The core `setup` skill connects them; the core `tool-conventions` skill says how each is used.

## How it fits with the core

- **`setup` hands over to `fix-backlog`.** Setup connects Notion and fills the config; the Support
  module owns its base, so the creation of the fix backlog and its schema live here.
- **`orient` lists open handoffs.** A bug kill that stops at a checkpoint writes a handoff through the
  core `handoff` skill, whose line 1 names `bug-kill`; `orient` shows it until it is closed.
- **Collaboration rule 20** ("what is not done now goes to the backlog") is carried out by
  `fix-backlog`: any session, in any module, that meets a bug it will not fix now files it there.
- **The collaboration rules and principles of the core apply everywhere here.** The skills cite them
  by number and do not repeat them.

## With the other modules

| Module | What it brings to a bug kill | When it is missing |
|---|---|---|
| Delivery | the specialist agents (front-end, back-end, database, AI engineer); the build workflow that takes L entries | the main session fixes, and says so |
| Assurance | owns the regression tests the fixes leave; its audit findings arrive as backlog entries | the test stays with the fix, and that is said |
| Release & Operations | the release path, the version scheme, the release notes | the Support pivot's section 7 holds the release path |
| Discovery | receives the "bugs" that are product decisions | they go to the owner in the report |

A missing module is said, and the work continues without it. Nothing it would have brought is
invented.
