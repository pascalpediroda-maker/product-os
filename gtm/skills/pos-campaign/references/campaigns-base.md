# Campaigns base: the schema

Copied from a working product's base, which works as it is. Only what belongs to that product was
left out: the sending tool's name in a property name, and French property names, put in English like
every OS base.

One entry per send (a campaign of the sending tool). The people live in the CRM (`databases.crm`),
related by `Contacts`. Updated at each follow-up point: the sending tool's figures, plus the replies
read in the mailbox.

It is a GTM-only base: `pos-campaign` creates it on the owner's go, the first time a campaign is sent
and the pivot names none, and writes its data source URL in the GTM pivot's appendix "Canonical
sources".

## Properties

| Property | Type | Values |
|---|---|---|
| `Name` | title | the campaign: the persona, the batch, the date |
| `Send date` | date | |
| `Sending tool ID` | text | the campaign's ID in the sending tool |
| `Send sheet` | url | the sheet the sending tool used for this send |
| `Sent` | number | read in the sending tool's API, never counted by hand |
| `Opens` | number | |
| `Clicks` | number | |
| `Replies` | number | human replies read in the mailbox (a sending tool's reply counter undercounts) |
| `Bounces` | number | from the sending tool's reports, which see bounces the mailbox does not |
| `Notes` | text | |
| `Contacts` | relation to the CRM, two-way, reverse `Campaigns` | every person of the send |
| `GTM actions` | relation to the GTM actions base | only when the pivot names one |

## The creation statement

The tool's own description in the session is the contract: read it first, follow it where it differs.

```sql
CREATE TABLE (
  "Name" TITLE,
  "Send date" DATE,
  "Sending tool ID" RICH_TEXT,
  "Send sheet" URL,
  "Sent" NUMBER,
  "Opens" NUMBER,
  "Clicks" NUMBER,
  "Replies" NUMBER,
  "Bounces" NUMBER,
  "Notes" RICH_TEXT,
  "Contacts" RELATION('<crm data source id>', DUAL 'Campaigns')
)
```

- Add `"GTM actions" RELATION('<gtm actions data source id>')` when the pivot names a GTM actions
  base.
- Nothing is created without the owner's go, and nothing changes on an existing base without it.

## How it reads back

- In SQL the date reads as `"date:Send date:start"`; `Contacts` is a JSON array of page URLs.

## Source

The working base, read on 2026-11-13.
