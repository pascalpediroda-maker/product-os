# CRM: the schema

Copied from a working product's base, which works as it is. Only what belongs to that product was
left out: options that name its customers, its referrers or its domain, and a relation to a sales
actions base that is not an OS base. French property names were put in English, like every OS base.

One entry per contact. The feedback base points to it (who said it); the fix backlog points to it
(who to tell when their bug is fixed). It holds personal data: names live in entries, never in the
schema.

`pos-setup` creates it (its Step 7) and writes its data source URL in `databases.crm`.

## Properties

| Property | Type | Values |
|---|---|---|
| `Name` | title | the contact's name |
| `Org` | select | the contact's organisation; options are added as contacts come. An option name cannot hold a comma: Notion splits it |
| `Email` | email | |
| `Status` | select | `Lead`, `Prospect`, `In demo`, `In trial`, `Active`, `Client`, `Cold`, `Churn`, `Lost` |
| `Motion` | select | the product's sales motions, from the owner at creation |
| `Source` | select | `LinkedIn`, `Inbound`, `SERP`, `Other`, plus the product's own (a referral, an event, an import) |
| `Persona` | select | the product's personas, from the owner at creation |
| `Target tier` | select | the product's plans, from the owner at creation |
| `Last touch` | date | the last exchange |
| `Next step` | text | the next action |
| `Next step date` | date | when it is due |
| `Notes` | text | |
| `Owner` | person | who in the team follows the contact |
| `Interactions` | relation to the feedback base, two-way, reverse `Contact CRM` | every feedback entry from this contact |

## The creation statement

The tool's own description in the session is the contract: read it first, follow it where it differs.

```sql
CREATE TABLE (
  "Name" TITLE,
  "Org" SELECT(),
  "Email" EMAIL,
  "Status" SELECT('Lead':gray, 'Prospect':blue, 'In demo':orange, 'In trial':yellow, 'Active':green, 'Client':green, 'Cold':default, 'Churn':red, 'Lost':red),
  "Motion" SELECT(<the product's sales motions, each 'Name':color>),
  "Source" SELECT('LinkedIn':orange, 'Inbound':green, 'SERP':brown, 'Other':default),
  "Persona" SELECT(<the product's personas, each 'Name':color>),
  "Target tier" SELECT(<the product's plans, each 'Name':color>),
  "Last touch" DATE,
  "Next step" RICH_TEXT,
  "Next step date" DATE,
  "Notes" RICH_TEXT,
  "Owner" PEOPLE,
  "Interactions" RELATION('<feedback data source id>', DUAL 'Contact CRM')
)
```

- Drop the `Interactions` line when the feedback base does not exist yet, or already has
  `Contact CRM` (the relation then exists).
- A fix backlog that exists without `Customer to notify` gets it once this base exists, on the fix
  backlog's side: `ADD COLUMN "Customer to notify" RELATION('<crm data source id>')`.

## How it reads back

- In SQL the dates read as `"date:Last touch:start"` and `"date:Next step date:start"`;
  `Interactions` is a JSON array of page URLs.
- `Notes` and `Next step` are rich text: SQL returns them lossy. Fetch the page before relying on
  them.

## When the base already exists

Nothing is created. The base is fetched, compared with this schema, and the differences are reported.
Nothing changes without the owner's go.

## Source

The working base, read on 2026-10-06 (47 contacts).
