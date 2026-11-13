---
name: pos-roadmap-review
description: >
  A review of the product roadmap (the roadmap base, databases.roadmap) in three passes: (1) statuses
  and priorities checked against the code in production (what is shipped moves to Released / DONE),
  (2) re-prioritisations proposed against the current objectives and the real state (move up, move
  down to LATER, drop), (3) duplicates grouped. Produces first a numbered report of the possible
  changes, then applies only what the owner validates. Creates no opportunity (that is
  pos-opportunity), touches neither the code nor the fix backlog (that is pos-bug-kill). Use when
  someone says "review the roadmap", "clean up the roadmap", "bring the roadmap up to date", "review
  the priorities", "what is shipped in the roadmap", "roadmap duplicates", "/pos-roadmap-review".
---

# Roadmap review: keep the roadmap true to the code and to the objectives

## Role

The roadmap drifts: shipped functions stay in Discovery, ideas from six months ago stay in NEXT while
the objectives have changed, the same idea exists under three titles. This skill squares the roadmap
up in three passes and **changes nothing without the owner's go**: the report first, the application
after.

Possible arguments: one pass only ("pass 1", "only the duplicates"), a scope (a `Theme`, a
`Priority`). Without an argument: the three passes on the whole roadmap.

Rule numbers refer to the collaboration rules of `pos-core`. They are not repeated here.

## What the skill does not do

- No new opportunity and no framing (that is `pos-opportunity`, then `pos-prd`).
- No code, no fix backlog (that is `pos-bug-kill`, in `pos-support`).
- No page deletion: the Notion connector cannot delete a page. A closed page is renamed (pass 3).
- **Never a parent / sub-item link** (`Parent item`, `Sub-item`) without the owner's agreement: a
  sub-item disappears from the views filtered on parents.

## Load before any action

1. **The product config:** `databases.roadmap`, `databases.feedback`, `databases.crm`,
   `databases.fix_backlog`, `modules.*`, `memory.*`, `routing.zones`, `pivots.dir`,
   `git.main_branch`, `git.push_deploys`. `databases.roadmap` empty: say so in one line and stop;
   propose `pos-setup`.
2. **The `pos-tool-conventions` skill of the core,** its Notion reference, before the first Notion
   call.
3. **The roadmap:** fetch its data source first, for its schema and its real values.
4. **The state of production:** `git fetch origin`, then `origin/<git.main_branch>` (rule 30). When
   `git.push_deploys` is false, what is live is read where the Release & Operations pivot says. A
   branch or a working copy that is not pushed is not shipped.
5. **Memory first:** the index (`memory.index`: the work marked in production, closed), the files in
   `memory.always`, and the files `routing.zones` lists for the zone of each entry.
6. **The current objectives:**
   - when `modules.gtm` is true: the current GTM or campaign plan the Go-to-Market pivot names (its
     objective and its decisions), and the pivot's sections 13 Motions and 15 Pricing & packaging
     state;
   - what customers ask for: the `Feedback & Insights` relations of the entries, the in-app reports
     (the Support pivot, section 2, when `modules.support` is true; otherwise the Discovery pivot,
     section 2), the paying customers (`Status` = `Client` in `databases.crm`).

   Write at the top of the report the three objectives kept and the date of their source. **When the
   most recent source is more than 30 days old, ask the owner one single question before pass 2:**
   "have your objectives changed since <date>?". No dated source at all: the same single question,
   "what are your objectives right now?". Never another framing question.

## Real values of the schema (invent none)

The OS roadmap base (`pos-setup`, bases reference `roadmap.md`); the fetch of step 3 wins where the
product's base differs:

- **Status:** `Unqualified`, `Discovery`, `Solutioning / Featuring`, `Ready for development`,
  `Under Development`, `Released`, `Dropped`.
- **Priority:** `NOW`, `NEXT`, `LATER`, `LATER-OTHER`, `DONE`, `Dropped`. A base created before
  `LATER-OTHER` and `Dropped` were in the schema lacks them: say so in the report, and point to
  `pos-setup` ("When the base already exists"), which adds them on the owner's go.
- **Expected coherence:** `Released` ↔ `DONE`; `Dropped` ↔ `Dropped`; `Under Development` ↔ `NOW`;
  `DONE` only with `Released`; an empty `Status` is to be filled.

## Pass 0: mechanical coherence

List the entries whose `Status` and `Priority` contradict each other (`Released` in `NOW`, `DONE`
outside `Released`, an empty `Status`...). These are corrections without judgement: they go into
section 2 of the report, proposed as one block.

## Pass 1: statuses against the code

For each entry neither `Released` nor `Dropped`:

1. **Read the page in full**, body included: the title alone does not say what is promised.
2. Write in one sentence what the entry promises, as a function for the user.
3. **Look for the proof, memory first, code next:** the work marked in production in the index, the
   architecture memory, then `git log origin/<git.main_branch>` (keywords, fix backlog IDs cited)
   and the code, **by what the function does, never by a button label**.
