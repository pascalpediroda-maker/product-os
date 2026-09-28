# Support context

Skeleton version 1, maintained by `product-os-support`.

Copy this file to `<pivots.dir>/product_support_context.md` (by default
`.claude/product/product_support_context.md`) and fill it before running a skill of the Support
module. It is the Support pivot: how bugs and reports reach the team, how the fix backlog is
organised for this product, who counts as a customer and how they are told, how a fix reaches them,
and where a bug may be reproduced. The `fix-backlog` and `bug-kill` skills read it first.

## Who reads it

| Reader | What it takes from here |
|---|---|
| `fix-backlog` | the channel a bug came through (1), the report marker (2), the Area list (3), who is in the team (4), how the customer to notify is found (5) |
| `bug-kill` | all of it: the in-app reports it files (2), the memory each area loads (3), the customer bonus (4), the messages (5), the priority rule (6), the release path (7), where it reproduces (8) |
| Any session that meets a bug it will not fix now | the Area list (3) and the team (4), to file the entry right |

## Rules for everything below the separation line

1. **One fact, one place.** The IDs of the shared bases stay in the product config
   (`databases.fix_backlog`, `databases.crm`, `databases.feedback`) and are never copied here. What
   the product's `CLAUDE.md` already states (the test space, the evidence folder, the branch policy)
   is pointed to, not copied. A section that outgrows a screen moves to a reference file in
   `memory.dir`, listed in the memory index, and this page keeps a one-line pointer.
2. **No customer, institution or person names.** Describe by type ("a mid-size customer", "the
   support mailbox"). People are named by role. The team is described by a rule (an email domain,
   membership of the team's own space) or by account IDs, never by a list of names.
3. **No secret.** No key, token, password or connection string. Name the variable or the file that
   holds it.
4. **A thin section is honest.** "None" and "not known yet" are findings. A skill that reads an empty
   section says so and continues without inventing what it would have held.
5. **Language.** Headings and table columns stay in English, so skills find them. Content is written
   in `product.team_language`.
6. **Section names are a contract.** Skills cite sections by number and name. Keep them; add the
   product's own sections after section 8.

## The sections

| # | Section | What it must answer |
|---|---|---|
| 1 | Channels | where reports and bugs reach the team, who reads each channel, which `Source` of the fix backlog each one feeds |
| 2 | In-app reports | where reports made inside the product live, who can see them, the read-only query that lists the new ones, whether anything may be written back, the marker a report carries in the fix backlog |
| 3 | Areas | the product's `Area` list for the fix backlog, and for each area the `routing.zones` key whose memory a bug kill loads, plus any rule that area imposes |
| 4 | The team | who counts as the team, so their reports are not counted as customer reports, and how a test report is recognised |
| 5 | Customers to notify | how the author of a report is matched to a record in `databases.crm`, how their language is found, how a direct link is built, who sends |
| 6 | Priority rule | the default rule of the `bug-kill` skill, or this product's override with its reason, and the batch size |
| 7 | Fix releases | how a minor fix release ships, service by service, how its version is set and read once live; or the pointer to the Release & Operations pivot |
| 8 | Test space | where a bug may be reproduced and a fix tested, what must never be used, the test accounts |

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

# Product content

## 1. Channels

<!--
Guidance: every way a bug or a report reaches the team today, including the informal ones (a call, a
demo). One row each.
- Where it arrives: by type ("the support mailbox", "the in-app report form", "a call with the
  customer's champion"), never an address that would expose a person.
- Who reads it: a role.
- Source in the fix backlog: one of the base's `Source` options (User feedback, Support,
  Interview / demo, In-app feedback, Audit, E2E, Dev session, Legacy notes). The `fix-backlog` skill
  uses this column to set `Source` on an entry.
- A channel nobody reads is a finding: say so here.
-->

| Channel | Where it arrives | Who reads it | `Source` in the fix backlog |
|---|---|---|---|
| | | | |

## 2. In-app reports

<!--
Guidance: the reports users make from inside the product (a feedback or bug form).
- Lives in: the store, by type ("a table of the product's database, read through the database
  connector"). If the product has no in-app reports, write "none" and leave the rest empty: the bug
  kill skips this step and says so.
- Visible to: who sees a report and its status inside the product. If the reporter's workspace (for
  example its admin) can see the status, nothing may be written back: a status change made by the
  team would show up at the customer's.
- Lists the new ones: the read-only query, with the columns a bug kill needs: the report's ID, its
  date, the page it was made from, the reporter's account, the reporter's space, the text. Filter on
  what makes a report a bug and new. Placeholders only, no production values.
- Marked as seen: how the owner marks a report as handled, only if that way is invisible to the
  reporter's workspace. Otherwise write "Nothing is written back": the marker in the fix backlog is
  then the only record that a report was taken in. The skills never write to this store; they list
  the reports fixed, and the owner acts.
- Marker: the text an entry carries in `Reproduction` so the report is never filed twice. The OS
  default is `report:<id>`, where <id> is the report's primary key.
- Page link: which part of the report's URL may be copied into an entry (the path only; never a
  query string that carries identifiers or tokens).
-->

**Lives in:**

**Visible to:**

**Lists the new ones (read only):**

```sql
-- Shape only. Replace every <...> with this product's names.
select r.<id>, r.<created_at>, r.<page_url>, r.<reporter_account>, r.<reporter_space>, r.<text>
from <reports table> r
where r.<category> = '<bug>' and r.<status> = '<new>'
order by r.<created_at>
```

**Marked as seen:** Nothing is written back. <!-- or the way, by the owner, that the reporter's workspace cannot see -->

