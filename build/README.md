# pos-build: Build

The build function of the product OS. It depends on `pos-core` and is switched on by
`modules.build: true` in the product config.

## Install

```
claude plugin marketplace add pascalpediroda-maker/product-os --scope project
claude plugin install pos-build@product-os --scope project
```

The core is installed with it if it is not there yet. Then open a new session in the product
repository, run `/pos-setup` (it connects the database and deploy connectors), and set
`modules.build: true` in the product config. The full sequence and the choice of scope are in the [root README](../README.md).

## What it guarantees

- **A build session loads only what building needs.** The Build pivot, the memory zones the request
  touches, the database connector and the deploy connector. Nothing from the other functions.
- **The work is sized before it starts, and every delivery is checked.** A tier announced with its
  reason (the session alone, one or two specialists, the full team), a base level with the deployed
  reference, and every agent's delivery opened and checked item by item against its brief.
- **Nothing reaches production without a proven benefit and the owner's go.** Every step closes with
  the post-implementation checklist: the session's tests, the interface compared with its neighbour,
  the gaps named, the owner's test list, a risk card per change (benefit, worst case, detection,
  rollback), local commits, and a push only on an explicit go, watched for 15 minutes after.
- **The SaaS stays isolated and the database stays up.** Authentication on every route with a local
  check, tenant isolation in policies and code, row-level security on every table, coupled writes in
  one transaction, load costed before it ships, and a hook that refuses an unbounded heavy query on
  the database.
- **The product's AI changes through one protocol.** When the product runs AI agents, every change
  goes through the AI engineer, a copy production never resolves, a bench before and after, and a
  full snapshot for rollback.

## What it contains

| Piece | Where | What it does |
|---|---|---|
| Build pivot | `templates/product_build_context.md` | above its separation line, the rules every build applies: building a multi-tenant SaaS (S1 to S16), engineering the product's AI (AI1 to AI16), tests (T1 to T6); below it, the product's facts those rules need: stack, paths, auth helpers, tenants and roles, data conventions, database, runtime and failure modes, interface, AI agents, tests, commits |
| `pos-build` | `skills/pos-build/` | the router a build session starts with: what it loads, what you can do from here, the tiers TRIVIAL, MINI and FEATURE, read before asking, an up-to-date base |
| `pos-dev` | `skills/pos-dev/` | the FEATURE tier: the session as dev lead with six specialists in dependency order, and the item-by-item check of every delivery |
| `pos-check-rls` | `skills/pos-check-rls/` | row-level security checked both ways (blocked and exposed), definer functions, fix patterns |
| `pos-post-impl-checklist` | `skills/pos-post-impl-checklist/` | the gates that close every step, the interface gate and the risk card included |
| `pos-audit` | `skills/pos-audit/` | an audit of the code on several axes, by the `audit-*` agents |
| `pos-visual-identity` | `skills/pos-visual-identity/` | the visual identity, its tokens, and the cascade into components |
| `dev-lead` | `agents/dev-lead.md` | the lead's operating guide, read by the session, never spawned |
| Specialist agents | `agents/db-engineer.md`, `backend-dev.md`, `frontend-dev.md`, `qa-engineer.md`, `devsecops.md`, `ai-engineer.md`, `prd-ux.md` | database, back end, front end, end-to-end tests, infrastructure and security, the product's AI, mockups and UX review |
| Auditors | `agents/audit-*.md` | one audit axis each, for `pos-audit` |
| Heavy SQL guard | `hooks/guard-heavy-sql.mjs` | refuses a query on the database connector that holds a heavy construct (regex, a text cast of JSON, `generate_series`, a cross join) unless it starts with a statement timeout of 10 s at most |

The agents that work on the database (`db-engineer`, `backend-dev`, `devsecops`, `ai-engineer`)
declare no tool list, so they reach the database connector of the session whatever its install name;
the others are limited to reading, editing and messaging.

## Fill these first

| What | Where | How |
|---|---|---|
| The Build pivot | `<pivots.dir>/product_build_context.md` (by default `.claude/product/`) | copy `templates/product_build_context.md` and fill it below the separation line, section by section. A thin section is honest: "none" is a finding |
| The module switch | `modules.build: true` | in the product config |
| `product.ai_agents` | the product config | `true` when the product runs AI agents for its users: the AI rules and `ai-engineer` then apply |
| `git.main_branch`, `git.push_deploys` | the product config | the reference the build checks its base against, and whether a push ships |
| `deploy.provider`, `deploy.project`, `deploy.app_service` | the product config | so a push is followed to a green build |

Worth filling too:

- `routing.zones`: one key per area of the code, with its architecture file, so a build loads only
  the zone it touches.
- A reading gate entry, so a build cannot act before it has read its pivot:

  ```json
  "reading_gate": {
    "skills": {
      "pos-build": {
        "require": ["pivot:product_build_context.md", "pivot:product.config.json"],
        "min_reads": 3
      },
      "pos-dev": {
        "require": ["pivot:product_build_context.md", "pivot:product.config.json"],
        "min_reads": 4
      }
    }
  }
  ```

The pivot carries the core's separation line. Above it: the rules and the skeleton, which an update
of this plugin may change. Below it: the product's content, which an update never overwrites.

## Connectors

| Connector | Needed for |
|---|---|
| The product's database connector (for example Supabase) | schema reads, migrations, access-policy checks, data checks, the logs watched after a push |
| The deploy connector (for example Easypanel), optional | following a push to a green build, reading a service's logs; without it, a build cannot be followed and that is said |

The core `pos-setup` skill connects them; the core `pos-tool-conventions` skill says how each is used
(Supabase and Easypanel references).

## How it fits with the core

- **The reading gate** holds a gated build skill until its pivot and config are read, when the config
  lists it under `reading_gate.skills`.
- **The guards of the core** ask before destructive git and delete commands, and before a push that
  deploys. This plugin adds the heavy SQL guard on the database connector.
- **`pos-orient` lists open handoffs.** A build that stops before the owner's QA or go writes a
  handoff through the core `pos-handoff` skill, whose line 1 names `pos-build`.
- **The collaboration rules and principles of the core apply everywhere here.** The skills and
  agents cite them by number and do not repeat them.

## With the other modules

| Module | What it brings to a build | When it is missing |
|---|---|---|
| Discovery | the framed topic and the spec a FEATURE implements; the personas `prd-ux` keeps in mind | the build works from the owner's request; no framing is invented |
| Support & Success | the fix backlog where a bug met on the way is filed (`pos-fix-backlog`); the bug kill, which uses this plugin's specialist agents for its fixes | a bug met on the way goes into a handoff for another session |
| Release & Operations | the release path, the version, what is live | the Build pivot's section 7 holds the services and how each ships |

A missing module is said, and the work continues without it. Nothing it would have brought is
invented.
