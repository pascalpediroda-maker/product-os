---
name: pos-visual-identity
description: >
  Define, evolve, or apply the product's visual identity: moodboard, art direction, palette,
  typography, shadows, radii, motion language, and design tokens. Use this skill EVERY TIME the user
  wants to work on brand visuals, UI redesign, design tokens, theming, moodboard, or art direction,
  whether they say "visual identity", "moodboard", "art direction", "redesign UI", "new theme",
  "design tokens", "change the vibe", "it feels too X", or flags a perception issue ("it looks
  bland", "no personality", "feels like every other tool"). Also trigger when adding a new visual
  primitive (illustration, signature icon, motion pattern) that could drift from the system. This
  skill encodes the WHOLE process (research, 3 competing directions, the owner picks, export tokens
  behind a flag, update the token file and the design system file, cascade into components).
  Skipping a phase produces drift between what the owner validated and what ships.
---

# Defining the product's visual identity

Visual identity is not a styling patch; it is a direction decided upstream, then cascaded into
tokens, then into components. Skipping the upstream step produces a redesign that still feels
generic, just differently. A product whose users entrust it with high-stakes work cannot look
forgettable.

The owner decides. Expect the owner to want the identity **opinionated**, **premium**, **memorable**,
and **appropriate to the product's real screens** (a dense working tool is not a landing-page hero).
Never propose a direction without trade-offs; never commit tokens without the owner's approval.

Rule numbers refer to the collaboration rules of `pos-core` (`core/rules/collaboration.md`),
principles to its working principles. They are not repeated here.

---

## Mandatory pre-flight: read the current state

Before proposing anything, read:

1. **The product config:** `product.*` (including `product.ui_language` and `product.ai_agents`),
   `modules.*`, `memory.*`, `pivots.dir`.
2. **The build pivot,** `<pivots.dir>/product_build_context.md`: the stack, the design system file
   it names, the token file and where tokens are declared, the UI rules.
3. **The design system file** it names: current tokens (palette, typography, radii, shadows,
   components).
4. **The token file** (CSS variables, theme declarations) and any styling config the stack uses.
5. **The domain pivot** (`pivots.domain`) and, when `modules.discovery` is true, the Discovery pivot:
   who the users are, what they work on, what tools they come from.
6. **Any prior direction doc:** `<memory.dir>/ui_direction_v2.md` (may not exist yet).

Map 5 or 6 signature screens and note the actual visual state (not the documented one). The
documentation often lags the code (rule 1).

---

## Product context (non-negotiable)

Write these constraints down from the pivots before Phase 1; they shape every direction you propose:

- **Users:** who they are, how dense their data is, how long their sessions last.
- **Competitors in the user's head:** the tools they use daily. The identity must feel *at their
  level*, not below.
- **Perception stake:** what the users entrust to the product. Cheap UI = cheap product = they trust
  it less with that work.
- **Density requirement:** the share of screens that are list-of-entities + side panel. The identity
  must survive high information density without visual noise.
- **Accessibility:** contrast AA minimum. Users who work long hours tire on low-contrast "aesthetic"
  palettes.
- **UI language:** `product.ui_language`. No cultural or language-specific type choices beyond it.

The three blocks below apply when the product has the trait. Each says which extra mocks every
direction must deliver in Phase 2.

### When the product is agentic (`product.ai_agents` true)

An agentic workspace is not a form-filling tool with AI features bolted on. The identity must encode
this, not decorate it.

- **Persistent agents, each with a persona and a scope** (the build pivot names them): for example a
  workspace-level agent with a coaching tone and ambiguous inputs, and an item-level agent with an
  execution tone, grounded in the item's data.
- **An assistant panel that is omnipresent** rather than a modal you summon: users spend hours with it
  open.
- **Tool-based interactions:** agents do not just chat, they propose structured changes (cards,
  diffs, multi-step proposals) that users accept or reject.

Consequences to enforce in every direction:

1. **Two-territory layout is the canvas.** The identity is not "a screen" but "a conversation zone +
   a document/list zone, coexisting for hours". Tokens must define both territories distinctly
   (colors, density, motion) without creating visual war between them.
2. **Agent presence needs a visual language.** Each agent needs: an avatar or mark, a typographic
   voice (quoted messages vs interface chrome visually distinct), a color signature (agents
   distinguishable without reading labels), a motion signature (how a proposal card arrives, how
   streaming tokens render, how a tool call is surfaced).
3. **Proposal cards are a first-class component.** They are where the agentic value shows up. They
   deserve their own primitive with opinionated styling, not a generic card with a chat icon. Part of
   the Phase 2 deliverables.
4. **Streaming and async states drive motion choice.** A large share of pixels are being written or
   updated live. The motion language must distinguish: streaming token (live thinking), tool running
   (work in progress), proposal ready (action available), accepted/rejected (state closed). This is
   a system, not four one-off animations.
5. **Trust signals matter more than polish.** Agentic products live or die on whether users believe
   the agent. Visual cues for: grounded-in-source vs speculating, confidence level, reversibility of a
   proposed action. These are identity decisions, not just UI patterns.
6. **The identity is ambient, not loud.** Because agents push content into the UI continuously, the
   chrome must be calm enough that new agent outputs can *be* the visual event.

Each direction must answer these six points explicitly and mock: (a) the workspace with its
workspace-level agent open, (b) an item with its agent proposing 3 changes, (c) a streaming state.

### When the work is collaborative (several people on one item)

The identity must make collaboration *feel alive*, otherwise the product looks like a single-player
tool with a chat box.

1. **Presence is a first-class citizen.** Avatars of connected collaborators, cursors and selections
   of other humans, "X is editing this" indicators, last-editor attribution. The palette must include
   a distinguishable *user-attribution color space* (multiple human colors, stable per user,
   accessible on all surfaces) separate from the agent color space.
2. **Human vs agent authorship must be instantly readable.** When a part was last edited, the user
   must know at a glance: which human, or which agent. A *systemic* visual decision (avatar ring,
   accent color, micro-label), not a tooltip. Confusion here = trust loss on both sides.
3. **Comment and review threads are core UI,** not a sidebar afterthought. They need dedicated
   typographic and color treatment.
4. **Async activity must be legible.** Users drop in after days away. The identity needs an activity
   surface ("what happened since I was gone") that distinguishes edits by others, agent proposals
   pending, comments to read, review changes. A feed, a diff ribbon, pulse dots: the direction picks
   one pattern.
5. **Invitation, role, and access signals are brand moments.** Sending an invite, a pending member,
   switching role: these telegraph "this is a serious shared workspace" and deserve intentional
   styling.
6. **Collaboration motion is different from agent motion.** A collaborator arriving or leaving, a
   remote selection moving, a comment posted: *human-paced*, distinct from the streaming and
   tool-call motion. The motion system then has **three registers**: UI chrome, agent activity, human
   activity.

Extra mock for each direction: *an item with 3 collaborators online + the agent active + one inline
comment thread open + a recent activity indicator*. A direction that cannot handle this screen
without visual clutter is discarded. A direction that "works" by silencing collaboration (grey
avatars, tiny indicators) fails the brief.

### When the core surface is a document (users come from a word processor or a spreadsheet)

When the pivots say users spend their day writing long-form text in a document that real readers
will judge, this is **the most load-bearing constraint**; it overrides "SaaS dashboard" reflexes:

1. **The editing surface must read as a document, not an app screen.** Generous margins, a serif or
   high-quality sans for long reading, real leading (1.6 to 1.7), paragraph spacing,
   optical-size-aware type. Users judge "does this belong in the word processor's universe or in a
   chat clone" within 5 seconds.
2. **Typography is the primary brand signal here,** more than color. A direction that leans on color
   or illustration but treats body text as a commodity fails.
3. **Respect the word processor's conventions inside the document,** reinvent them at the workspace
   level. Headings, numbering, footnote markers, captions, quoted blocks look "document-grade".
   Ornamentation welcome *inside the document*; chrome stays clean *outside*.
4. **Print-adjacent mental model.** When the document exports to a file format, the on-screen
   rendering should foreshadow the printed output enough that users trust the export. A page-like
   preview must feel intentional, not a compromise.
5. **Tables and structured data need first-class typography.** Users coming from spreadsheets judge
   table legibility ruthlessly: tabular numerals (OpenType `tnum`), banding or no banding (decide),
   aligned decimals, proper small caps for headers.
6. **The bridge to their old tool is a brand moment.** Import, export, contribute-by-upload: "round
   trip is a feature, not a fallback". File icons, drop zones, diff views carry identity weight.
7. **Two-mode reading is real.** Edit (tools visible) and read (chrome fades) are one product, not two
   stitched together.
8. **"Feels like writing somewhere real" over "feels like AI-native".** The seat of gravity is the
   text the human writes. A direction that makes the agent panel visually dominant fails writers who
   need to stay in flow.

Extra mock for each direction: *the document in read mode*, a full page-like view with headings,
body, a figure with caption, a footnote, and tabular data. If a user could not print and circulate
it without embarrassment, the direction is discarded.

The workspace chrome can be contemporary app UI; the document surface cannot. Two dialects, one
system: shared primitives (palette, motion language) without either compromising.

If a direction violates the constraints that apply, discard it; do not argue it to the owner.

---

## The process (5 phases, never skip)

### Phase 1: research and constraints recap

Produce a short brief (about 300 words) that captures:

- What the current identity signals (positive and negative)
- What the product means (its positioning, from the pivots)
- Adjacent references the owner should have in mind (for example Linear, Arc, Stripe, Pitch,
  Notion, Readwise, Superhuman, Things, Craft) with a one-line takeaway each
- The hard constraints from the context section above

Write it to `<memory.dir>/ui_direction_brief.md`. Get the owner's reaction before Phase 2.

### Phase 2: three competing directions

Never propose one direction; propose **three**, each internally coherent, each with trade-offs.
Example axes of differentiation:

| Direction | Personality | Reference | Risk |
|---|---|---|---|
| A: Editorial minimal | Quiet, confident, serif accents | Linear, Stripe docs | Bland if executed weakly |
| B: Organic warm | Approachable, human, earthy accent | Arc, Readwise | Too soft for B2B seriousness |
| C: Industrial premium | Dense, architectural, contrast-heavy | Figma, Pitch | Fatiguing for long sessions |

For **each** direction, deliver:

- 3-word personality tagline
- Palette: 1 primary, 1 accent, neutral scale (9 steps), semantic (success/warning/error)
- Typography: display font + body font + mono; tracking and leading per scale
- Shadow scale: 4 levels (flat, raised, floating, modal)
- Radius scale: sm/md/lg/xl with intentional mapping (input = md, card = lg, modal = xl)
- Motion language: 1 sentence (for example "spring physics, enter from below, never fade-only")
- Illustration and iconography stance: in-house illustrations? custom icon set? a curated library?
- 1 mocked signature screen as a concrete preview, plus the extra mocks the context blocks require

Output: `<memory.dir>/ui_direction_options.md` + an optional moodboard page in the team's workspace.
Present to the owner as a choice question with preview blocks.

### Phase 3: the owner picks (checkpoint)

**Hard stop.** Do not start encoding tokens until the owner confirms:

- Which direction (A/B/C or a mix)
- Scope (global redesign vs signature screens first)
- Animation budget (discreet everywhere vs loud signature moments)
- Illustrations: in-house yes/no

Save the decisions to `<memory.dir>/ui_direction_v2.md` as the new source of truth. This file
supersedes any older direction memo.

### Phase 4: token export

Translate the chosen direction into code:

1. Update the token file the build pivot names: new variables, semantic variables (for example
   `--surface-raised`, `--surface-sunken`, `--accent-warm`, `--border-emphasis`,
   `--shadow-floating`).
2. If the stack has a styling config that also declares tokens, mirror them there.
3. Update the design system file's sections (colors, typography, shadows, radii, motion) so future
   components are written against the new system.
4. Add a feature flag or a `data-theme="v2"` switch on the root element so the old and new themes
   coexist during migration.
5. Create a dev-only gallery route that renders every primitive under both themes for visual diffing.

Do **not** refactor any real component in this phase. The goal: tokens ready, old UI still works.

### Phase 5: component cascade (handoff to the normal build flow)

Hand off to the Build module's build skill when `modules.build` is true, otherwise to the main
session. Order of refactor:

1. Button, Input, Badge (cheap wins, visible everywhere)
2. Card, Modal, ListItem (structural)
3. Sidebar + Topbar (sets the overall temperature)
4. Signature screens
5. Long tail

At each step, use the motion library the product already has for enter/exit and hover; the motion
language decided in Phase 2 is the contract. Render every step and look at it before showing it
(rule 10).

Remove the old-theme flag only when **all** screens have been migrated.

---

## Deliverables checklist

A completed run of this skill produces:

- [ ] `<memory.dir>/ui_direction_brief.md` (Phase 1)
- [ ] `<memory.dir>/ui_direction_options.md` with 3 directions + mocks (Phase 2)
- [ ] The owner's decision in `<memory.dir>/ui_direction_v2.md` (Phase 3)
- [ ] The updated token file (Phase 4)
- [ ] The updated design system file (Phase 4)
- [ ] The dev-only gallery route (Phase 4)
- [ ] The feature flag for old/new coexistence (Phase 4)
- [ ] Optional moodboard page (Phase 2)

If any deliverable is skipped, the identity will drift. Flag it explicitly to the owner rather than
silently skipping.

---

## Anti-patterns (learned from prior sessions)

- **Don't propose a component library's defaults renamed.** The owner spots it in one screen.
- **Don't use a UI-generation tool as the source of truth.** Use it only to generate variations
  *during Phase 2 ideation*, then discard.
- **Don't refactor a component and tokens in the same commit.** Tokens land first (behind the flag),
  components cascade after.
- **Don't invent illustrations with AI image tools** without the owner's explicit approval: the
  stylistic inconsistency is worse than no illustrations.
- **Don't touch typography without checking glyph coverage** (Cyrillic, diacritics) for the names and
  languages the product's users write.
- **Don't kill density for "breathing room".** Users who need to see many entities on one screen
  lose them. A direction that breaks density is discarded.

---

## When something is missing

Say it in one line, continue with what exists, and never invent what the missing piece would have
brought (principle 10).

| Missing | What the skill does |
|---|---|
| the build pivot | asks the owner for the design system file and the token file before Phase 4; Phases 1 to 3 run on what the code shows |
| no design system file yet | Phase 4 creates it from the chosen direction, at the path the owner agrees, and the build pivot is updated to name it |
| no Discovery pivot or personas | the user constraints come from the domain pivot and the owner; the brief says which constraints are unsourced |
| `modules.build` false | the main session runs the Phase 5 cascade itself and says so |

---

## References (inspiration, not templates)

- [triptease/claude-skill-design-system](https://github.com/triptease/claude-skill-design-system): design system skill structure
- [julian-oczkowski: 7 Claude Code Design Skills](https://medium.com/@julian.oczkowski/7-claude-code-design-skills-that-follow-a-real-design-process-b871b8673d05): upstream process
- [ComposioHQ/awesome-claude-skills: brand-guidelines](https://github.com/ComposioHQ/awesome-claude-skills/blob/master/brand-guidelines/SKILL.md): application of brand
- [Anthropic: Package your brand guidelines in a skill](https://claude.com/resources/use-cases/package-your-brand-guidelines-in-a-skill): official recipe

Read these once when evolving this skill; do not copy them slavishly. The product's context
overrides generic advice.
