---
name: pos-mockup
description: >
  Make a mockup of a product screen (a step-by-step HTML to scroll through, or a single screen), for
  the owner or for users: start from snapshots of the REAL pages in the test space, retouch only what
  the function changes, and pass five gates before showing anything (automatic contrast, side by side
  with the app, components copied element by element, the information inventory, a fidelity review by
  the UX agent). Applies to every mockup, whichever skill asks for it (framing, build, spec, support).
  Use when someone says "mockup", "mock it up", "show me the screen", "redo the mockup", "a prototype
  to click through", "/pos-mockup".
---

# Mockup

## Why this skill exists

Two defects come back in mockups, and they are the same every time:

- **An existing screen redrawn instead of taken over.** A screen drawn from memory, with the wrong
  icon and a tab replaced; the review of a spreadsheet built on the dressing of an old mockup, far
  from the real review screen, with a smaller font and extra blocks.
- **Grey on grey.** Table headers in light grey on a grey band, where the app sets its headers in
  dark text on the band.

Both passed the session's review and the UX agent's, which checked the decisions and the figures,
never the fidelity nor the legibility. The rule "start from the real capture" lived in one framing
skill only; it lives here now, and every mockup goes through this skill.

Rule numbers refer to the collaboration rules of `pos-core`, and codes such as S11 or T1 to the rules
of the Build pivot, `<pivots.dir>/product_build_context.md`.

## Mandatory reads

- **The design system file** (Build pivot section 8): tokens, components, states, typography.
- **Build pivot T1 and section 10:** the dev server port (a queue between sessions), the test setup
  and the test space.
- **The product's `CLAUDE.md`:** the evidence folder (rule 25) and the test space (rule 32), and the
  rule on structural interface choices (`pos-build`, DO).

## Config

| Key | Use |
|---|---|
| `build.test_auth_state` | the saved session state of the test account, relative to the repository, written by the test setup of Build pivot section 10. `snapshot.cjs` reads it and stops when it is missing |
| `product.ui_language` | the language of every string the mockup shows |

The space where snapshots are taken is the test space the product's `CLAUDE.md` names (rule 32):
never a customer's space, even read only.

## Where the files live

- **Sources** (the working HTML, data, scripts specific to the mockup, notes): the session's
  scratchpad, folder `<scratchpad>/<topic>-mockup/`. Never under `.claude/` (each write there asks the
  owner for an approval).
- **What is shown** (the final HTML, the captures of each step, the comparisons): the evidence
  folder of the product's `CLAUDE.md`, `<evidence-folder>/<YYYY-MM-DD>-<topic>/`, given to the owner by
  its absolute path (rule 25).
- The scripts of this skill: `${CLAUDE_PLUGIN_ROOT}/skills/pos-mockup/snapshot.cjs`, `check.cjs`,
  `compare.cjs`, `scenario.js` (the header of each file is its usage). They need `playwright` and
  `axe-core` in the product's `node_modules`.

## Procedure

### 0. The pattern is found before it is drawn (blocking)

- **The design system file is read IN FULL**, its business composites included, before any idea: the
  case often already has its precedent (a refusal dialog, a paywall, a floating alert, a job-status
  component). Name that precedent in writing, or write that nothing covers the case, with what was
  searched.
- **The problem goes to `prd-ux` first, in the background, WITHOUT the session's idea:** what the
  user lives, the constraints, the owner's remarks. The UX agent proposes the pattern; the session
  judges it; then it builds. A UX review made afterwards on the session's idea does not replace this
  step. (A permanent five-line warning was drawn under a document row without reading the design
  system, which already had the refusal dialog for the same kind of case; the UX agent, briefed on
  that idea, validated it. The owner: "very big, not manageable".)

### 1. The screens touched

List each screen the mockup shows: **existing** (taken over), **existing and changed** (taken over,
then retouched), **new** (no equivalent: it is built with the classes and components of the snapshot
of a neighbouring screen, never with a redrawn dressing). For each new screen, name the closest
existing screen: it provides the frame, the typography and the components.

### 2. The snapshots (the session's gesture, never an agent's)

- The dev server, taken as T1 says (the port probed in the same command as the start, never a second
  port; ask the owner before starting one, rule 8), on a checkout up to date with `origin/<main>`.
- A renewed test session: the test setup of Build pivot section 10.
- `node ${CLAUDE_PLUGIN_ROOT}/skills/pos-mockup/snapshot.cjs <repo> <scratchpad>/<topic>-mockup/base <name> <url> ...`
  in the test space, at 1440 x 900: one PNG and one standalone HTML per screen (its real DOM and CSS,
  fonts and images included).
- The server stopped by its process id as soon as the snapshots are taken; tell the session that was
  waiting for the port.
- A page that lands on the sign-in page means the test session must be renewed, not a page to draw.

### 3. Build on the snapshots

- **The mockup starts from the snapshot's HTML:** rail, top bar, toolbars, panels, tables and
  components stay the app's, byte for byte. Only what the function changes is retouched, with the
  classes already present in the snapshot's CSS (the design system's tokens). Forbidden: starting from
  the CSS of an old mockup, redrawing a component that exists, inventing a colour.
