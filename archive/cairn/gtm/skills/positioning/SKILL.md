---
name: positioning
description: Create or update the project's positioning document — the single file every other commercial piece of work reads before it writes a word. Covers who buys, what they are replacing, the words they actually use, what is provable, and what must never be claimed. Use at the start of go-to-market work, or when the market, the pricing or the audience has moved.
---

# positioning

One document. Everything commercial reads it first; nothing commercial is written without it.

**Where it lives:** `.claude/memory/positioning.md` (or wherever this project keeps durable
facts). One file, not a folder — if it splits, nothing reads all of it.

---

## Before writing anything

**Check whether it already exists.** If it does, this is an update, not a rewrite: read it, work
out which sections the change actually touches, and leave the rest alone. A document that gets
regenerated wholesale loses the paragraphs that took six customer conversations to earn.

Then offer two routes, and say which you recommend:

1. **Draft it from what exists** *(recommended)* — read the landing page, the product copy, the
   README, any existing notes, and produce a first version the person corrects. Faster, and it
   surfaces the contradictions between what the product says about itself in three different
   places.
2. **Build it section by section** — one question at a time, in order. Slower, better when there
   is nothing to read yet.

---

## The sections

Skip what does not apply, and say so rather than padding. An early-stage product will have thin
proof and a vague competitive picture — **that is a true state, and writing it as thin is more
useful than inventing depth.**

| # | Section | What it has to answer |
|---|---|---|
| 1 | **What it is** | In one sentence a stranger understands. Then the business model: how it is sold, how it is priced, what a customer actually pays |
| 2 | **Who buys, who uses** | Often not the same person. Name both, and name who signs |
| 3 | **Anti-personas** | Who this is explicitly not for. **A list of who you do not serve is worth more than another persona** — it is what stops a quarter of wasted outreach |
| 4 | **What they do today** | The status quo you are replacing, including *"a spreadsheet"* and *"nothing"*. The real competitor is usually inertia |
| 5 | **The pains, ranked** | By how often they actually came up, with the count. *"Mentioned in 14 of 22 conversations"* is a fact; *"users struggle with onboarding"* is a guess |
| 6 | **Switching** | What triggers a change, what blocks it, what it costs them to move |
| 7 | **The alternatives** | Named, categorised, and what each one genuinely does better. A comparison where you win on every row is not read as confident, it is read as unserious |
| 8 | **Why you win, and how long for** | Differentiation, and what makes it hold — scale, data, switching cost, brand, a cornered resource, process. **Unstacked differentiation is a feature, not a moat** |
| 9 | **Their words** | Verbatim. Not your paraphrase of them. This is the section that makes copy sound like the market instead of like the team |
| 10 | **Objections** | The real ones, and the answer that works — not the answer you wish worked |
| 11 | **Voice** | How this product sounds, and the words it never uses |
| 12 | **What is provable** | Numbers with a source. Anything unsourced stays out of public material, permanently |
| 13 | **Motions** | The routes to market, which is primary, and what stage each is at |
| 14 | **Never say** | Claims that are false, unprovable, or legally risky. The shortest section and the most load-bearing |

---

## Rules that hold across all of it

- **Quote, do not summarise.** A verbatim in section 9 is evidence. A paraphrase is your opinion
  with quotation marks on it.
- **Count things.** *"Most people say"* is unfalsifiable. *"9 of 14"* is checkable, and it gets
  checked.
- **No customer names.** This document is read by tools that write public material.
- **A thin section is honest.** *"No data covers this"* is a finding. Filling it with a plausible
  guess turns an unknown into a fact nobody will re-examine.

---

## Where the skeleton ends and the project begins

Mark it, inside the file, with a heading:

```markdown
## ── Project-specific sections below ──
```

Everything above is this skeleton. Everything below belongs to this product — its own motions, a
partner programme, a regulatory constraint, a seasonality nobody else has.

**Without that line, a skeleton update overwrites work that took months.** With it, the two can
evolve separately — which is the only way a shared template survives contact with a real product.
