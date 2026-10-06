# The product OS catalog

What the OS offers, function by function: the skills a person starts, what each one calls (skills and
agents), the agents grouped by trade, and the ways to begin. The `pos-guide` skill reads this file and
shows the part that fits the product in front of it.

**Status.**

- **Installed with `<plugin>`**: the skill or agent ships in that plugin today. It is usable once the
  plugin is installed and the session has restarted.
- **Planned**: designed, not built. Its name is a working name. A session never does a planned
  skill's work from memory in its place: the gap is declared (principle 10).

**Keeping it true.** A plugin that ships, or a skill or agent added, renamed or removed, updates this
file in the same commit.

**Naming.** A plugin is `pos-<function>`; every skill it ships is `pos-<name>`, so the short form
(`/pos-orient`) never collides with another plugin's command. Agents keep plain names: nobody types
them.

**How a person reaches them.** Skills are typed with `/`. A plugin's skill may show with its plugin
name in front (`/pos-core:pos-orient`). Agents are never typed: the skill that needs one spawns it
with a brief and checks what it returns (rule 37). `/agents` lists the agents a session can use.
Nothing from a plugin is copied into the product's `.claude/skills` or `.claude/agents`: those folders
hold the product's own.

---

## 1. Starting a session: which skill, by situation

These are the entry points: the skills a person types. Everything else in this catalog is called by
them.

| Situation | Start with | Status |
|---|---|---|
| The OS was just installed, or a connector broke | `pos-setup` | Installed with `pos-core` |
| Not sure what the OS does here, or where to begin | `pos-guide` | Installed with `pos-core` |
| Any work session: at its start, after a compaction, or when unsure which checkout, branch or task you are on | `pos-orient`, then the skill its "Next" names. An open handoff is read after the skill on its line 1 has run | Installed with `pos-core` |
| A new unit of the users' trade to cover (official documents in hand), or a unit's sources changed | `pos-domain` | Installed with `pos-core` |
| A bug seen or reported that will not be fixed now | `pos-fix-backlog` | Installed with `pos-support` |
| Time to empty the fix backlog into a fix release | `pos-bug-kill` | Installed with `pos-support` |
| Stopping before the work is finished, or splitting it across sessions | `pos-handoff` | Installed with `pos-core` |
| A customer signal to handle now: a report, a user stuck | `pos-support` | Planned (Support & Success) |
| Who signed up lately and how they use the product | `pos-user-activity-report` | Planned (Support & Success) |
| An interview or a demo to write up | `pos-meeting-notes` | Planned (Discovery) |
| An idea, a request, a pain heard: is it worth doing, and how big? | `pos-opportunity` | Planned (Discovery) |
| An opportunity to frame and decide, or a structuring design question | `pos-prd` | Planned (Design) |
| The product's look, its tokens and components | `pos-design-system` | Planned (Design) |
| Something decided, to build | `pos-dev` | Planned (Delivery) |
| Checking quality: an audit, the regression suite | `pos-audit` | Planned (Assurance) |
| Shipping and checking what runs | `pos-release` | Planned (Release & Operations) |
| Positioning, pricing, prospecting, content | `pos-gtm` | Planned (Go-to-Market) |

## 2. What each entry skill calls

### Installed

| Skill | Skills it calls | Agents it calls |
|---|---|---|
| `pos-setup` | `pos-fix-backlog` when Support is installed and the base does not exist; hands over to `pos-guide`, `pos-orient`, `pos-domain` | none |
| `pos-guide` | none: it reads and recommends | none |
| `pos-orient` | none: it reads and reports | none |
| `pos-domain` | `pos-tool-conventions` before reading a connected tool | Phase 1, in parallel and read-only: `unit-analyst-model`, `unit-analyst-configuration`, `unit-analyst-ai`, `unit-analyst-knowledge`. The session leads them, following `unit-analysis-lead` |
| `pos-fix-backlog` | `pos-tool-conventions` (its Notion reference) before the first Notion call | none |
| `pos-bug-kill` | `pos-fix-backlog` to file the in-app reports and close entries; `pos-tool-conventions`; `pos-handoff` when a batch waits on the owner | read-only verification agents, one per group of areas, briefed with the annex of `pos-bug-kill`; for the fixes, the Delivery agents of the bug's kind (front-end, back-end, database, AI engineer, QA) when Delivery is installed, otherwise the session fixes and says so |
| `pos-handoff` | none | none |

Called only by other skills, never typed: `pos-tool-conventions`, how to use Notion, Supabase, Amplitude
and Gmail without breaking anything.

### Planned

