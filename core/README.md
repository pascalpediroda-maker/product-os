# pos-core: Foundation + Domain

To install it and get started, follow "Start here" in the [root README](../README.md): add the
marketplace, install, open a new session, run `/pos-setup`.

The core is always installed. Every product function (Discovery, Design, Delivery, Assurance, Support & Success, Release & Operations, Go-to-Market) is an optional plugin that depends on it.

It guarantees three things:

- **A session never works from memory.** Each piece of knowledge has one place, found from the zone being touched, and a gated skill cannot act before it has read what its zone requires.
- **Every incident moves a rule one rung up**: a sentence, then a gate, then a hook or a test.
- **The domain is captured once.** The knowledge of the user's trade (official definitions, method, the criteria real judges apply, the units to cover) is written once, then read by product decisions, by configuration and by the product's AI.

## What it contains

| Piece | Where | What it does |
|---|---|---|
| Product config | `templates/product/product.config.json` | the product, its modules and libraries, the memory routing table, the reading gate, the database IDs |
| Domain pivot | `templates/product/product_domain_context.md` | the domain written once: glossary, phases, judges' criteria, how a unit lives in the product, coverage, ground truth |
| Memory templates | `templates/CLAUDE.md`, `templates/memory/` | where knowledge lives, the index, the shape of an architecture file and a reference file |
| Rules | `rules/collaboration.md`, `rules/principles.md` | how the owner and the assistant work together, and the rungs a broken rule climbs |
| Session rules | `hooks/session-rules.mjs` | at session start, injects a digest of the rules built from the config (where a deferred bug goes, who pushes, where memory is read), whatever the product's own CLAUDE.md says |
| Reading gate | `hooks/reading-gate.mjs` | a gated skill cannot run a shell or write a file before it has read the files the config requires |
| Guards | `hooks/guard-destructive-git.mjs`, `hooks/guard-destructive-delete.mjs` | ask before commands that destroy work: reset to the remote, force push, worktree or branch removal, recursive deletes, a push that deploys |
| `pos-setup` | `skills/pos-setup/` | the first skill a new product runs: templates in place, an existing CLAUDE.md reconciled with the OS rules, the connectors it needs (Notion, Supabase, Amplitude, Gmail) created, signed in with least privilege and tested, credentials kept out of the repository, the config filled |
| `pos-guide` | `skills/pos-guide/` | the tour for this product: which skill to start a session with, what each calls, the agents by trade, where to begin, with one recommendation. Its catalog (`references/catalog.md`) maps every skill and agent of the OS, installed or planned; a plugin that ships updates it in the same commit |
| `pos-tool-conventions` | `skills/pos-tool-conventions/` | how to use each connected tool without breaking anything, one reference per tool, every fact checked on the vendor's documentation |
| `pos-orient` | `skills/pos-orient/` | where things stand, re-read from what is written and from git, never recalled |
| `pos-handoff` | `skills/pos-handoff/` | a handoff that starts with the reading order and carries state, not story |
| `pos-domain` | `skills/pos-domain/`, `agents/unit-*.md` | a new unit of the trade enters as data: analyse, integrate, calibrate, activate |

## Function plugins

Installed on top of the core, from the same marketplace, each switched on by its `modules.<function>` key.

| Plugin | Function | What it carries |
|---|---|---|
| `pos-support` | Customer Support & Success (`modules.support`) | the fix backlog base and its schema (`pos-fix-backlog`), the bug kill session that empties it into a minor fix release (`pos-bug-kill`), the Support pivot |

## Fill these first

Copy the templates into your product repository, then fill them before running any skill. The `pos-setup` skill does the copying for you.

| File | Where it goes | What it holds |
|---|---|---|
| `templates/product/product.config.json` | `.claude/product/product.config.json` | the product, the installed modules and libraries, the memory routing table, the reading gate, the database IDs |
| `templates/product/product_domain_context.md` | `.claude/product/product_domain_context.md` | the domain in one page, the official glossary, the phases of the user's work, the judges' criteria, the units and their coverage |
| `templates/CLAUDE.md` | repository root, only when the product has none | rules that apply to all work. An existing CLAUDE.md is kept and reconciled by `pos-setup` |
| `templates/memory/MEMORY.md` | `.claude/memory/MEMORY.md` | the index, one line per memory file |
| `templates/memory/*.md` | `.claude/memory/` | the shapes of a subsystem architecture file and of a reference file |

