# CRM: the schema

The CRM base holds the people the team sells to and works with: one entry per contact, with their
organisation, where they stand in the sales pipeline, the last exchange, and the next step with its
date. The feedback base points to it (who said it), and the fix backlog points to it (who to tell
when a bug they reported is fixed).

The GTM module (`modules.gtm`) is the one that needs this base; the core `pos-setup` skill records it
as `databases.crm`. The Support module reads it to notify customers (`Customer to notify`, and the
Support pivot's section 5 says how a report's author is matched to a contact). The `pos-setup` skill
creates it from this schema (its Step 7) when the owner wants it, and writes its data source URL in
the config through a shown diff.

The structure is in English whatever `product.team_language` is, so skills find its properties by
name and another product can reuse it as it is. Entries are written in the team's language.

**This base holds personal data** (names, email addresses). The schema itself carries none: names
live in entries only, never in an option list, a title template or a view name.

## Properties

| Property | Type | Values or rule |
|---|---|---|
| `Name` | title | the contact's full name; one entry per person |
| `Organisation` | text | the contact's organisation, and their role there when it helps |
| `Email` | email | the contact's address |
| `Status` | select | `Lead`, `Prospect`, `In demo`, `In trial`, `Active`, `Customer`, `Cold`, `Lost` |
| `Motion` | select | the product's own sales motions, from the owner at creation |
| `Source` | select | `Inbound`, `Social network`, `Referral`, `Search`, `Imported`, `Other` |
| `Persona` | select | the product's own persona list; the same option names as the feedback base's `Persona` |
| `Target plan` | select | the product's own plans, from the owner at creation |
| `Last touch` | date | the date of the last exchange with this contact |
| `Next step` | text | the next action, in one line |
| `Next step date` | date | when the next step is due |
| `Notes` | text | context no other property holds: who referred them, history, constraints |
| `Interactions` | relation to the base in `databases.feedback`, two-way, reverse `Contact` | every feedback entry from this contact; only when that base is configured |

### What each status means

| Status | Means |
|---|---|
| `Lead` | known, not in conversation yet |
| `Prospect` | in conversation, no demo yet |
| `In demo` | a demo is planned or done, no account yet |
| `In trial` | uses the product on a trial |
| `Active` | uses the product without paying |
| `Customer` | pays |
| `Cold` | no answer or no interest for now; may come back |
| `Lost` | said no |

### Where a contact comes from (`Source`)

| Source | When |
|---|---|
| `Inbound` | the contact came to the product or the team first |
| `Social network` | met or reached through a social network |
| `Referral` | introduced by someone; who referred them goes in `Notes` |
| `Search` | found the product through a search engine |
| `Imported` | brought in from an earlier list or tool |
| `Other` | none of the above; say how in `Notes` |

### Rules the schema carries

- **One entry per person.** The organisation is a property of the person, so two people of one
  organisation are two entries with the same `Organisation`.
- **`Organisation` is text, not a select.** Observed on the working base: a select of organisations
  grew one option per customer, so customer names sat in the schema that every fetch of the base
  returns, and values that held a comma were split by Notion into two options, leaving fragments of
  sentences as options.
- **No person or customer name in an option.** Observed: the working base had one `Source` option per
  referrer. A referral is `Referral`, and the referrer is written in `Notes`.
- **`Status` is a select, not Notion's status type.** A status property sorts its options into
  Notion's fixed groups (`To-do`, `In progress`, `Complete`), which can only be changed in Notion;
  `Cold` and `Lost` fit none of them. The connector's schema language takes a list of options for a
  select, and none for a status.
- **`Persona` uses the same option names as the feedback base**, so a contact and the entries they
  produced can be compared by value. Observed: the working base used bare codes here and long names
  in the feedback base.
- **`Motion` and `Target plan` are the product's own lists**, set with the owner at creation, like
  the fix backlog's `Area`; they are written in the GTM pivot once that module exists. `Motion` says
  through which sales motion the contact is worked (direct, through partners, self-serve...);
  `Target plan` says which of the product's plans the contact is aimed at.
- **`Interactions` is two-way**, written from either side: it is the reverse of the feedback base's
  `Contact`. Creating it here adds `Contact` to the feedback base: say so before creating.
- **The fix backlog's `Customer to notify` is one-way**, so it adds no property here.
- **A relation whose base is not configured is left out**, not pointed at a placeholder. It is added
  later with the connector's update capability, once that base exists.

### Left out

- The owner person property: set on 1 of 47 contacts. A team with several sellers adds an `Owner`
  property of type `PEOPLE`.
- The relation to a base of sales actions: its target is not one of the OS bases. The module that
  brings such a base adds the relation.
