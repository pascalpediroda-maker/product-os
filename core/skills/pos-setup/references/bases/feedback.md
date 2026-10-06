# Feedback: the schema

The feedback base is where what the team learns from people is written down: a discovery interview,
a customer meeting, an onboarding session, a demo, a support mail, a chat message, a publication, or
what an account did in the product. One entry per source event: a meeting write-up is one entry, and
the write-up itself is the page body. Roadmap opportunities point to the entries that support them;
a bug that comes out of an entry is filed in the fix backlog and points back to it.

The Discovery module (`modules.discovery`) is the one that needs this base; the core `pos-setup`
skill records it as `databases.feedback`. The `pos-setup` skill creates it from this schema (its Step 7) when the owner wants
it, and writes its data source URL in the config through a shown diff.

The structure is in English whatever `product.team_language` is, so skills find its properties by
name and another product can reuse it as it is. Entries are written in the team's language;
`Verbatim` stays in the language the person spoke.

## Properties

| Property | Type | Values or rule |
|---|---|---|
| `Subject` | title | one line: what this entry records (the meeting and its subject, the request in a mail, the behaviour seen). The person is carried by `Contact` |
| `Date` | date | when it was said or seen, not when it was filed |
| `Type` | select | `Discovery interview`, `Customer meeting`, `Onboarding meeting`, `Demo`, `Support / mail`, `Chat / message`, `Publication`, `Product usage`, `Internal` |
| `Persona` | select | the product's own persona list, from the owner at creation; the same option names as the CRM's `Persona` |
| `Verbatim` | text | the strongest quote, word for word, in its original language, 200 characters at most; empty when there is none, never paraphrased |
| `Tags` | multi-select | `Follow-up`, `Onboarding`, `Usage`, `Testimony` |
| `Contact` | relation to the base in `databases.crm`, two-way, reverse `Interactions` | who said it; only when that base is configured |
| `Opportunities` | relation to the base in `databases.roadmap`, two-way, reverse `Feedback` | the opportunities this entry supports; only when that base is configured |
| `Fixes` | relation to the base in `databases.fix_backlog`, two-way, reverse `Source feedback` | the bugs filed from this entry; only when that base is configured |

### Where an entry comes from (`Type`)

| Type | When |
|---|---|
| `Discovery interview` | an interview about the person's problem and context, outside a sale |
| `Customer meeting` | a meeting with a prospect or a customer: follow-up, pricing, a decision |
| `Onboarding meeting` | a session that helps a new account get started |
| `Demo` | the team shows the product |
| `Support / mail` | a support request or a mail |
| `Chat / message` | a message on a chat or a social network |
| `Publication` | a public text: an article, a post, a review |
| `Product usage` | what an account did in the product, read from the product's own data (an activity report), not said by the person |
| `Internal` | written by the team itself: a product decision out of a bug kill, a review, an observation. `Contact` stays empty |

### What each tag means (`Tags`)

| Tag | Means |
|---|---|
| `Follow-up` | a next step with this person is expected; the CRM's `Next step` says which |
| `Onboarding` | about getting started with the product |
| `Usage` | about how the product is used day to day |
| `Testimony` | a statement worth quoting; any public use needs the person's consent |

### A meeting write-up

A meeting-notes skill files **one entry per meeting**:

- `Subject`: the meeting and its subject; `Date`: the meeting's date;
- `Type`: one of the four meeting kinds (`Discovery interview`, `Customer meeting`,
  `Onboarding meeting`, `Demo`);
- `Persona`: the main contact's; `Verbatim`: their strongest quote; `Tags` as they apply;
- `Contact`: the person, found in the CRM or created there first;
- `Opportunities`: every roadmap entry the meeting brings evidence to;
- the write-up itself (profile, what was said, pain points, actions) is the page body.

A bug seen during the meeting goes to the fix backlog with `Source` `Interview / demo` and its
`Source feedback` pointing to this entry; the entry's `Fixes` then lists it.

### Relations between the OS bases

| From | Property | To | Kind | Reverse | Created by |
|---|---|---|---|---|---|
| fix backlog | `Source feedback` | feedback | two-way | `Fixes` | the second of the two bases to exist |
| fix backlog | `Customer to notify` | CRM | one-way | none | the fix backlog, once the CRM exists |
| feedback | `Contact` | CRM | two-way | `Interactions` | the second of the two bases to exist |
| feedback | `Opportunities` | roadmap | two-way | `Feedback` | the second of the two bases to exist |

A two-way relation is written once, from one side: Notion adds the reverse property on the other base.
When both bases already exist without it, it is added with the update capability on one side only
(`ADD COLUMN "Contact" RELATION('<crm data source id>', DUAL 'Interactions')`); adding it from both
sides makes two unrelated relations.

### Rules the schema carries

- **One entry per source event, not one per insight.** The working base holds one entry per meeting,
  with the write-up as its body; a meeting that supports several opportunities links them all.
- **No status.** An entry records what was said or seen. What is done about it lives in the roadmap
  (`Opportunities`) and the fix backlog (`Fixes`), each with its own status.
- **The person is carried by `Contact`.** The title says what the entry records and does not need the
  person's name, since the relation shows it. A customer's name never goes in an option value.
- **`Persona` uses the same option names in the feedback base and in the CRM**, so an entry's persona
  and its contact's persona can be compared by value. Observed: the working base used long names in
  one base and bare codes in the other, which no query can match.
- **No emoji in option names.** Skills match option values exactly, case included. Observed: some
  options of the working base began with an emoji and others did not, and every skill had to copy them
  character for character.