Every template carries a separation line. Above it: the generic skeleton, which an OS update may change. Below it: what belongs to your product, which an update never overwrites.

## `product.config.json`

One file, read by the hooks and by every skill. Strict JSON: no comments.

| Key | Meaning |
|---|---|
| `schema_version` | version of this contract; the hooks do nothing with a version they do not know |
| `product.name`, `product.one_liner` | the product in a name and a sentence |
| `product.ui_language` | language of every user-facing string |
| `product.team_language` | language the team and the assistant talk in |
| `product.ai_agents` | `true` when the product runs AI agents for its users (an assistant, a chatbot, generated content). Asked by `pos-setup`; the AI engineering part of Delivery reads it. A missing key reads as `false` |
| `modules.<function>` | `true` when that product-function plugin is installed. A skill that needs a missing module says so and continues; it never invents what the module would have brought |
| `libraries.<id>` | `true` when that external skill library is installed. Native skills route to it when present, and do the work themselves or declare it uncovered when absent |
| `memory.dir` | where memory files live, relative to the repository root |
| `memory.index` | the index file inside `memory.dir` |
| `memory.always` | files every gated skill must read, whatever the zone. A bare name resolves under `memory.dir`; a name prefixed `pivot:` (for example `pivot:product_domain_context.md`) resolves under `pivots.dir`, and the same holds in `reading_gate.skills.<skill>.require` |
| `routing.zones.<zone>` | the memory files a zone requires. This table is what lets a session load only what the request needs |
| `reading_gate.skills.<skill>.require` | files that skill must read before it may run a shell or write a file, on top of `memory.always` |
| `reading_gate.skills.<skill>.min_reads` | minimum number of distinct files read, memory and pivots together. Every named file is required whatever this number; it only raises the floor above them |
| `reading_gate.stale_hours` | an armed gate older than this is ignored (default 6) |
| `pivots.dir` | where the per-function pivot files and this config live |
| `pivots.domain` | the domain pivot file name inside `pivots.dir` |
| `databases.feedback` / `roadmap` / `fix_backlog` / `crm` | the shared bases. For Notion, the full data source URL, `collection://<id>`, used as it is (it is also the table name in Notion's SQL mode). Empty means not configured: the skill that needs it says so |
| `analytics.provider`, `analytics.project_id` | where product analytics are read |
| `git.main_branch`, `git.push_deploys` | when `push_deploys` is true (the default when the key is missing), a push to `main_branch` ships to production: the git guard asks before it, and it only happens on an explicit go |

A skill that is not listed under `reading_gate.skills` is not gated.

**Function pivots.** Each function plugin has one pivot, named `<pivots.dir>/product_<module>_context.md`, where `<module>` is its key under `modules`: `product_support_context.md`, `product_release_ops_context.md`, `product_discovery_context.md`, and so on. The plugin ships it as a template with the same separation line.

## How the hooks behave

- **The OS rules reach every session.** At the start of a new, cleared or compacted session, the session-rules hook injects a digest built from the config. Where the product's CLAUDE.md says otherwise on a subject the config settles (a deferred bug, a push, memory), the OS rule applies and the session names the conflict once; a choice the owner recorded in CLAUDE.md under "Product OS: standing choices of the owner" wins, and the owner's word in the conversation wins over everything. Without a config, the hook says only, and only if the repository enabled the core in its own settings, that the OS is not set up and that `pos-setup` is next.
- **The reading gate needs the config.** Without `.claude/product/product.config.json`, or with an unknown `schema_version`, it does nothing and logs why.
- **The guards protect everywhere.** The destructive git rules and the delete guard apply with or without a config. The config only refines them: `git.main_branch` names the protected branch, and the confirmation before a push to it applies when `git.push_deploys` is true.
- **A read counts wherever the work happens.** A file read in any worktree of the same repository counts, matched by its path relative to `memory.dir` or `pivots.dir`. A file read in another repository does not.
- **A required file that does not exist is dropped and named**, rather than locking the session with no way out.
- **A hook never blocks by crashing.** Every failure exits cleanly and is logged under the plugin's data directory, without command text.

Tests: `node --test "core/hooks/test/*.test.mjs"` (Node 22 or later).
