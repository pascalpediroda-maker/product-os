# Feedback & Insights: the schema

Copied from a working product's base, which works as it is. Only what belongs to that product was
left out: options that name its customers or its people, and relations to bases that are not OS
bases. French property names were put in English, like every OS base.

What people tell the team, and what the team sees them do: an interview, a client call, an onboarding
call, a support ticket, a chat message, a demo, a publication, a self-onboarding. One entry per event.
A meeting write-up is one entry: the write-up is the page body, the entry is linked to the contact and
to the opportunities it supports. A bug seen in it goes to the fix backlog, linked back.

`pos-setup` creates it (its Step 7) and writes its data source URL in `databases.feedback`.

## Properties

| Property | Type | Values |
|---|---|---|
| `Name` | title | the entry in one line |
| `Date` | date | when it was said or seen |
| `Type` | select | `🧪 Discovery`, `📞 Call Client`, `📞 Call Client onboarding`, `📧 Ticket Support / Mail`, `💬 Discord / Chat`, `Publication / Article`, `Message linkedin`, `Demo`, `self-onboarding` |
| `Persona` | select | the product's personas, from the owner at creation |
| `Verbatim` | text | the quote, word for word, in the language it was said |
| `Tags` | multi-select | `Onboarding`, `Testimony`, `Follow-up`, `Usage`, plus the product's own |
| `Team` | person | who in the team took part |
| `Contact CRM` | relation to the CRM, two-way, reverse `Interactions` | who said it |
| `Opportunities / Features` | relation to the roadmap, two-way, reverse `Feedback & Insights` | the opportunities this entry supports |
| `Fix backlog` | relation to the fix backlog, two-way, reverse `Source feedback` | the bugs filed from this entry |

A relation is created only toward a base that exists. A two-way relation is written once, from the
base created second: Notion adds the reverse property on the other one.

## The creation statement

The tool's own description in the session is the contract: read it first, follow it where it differs.

```sql
CREATE TABLE (
  "Name" TITLE,
  "Date" DATE,
  "Type" SELECT('🧪 Discovery':green, '📞 Call Client':orange, '📞 Call Client onboarding':yellow, '📧 Ticket Support / Mail':purple, '💬 Discord / Chat':pink, 'Publication / Article':brown, 'Message linkedin':gray, 'Demo':blue, 'self-onboarding':red),
  "Persona" SELECT(<the product's personas, each 'Name':color>),
  "Verbatim" RICH_TEXT,
  "Tags" MULTI_SELECT('Onboarding':brown, 'Testimony':red, 'Follow-up':orange, 'Usage':green),
  "Team" PEOPLE,
  "Contact CRM" RELATION('<crm data source id>', DUAL 'Interactions'),
  "Opportunities / Features" RELATION('<roadmap data source id>', DUAL 'Feedback & Insights'),
  "Fix backlog" RELATION('<fix backlog data source id>', DUAL 'Source feedback')
)
```

Drop a relation line when its base does not exist yet, or when that base already has the reverse
property (the relation then exists). A fix backlog created before this base gets its `Source feedback`
from the `Fix backlog` line.

## How it reads back

- In SQL the date reads as `"date:Date:start"`; `Tags` and the relations are JSON arrays (option
  names, page URLs).
- `Verbatim` and the page body are rich text: SQL returns them lossy. Fetch the page before relying
  on them.

## When the base already exists

Nothing is created. The base is fetched, compared with this schema, and the differences are reported.
Nothing changes without the owner's go.

## Source

The working base, read on 2026-10-06 (362 entries).
