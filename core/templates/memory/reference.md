# Template: reference file

Skeleton version 1, maintained by `pos-core`.

**Use.** Copy everything below the separation line into `<memory.dir>/reference_<topic>.md`, fill
it, add its line to `<memory.index>`, and list it under every zone of `routing.zones` that needs it.
The new file starts with its front matter and belongs entirely to the product. Everything above the
line is guidance, which an OS update may change.

## What this file is for

A reference is knowledge that sessions consult and that is **not** our internal architecture (that
goes to `archi-<subsystem>.md`). Five kinds:

| Kind | Holds | Example topics |
|---|---|---|
| `domain` | facts and definitions of the users' trade, from official sources | official definitions, the rules the judges apply, a regulation |
| `convention` | how this product does something in its stack | git workflow, deployment, logging, analytics events |
| `gotcha` | a trap of a tool, a provider or a platform, and its way out | a model provider's quirks, shell differences, a database pitfall |
| `rule` | a design rule our features must follow | quality rules for the product's AI, extraction rules, security rules |
| `catalog` | reusable patterns or a list to pick from | configuration patterns, reference test documents |

## How to write it

- **The rule or the fact first**, in a few lines: what a reader must do or know. The explanation
  follows.
- **Domain facts are quoted verbatim** from the official source, with the location and the version
  or date read. An official source beats a third-party guide. A figure without a source is marked
  "to verify". If the domain pivot (`pivots.domain`) already holds the fact, link to it instead of
  copying it.
- **Conventions and gotchas give the symptom, the cause, the fix, and the command that checks it.**
- **Incidents are kept as generic lessons**: what went wrong and the mechanism behind it, with no
  names, no client data and no personal data.
- **One fact, one place.** If another file states the same rule, keep it in one and link from the
  other.
- **Rewrite, don't append.** When the rule changes, replace the text and note what it replaced, with
  the date. Leaving the old procedure in a closing section, under a new rule stated at the top, gives
  the next reader two contradictory instructions.
- **Name the lock.** When a gate, a hook or a test enforces the rule, say which one.
- **Never link to the assistant's auto-memory.**

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

---
name: <Topic>
description: <What this file settles, in one sentence. Then when to read it, e.g. "Read before any git operation on the main branch.">
metadata:
  type: reference
  kind: <domain | convention | gotcha | rule | catalog>
  source: <official source, version, date read | internal, measured on YYYY-MM-DD>
  verified: <YYYY-MM-DD>
---

# <Topic>

**Verified on <YYYY-MM-DD>** against <source>.

## The rule

<!-- The rule or the fact, in a few lines. Imperative for a rule ("Never X. Always Y."), declarative
for a fact. If there are several, number them. -->

## Why

<!-- The reason: the mechanism that makes the rule necessary, or the incident as a generic lesson
(what went wrong, how it showed up). -->

## How to apply

<!-- Concrete steps, commands and checks, in the order a session uses them. -->

## Source

<!-- domain: verbatim quotes, each with its location (document, section, page) and version.
convention, gotcha, rule: where it was measured or decided, and when. -->

## Details

<!-- The body of the reference: definitions, cases, examples. For a catalog, a table with one row
per entry and the columns a reader filters on. -->

## Pitfalls

<!-- How this rule or fact gets misapplied, and how to detect it. -->

## Scope

<!-- What this file does not cover, and where that lives. -->

## Locked by

<!-- The gate, hook or test that enforces this rule, if any. "None" is a valid answer. -->

## Related

<!-- Links to other reference_* and archi-* files in memory.dir. Never to the assistant's
auto-memory. -->
