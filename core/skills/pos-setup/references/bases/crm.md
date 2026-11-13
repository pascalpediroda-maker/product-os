# CRM: the schema

Copied from a working product's base, which works as it is. Only what belongs to that product was
left out: options that name its customers, its referrers, its owner or its domain, and a relation to a
sales actions base that is not an OS base. French property names were put in English, like every OS
base. The relation to the campaigns base is created from the campaigns base's side (the GTM module),
so it has no line here.

One entry per contact. The feedback base points to it (who said it); the fix backlog points to it
(who to tell when their bug is fixed). It holds personal data: names live in entries, never in the
schema.

`pos-setup` creates it (its Step 7) and writes its data source URL in `databases.crm`.

## Properties

| Property | Type | Values |
|---|---|---|
| `Name` | title | the contact's name |
| `Org` | text | the contact's organisation |
| `Country` | text | the contact's country |
| `Email` | email | |
| `LinkedIn` | url | the contact's LinkedIn profile |
| `Connected on LinkedIn` | checkbox | the contact is a LinkedIn connection of the owner |
| `Contact mode` | select | how this person is contacted: `1:1 owner` (only the owner writes to them, by hand: never in a sequence or an automatic action), `Sequence`, `Do not contact` |
| `Ready message` | text | a one-to-one message (LinkedIn or mail) ready for the owner to copy; emptied once sent |
| `Status` | select | `Lead`, `Prospect`, `In demo`, `In trial`, `Active`, `Client`, `Cold`, `Churn`, `Lost/dropped` |
| `Motion` | select | the product's sales motions, from the owner at creation |
| `Source` | select | `LinkedIn`, `Inbound`, `SERP`, `Other`, plus the product's own (a referral, an event, an import) |
| `Persona` | select | the product's personas, from the owner at creation |
| `Target tier` | select | the product's plans, from the owner at creation |
| `Last touch` | date | the last exchange |
| `Next step` | text | the next action |
| `Next step date` | date | when it is due |
| `Notes` | text | |
| `Owner` | person | who in the team follows the contact |
| `Tags` | multi-select | the product's own tags, from the owner when needed (for example, the users of a former product, to treat them apart) |
| `Interactions` | relation to the feedback base, two-way, reverse `Contact CRM` | every feedback entry from this contact |

## The creation statement

The tool's own description in the session is the contract: read it first, follow it where it differs.

```sql
CREATE TABLE (
  "Name" TITLE,
  "Org" RICH_TEXT,
  "Country" RICH_TEXT,
  "Email" EMAIL,
  "LinkedIn" URL,
  "Connected on LinkedIn" CHECKBOX COMMENT 'A LinkedIn connection of the owner',
  "Contact mode" SELECT('1:1 owner':purple, 'Sequence':blue, 'Do not contact':red) COMMENT 'How this person is contacted. 1:1 owner = never in a sequence or an automatic action',
  "Ready message" RICH_TEXT COMMENT 'One-to-one message ready for the owner to copy (LinkedIn or mail). Emptied once sent',
  "Status" SELECT('Lead':gray, 'Prospect':blue, 'In demo':orange, 'In trial':yellow, 'Active':green, 'Client':green, 'Cold':default, 'Churn':red, 'Lost/dropped':red),
  "Motion" SELECT(<the product's sales motions, each 'Name':color>),
  "Source" SELECT('LinkedIn':orange, 'Inbound':green, 'SERP':brown, 'Other':default),
  "Persona" SELECT(<the product's personas, each 'Name':color>),
  "Target tier" SELECT(<the product's plans, each 'Name':color>),
  "Last touch" DATE,
  "Next step" RICH_TEXT,
  "Next step date" DATE,
  "Notes" RICH_TEXT,
  "Owner" PEOPLE,
  "Tags" MULTI_SELECT(),
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
- `Notes`, `Next step` and `Ready message` are rich text: SQL returns them lossy. Fetch the page
  before relying on them.
- `Connected on LinkedIn` reads `"__YES__"` or `"__NO__"`.
- **`Contact mode` is the one place a one-to-one contact is marked.** A skill that adds a contact to a
  sequence or to any automatic action filters out `1:1 owner` and `Do not contact`; one never writes
  the mark in `Notes` instead.

## When the base already exists

Nothing is created. The base is fetched, compared with this schema, and the differences are reported.
Nothing changes without the owner's go.

A base created by an earlier version of this schema lacks `Country`, `LinkedIn`,
`Connected on LinkedIn`, `Contact mode`, `Ready message` and `Tags`, and may hold `Org` as a select.
The missing properties are reported with the other differences and, on the owner's go, added with
one `ADD COLUMN` each, as in the creation statement. An existing `Org` select stays as it is (a
type change would rewrite every entry): said, never changed without the owner asking. No entry is
backfilled; a one-to-one mark found in an entry's `Notes` is moved to `Contact mode` only when the
owner asks. Its `Status` may hold `Lost` where this schema says `Lost/dropped`: the option is never
renamed (renaming a select option in Notion clears it from every entry that carried it); the skills
read either name as the same status.

## Source

The working base, read on 2026-10-06 (47 contacts); its new properties (`Country`, `LinkedIn`,
`Connected on LinkedIn`, `Contact mode`, `Ready message`, `Tags`, `Org` as text) re-read on
2026-11-13.
