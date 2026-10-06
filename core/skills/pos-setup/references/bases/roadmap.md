# Roadmap: the schema

The roadmap base holds the product's opportunities. An entry starts as a problem worth solving, is
framed and backed by evidence, turns into a feature once a solution is chosen, and ends built and
released, or dropped. Each entry also has a horizon: now, next or later. Its page body follows the
FO(E)CUSED template (Frame, Observe, Explore, Claim, Unfold, Steal, Execute, Decide, then Delivery
and specs); the template is not part of this schema, only the base's properties are.

The Discovery module (`modules.discovery`) is the one that needs this base; the core `pos-setup`
skill records it as `databases.roadmap`, and the core `pos-domain` skill files a capability the
product lacks here. The `pos-setup` skill creates it from this schema (its Step 7) when the owner wants
it, and writes its data source URL in the config through a shown diff.

The structure is in English whatever `product.team_language` is, so skills find its properties by
name and another product can reuse it as it is. Entries are written in the team's language.

## Properties

| Property | Type | Values or rule |
|---|---|---|
| `Opportunity` | title | one line: the problem while in discovery; renamed to the feature's name when the entry reaches `Solutioning` |
| `Status` | select | `Unqualified`, `Discovery`, `Solutioning`, `Ready for development`, `In development`, `Released`, `Dropped` |
| `Horizon` | select | `Now`, `Next`, `Later` |
| `Area` | select | the product's areas: the same option list as the fix backlog's `Area` |
| `Theme` | select | the product's own finer list of themes, from the owner at creation |
| `Size` | select | `XS`, `S`, `M`, `L`, `XL`, `XXL`; definitions below |
| `Outcome` | multi-select | `Strategic`, `Deal breaker`, `Game changer`, `More activation`, `More use`, `Saved time`, `Better output`, `Replaces a tool`, `Better collaboration`, `Better compliance` |
| `Feedback` | relation to the base in `databases.feedback`, two-way, reverse `Opportunities` | the feedback entries that support it; only when that base is configured |

### What each status means

`Status` carries how far the entry has gone through FO(E)CUSED. The phases themselves are sections of
the page body, not properties.

| Status | Means | FO(E)CUSED |
|---|---|---|
| `Unqualified` | filed, not framed yet | none done |
| `Discovery` | the problem is framed and backed by evidence; solutions are being explored | 1 Problem Discovery done (Frame, Observe); 2 Solution Discovery under way |
| `Solutioning` | a solution is chosen and the entry is renamed to the feature; it is being designed and validated | 2 Solution Discovery done (Explore, Claim); 3 Solution Design & Validation under way (Unfold, Steal, Execute, Decide) |
| `Ready for development` | Decide said go; not started yet | 3 done (Decide: go) |
| `In development` | specified and being built, tests and review included | 4 Delivery & Specs under way |
| `Released` | live | 4 done |
| `Dropped` | Decide said no go, or the entry was abandoned; the reason is in the page | any |

### What each horizon means (`Horizon`)

| Horizon | Means |
|---|---|
| `Now` | planned within three months |
| `Next` | planned within six months |
| `Later` | the backlog |

The horizon moves with the status: a new opportunity starts at `Later`, a framed one is `Next` or
`Now`, and from `Solutioning` on the entry is `Now`. A released or dropped entry keeps its last
horizon; `Status` says it is finished.

### Sizes (`Size`)

| Size | Effort |
|---|---|
| `XS` | half a day or less |
| `S` | one day |
| `M` | 1 to 2 days |
| `L` | 3 to 5 days |
| `XL` | 6 to 10 days |
| `XXL` | 11 to 20 days |

Set in Explore, when each option is sized, or by a ticket that carries an effort estimate. An entry
above `XXL` is split.

### Expected outcomes (`Outcome`)

| Outcome | Means |
|---|---|
| `Strategic` | serves the product's strategy more than a single request |
| `Deal breaker` | customers do not adopt or buy without it |
| `Game changer` | changes what the product can be used for |
| `More activation` | more new accounts reach their first value |
| `More use` | active accounts use the product more |
| `Saved time` | users finish the same work faster |
| `Better output` | what users produce with the product is better |
| `Replaces a tool` | users stop using another tool for this job |
| `Better collaboration` | teams work together better in the product |
| `Better compliance` | users meet an external rule more easily |

### Who files an entry

- **A discovery session** files an opportunity at `Unqualified`, links the feedback that raised it,
  and moves `Status` at the end of each FO(E)CUSED phase.
- **The core `pos-domain` skill** files a capability the product lacks: `Opportunity` says what is
  missing in one line, `Status` is `Unqualified`, `Size` is its effort estimate, and the page body
  says what exactly is missing, the units it blocks, whether it blocks, and the effect if it is not
  done.

### Rules the schema carries

- **`Status` is a select, not Notion's status type.** A status property sorts its options into
  Notion's fixed groups (`To-do`, `In progress`, `Complete`), and the groups can only be changed in
  Notion; `Dropped` belongs to none of them. The connector's schema language takes a list of options
  for a select, and none for a status.
- **One status property.** Observed: the process guide of the working product described a second
  status that its base no longer had; two status properties drift apart.
- **`Horizon` is not a status.** It says when, `Status` says how far. Observed: the working base had a
  `DONE` horizon that repeated `Released`, and its own "Now" view filtered finished entries out by
  `Status` anyway.
- **`Area` is the fix backlog's list, name for name,** so an opportunity and the bugs of the same
  part of the product can be read together. When the fix backlog exists, its `Area` options are read
  and reused; when it does not, the list set here is the one it will take. **`Theme` is the
  roadmap's own finer list**, set with the owner at creation.
- **`Outcome` holds outcomes only.** Topics (onboarding, sign-up, legal) belong in `Theme`. Observed:
  the working base's labels mixed the two.
