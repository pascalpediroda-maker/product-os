---
name: pos-post-impl-checklist
description: >
  The shared checklist that closes every implemented step (a feature done, a bug fixed, an agent
  tuned): the session's own tests, the interface gate against the neighbouring screen, the honest
  list of gaps, the owner's test list, lint and type-check, a light security check, the pre-mortem
  risk card required before any push or production write, local commits, help articles and
  architecture memory, and the final report. Used by pos-build (every tier), pos-dev and the Support
  module's fixes. Use when a step is implemented, or when someone says "close the step", "post-impl
  checklist", "/pos-post-impl-checklist".
---

# Post-implementation checklist

After each implemented step, produce a report that follows the gates below, in order. **Do not
propose the next step before Gate 8.**

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles,
and codes such as S2 or AI13 to the rules of the Build pivot, `<pivots.dir>/product_build_context.md`.
`<main>` is `git.main_branch`.

## The gates (in order)

### Gate 1: the session's tests (what was checked locally)

A concrete list:

- which scripts and commands ran;
- on how many cases or rows;
- which assertion was checked;
- the factual result (numbers, status codes, captures).

### Gate 1b: the interface gate (MANDATORY as soon as a screen is touched, before Gate 2)

"Reread the design system" is not enough: the **comparison with the neighbour** is what catches the
gaps. Incident: on a chain of linked items, a grey add button and a component mode that no other
screen used, a field of the detailed level visible in the summary view, no create button, no
explanation of the links, labels of mixed sizes. Shipped to production, then found by the owner.

The session fills this table itself, never the agent in its place, and it appears in the Gate 8
report:

| Element added or changed | Neighbouring screen opened (file or URL) | Same component, same variant or mode? | Gap | Aligned, or choice owned |
|---|---|---|---|---|

For each element, check **in the neighbour's code, not from memory:**

1. **The same component AND the same variant or mode.** A shared component with several modes: take
   the neighbours' mode, not the most convenient one.
2. **The same sizes and tones:** field label, add button (size, colour), spacing, help text (never the
   tone the design system reserves for placeholders).
3. **The same display level:** a field the product shows only at a deeper level of detail does not
   appear at a shallower one (Build pivot section 8).
4. **A field that links two items always offers:** link an existing item, create a new one already
   linked, one line of explanation (what the link means for the user), navigation both ways. And
   the order follows the natural flow (what comes in before what goes out).
5. **Every state rendered AND looked at** (never a capture sent without being looked at, rule 10):
   empty, filled, locked or validated, each level switch, an element disabled by configuration, the
   narrowest width.
6. **A missing function is not a fix:** adding a field, a link or a button is a structural interface
   choice, so a mockup (`prd-ux`) and the owner's go come BEFORE the code (`pos-build`, DO).

A gap neither aligned nor justified is fixed before Gate 2.

### Gate 2: the gaps left (an honest inventory)

What was NOT tested:

- components changed but not exercised;
- data handled but not observed (for example 50 of 51 rows untouched);
- downstream integrations (LLM calls, assistants, agents) never called;
- edge cases noted but not covered.

### Gate 3: for the owner to test (manual end-to-end list)

For each user-visible change:

- the exact URL or user flow;
- the sequence of actions (click X, type Y, wait for Z);
- the expected observable outcome;
- what would signal a regression.

When the change is **back-end only** (no user-visible effect): skip this gate, write "No end-to-end
test for the owner: back-end only.", and **continue to the next step without waiting**.

### Gate 4: lint and type-check

- The product's lint passes.
- The type-check passes (or the build, when it runs it).
- No new warning (report the severity; existing warnings do not fail the gate).

### Gate 5: light security check

- The service-role key never reaches client code (S8).
- No prompt content, user text, amounts or names in logs (S10).
- New routes authenticate with the auth helper of Build pivot section 3. **Never a network "get the
  user" call in server code** (S2): it costs an auth-server round trip per call and logs users out
  under fan-out. The guard test of section 3 enforces it.
- **Schema touched? Read the database's security advisors.** They listed dozens of tables exposed to
  the publishable key, at error level, for months, and nobody looked. When the product has the RLS
  event trigger, new tables get RLS automatically, but the policies are yours to write: read for the
  roles that truly need it, no write policy when every writer is server-side (S16).
- **A new `SECURITY DEFINER` function?** It runs with its owner's rights and bypasses RLS: revoke it
  from `PUBLIC, anon, authenticated` and grant it to `service_role`, unless it checks its caller
  itself (S16). Functions without that check were found callable with the publishable key.
- The public-surface invariant test of Build pivot section 6 stays green (it guards all of the above).
  `pos-check-rls` when in doubt.

