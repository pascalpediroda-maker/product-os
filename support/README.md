# pos-support: Customer Support & Success

The Support & Success function of the product OS. It depends on `pos-core` and is switched on
by `modules.support: true` in the product config.

## Install

```
claude plugin marketplace add pascalpediroda-maker/product-os --scope project
claude plugin install pos-support@product-os --scope project
```

The core is installed with it if it is not there yet. Then open a new session in the product
repository and run `/pos-setup`: it sets `modules.support`, connects Notion and hands over to
`pos-fix-backlog` to create the base. `marketplace update` only works once the marketplace has been
added. The full sequence and the choice of scope are in the [root README](../README.md).

## What it guarantees

- **No bug found is lost.** A bug is fixed in the session that sees it, or it is filed in the fix
  backlog with enough to pick it up cold. Never left in a conversation.
- **A bug kill empties the backlog into a minor fix release, and closes the loop with customers.**
  Every entry is re-verified against what is deployed, fixed with a test that failed first, shipped
  on the owner's go, checked live, and every customer who reported one has a message drafted for the
  owner to send.
- **One customer signal is handled end to end, from its memory.** A report, a bug, a stuck user or a
  drifting AI agent is triaged, reproduced, fixed at the root and left with a regression test; a
  missing function goes to the build instead of being patched as a fix.
- **Help content follows the product.** An article is written from the code, illustrated with
  screenshots stored privately, and the copy the product's AI reads is re-ingested with it; a commit
  that touches a watched screen says so.
- **The owner knows who signed up and where they stand,** from the database and the analytics crossed,
  never from one source alone.
- **Nothing reaches a customer or production without the owner.** Messages are drafts, the push
  waits for an explicit go, the CRM is only suggested, and the in-app reports store is only read.

## What it contains

| Piece | Where | What it does |
|---|---|---|
| Support pivot | `templates/product_support_context.md` | the product's support facts: channels, in-app reports and the query that lists them, the fix backlog's ID prefix, the `Area` list and the memory each area loads, who is the team, how a customer is told, the priority rule, how a fix release ships and is read once live, where bugs are reproduced, where the help center lives and the paths that make it stale, where users' activity is read |
| `pos-support` | `skills/pos-support/` | the support router: a session about one signal (a customer report, a bug, a stuck user, a help center gap, an AI agent that drifts) starts here. Loads only the Support pivot, the fix backlog, the area's memory and the support connectors, triages, routes to the right specialist, and follows RED -> GREEN -> REFACTOR. A missing function goes to the build |
| `pos-fix-backlog` | `skills/pos-fix-backlog/` | creates the fix backlog base in Notion, or checks an existing one; files an entry after searching for a duplicate; moves and closes entries. The base every other support skill reads and writes |
| The schema | `skills/pos-fix-backlog/references/schema.md` | the backlog's properties, statuses, sources, the creation statement, and the Notion traps that bite on creation |
| `pos-bug-kill` | `skills/pos-bug-kill/` | a session that verifies the backlog against the deployed reference, proposes a batch, fixes it area by area in RED -> GREEN -> REFACTOR, ships a minor fix release on a go, and closes the loop |
| `pos-kb-article` | `skills/pos-kb-article/` | the help center pipeline: read the code, write the article, capture and look at the screenshots, store them privately (signed URLs only, never a public bucket), sync and re-ingest the copy the product's AI reads, update the work center |
| `pos-user-activity-report` | `skills/pos-user-activity-report/` | the latest sign-ups, each crossed between the database and the analytics, given an engagement cohort, written to the feedback base; a CRM action suggested, never written |
| Help content hook | `hooks/check-kb-update.mjs` | after a commit, reminds when the changed files match the paths Support pivot section 9 watches: an article, the AI's copy or a screenshot may be stale. Reminds only; never blocks |

## Fill these first