- Options: a churned status, never used (added, with every current option listed, when the first
  customer leaves), a source for an event channel, never used, and five persona codes never used.

## Before creating: fix the names

- **No commas in option names.** Notion's API reference: "Commas are not allowed." Check every
  option, including the product's `Motion`, `Persona` and `Target plan` lists.
- **Names are unique regardless of case.**
- **The `Persona` list is the one the feedback base uses**, name for name. When the feedback base
  already exists, its `Persona` options are read and reused.
- **Names are final before anything is imported.** Notion's API "does not rename existing options":
  "New names add options", and "Omitted options are removed". A rename made through the connector is
  a removal plus an addition, and the entries that carried the old option lose their value. So the
  names are settled with the owner first, then the base is created, then contacts are imported.

## The creation statement

The connector's create capability takes the schema as a SQL `CREATE TABLE` statement. As read in its
description on 2026-10-06, the statement looks like the one below. The tool's own description in the
session is the contract: read it first, and follow it where it differs.

```sql
CREATE TABLE (
  "Name" TITLE,
  "Organisation" RICH_TEXT,
  "Email" EMAIL,
  "Status" SELECT('Lead':gray, 'Prospect':blue, 'In demo':orange, 'In trial':yellow, 'Active':green, 'Customer':purple, 'Cold':default, 'Lost':red),
  "Motion" SELECT(<the product's sales motions, each 'Name':color>),
  "Source" SELECT('Inbound':green, 'Social network':orange, 'Referral':purple, 'Search':brown, 'Imported':blue, 'Other':default),
  "Persona" SELECT(<the product's personas, the same names as in the feedback base, each 'Name':color>),
  "Target plan" SELECT(<the product's plans, each 'Name':color>),
  "Last touch" DATE,
  "Next step" RICH_TEXT,
  "Next step date" DATE,
  "Notes" RICH_TEXT,
  "Interactions" RELATION('<feedback data source id>', DUAL 'Contact')
)
```

Drop the `Interactions` line when `databases.feedback` is empty, or when the feedback base already
has a `Contact` property pointing at a CRM (the relation then exists). When the fix backlog exists
without `Customer to notify`, add it there once this base is created, on the fix backlog's side:
`ADD COLUMN "Customer to notify" RELATION('<crm data source id>')`.

## How the properties read back

- In SQL, the dates read as `"date:Last touch:start"` and `"date:Next step date:start"`; `Email` is
  plain text; `Interactions` is a JSON array of page URLs.
- A relation is written as a list of page URLs (page IDs are also accepted), never as names. A
  skill that links a feedback entry to a contact searches for the contact first, and creates one only
  when none matches; for a report's author, the Support pivot's section 5 says how the match is made.
- `Notes` and `Next step` are rich text: SQL returns them lossy. Read in rows mode, or fetch the
  page, before relying on them or rewriting them.

The rest of the connector's behaviour is in the `pos-tool-conventions` skill, Notion reference.

## When the base already exists

When `databases.crm` is set, nothing is created. The base is fetched and compared with this schema,
and the differences are reported: a missing property, an option spelled differently, a `Persona` list
that differs from the feedback base's, an option list that names customers or people (an organisation
select, a referrer per option). Nothing changes without the owner's go. An option that entries
already carry is never renamed through the connector: the owner renames it in the Notion UI, which
keeps the values. Turning an organisation select into text is the owner's decision; whether the
connector keeps the values through that type change is to verify before doing it.

## Sources

Read on 2026-10-06, unless marked otherwise.

- Notion API, data source properties: https://developers.notion.com/reference/property-object
  ("Commas are not allowed.", option names unique regardless of case, one-way and two-way relations).
- Notion API, update data source properties: https://developers.notion.com/reference/update-data-source-properties
  ("Omitted options are removed.", "New names add options.", "The API does not rename existing
  options or change their colors.", status groups `To-do`, `In progress`, `Complete`).
- The create database and update data source tools' own descriptions, read in a connected session
  (`EMAIL`, `RELATION('id', DUAL 'name')`, `ADD COLUMN`). They have no public URL; re-read them in
  the session before use.
- Observed on a working product's base, 2026-10-06: 47 contacts. Status: in trial 13, cold 8,
  prospect 8, active 6, in demo 5, lost 3, lead 2, customer 1, none 1, churned never used. Motion set
  on 42, source on 45, persona on 38 (four of eleven options used), target plan on 23 (three of five
  used). Filled: last touch 46, organisation 45, next step 41, email 36, notes 36, interactions 34,
  next step date 24, sales-action link 10, owner 1. The organisation select held one option per
  customer, including fragments of values split at a comma.
