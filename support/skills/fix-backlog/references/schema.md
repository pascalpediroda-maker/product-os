# Fix backlog: the schema

The fix backlog is the shared base where a bug that is not fixed in the session that sees it is
written down, so a bug kill session can empty it in batches (core principle 8, collaboration
rule 20). The Support module owns it: the `fix-backlog` skill creates it in Notion when
`databases.fix_backlog` is empty and the owner says yes, and checks an existing base against this
schema (its section "Create or check the base").

The structure is in English whatever `product.team_language` is, so skills find its properties by
name and another product can reuse it as it is. Entries are written in the team's language.

A base created earlier by the core `setup` skill has this same schema: nothing to migrate.

## Properties

| Property | Type | Values or rule |
|---|---|---|
| `Bug` | title | one line: what the user sees go wrong |
| `ID` | unique ID, prefix `FIX` | numbered by Notion (FIX-1, FIX-2...); commits and messages cite it |
| `Status` | select | `To triage`, `To fix`, `In progress`, `Fixed (to release)`, `Released`, `Not reproduced`, `Dropped` |
| `Severity` | select | `Blocker`, `Major`, `Minor`, `Cosmetic`; definitions in the `bug-kill` skill, Step 3 |
| `Priority` | select | `P0`, `P1`, `P2`, `P3`; set only by a bug kill, when the owner validates the batch |
| `Area` | select | the product's own list of areas: the Support pivot, section 3 |
| `Source` | select | `User feedback`, `Support`, `Interview / demo`, `In-app feedback`, `Audit`, `E2E`, `Dev session`, `Legacy notes` |
| `Users affected` | number | how many users are known to hit it |
| `Effort` | select | `XS`, `S`, `M`, `L`; definitions in the `bug-kill` skill, Step 3 |
| `Reproduction` | text | the steps, the account or space used (the team's test space, never a customer's), what is expected, what happens; for an in-app report, its marker `report:<id>` |
| `Reported on` | date | when it was first reported |
| `Source feedback` | relation to the base in `databases.feedback`, two-way | only when that base is configured |
| `Customer to notify` | relation to the base in `databases.crm`, one-way | only when that base is configured |
| `Commit` | text | the commit that fixes it |
| `Version` | text | the release that ships the fix |
| `Created` | created time | set by Notion |

### What each status means

| Status | Means | Set by |
|---|---|---|
| `To triage` | filed, not verified yet | whoever files it (`fix-backlog`, "File an entry") |
| `To fix` | verified against the deployed reference: still present, to reproduce, or taken over by ongoing work (then out of the batch) | a bug kill, Step 2 |
| `In progress` | a session is fixing it now | the session that starts the fix |
| `Fixed (to release)` | fixed and committed, not live yet | the session that commits the fix |
| `Released` | live; `Version` says in which release, or since when | at release, or at triage when the deployed code already fixes it |
| `Not reproduced` | a real attempt did not reproduce it | a bug kill, Step 4 only; never from reading code |
| `Dropped` | not a bug, a test report from the team, or nobody remembers what it was | anyone, with the reason in `Reproduction` |

### Where an entry comes from (`Source`)

| Source | When |
|---|---|
| `User feedback` | a user told the team outside the product: a mail, a call, a message |
| `Support` | a support session decided not to fix it at once |
| `Interview / demo` | seen in an interview or a demo |
| `In-app feedback` | a report made from inside the product; the entry carries its marker `report:<id>` |
| `Audit` | an audit finding not handled at once |
| `E2E` | a red end-to-end test not fixed at once |
| `Dev session` | met by a session outside its task, or left over after a fix |
| `Legacy notes` | imported from notes that predate the base |

### Choices, and why