### Gate 5b: pre-mortem and risk card (MANDATORY before any push request or production write)

Incident: a migration with no benefit (rights removed from functions that already answered "no") was
applied to production inside the go of a code batch, without its risk being presented; it worsened an
outage the same evening. This gate exists so that it does not happen again.

For EACH change that goes to production (code, migration, prompt, configuration), the session fills
the card itself, never the agent in its place:

| Change | Real benefit, proven (for whom, the proof) | Plausible worst case | How it is detected | Rollback (ready) |
|---|---|---|---|---|

1. **Benefit:** what changes for a user, or the real access closed (what a caller obtains today).
   "Nothing measurable" means the change does not ship (verdict "Don't"), even when it is already
   coded.
2. **Pre-mortem:** look for how it breaks, not for reassurance. Run the change against the known
   failure modes of Build pivot section 7 (for example a session that drops, so a signed-in user's
   requests arrive without a session; several tabs; the auth server's rate limit on the single server
   IP; the database's connection limit under a burst; automatic client relaunches; a deploy during a
   long job). Every error path counts: an empty read that becomes an error is a regression.
3. **Load:** for any mechanism per page, per tab or per element, the S14 formula against the
   database's connection limit.
4. **Scope:** the change stays within the bug or the request; any widening has its own line and its
   own proven benefit.
5. **A migration that changes the behaviour of what exists** (S16) is presented on its own line, with
   its rollback migration written; it is never applied to production before the go that names it. An
   additive migration that live code does not read yet keeps the normal path of development.

### Gate 6: local commits (as soon as the work holds)

- **Commit freely, push on a go** (rule 27). Commit as soon as the work holds and type-checks,
  without waiting for the owner's QA: a local commit costs nothing and can be reworked. The **push**
  waits for an explicit go, valid for that push only.
- **Granularity: what is efficient.** No forced splitting, no monolith. One feature over three
  coherent layers (database, API, interface) tested together: one commit is fine. Two independent
  fixes: two commits.
- **Named files only** (rule 28): never `git add -A` or `git add .` (secrets, personal files, large
  exports).
- **The commit scope** of Build pivot section 11.
- **Clear messages:** a message says what was done. Not "WIP", not "fix", not "update".
- **Commit is not push.** Commits stay local until the owner says "push", even on `<main>`, even when
  the push deploys as expected.

### Gate 7: help articles and architecture memory

- A user-visible change (a new view, a dialog, an interface action, a copy change of a paragraph or
  more): update the help articles through the process of Build pivot section 11.
- A structural change (a new table, a new core element, a new kind of agent, a new pipeline): update
  the architecture file the memory index names for that zone (principle 4).
- A minor change (a typo, an internal refactor, a performance tweak): no update needed.

### Gate 8: the final report (in `product.team_language`)

In the transcript:

- the files touched;
- the interface gate table (Gate 1b), whenever a screen was touched: never omitted;
- the tests added;
- the help articles created or updated;
- the architecture memory updated;
- the verdict visible or back-end only (Gate 3);
- the risk card of Gate 5b, never omitted: the push request carries it, line by line.

Then wait for the owner:

- QA validated: the work is already committed; **wait for an explicit "push"**.
- A bug found: fix it before moving on.
- No time to test: state the risk explicitly, and agree to move on without a net.

The report follows rules 22 and 23: status first, in the user's terms.

## Hard rules

1. **No push without the owner's explicit go** (rule 27). Even after a validated QA, commits stay
   local. The owner may batch pushes, or never push.
2. **No next step proposed before Gate 8.** The three lists (Gates 1, 2 and 3) are a coverage
   contract. Without them, the next step may break silently on a regression the type-check cannot
   see.
3. **An agent's report is never proof of delivery** (principle 2). For each item of the brief, open
   the file and check (`pos-dev`, Step 4.5). Read the agent's warnings to the end and weigh each one
   in the Gate 5b card: a risk the agent wrote and the session did not weigh is the session's failure.
4. **No push request and no production write without the Gate 5b card.** A change whose benefit is
   not proven does not ship.
5. **Watch after every push or production write.** For 15 minutes after the build is green or the
   migration applied: the database's logs (requests per 5 minutes, 5xx, 429, database errors) and the
   application's logs where Build pivot section 7 says, compared with the hour before. Any drift: tell
   the owner at once, with the rollback ready, before anything else. With `deploy.provider` set, follow
   the build to green first (`pos-tool-conventions`, Easypanel reference, section 4).
6. **An agent that delivers wrong, too wide or badly reported work:** fix the brief in the same
   session (rule 38), say what changed, and record the agent's fault so that its prompt is corrected
   in the OS (principle 15). The method is the session's to improve: no go is asked for that.