**Marker in the fix backlog:** `report:<id>`

**Page link:** <!-- which part of the URL is copied -->

## 3. Areas

<!--
Guidance: the product's own list of areas. Each is one option of the fix backlog's `Area` select, and
the list here and the options in the base must match (the `fix-backlog` skill compares them).
- Option names: no commas (Notion refuses them), unique regardless of case, and final before the base
  is created or any entry imported. Renaming an option through the connector erases its value on
  every entry that carries it.
- Zone(s): the key or keys of `routing.zones` in the product config whose memory files a bug kill
  loads, once, before fixing that area. Every key named here exists in `routing.zones`.
- Area rule: what that area imposes on any fix, if anything. For example: "a prompt change goes
  through the AI Engineering change protocol and the AI engineer role, without exception"; "the
  design system memory before any change"; "a schema change goes through a migration". Leave empty
  when there is none.
- Keep an `Other` area for what fits nowhere; the bug kill moves its entries to the right area at
  triage.
-->

| Area (option in the backlog) | Zone(s) in `routing.zones` | Area rule |
|---|---|---|
| Other | | the bug kill names the zone at triage |

## 4. The team

<!--
Guidance: who counts as the team. Their reports count by their severity only: they never get the
priority bonus of a customer report. The owner is part of the team.
- Team members: a rule rather than a list when one exists (an email domain, membership of the team's
  own space), otherwise account IDs. Never names.
- Test reports: how to recognise a report the team sent to try the form (sent from the team's space,
  placeholder text such as a greeting or "test"). A bug kill files each one as a `Dropped` entry, so
  its marker stops it coming back at every session.
-->

**Team members:**

**The owner:** counted as team.

**Test reports look like:**

## 5. Customers to notify

<!--
Guidance: how a bug kill finds who to tell, and how the message is shaped. Collaboration rule 40 of
the core is the rule for a support message; write here only what is specific to this product.
- CRM: the base is `databases.crm` in the product config. Say how the author of a report is matched
  to a record (by email, by organisation) and what to do when no record matches (the default: list
  the person for the owner in the final report; the skills never create a CRM record).
- Language: where a customer's language is read, in order (the country in the analytics profile, the
  domain of their email, the language of their earlier messages).
- Direct link: the base address of the deployed product, and how to build a link to each area's
  pages. Say whether a link needs the user signed in. A link never carries a token.
- Who sends: the owner. Where drafts go (the owner's mailbox when a mail connector is callable,
  otherwise text in the report), and any signature or tone this product uses.
-->

**Matching a report to a CRM record:**

**No record matches:** listed for the owner in the final report.

**Language, read in this order:**

**Direct links:**

| Area | Link pattern | Needs sign-in |
|---|---|---|
| | | |

**Who sends, and where drafts go:**

## 6. Priority rule

<!--
Guidance: the `bug-kill` skill carries the default grid (severity, effort, priority, and the bonus
for a bug a customer reported). Write "Default." unless this product has a reason to differ; then
write the rule in full and its reason in one sentence.
- Batch size: the default is small batches (one or two areas, about five bugs), each shipped and
  closed before the next opens. Change it here if the owner works otherwise.
-->

**Priority:** Default.

**Batch size:** Default.

## 7. Fix releases

<!--
Guidance: how a minor fix release reaches users, and how to prove it did.
- When the Release & Operations module is installed (`modules.release_ops` true): write one line,
  the pointer to its pivot by its file name in `pivots.dir`, and nothing else unless a fix release
  differs from a functional one.
- Otherwise, fill the table: one row per service a fix can touch (the app, a background worker, a
  scheduled job, a function deployed from a console). "Ships by": a push to `git.main_branch` that a
  pipeline deploys, an archive uploaded by the owner, a manual deploy. A service that does not ship
  with the app is the one a bug kill must plan at triage, not discover at release.
- Version: the scheme, which part a fix release changes, and what increments it (the build
  pipeline, a person).
- Live version: where it is read once deployed (a screen of the product, a build identifier in the
  logs), and any source that must not be trusted (for example an endpoint that returns a hard-coded
  version).
- Release note for fixes: by default, the entries moved to `Released` with that version (a filter on
  the fix backlog), until the product has an in-app changelog.
-->

**Release & Operations pivot:** <!-- file name in pivots.dir, when modules.release_ops is true -->

| Service | Ships by | Who triggers it | How to check it is live |
|---|---|---|---|
| | | | |

**Version scheme:**

**Live version read at:**

**Not to trust:**

**Release note for fixes:** Default.

## 8. Test space

<!--
Guidance: where a bug may be reproduced and a fix tested. Collaboration rules 32 and 33 of the core
are the rules; write here the product's facts.
- Test space: if the product's `CLAUDE.md` names it (its section on client spaces and the test
  space), write the pointer and do not copy it.
- Test copies: the items a writing test uses, and the command or script that makes a new copy (new
  identifiers, no link to an import).
- Never used for tests: reference items, items imported from real documents, any customer's space.
- Test accounts: one per role a permission bug may need, by role. Credentials by the name of the
  variable or file that holds them, never the value.
- Evidence: the folder named in `CLAUDE.md`; a bug kill writes into a `<YYYY-MM-DD>-bug-kill`
  subfolder.
- Dev server: the port, and the memory file that says how it is started. Sessions ask the owner
  before starting one.
-->

**Test space:**

**Test copies, and how to make one:**

**Never used for tests:**

| Role | Test account | Credentials held in |
|---|---|---|
| | | |

**Evidence:** <!-- pointer to the folder named in CLAUDE.md -->

**Dev server:**

## Change log

<!-- One line per change: date, what changed, why. -->