- **`Status` is a select, not Notion's status type.** A status property sorts its options into
  Notion's fixed groups (`To-do`, `In progress`, `Complete`), and the groups themselves can only be
  changed in Notion. `Not reproduced` and `Dropped` belong to none of them. The connector's schema
  language also takes a list of options for a select, and none for a status (read in the create
  capability's own description).
- **`Source feedback` is two-way**, so a feedback entry shows the fixes it produced. Creating it adds
  one property to the feedback base: say so before creating.
- **`Customer to notify` is one-way**, so the CRM base's schema is not changed.
- **A relation whose base is not configured is left out**, not pointed at a placeholder. It is added
  later with the connector's update capability, once the base exists.
- **Customers are carried by the relation, never written in `Bug` or `Reproduction`.** The base is
  read by every session; a name in free text travels with every copy of it.

## Before creating: fix the names

- **No commas in option names.** Notion's API reference: "Commas are not allowed." Check every
  option, including the product's `Area` list.
- **Names are unique regardless of case.**
- **Names are final before anything is imported.** Notion's API "does not rename existing options":
  "New names add options", and "Omitted options are removed". A rename made through the connector is
  a removal plus an addition, and the entries that carried the old option lose their value. So the
  names are settled with the owner first, then the base is created, then entries are imported.
- **An `ID` number cannot be written.** Notion's reference: "You can configure the prefix, but you
  cannot write a page's number." An import numbers entries in the order it creates them; a legacy
  identifier, if one must be kept, goes in the entry's text.

## The creation statement

The connector's create capability takes the schema as a SQL `CREATE TABLE` statement. As read in its
description on 2026-09-26, the statement looks like the one below. The tool's own description in the
session is the contract: read it first, and follow it where it differs.

```sql
CREATE TABLE (
  "Bug" TITLE,
  "ID" UNIQUE_ID PREFIX 'FIX',
  "Status" SELECT('To triage':gray, 'To fix':red, 'In progress':yellow, 'Fixed (to release)':blue, 'Released':green, 'Not reproduced':brown, 'Dropped':default),
  "Severity" SELECT('Blocker':red, 'Major':orange, 'Minor':yellow, 'Cosmetic':gray),
  "Priority" SELECT('P0':red, 'P1':orange, 'P2':yellow, 'P3':gray),
  "Area" SELECT(<the product's areas, each 'Name':color>),
  "Source" SELECT('User feedback':blue, 'Support':purple, 'Interview / demo':pink, 'In-app feedback':green, 'Audit':orange, 'E2E':gray, 'Dev session':brown, 'Legacy notes':default),
  "Users affected" NUMBER,
  "Effort" SELECT('XS':green, 'S':blue, 'M':yellow, 'L':red),
  "Reproduction" RICH_TEXT,
  "Reported on" DATE,
  "Source feedback" RELATION('<feedback data source id>', DUAL 'Fixes'),
  "Customer to notify" RELATION('<crm data source id>'),
  "Commit" RICH_TEXT,
  "Version" RICH_TEXT,
  "Created" CREATED_TIME
)
```

Drop the `Source feedback` line when `databases.feedback` is empty, and the `Customer to notify`
line when `databases.crm` is empty.

## How the properties read back

- In SQL, the unique ID column named `ID` reads as `"userDefined:ID"` (a property named `id` or `url`
  takes the `userDefined:` prefix), and the date reads as `"date:Reported on:start"`.
- A relation is written as a list of page URLs (page IDs are also accepted), never as titles.
- `Reproduction` is rich text: SQL returns it lossy (mentions, links and formatting can be missing).
  Read it in rows mode, or fetch the page, before relying on it or rewriting it.

The rest of the connector's behaviour is in the `tool-conventions` skill, Notion reference.

## When the base already exists

When `databases.fix_backlog` is set, nothing is created. The base is fetched and compared with this
schema and with the Support pivot's Area list, and the differences are reported (a missing property,
an option spelled differently, an area in one list and not the other). Nothing changes without the
owner's go, and an option that entries already carry is never renamed through the connector.

## Sources

Read on 2026-09-26.

- Notion API, data source properties: https://developers.notion.com/reference/property-object
  ("Commas are not allowed.", option names unique regardless of case, the unique ID prefix, one-way
  and two-way relations).
- Notion API, update data source properties: https://developers.notion.com/reference/update-data-source-properties
  ("Omitted options are removed.", "New names add options.", "The API does not rename existing
  options or change their colors.", status groups `To-do`, `In progress`, `Complete`).
- Notion MCP, supported tools: https://developers.notion.com/guides/mcp/mcp-supported-tools (the
  create database and update data source tools; data source IDs from `collection://...` tags).
- The `CREATE TABLE` syntax (`UNIQUE_ID PREFIX`, `SELECT('opt':color)`, `RELATION('id', DUAL 'name')`,
  `CREATED_TIME`, `STATUS` taking no options): the create database tool's own description, read in a
  connected session. It has no public URL; re-read it in the session before use.
- Observed in use, September 2026: renaming select options erased the values of the renamed options;
  the unique ID column read as `"userDefined:ID"` in SQL.