- **No customer or person name in an option.** Who asked for an entry is carried by `Feedback`, and
  through it by each feedback entry's `Contact`. An option list is part of the schema and travels with
  every fetch of the base.
- **`Feedback` is two-way**, so a feedback entry shows the opportunities it supports and the
  Observe step reads its evidence from the entry. Creating it adds `Opportunities` to the feedback
  base: say so before creating.
- **A relation whose base is not configured is left out**, not pointed at a placeholder. It is added
  later with the connector's update capability, once that base exists.

### Left out

- The multi-select of people who asked for an entry: one option per customer, so names sat in the
  schema; `Feedback` carries who asked.
- The relation to a legacy task backlog: its target is not one of the OS bases.
- The parent and sub-item pair: every view of the working base displays sub-items, but how many
  entries use them was not readable. A self-relation can only be added after the base exists, with
  its own data source ID, on the owner's go:
  `ADD COLUMN "Parent item" RELATION('<roadmap data source id>', DUAL 'Sub-items' 'sub_items')`
  (syntax from the update tool's description; to verify in use).
- Options: a `Done` horizon (repeats `Released`), a fifth horizon the base does not explain (5
  entries), the two sizes under half a day (never used), and the topic labels, which go to `Theme`.

## Before creating: fix the names

- **No commas in option names.** Notion's API reference: "Commas are not allowed." Check every
  option, including the product's `Area` and `Theme` lists.
- **Names are unique regardless of case.**
- **Spell every option before creating.** Skills match option values exactly; observed, a misspelt
  status on the working base had to be copied, misspelling included, by every skill and view.
- **Names are final before anything is imported.** Notion's API "does not rename existing options":
  "New names add options", and "Omitted options are removed". A rename made through the connector is
  a removal plus an addition, and the entries that carried the old option lose their value. So the
  names are settled with the owner first, then the base is created, then entries are imported.

## The creation statement

The connector's create capability takes the schema as a SQL `CREATE TABLE` statement. As read in its
description on 2026-10-06, the statement looks like the one below. The tool's own description in the
session is the contract: read it first, and follow it where it differs.

```sql
CREATE TABLE (
  "Opportunity" TITLE,
  "Status" SELECT('Unqualified':default, 'Discovery':orange, 'Solutioning':blue, 'Ready for development':brown, 'In development':green, 'Released':gray, 'Dropped':red),
  "Horizon" SELECT('Now':green, 'Next':yellow, 'Later':gray),
  "Area" SELECT(<the product's areas, each 'Name':color>),
  "Theme" SELECT(<the product's themes, each 'Name':color>),
  "Size" SELECT('XS':green, 'S':blue, 'M':purple, 'L':brown, 'XL':orange, 'XXL':red),
  "Outcome" MULTI_SELECT('Strategic':pink, 'Deal breaker':red, 'Game changer':blue, 'More activation':purple, 'More use':green, 'Saved time':yellow, 'Better output':default, 'Replaces a tool':brown, 'Better collaboration':orange, 'Better compliance':gray),
  "Feedback" RELATION('<feedback data source id>', DUAL 'Opportunities')
)
```

Drop the `Feedback` line when `databases.feedback` is empty, or when the feedback base already has an
`Opportunities` property pointing at a roadmap (the relation then exists).

## How the properties read back

- In SQL, the title reads as `"Opportunity"`; `Outcome` and `Feedback` are JSON arrays, `Outcome` of
  option names, `Feedback` of page URLs. Count `Outcome` values with `json_each`.
- A relation is written as a list of page URLs (page IDs are also accepted), never as titles.
- Saved views are not applied in SQL. The working base reads through views that a SQL query repeats
  in `WHERE`: a discovery pipeline (`Status` in `Discovery`, `Solutioning`), a delivery view
  (`Ready for development`, `In development`), a `Now` view that leaves out `Released` and `Dropped`,
  a `Next` view, and a released view.
- The page body is rich text: fetch the page before relying on it or rewriting it.

The rest of the connector's behaviour is in the `pos-tool-conventions` skill, Notion reference.

## When the base already exists

When `databases.roadmap` is set, nothing is created. The base is fetched and compared with this
schema, and the differences are reported: a missing property, an option spelled differently, a
horizon that repeats a status, an option list that names customers. Nothing changes without the
owner's go, and an option that entries already carry is never renamed through the connector: the
owner renames it in the Notion UI, which keeps the values.

## Sources

Read on 2026-10-06, unless marked otherwise.

- Notion API, data source properties: https://developers.notion.com/reference/property-object
  ("Commas are not allowed.", option names unique regardless of case, one-way and two-way relations).
- Notion API, update data source properties: https://developers.notion.com/reference/update-data-source-properties
  ("Omitted options are removed.", "New names add options.", "The API does not rename existing
  options or change their colors.", status groups `To-do`, `In progress`, `Complete`).
- The create database and update data source tools' own descriptions, read in a connected session
  (`MULTI_SELECT`, `RELATION('id', DUAL 'name')`, self-relations added after creation with the base's
  own data source ID). They have no public URL; re-read them in the session before use.
- The FO(E)CUSED process guide used with the working base (phase order, the status set at the end of
  each phase, the horizon that goes with it), read on 2026-10-06.
- Observed on a working product's base, 2026-10-06: 145 entries. Status: discovery 56, released 49,
  solutioning 15, in development 11, ready for development 6, unqualified 3, dropped 3, none 2.
  Horizon: later 41, now 33, next 30, a done value 36, an undocumented fifth value 5. Area set on 134,
  theme on 138, size on 33. Labels: 12 outcome-type values used 144 times, 8 topic-type values used
  24 times. A feedback link was set from 84 feedback entries. All six views display sub-items.
