# Fix backlog: the reusable schema

The fix backlog is the shared base where a bug that is not fixed at once is written down, so a fix
session can empty it in one batch (`rules/principles.md`, principle 8). Setup creates it in Notion
when `databases.fix_backlog` is empty and `modules.support` is true, and the owner says yes.

The structure is in English whatever `product.team_language` is, so skills find its properties by
name. Entries are written in the team's language.

## Properties

| Property | Type | Values or rule |
|---|---|---|
| `Bug` | title | one line: what the user sees go wrong |
| `ID` | unique ID, prefix `FIX` | numbered by Notion (FIX-1, FIX-2...); commits and messages cite it |
| `Status` | select | `To triage`, `To fix`, `In progress`, `Fixed (to release)`, `Released`, `Not reproduced`, `Dropped` |
| `Severity` | select | `Blocker`, `Major`, `Minor`, `Cosmetic` |
| `Priority` | select | `P0`, `P1`, `P2`, `P3` |
| `Area` | select | the product's own list of areas, given by the owner before creation |
| `Source` | select | `User feedback`, `Support`, `Interview / demo`, `In-app feedback`, `Audit`, `E2E`, `Dev session`, `Legacy notes` |
| `Users affected` | number | how many users are known to hit it |
| `Effort` | select | `XS`, `S`, `M`, `L` |
| `Reproduction` | text | the steps, the account or space used (the team's test space, never a client's), what is expected, what happens |
| `Reported on` | date | when it was first reported |
| `Source feedback` | relation to the base in `databases.feedback`, two-way | only when that base is configured |
| `Customer to notify` | relation to the base in `databases.crm`, one-way | only when that base is configured |
| `Commit` | text | the commit that fixes it |
| `Version` | text | the release that ships the fix |
| `Created` | created time | set by Notion |

Choices, and why:

- **`Status` is a select, not Notion's status type.** A status property sorts its options into
  Notion's fixed groups (`To-do`, `In progress`, `Complete`), and the groups themselves can only be
  changed in Notion. `Not reproduced` and `Dropped` belong to none of them. The connector's schema
  language also takes a list of options for a select, and none for a status (read in the create
  capability's own description).
- **`Source feedback` is two-way**, so a feedback entry shows the fixes it produced. Creating it adds
  one property to the feedback base: say so before creating.
- **`Customer to notify` is one-way**, so the CRM base's schema is not changed by setup.
- **A relation whose base is not configured is left out**, not pointed at a placeholder. It is added
  later with the connector's update capability, once the base exists.

## Before creating: fix the names

- **No commas in option names.** Notion's API reference: "Commas are not allowed." Check every
  option, including the owner's `Area` list.
- **Names are final before anything is imported.** Notion's API "does not rename existing options":
  "New names add options", and "Omitted options are removed". A rename made through the connector is
  a removal plus an addition, and the entries that carried the old option lose their value. So the
  names are settled with the owner first, then the base is created, then entries are imported.
- **An `ID` number cannot be written.** Notion's reference: "You can configure the prefix, but you
  cannot write a page's number." An import numbers entries in the order it creates them; a legacy
  identifier, if one must be kept, goes in the entry's text.

## How to create it

1. Ask the owner for:
   - the parent page, where the other shared bases live. Without a parent, the connector creates the
     base as a private page at the workspace level, which nobody else sees;
   - the `Area` list for this product.
2. Show the full schema (the table above, with the `Area` values and the relations that apply),
   then: "OK, or adjust before I create it?"
3. Say what the call does: it creates one base under the named page and, if `Source feedback`
   applies, adds one property to the feedback base. Then create it.
4. Fetch the new base. Compare each property and each option with the schema, and read its data
   source ID (`collection://...`) from the response.
5. Write `databases.fix_backlog` through setup's config step (diff shown, written on OK).

The connector's create capability takes the schema as a SQL `CREATE TABLE` statement. As read in its
description on 2026-09-26, the statement looks like the one below. The tool's own description in
the session is the contract: read it first, and follow it where it differs.

```sql
CREATE TABLE (
  "Bug" TITLE,
  "ID" UNIQUE_ID PREFIX 'FIX',
  "Status" SELECT('To triage':gray, 'To fix':red, 'In progress':yellow, 'Fixed (to release)':blue, 'Released':green, 'Not reproduced':brown, 'Dropped':default),
  "Severity" SELECT('Blocker':red, 'Major':orange, 'Minor':yellow, 'Cosmetic':gray),
  "Priority" SELECT('P0':red, 'P1':orange, 'P2':yellow, 'P3':gray),
  "Area" SELECT(<the owner's areas, each 'Name':color>),
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

## When the base already exists

When `databases.fix_backlog` is set, setup does not create anything. It fetches the base, compares it
with this schema, and reports the differences (a missing property, an option spelled differently).
It changes nothing without the owner's go, and never renames an option that entries already carry.

## Sources

Read on 2026-09-26.

- Notion API, data source properties: https://developers.notion.com/reference/property-object
  ("Commas are not allowed.", the unique ID prefix, one-way and two-way relations).
- Notion API, update data source properties: https://developers.notion.com/reference/update-data-source-properties
  ("Omitted options are removed.", "New names add options.", "The API does not rename existing
  options or change their colors.", status groups `To-do`, `In progress`, `Complete`).
- Notion MCP, supported tools: https://developers.notion.com/guides/mcp/mcp-supported-tools (the
  create database and update data source tools; data source IDs from `collection://...` tags).
- The `CREATE TABLE` syntax (`UNIQUE_ID PREFIX`, `SELECT('opt':color)`, `RELATION('id', DUAL 'name')`,
  `CREATED_TIME`, `STATUS` taking no options): the create database tool's own description, read in a
  connected session. It has no public URL; re-read it in the session before use.