4. Verdict:
   - **Shipped:** a proof on `origin/<git.main_branch>` (a commit, a date, a file or a screen) →
     `Released` / `DONE`. When `modules.gtm` is true, check too that the function has its line in the
     dated product state of the Go-to-Market pivot, section 1; otherwise the line to add goes into
     section 3 of the report, and is written with the rest after the owner's go;
   - **Partly shipped:** say what is shipped and what remains → keep the status, or split it if the
     owner wants (a proposal only);
   - **Not shipped:** only after a search by the function in the memory AND the code ("not found" is
     not "does not exist");
   - **Undetermined:** the proof is missing; say it as it is, with what would need checking.
5. A function present in a branch or a working copy that is not pushed = `Under Development`, never
   `Released`.

**Delegation:** beyond 20 entries, split them by `Theme` between agents running in parallel, in the
background (rule 36). Each agent writes its verdicts and proofs into a scratchpad file and returns a
report of three sentences at most, in plain words. The session itself checks each "Shipped" (the
commit exists on `origin/<git.main_branch>`) before putting it into the report (rule 37).

## Pass 2: re-prioritisations

For each entry still open, the default is **"change nothing"**. A change is proposed only with its
reason, on these criteria:

- **Objective:** which current objective the entry serves, or none.
- **Demand:** the number and date of the linked signals (feedback entries, a paying customer, an
  in-app report). The last signal says more than the count.
- **Age and movement:** created when, touched when. More than 90 days without a signal or a movement
  = a candidate for `LATER` or `Dropped`.
- **Effort** (`T-shirt size`) against the value.
- **Already covered** by a shipped function or another entry.

Possible verdicts: keep, move up (to `NOW` or `NEXT`), move down (`LATER`, `LATER-OTHER`), drop. "Drop" is a normal
verdict: a good idea of yesterday may no longer serve today's objectives. Judge each entry on its real
value for a user; never inflate the batch to look complete. When the `NOW` list holds more than 10
entries, flag it: `NOW` is no longer a priority.

## Pass 3: duplicates

Group the entries that promise the same thing: close titles, the same `Theme`, bodies that overlap,
the same linked feedback entries. For each group:

- **Keep** the most advanced entry (status), the richest (body) and the most linked (signals).
- **Carry** into the kept entry the `Feedback & Insights` relations of the others (read the existing
  relation, write the union) and a line "Merged on <date> from <link>" in its body.
- **Close** the others: rename them "⚠️ DUPLICATE → <title of the kept entry>", `Status` =
  `Dropped`, `Priority` = `Dropped`, a mention of the kept entry at the top of the body.
- **Complementary, not duplicates** (two faces of one subject, such as the buyer's side and the end
  user's side): keep them separate, propose a cross mention. Never a parent link.

## The report (before any write to the roadmap)

A Notion page "Roadmap review, YYYY-MM-DD", a plain sub-page of the page that holds the roadmap base,
not an entry of the base. Every line is **numbered continuously** so the owner answers by numbers
("go 1-14, not 15, 22 to LATER"). Every entry cited is a link to its page.

1. **In short:** the objectives kept and their date; the number of changes per section.
2. **Mechanical coherence:** # · entry · current → proposed.
3. **Statuses against the code:** # · entry · current → proposed · proof (commit, date, file or
   memory) · confidence.
4. **Re-prioritisations:** # · entry · current → proposed · reason (objective, demand, age, effort).
5. **Duplicates:** # · group · to keep · to close · what moves.
6. **Undetermined:** what is missing to decide.

Message to the owner: the status first ("Report ready: N changes proposed"), the page's link, the two
or three changes that matter most, one line each, then one single request: "answer by numbers". No
table in the chat.

## Application (after the go, only the numbers validated)

- Statuses and priorities: `notion-update-page` with `update_properties`, one write per page.
- Merges: relations first, body next, renaming last.
- In the report page, mark each line "applied" or "not applied", with the reason.
- Report: "Done" or "Not done: X remains", the number of changes applied, what could not be and why.

## Rules

- Notion is the state: never say "shipped" without the proof on `origin/<git.main_branch>`.
- Name an entry by its title, never by an identifier.
- Never change an existing entry of the fix backlog or of the other bases from this skill. A defect
  found on the way (a public promise that is false, a bug an agent saw) is checked in the code, then
  filed in the fix backlog in the same turn, as the `pos-fix-backlog` skill says, and the report cites
  it by its ID and its title. When `modules.support` is false, the report lists it and says that no
  fix backlog is configured.
- A numbered list in Notion restarts at 1 after a paragraph. To keep the numbering continuous, write
  isolated lines as bullets "**17** · ...".
- An owner's decision on a line ("not 15") holds for the next review: write it in the entry's page
  body ("review of <date>: not to drop, the owner's decision: <their reason>") so it is not proposed
  again. Never the value of a priority or a status in the text: the property is the state, and a copy
  in the text goes stale.
- In the report and in the message, a line is always cited by its number AND the entry's title
  ("line 21, <title>"), never by the number alone: the owner cannot answer "line 21".
