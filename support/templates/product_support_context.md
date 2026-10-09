# Support context

Skeleton version 3, maintained by `pos-support`.

Copy this file to `<pivots.dir>/product_support_context.md` (by default
`.claude/product/product_support_context.md`) and fill it before running a skill of the Support
module. It is the Support pivot: how bugs and reports reach the team, how the fix backlog is
organised for this product, who counts as a customer and how they are told, how a fix reaches them,
where a bug may be reproduced, where the help center lives, and where the activity of users is read.
Every skill of the Support module reads it first.

## Who reads it

| Reader | What it takes from here |
|---|---|
| `pos-fix-backlog` | the channel a bug came through (1), the report marker (2), the Area list and the ID prefix (3), who is in the team (4), how the customer to notify is found (5) |
| `pos-bug-kill` | all of it: the in-app reports it files (2), the memory each area loads and the ID prefix its commits cite (3), the customer bonus (4), the messages (5), the priority rule (6), the release path (7), where it reproduces (8) |
| `pos-support` | the channels (1), the areas and their memory (3), the team (4), the customers to notify (5), the test space (8), the activity tables and events that rebuild a user's journey (10) |
| `pos-kb-article` | the help center: where it lives, its scripts, the screenshot space, the copy the product's AI reads (9); the test space (8) |
| `pos-user-activity-report` | the activity tables, events and cohorts (10); the team (4), so its accounts are left out |
| the help content hook | the paths whose change may leave help content or screenshots stale (9) |
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
   product's own sections after section 10.

## The sections

| # | Section | What it must answer |
|---|---|---|
| 1 | Channels | where reports and bugs reach the team, who reads each channel, which `Source` of the fix backlog each one feeds |
| 2 | In-app reports | where reports made inside the product live, who can see them, the read-only query that lists the new ones, whether anything may be written back, the marker a report carries in the fix backlog |
| 3 | Areas | the prefix of the fix backlog's `ID` (unique across the whole Notion workspace), the product's `Area` list for the fix backlog, and for each area the `routing.zones` key whose memory a bug kill loads, plus any rule that area imposes |
| 4 | The team | who counts as the team, so their reports are not counted as customer reports, and how a test report is recognised |
| 5 | Customers to notify | how the author of a report is matched to a record in `databases.crm`, how their language is found, how a direct link is built, who sends |
| 6 | Priority rule | the default rule of the `pos-bug-kill` skill, or this product's override with its reason, and the batch size |
| 7 | Fix releases | how a minor fix release ships, service by service, how its version is set and read once live; or the pointer to the Build pivot |
| 8 | Test space | where a bug may be reproduced and a fix tested, what must never be used, the test accounts |
| 9 | Help center | where the help articles live and the page that tracks their state, the product name to use, the copy the product's AI reads and how it is re-ingested, how screenshots are captured and stored (never a public bucket), the limitations to state, the paths whose change makes help content stale |
| 10 | Activity | where sign-ups, the server event log, sessions and profiles live, the key that joins them, the events that mark each step of the funnel, the analytics events and where they fire, where the assistant's conversations are read, the cohorts |

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
  Interview / demo, In-app feedback, Audit, E2E, Dev session, Legacy notes). The `pos-fix-backlog` skill
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
Guidance: the prefix of the fix backlog's IDs, and the product's own list of areas.
- ID prefix: the prefix of the base's `ID` property. Every entry reads `<prefix>-n`, and commits,
  handoffs and messages cite it that way. Notion keeps a unique ID prefix unique across the whole
  workspace: when another product's fix backlog lives in the same Notion workspace, this product
  cannot take its prefix. The OS default is `FIX`; a second product takes one of its own, for example
  its initials or `BUG`. The `pos-fix-backlog` skill proposes it when it creates the base, picks another
  on a conflict with the owner's OK, and writes the one the base was created with here. On an
  existing base it reads the prefix from an entry and reports a difference with this line, or a
  missing line. The base is the reference: the prefix is final once entries exist.
- Each area is one option of the fix backlog's `Area` select, and the list here and the options in
  the base must match (the `pos-fix-backlog` skill compares them).
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

**ID prefix:** <!-- the prefix the base was created with, written by pos-fix-backlog; FIX is the default -->

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
Guidance: the `pos-bug-kill` skill carries the default grid (severity, effort, priority, and the bonus
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
- When the Release & Operations module is installed (`modules.build` true): write one line,
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

**Build pivot:** <!-- file name in pivots.dir, when modules.build is true -->

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

## 9. Help center

<!--
Guidance: everything `pos-kb-article` needs to write, illustrate and keep help articles in sync, and
the paths the help content hook watches. "None" is a finding: a product with no help center yet says
so, and the skill asks the owner where it should live before writing anything.
- Lives in: the tool (for example Notion) and the parent page of the help center.
- Work center: the page that tracks the help center's state: the gap analysis (features with no
  article), the articles written, the pages to clean. The skill reads it before writing and updates it
  after. Its page ID is written here: it is a page, not one of the shared bases of the config.