- **`Contact`, `Opportunities` and `Fixes` are two-way**, so a contact shows its interactions, an
  opportunity shows its evidence (the Observe step of the roadmap's FO(E)CUSED page reads it), and an
  entry shows the bugs it produced. Creating one adds a property to the other base: say so before
  creating.
- **A relation whose base is not configured is left out**, not pointed at a placeholder. It is added
  later with the connector's update capability, once that base exists.

### Left out

- The team-member person property (who in the team took part): set on 18 of 362 entries; who filed
  an entry is in Notion's own created-by.
- One tag, the most used (142 of 362 entries), whose meaning the base does not document: it is kept
  only once the owner names what it means.

## Before creating: fix the names

- **No commas in option names.** Notion's API reference: "Commas are not allowed." Check every
  option, including the product's `Persona` list. A comma in a value splits it into two options.
- **Names are unique regardless of case.**
- **Names are final before anything is imported.** Notion's API "does not rename existing options":
  "New names add options", and "Omitted options are removed". A rename made through the connector is
  a removal plus an addition, and the entries that carried the old option lose their value. So the
  names are settled with the owner first, then the base is created, then entries are imported.
- **The `Persona` list is the one the CRM uses**, name for name. When the CRM already exists, its
  `Persona` options are read and reused; when it does not, the list written here is the one the CRM
  will take.

## The creation statement

The connector's create capability takes the schema as a SQL `CREATE TABLE` statement. As read in its
description on 2026-10-06, the statement looks like the one below. The tool's own description in the
session is the contract: read it first, and follow it where it differs.

```sql
CREATE TABLE (
  "Subject" TITLE,
  "Date" DATE,
  "Type" SELECT('Discovery interview':green, 'Customer meeting':orange, 'Onboarding meeting':yellow, 'Demo':blue, 'Support / mail':purple, 'Chat / message':pink, 'Publication':brown, 'Product usage':red, 'Internal':gray),
  "Persona" SELECT(<the product's personas, each 'Name':color>),
  "Verbatim" RICH_TEXT,
  "Tags" MULTI_SELECT('Follow-up':orange, 'Onboarding':brown, 'Usage':green, 'Testimony':red),
  "Contact" RELATION('<crm data source id>', DUAL 'Interactions'),
  "Opportunities" RELATION('<roadmap data source id>', DUAL 'Feedback'),
  "Fixes" RELATION('<fix backlog data source id>', DUAL 'Source feedback')
)
```

- Drop the `Contact` line when `databases.crm` is empty, the `Opportunities` line when
  `databases.roadmap` is empty, and the `Fixes` line when `databases.fix_backlog` is empty.
- Before keeping a relation line, fetch the target base: if it already has the reverse property
  (`Interactions`, `Feedback` or `Source feedback`) pointing at a feedback base, the relation exists
  and the line is dropped. A fix backlog created before this base has no `Source feedback`, so the
  `Fixes` line adds it there.

## How the properties read back

- In SQL, the date reads as `"date:Date:start"`. `Tags` is a JSON array; count its values with
  `json_each` (observed 2026-10-06):
  ```sql
  SELECT j.value AS tag, COUNT(*) AS n
  FROM "collection://<data source id>" AS t, json_each(t."Tags") AS j
  GROUP BY j.value
  ```
- A relation reads as a JSON array of page URLs, and is written as a list of page URLs (page IDs are
  also accepted), never as titles.
- `Verbatim` and the page body are rich text: SQL returns them lossy. Read in rows mode, or fetch the
  page, before relying on them or rewriting them.
- On a plan below Business, SQL works on one data source at a time and shares a workspace quota
  (observed 2026-10-06: a query over several data sources was refused, and the quota ran out after ten
  single-source queries in one session). Group several counts into one query where the result stays
  small.

The rest of the connector's behaviour is in the `pos-tool-conventions` skill, Notion reference.

## When the base already exists

When `databases.feedback` is set, nothing is created. The base is fetched and compared with this
schema, and the differences are reported: a missing property, an option spelled differently, a
`Persona` list that differs from the CRM's, a relation missing or pointing elsewhere. Nothing changes
without the owner's go, and an option that entries already carry is never renamed through the
connector: the owner renames it in the Notion UI, which keeps the values.

## Sources

Read on 2026-10-06, unless marked otherwise.

- Notion API, data source properties: https://developers.notion.com/reference/property-object
  ("Commas are not allowed.", option names unique regardless of case, one-way and two-way relations).
- Notion API, update data source properties: https://developers.notion.com/reference/update-data-source-properties
  ("Omitted options are removed.", "New names add options.", "The API does not rename existing
  options or change their colors.").
- The create database and update data source tools' own descriptions, read in a connected session
  (`MULTI_SELECT`, `RELATION('id', DUAL 'name')` naming the reverse property, `ADD COLUMN`). They have
  no public URL; re-read them in the session before use.
- Observed on a working product's base, 2026-10-06: 362 entries. Types used: discovery interviews
  105, customer meetings 112, onboarding meetings 58, product-usage reports 40, support or mail 17,
  demos 12, chat 11, social messages 2, publications 1, none 4. Filled: date 360, tags 339, persona
  222, verbatim 165, contact 87, roadmap link 84, team member 18, fix backlog link 1. A meeting
  write-up was one entry whose body held the write-up, linked to its contact and to two roadmap
  entries.
- Observed in use, 2026-10-06: SQL over several data sources refused on a plan below Business; the
  workspace SQL quota exhausted after ten single-source queries; `json_each` over a multi-select
  column worked.
