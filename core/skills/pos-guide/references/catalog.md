# The product OS map

How the OS is meant to be used, and what each piece does. The `pos-guide` skill reads this file and
shows the part that fits the product in front of it.

**Keeping it true.** A plugin that ships, or a skill or agent added, renamed or removed, updates this
file in the same commit.

**Naming.** A plugin is `pos-<function>`; every skill it ships is `pos-<name>`, so the short form
(`/pos-build`) never collides with another plugin's command. Agents keep plain names: nobody types
them. Nothing from a plugin is copied into the product's `.claude/skills` or `.claude/agents`: those
folders hold the product's own.

---

## 1. A session starts with a router

What a session comes to do decides what it loads. A router skill loads only the pivot, the memory and
the connectors of that use, then shows what can be done from there. Starting with the right router
is what keeps a session from working from memory or loading everything.

| You come to | Start with | It loads | Plugin |
|---|---|---|---|
| build, change or ship the product | `/pos-build` | the Build pivot, the memory zones the request touches, the database and deploy connectors | `pos-build` |
| frame an idea, a request, feedback, a whole new app, or write a spec | `/pos-opportunity` | the Discovery pivot, the feedback, roadmap and CRM bases, Notion and analytics | `pos-discovery` |
| handle a customer signal: a bug, a stuck user, a help center gap, an AI agent that drifts | `/pos-support` | the Support pivot, the fix backlog, the memory of the area, Notion, the database, analytics, mail | `pos-support` |
| position, price, prospect, write content | `/pos-gtm` | the GTM pivot, the CRM and feedback bases, Notion, mail | `pos-gtm` |

Before a router, when you are unsure where things stand: `/pos-orient` (the checkout, git, open
handoffs). To know where the product is in its path and which router comes next: `/pos-guide`.

## 2. What each router leads to

### `/pos-build`: build and ship

| You want to | Skill or agent |
|---|---|
| a feature with the full team | `/pos-dev`, guided by `dev-lead` (read, never spawned) |
| check a table's access policies, both ways | `/pos-check-rls` |
| close a step: tests, interface gate, risk card before a push, commit, report | `/pos-post-impl-checklist` |
| audit the code on seven axes | `/pos-audit` |
| define or evolve the visual identity and its tokens | `/pos-visual-identity` |
| migrations and access policies | `db-engineer` |
| routes, server logic, LLM calls | `backend-dev` |
| screens and components | `frontend-dev` |
| end-to-end tests | `qa-engineer` |
| infrastructure, security, cost, deployment | `devsecops` |
| the product's AI agents | `ai-engineer` |
| a mockup before a structural interface choice | `prd-ux` |
| one audit axis each: security, architecture, code quality, performance, tests, interface, AI | `audit-security`, `audit-architecture`, `audit-code-quality`, `audit-performance`, `audit-tests`, `audit-ui`, `audit-ai` |

### `/pos-opportunity`: discovery

| You want to | Skill or agent |
|---|---|
| a full PRD, five perspectives that converge, written into the opportunity's FO(E)CUSED page | `/pos-prd`, guided by `prd-facilitator` (read, never spawned) |
| assess an opportunity or a strategy in one page | `/pos-strategy` |
| write up a meeting into the feedback base | `/pos-meeting-notes` |
| transcribe a recording on the machine | `/pos-meeting-transcript` |
| the perspectives of a PRD: product, tech, voice of the customer, GTM | `prd-pm`, `prd-tech`, `prd-voc`, `prd-gtm` (and `prd-ux` from `pos-build`) |

`/pos-opportunity` sizes a subject: a tiny one goes straight to `/pos-build`, a medium or big one to
`/pos-prd`. FO(E)CUSED is the life cycle of an opportunity, from the problem to the specs:
*Discovery Discipline* (Tristan Charvillat, Rémi Guyot, Thiga) combined with Continuous Discovery
(Teresa Torres), with an Explore step added before the claim.

### `/pos-support`: customers and bugs

| You want to | Skill or agent |
|---|---|
| file a bug that will not be fixed now | `/pos-fix-backlog` |
| empty the fix backlog into a fix release | `/pos-bug-kill` |
| write or update a help center article | `/pos-kb-article` |
| see who signed up lately and how they use the product | `/pos-user-activity-report` |
| fix: the build agents of the bug's kind | from `pos-build` |

A missing function is not support: if it never worked, it goes to `/pos-build`.

### `/pos-gtm`: go-to-market

| You want to | Skill or agent |
|---|---|
| a state of play and three priorities for the week (coach mode) | `/pos-gtm` |
| execute: copy, sequences, pricing, SEO, referral... | the marketing library, routed by `/pos-gtm` |
| visuals for posts | `/pos-social-visual` |
| a product-shaped topic | `/pos-opportunity` |

## 3. The path of a product

Which router at each step, and when the step is done.

| Step | Router | Done when |
|---|---|---|
| **1. Frame the app** | `/pos-setup` once, then `/pos-opportunity` on the whole app: `/pos-strategy` for the bet, `/pos-prd` for the V0.1 scope. `/pos-gtm` sets the positioning alongside | the V0.1 PRD is written and the owner said go |
| **2. Build the V0.1** | `/pos-build`: the data model and its access policies first, then the design system (`/pos-visual-identity`), the screens, the tests | the V0.1 runs locally, its tests pass, the owner did the QA |
| **3. Ship the V0.1** | `/pos-build`: the first deployment, followed to a green build and checked live | the V0.1 answers in production |
| **4. Evolve** | `/pos-opportunity` for ideas and feedback, `/pos-support` for bugs and customers, `/pos-build` to deliver, `/pos-audit` on a cadence. `/pos-gtm` runs alongside | never: this is the product's life |

**A product whose users work in a regulated or codified trade** (archives, regulations,
certifications...) integrates each unit of that trade with `/pos-domain`, once the product exists
and serves such units. It is not a first step: a product with no database or screens yet starts at
step 1.

## 4. The foundation, under every session

| Skill | What it does |
|---|---|
| `/pos-setup` | the first run: templates, connectors, the shared bases, the config |
| `/pos-guide` | where the product is in its path, and which router comes next |
| `/pos-orient` | where the work stands: checkout, git, open handoffs |
| `/pos-handoff` | stop before the end, or split the work across sessions |
| `/pos-domain` | integrate a unit of the users' trade (section 3), with its four analysts |
| `pos-tool-conventions` | how to use Notion, Supabase, Amplitude, Gmail, Easypanel without breaking anything; read by the other skills, never typed |

Hooks that apply in every session: the session rules (bugs, pushes, memory), the reading gate, the
guards on destructive git commands and deletions, and, with `pos-build`, the guard on heavy SQL
against production.

## 5. What stays out of the OS

What belongs to one product (its domain, its clients, its tables) stays in that product's
repository. What belongs to one person (their voice, their job search) is never shipped.