| Skill | Will call | Agents |
|---|---|---|
| `pos-support` | `pos-fix-backlog` when the fix is deferred | the Delivery agent of the signal's kind |
| `pos-user-activity-report` | writes to the feedback base for Discovery | none |
| `pos-meeting-notes` | writes to the feedback base | none |
| `pos-opportunity` | sizes the subject (tiny, medium, big): a tiny one goes to `pos-dev`; a medium or big one opens or advances its FO(E)CUSED page, then `pos-prd` | `voc` |
| `pos-prd` | writes into the FO(E)CUSED sections of the current phase | `prd-pm`, `prd-tech`, `prd-ux`, plus `voc` (Discovery) and the GTM perspective; the session facilitates |
| `pos-design-system` | the visual identity, then tokens and components | none |
| `pos-dev` | sizes the request in three tiers, reads the zone's memory, `pos-kb-article` at delivery | `db-engineer`, `backend-dev`, `frontend-dev`, `ai-engineer`, `qa-engineer`; the session leads them |
| `pos-audit` | its findings not fixed now go to `pos-fix-backlog` | the seven auditors |
| `pos-release` | the smoke test of Assurance, the release note | `devsecops` |
| `pos-gtm` | the marketing library when installed | the GTM perspective |

FO(E)CUSED is the life cycle of an opportunity, from the problem to the specs: *Discovery Discipline*
(Tristan Charvillat, Rémi Guyot, Thiga) combined with Continuous Discovery (Teresa Torres), with an
Explore step added before the claim.

## 3. The agents, by trade

| Trade | Agent | What it does | Called by | Status |
|---|---|---|---|---|
| **Domain analysts** | `unit-analysis-lead` | the guide the session follows to lead an analysis: intake, the missing documents checkpoint, the four briefs, the synthesis. Never spawned | `pos-domain` | Installed with `pos-core` |
| | `unit-analyst-model` | can the product's data model carry the new unit, element by element; verdict Easy, Medium or Hard | `pos-domain` | Installed with `pos-core` |
| | `unit-analyst-configuration` | the complete configuration the unit needs, compared with the closest existing unit | `pos-domain` | Installed with `pos-core` |
| | `unit-analyst-ai` | which of the product's AI agents, checks and scores work for the unit, and whether the product can judge like the real judges | `pos-domain` | Installed with `pos-core` |
| | `unit-analyst-knowledge` | what the product's AI must know: knowledge base plan, unit sheet, domain pivot updates | `pos-domain` | Installed with `pos-core` |
| **Bug verification** | a read-only general agent | checks a group of backlog entries against the deployed code and returns a verdict with its proof | `pos-bug-kill` | Installed with `pos-support` (a brief, not a named agent) |
| **Product workshop** | `voc` | brings real verbatims and data from the feedback bases; never invents | `pos-opportunity`, `pos-prd` | Planned (Discovery) |
| | `prd-pm`, `prd-tech`, `prd-ux` | the product, technical and UX perspectives of a decision | `pos-prd` | Planned (Design) |
| **Developers** | `db-engineer` | migrations and access policies | `pos-dev`, `pos-bug-kill` | Planned (Delivery) |
| | `backend-dev` | routes, business logic, integrations | `pos-dev`, `pos-bug-kill` | Planned (Delivery) |
| | `frontend-dev` | screens and components, from the design system | `pos-dev`, `pos-bug-kill` | Planned (Delivery) |
| | `ai-engineer` | the product's AI agents: prompts, settings, the change protocol | `pos-dev`, `pos-bug-kill` | Planned (Delivery) |
| **Quality** | `qa-engineer` | end-to-end tests and the regression suite | `pos-dev`, `pos-bug-kill`, `pos-audit` | Planned (Assurance) |
| | `audit-security`, `audit-architecture`, `audit-ai`, `audit-ui`, `audit-performance`, `audit-tests`, `audit-code-quality` | one audit axis each | `pos-audit` | Planned (Assurance) |
| **Operations** | `devsecops` | hosting, deployment, logs, monitoring | `pos-release` | Planned (Release & Operations) |

## 4. Where to begin

Three ways in. The `pos-guide` skill recommends one from the product's state, and the owner chooses.

| Way in | For | The sequence | Needs |
|---|---|---|---|
| **The domain first** | any product whose domain pivot is still empty | `pos-domain` on the unit the product already serves. It writes the domain pivot that every later skill reads: glossary, phases of the users' work, the judges' criteria, coverage | `pos-core` |
| **Start small and see** | an owner who wants a first result fast and learns the OS on it | capture two or three real signals (`pos-meeting-notes`) → `pos-opportunity` sizes one → a tiny one: `pos-dev` builds it; a medium one: `pos-prd` frames it (FO(E)CUSED phases 1 and 2), then `pos-dev` builds it → shipped on the owner's go | Discovery, Design, Delivery |
| **Foundations first** (more guided) | a product starting its code, or whose data model or interface is not written down | either the **data model**: the architecture pivot, the tables with their access policies, the invariant tests (Delivery, SaaS architecture); or the **design system**: identity, tokens, components (Design). Then "start small" on solid ground | Delivery or Design |

With users and bugs already, Support runs alongside any of them: `pos-fix-backlog` from day one, a
`pos-bug-kill` when the backlog has grown.