| What | Where | How |
|---|---|---|
| The Support pivot | `<pivots.dir>/product_support_context.md` (by default `.claude/product/`) | copy `templates/product_support_context.md` and fill it below the separation line. The pivot of a function is named `product_<function>_context.md` in `pivots.dir` |
| The fix backlog base | `databases.fix_backlog` | run the `pos-fix-backlog` skill: it creates the base with the owner's parent page, Area list and ID prefix, then writes the key and the prefix through a shown diff. The prefix is unique across the Notion workspace: a second product whose backlog shares a workspace with another takes its own (`FIX` is only the default). A base that already exists is checked, not recreated |
| The module switch | `modules.support: true` | in the product config |

Worth filling too:

- `databases.crm`: without it, `Customer to notify` does not exist and the customers to tell are only
  listed in the report.
- `databases.feedback`: without it, an entry cannot point to the feedback it came from, and the
  activity report gives its entries as text.
- `analytics.provider` and `analytics.project_id`: without them, a user's journey and the activity
  report rest on the database alone, and say so.
- Support pivot sections 9 and 10: without them, `pos-kb-article` asks where the help center lives,
  the help content hook stays silent, and `pos-user-activity-report` stops before its first query.
- A reading gate entry, so a bug kill cannot act before it has read its pivot:

  ```json
  "reading_gate": {
    "skills": {
      "pos-bug-kill": {
        "require": ["pivot:product_support_context.md", "pivot:product.config.json"],
        "min_reads": 4
      },
      "pos-support": {
        "require": ["pivot:product_support_context.md", "pivot:product.config.json"],
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
| Notion | the fix backlog; required |
| The product's database connector (for example Supabase), read only | the in-app reports, and the data checks of a verification |
| Gmail, optional | customer drafts in the owner's mailbox; without it, drafts come as text |
| Analytics (for example Amplitude), optional | a customer's language, a user's real journey, the activity report |

The core `pos-setup` skill connects them; the core `pos-tool-conventions` skill says how each is used.

## Hooks

The plugin ships one hook, declared in `hooks/hooks.json`: after a Bash or PowerShell command that
makes a commit, `check-kb-update.mjs` compares the files the commit changed with the paths of Support
pivot section 9 (the fenced block `json pos-help-paths`, below the separation line) and adds a
reminder to the session when one matches. It needs `modules.support: true` and that block; otherwise
it does nothing. It never blocks, and logs under the plugin's data directory without command text.

Tests: `node --test "support/hooks/test/*.test.mjs"` (Node 22 or later).

## How it fits with the core

- **`pos-setup` hands over to `pos-fix-backlog`.** Setup connects Notion and fills the config; the Support
  module owns its base, so the creation of the fix backlog and its schema live here.
- **`pos-orient` lists open handoffs.** A bug kill that stops at a checkpoint writes a handoff through the
  core `pos-handoff` skill, whose line 1 names `pos-bug-kill`; `pos-orient` shows it until it is closed.
- **Collaboration rule 20** ("what is not done now goes to the backlog") is carried out by
  `pos-fix-backlog`: any session, in any module, that meets a bug it will not fix now files it there.
- **The collaboration rules and principles of the core apply everywhere here.** The skills cite them
  by number and do not repeat them.

## With the other modules

| Module | What it brings to a bug kill | When it is missing |
|---|---|---|
| Delivery | the specialist agents (front-end, back-end, database, AI engineer); the build workflow that takes L entries and the missing functions `pos-support` sends | the main session fixes, and says so |
| Assurance | owns the regression tests the fixes leave; its audit findings arrive as backlog entries | the test stays with the fix, and that is said |
| Release & Operations | the release path, the version scheme, the release notes | the Support pivot's section 7 holds the release path |
| Discovery | receives the "bugs" that are product decisions, and reads the entries `pos-user-activity-report` writes in the feedback base | they go to the owner in the report |

A missing module is said, and the work continues without it. Nothing it would have brought is
invented.
