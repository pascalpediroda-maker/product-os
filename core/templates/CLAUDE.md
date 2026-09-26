# <product.name>

Skeleton version 1, maintained by `product-os-core`.

Copy this file to the root of the product repository. It holds the rules that apply to all work on
the product and must always be in context. The product itself (name, installed modules, memory
routing, reading gate, shared databases, git) is described in `.claude/product/product.config.json`;
this file refers to its keys by name.

## Rules that come with the OS

Two rule files of the core plugin apply to all work here. They are not copied into this file,
because a rule lives in one place:

- `rules/collaboration.md`: how the owner and the assistant work together: reading before acting,
  verifying before asserting, deciding and owning, scope, reporting, git and releases, client data,
  delegation, writing for others, housekeeping.
- `rules/principles.md`: the working principles, and the rungs (a written rule that is broken again
  becomes a gate, then a hook or a test).

The product's own rules are below the separation line. Where one of them explicitly lifts or changes
an OS rule, the product rule wins for this product.

## Where knowledge lives

Four destinations. One rule decides between them.

| Destination | What goes there | How it loads |
|---|---|---|
| A skill or agent file | behaviour or knowledge scoped to **one** skill or agent | automatically when that skill or agent runs; it cannot be skipped |
| This `CLAUDE.md` | rules that apply to **all** work and must always be in context | every session |
| Repo memory: `memory.dir`, indexed by `memory.index` | **facts about the product** that a skill reads: architecture, references, methodology, design system, domain | on demand: `memory.always` for every gated skill, `routing.zones.<zone>` for the zone touched |
| The assistant's auto-memory (local, outside the repository) | **in-flight state** of the work, and the **working relationship** with the owner | its index is loaded each session, on this machine only |

**Decision.** Behaviour scoped to one skill: inline it in that skill, the preferred home. Behaviour
that crosses skills: here. A product fact that a skill reads: `memory.dir`. In-flight state or
personal context: auto-memory.

- The pivot files (`pivots.dir`, with the domain pivot `pivots.domain`) are part of repo knowledge:
  each layer of the OS reads its pivot first.
- Versioned memory never points to auto-memory. A link from `memory.dir` to a local file is dead for
  everyone else.
- Each fact has one home. When two files say the same thing, keep it in one and link from the other.

## Naming inside the memory directory

- **`archi-<subsystem>.md`**: how a subsystem of this product is built: entry points, data flow,
  data model, configuration, invariants, pitfalls. A family of subsystems may share a sub-prefix
  (`archi-ai-<name>.md` for the product's AI subsystems). Shape: the core template
  `memory/archi-subsystem.md`.
- **`reference_<topic>.md`**: knowledge consulted that is **not** our internal architecture: the
  external domain, stack conventions and gotchas, design rules, catalogues. Shape: the core template
  `memory/reference.md`.
- **Discriminant.** Does it describe the internals of one of our features? `archi-`. Is it a domain
  fact, a convention, a gotcha, a rule or a catalogue? `reference_`.
- Every file has one line in `memory.index`. Every zone in `routing.zones` lists the files it needs,
  and every file it lists exists.

## Verification order: memory first, code confirms

1. Find the zone the request touches. Read `memory.always` and `routing.zones.<zone>` in full, then
   the pivot of the layer if the task belongs to one. A gated skill (`reading_gate.skills`) cannot
   run a shell or write a file before that.
2. Code and tools serve to **confirm** a hypothesis born from memory, or to settle a **negative**
   claim. Never search the source as a first action when memory documents the answer.
3. "I didn't find it" is not "it doesn't exist". Before any negative assertion ("not tracked",
   "feature absent", "the tool can't"), exhaust the cheap checks: read whole files, search with
   several patterns, call the tool that would know.
4. On a fact lookup (a URL, a key, an endpoint, a value), read **all** the relevant memory hits
   before concluding, never just one.
5. A contradiction between two memory files, or a `localhost` default, or an "ask the owner"
   placeholder, is a sign of missing information. Reconcile the memory files. Never improvise a local
   workaround, and never stop at a dead end.
6. When the code proves a memory file wrong, fix the file in the same task and update its date.

## When a rule is broken again

It climbs one rung (`rules/principles.md`): a sentence, then a gate, then a hook or a test. The lock
names its rule, the rule names its lock, and the product's locks are listed in the register below.
A lesson that would hold for any product is proposed to the OS, not kept here.

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

# Product rules

<!--
Everything below is this product's own content. An OS update never touches it.
Guidance:
- Keep a rule here only if it applies to all work on this product. A rule for one skill goes into
  that skill; a product fact goes into memory.dir.
- One rule, one place: state it once, with its reason in a sentence. Point to memory for details.
- An incident is kept as its generic lesson: no client names, no personal data.
- Delete the guidance comments once a section is filled. Delete a section that does not apply.
-->

## The product

<!-- One paragraph: what the product does, for whom, and the one thing a new session must not get
wrong about it. Name and one-liner are in product.config.json (product.name, product.one_liner). -->

- UI language (`product.ui_language`): <!-- every user-facing string -->
- Team language (`product.team_language`): <!-- what the owner and the assistant talk in -->
- Vocabulary: <!-- the product's words for its main objects, and the words never to use instead.
  The full glossary is in the domain pivot (pivots.domain). -->

## Stack and conventions

<!-- Framework, database, hosting, AI provider. Then the conventions every change must follow, each
with its reason: how every route authenticates, the error format, status codes, logging, how the
server reaches the database, what is forbidden and why. Point to the archi-* file for details. -->

## Security and confidentiality

<!-- What data is sensitive, where it may go (which providers may receive it), storage rules (private
storage, signed links), what never appears in logs, which keys never reach the client. -->

## Tenancy and permissions

<!-- How data is scoped (per workspace, per project), the primary gate (row-level policies) and the
second gate (application code), the role model, and the helpers that check permissions. -->

## Client spaces and the test space

<!-- How to tell a space that belongs to a client (for example, a membership query). The test space
sessions use to illustrate and test. Reference or imported data that must never be used for tests,
and the duplication script that makes a test copy. -->

## Git and release

<!-- Main branch and whether a push deploys: git.main_branch, git.push_deploys.
Branch policy: work on the main branch by default? when is a separate branch or working copy allowed,
and who agrees to it?
What gets committed (code, scripts, memory, skills) and what never does (credentials, session files).
How a push reaches production, and how to check the deployed build afterwards. -->

## UI

<!-- The design system file in memory.dir that every UI change reads first, the component library
to reuse, and the non-negotiables (for example: no dark mode, tokens only, sentence case). -->

## Evidence

<!-- The one folder where captures, exports and results shown to the owner go, with one dated
subfolder per topic, for example `<evidence-folder>/<YYYY-MM-DD>-<topic>/`. Test code and generated
test output live elsewhere. -->

## Standing instructions from the owner

<!-- The owner's standing choices that change a default of the OS rules for this product, each with
the rule it changes. Example: "Delegation to agents needs no permission; ask only for an unusual cost
or sensitive data (rule 36)." -->

## Register of locks

<!-- One row per rule of this product (or OS rule applied here) that has climbed to a gate, a hook or
a test. -->

| Rule | Rung | Lock (gate, hook or test) | Since |
|---|---|---|---|
| <!-- rule --> | <!-- 2 or 3 --> | <!-- path of the hook, test or skill step --> | <!-- YYYY-MM-DD --> |