- Article bases: one row per topic, with the base that holds its articles (`collection://...`) and
  the name of its title property.
- Product name: the name every article uses, and any former name that must never appear.
- Copy read by the product's AI: when the product's AI assistant reads help content, the file that
  holds the short copy of each article, the section how-to entries go into, and the command that
  re-ingests it. "None" when no AI reads help content.
- Screenshots: the capture command, the upload command, how a new shot is added to the capture
  script, how the script signs in. Storage: a private store only, files reached through signed URLs
  only; never a public bucket, whatever the content. How an image reaches an article (for example
  uploaded into the help center tool itself, since a signed link expires).
- Screenshot space: the test space and account captures are taken from (a pointer to section 8 when
  it is the same), and which views show empty states there.
- Obsolete pages: the title prefixes that flag a page for the owner to delete, since a help center
  page often cannot be deleted through the connector.
- Known limitations: what an article touching a feature must state, until it changes.
- Paths: the JSON block below is read by the help content hook after each commit. Each entry is a
  regular expression matched against the paths a commit changed (relative to the repository root,
  forward slashes) and the label the reminder shows. `help_content`: paths whose change may leave an
  article or the AI's copy out of date. `screenshots`: paths of the views the capture script covers.
  Keep the info string of the block (`json pos-help-paths`): the hook finds the block by it.
-->

**Lives in:**

**Work center page:**

| Topic | Parent page | Articles base | Title property |
|---|---|---|---|
| | | | |

**Product name, and names never used:**

**Copy read by the product's AI, and how it is re-ingested:**

**Capture command:**

**Upload command:**

**Adding a shot, and how the script signs in:**

**Storage, and how an image reaches an article:** a private store, signed URLs only.

**Screenshot space:**

**Obsolete pages are renamed with:** `⚠️ OBSOLETE: <title>` (describes a former product or behaviour), `⚠️ ORPHAN: <title>` (documents something the code no longer has), `⚠️ DUPLICATE: <title>`.

**Known limitations to state:**

| Feature | Limitation | Until |
|---|---|---|
| | | |

**Paths that make help content stale (read by the hook):**

```json pos-help-paths
{
  "help_content": [],
  "screenshots": []
}
```

## 10. Activity

<!--
Guidance: where a user's real activity is read, for `pos-user-activity-report` and for the journey
`pos-support` rebuilds at RED. Placeholders only, no production values, no user named.
- Accounts: the table that holds sign-ups, and its columns for the ID, the email, the creation date
  and the confirmation date.
- Join key: the one ID that is the same across accounts, events, sessions and profiles, and any trap
  (an ID that looks the same and is not).
- Server event log: the table, its columns (user, action, details, date, space), and the actions of
  the funnel in order, each with what it means when it is the last one a user reached.
- Sessions: the table and its columns (start, last heartbeat, end, duration, entry page, source,
  device, country).
- Profile: the table and the columns that say who the person is (name, organisation, role, country).
- Event roles: the events the cohorts of `pos-user-activity-report` use, each named by its role, with
  the product's event name and where it is read. The provider and project are in the config
  (`analytics.*`).
- Client events fire: where client-side analytics events are sent from (for example production only),
  and the memory file that lists the events.
- Assistant conversations: where what a user said to the product's AI assistant can be read (a log
  route, a table), or "none".
- Cohorts: "Default." keeps the OS cohorts of `pos-user-activity-report`; otherwise the product's own
  definitions, in the event roles below.
- Uncovered unit: how to tell that a unit a user explored is not covered by the product yet (the
  coverage of the domain pivot), or "not applicable".
- Default window: how far back a report looks when the owner gives no window (the OS default is 7
  days).
-->

**Accounts:**

**Join key, and its traps:**

**Server event log:**

| Step | Action | When it is the last one reached |
|---|---|---|
| | | |

**Sessions:**

**Profile:**

**Event roles:**

| Role | Event name | Read in (server log or analytics) |
|---|---|---|
| sign-up started | | |
| sign-up confirmed | | |
| space created | | |
| first exploration of a unit | | |
| activation (first project created) | | |
| session start | | |
| deep usage | | |

**Client events fire:**

**Assistant conversations read at:**

**Cohorts:** Default.

**Uncovered unit:**

**Default window:** 7 days.

## Change log

<!-- One line per change: date, what changed, why. -->
