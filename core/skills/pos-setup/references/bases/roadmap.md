# Roadmap: the schema

Copied from a working product's base, which works as it is. Only what belongs to that product was
left out: options that name its customers or its domain, and a relation to a legacy base. French
property names were put in English, like every OS base.

One entry per opportunity, from the problem to the release. `Status` says how far it has gone
through FO(E)CUSED; the phases themselves are sections of the page body, whose template comes with the
Discovery module.

`pos-setup` creates it (its Step 7) and writes its data source URL in `databases.roadmap`.

## Properties

| Property | Type | Values |
|---|---|---|
| `Name` | title | the opportunity, then the feature once a solution is chosen |
| `Status` | select | `Unqualified`, `Discovery`, `Solutioning / Featuring`, `Ready for development`, `Under Development`, `Released`, `Dropped` |
| `Priority` | select | `NOW`, `NEXT`, `LATER`, `DONE` |
| `Area` | select | the product's areas, from the owner at creation |
| `Theme` | select | the product's themes, from the owner at creation |
| `T-shirt size` | select | `XXXS < 1 H`, `XXS < 2 h`, `XS <= 0.5 d`, `S <= 1d`, `M 1-2d`, `L 3-5d`, `XL 6 - 10d`, `XXL 11-20 d` |
| `Labels` | multi-select | `strategic`, `Deal breaker`, `Game changer`, `More activation`, `More use`, `Saved time`, `efficiency`, `Better collaboration`, `Better compliance`, `onboarding`, `signup`, `customer care`, `NFR`, `Legal`, `MAU`, `CRUD`, plus the product's own |
| `Users` | multi-select | the users who asked for it; options are added as they come |
| `Parent item`, `Sub-item` | relation to the roadmap itself, one parent | added once the base exists (below) |
| `Feedback & Insights` | relation to the feedback base, two-way, reverse `Opportunities / Features` | the feedback that supports it |

## The creation statement

The tool's own description in the session is the contract: read it first, follow it where it differs.

```sql
CREATE TABLE (
  "Name" TITLE,
  "Status" SELECT('Unqualified':default, 'Discovery':orange, 'Solutioning / Featuring':blue, 'Ready for development':brown, 'Under Development':green, 'Released':gray, 'Dropped':red),
  "Priority" SELECT('NOW':green, 'NEXT':yellow, 'LATER':gray, 'DONE':brown),
  "Area" SELECT(<the product's areas, each 'Name':color>),
  "Theme" SELECT(<the product's themes, each 'Name':color>),
  "T-shirt size" SELECT('XXXS < 1 H':green, 'XXS < 2 h':pink, 'XS <= 0.5 d':yellow, 'S <= 1d':blue, 'M 1-2d':purple, 'L 3-5d':brown, 'XL 6 - 10d':orange, 'XXL 11-20 d':red),
  "Labels" MULTI_SELECT('strategic':pink, 'Deal breaker':red, 'Game changer':blue, 'More activation':pink, 'More use':green, 'Saved time':yellow, 'efficiency':purple, 'Better collaboration':orange, 'Better compliance':gray, 'onboarding':brown, 'signup':gray, 'customer care':red, 'NFR':orange, 'Legal':yellow, 'MAU':yellow, 'CRUD':green),
  "Users" MULTI_SELECT(),
  "Feedback & Insights" RELATION('<feedback data source id>', DUAL 'Opportunities / Features')
)
```

- Drop the `Feedback & Insights` line when the feedback base does not exist yet, or already has
  `Opportunities / Features` (the relation then exists).
- Then the parent and sub-items, with the base's own data source ID:
  `ADD COLUMN "Parent item" RELATION('<roadmap data source id>', DUAL 'Sub-item')`. Turn on sub-items
  in the views, in Notion.

## How it reads back

- In SQL, `Labels`, `Users` and the relations are JSON arrays.
- Saved views are not applied in SQL: put their filters in `WHERE`.
- The page body is rich text: fetch the page before relying on it.

## When the base already exists

Nothing is created. The base is fetched, compared with this schema, and the differences are reported.
Nothing changes without the owner's go.

## Source

The working base, read on 2026-10-06 (145 entries), with its FO(E)CUSED page template.