- **Step-by-step format: the scenario bar is the skill's, never a bar redone:** `scenario.js`, pasted
  into the mockup's `<script>` after `STEPS` (the header of the file is the contract). The product
  sets once its insets (the width of its navigation rail and side panel) and the design system's
  classes for the bar, read in the snapshot's CSS. Same look on every mockup, always above dialogs and
  overlays, Previous and Next, the keyboard arrows, the step in the URL. (A redone bar slipped under a
  dialog's overlay, "I can't do anything any more"; another mockup had a bar of another colour.)
- **The CTAs of the journey are clickable:** each step declares in `next` the labels of the real
  buttons that move the story on (Confirm, Merge, Export, a menu item, Open); `scenario.js` makes them
  go to the next step and draws a ring around them. A user who tests clicks on the screen, not only on
  Next.
- **Nothing the app does not have:** no mention, state or control that no screen of the same kind
  shows, even copied from another kind of screen ("Changes save automatically" in a page's toolbar,
  taken from the foot of a dialog: saving is automatic everywhere and is never announced).
- **Two lists of the same object have the same columns, in the same order;** a column specific to
  one goes last, just before the "..." menu, and the width breakpoints are the same. (Two lists of the
  same object were delivered different three times.)
- **A new object that can be shared is drawn with its comments from the first mockup,** through the
  product's existing comment mechanism, never deferred to a later mockup.
- Interface strings in `product.ui_language`, sentence case, no em dash; the product's vocabulary
  (the domain pivot's glossary, rule 39).
- Data: fictitious and consistent from one step to the next; nothing real copied from a customer
  (amounts, names of people); an official figure (a reference, a rule of the domain) comes from its
  source, never invented.
- An agent may build (`frontend-dev`): its brief gives the paths of the snapshots, this procedure,
  and forbids in so many words starting a server or starting from another mockup.

### 4. The five gates, before showing anything

1. **Contrast:** first `check.cjs` on each snapshot (`<base>/<name>.html`, output
   `<base>/baseline-<name>`), to know the defects the app already has; then
   `node ${CLAUDE_PLUGIN_ROOT}/skills/pos-mockup/check.cjs <repo> <mockup.html> <evidence>/<version> <base>/baseline-*/contrast-report.json`,
   which renders a capture per step and the axe-core contrast audit (WCAG AA), and checks on each
   step that Next can be clicked (nothing covers the bar) and that the CTAs declared in `next` exist
   on the screen. Zero NEW defect, or each new defect justified in writing (a disabled text the design
   system wants).
2. **Fidelity:** `node ${CLAUDE_PLUGIN_ROOT}/skills/pos-mockup/compare.cjs <repo> <evidence>/<version>/compare <name> <real.png> <mockup.png> ...`
   for each existing or changed screen: the app on the left, the mockup on the right.
3. **Components copied, element by element:** every element that exists in the app (a check, a
   card, a menu item, a pill, a list row) is COPIED from the snapshot's DOM, never rebuilt, and nothing
   is added to it (a link, a line of explanation, a pill). For each one, a cropped comparison: the
   app's element and the mockup's side by side. (A mockup's check had an "Open" link, a "Why" line and
   a grade pill that no check of the app has; the comparison of whole screens did not show it.)
4. **Information inventory,** for every retouch: screen by screen, the list of what the previous
   version showed (columns, figures, units, states) and where each piece of information lives in the
   new one. Information that disappears without the owner's decision comes back. (Moving to a list
   and a detail, a summary table and a unit of effort disappeared without being placed anywhere.)
   Every figure shown carries a readable unit (no thousands with one decimal that reads as a thousands
   separator).
5. **Review by `prd-ux`,** in the background, with three distinct questions: (a) fidelity, image by
   image of the screen and element comparisons: frame, text sizes, colours, spacing and components
   identical except what the function changes, each gap named; (b) the information inventory
   (gate 4); (c) the owner's decisions, step by step. An agent that finds no gap on fidelity looked
   too fast: the session looks at the comparisons itself.

Then the session: it opens each step capture (rule 10), rereads the inventory against the captures,
and fixes what remains.

### 5. Show

A short message: the status, the absolute path of the HTML and of the captures folder, what changed
since the previous version, what is not drawn. Then wait (rule 25). A mockup for external users is
anonymised (fictitious names and amounts) and the owner rereads it before anything is sent.

## The owner's feedback on a mockup

Each remark first gets the session's argued verdict (agree, nuance or disagree, with the reason and
what it breaks elsewhere), which the owner reads before any retouch (rule 15). The retouch goes
through gates 4.1 to 4.5 again.

## When something is missing

Say it in one line, continue with what exists, and never invent what the missing piece would have
brought.

| Missing | What the skill does |
|---|---|
| `build.test_auth_state`, or no test setup | no snapshot: said; the owner is asked for the test setup; nothing is drawn from memory |
| no test space named | no snapshot (rule 32: never a customer's space); the owner is asked which space to use |
| no dev server, and no go to start one | no snapshot: said; the mockup waits |
| `playwright` or `axe-core` not in the product | the gate that needs it is declared not run, with the reason; the mockup is not shown as passed |
| no design system file | said; the snapshots are the only reference, and gate 1 runs on them |
| a new screen with no existing neighbour | said in step 1; the closest screen of the product provides the frame |

## How it fits

| Skill or agent | Relation |
|---|---|
| Discovery module (framing, spec) | asks for a mockup; this skill makes it |
| `pos-build` | a structural interface choice: mockup through this skill, the owner's go, then the code |
| Support module | an evolution met in support goes to a build, with a mockup through this skill |
| `prd-ux` | proposes the pattern (step 0) and reviews the result (gate 5) |
| `frontend-dev` | may build the mockup from the snapshots, never start a server |
| `pos-visual-identity` | defines the tokens the mockup reuses; never invoked to "fix" a mockup |
