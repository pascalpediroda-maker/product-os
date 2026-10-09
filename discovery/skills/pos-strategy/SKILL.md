---
name: pos-strategy
description: >
  Assess a market OPPORTUNITY or a product or business STRATEGY, and turn it into an actionable
  one-pager. Chain: Opportunity (Desirability x Defensibility x Viability) -> Diagnosis (Rumelt) ->
  Cascade (Playing to Win) -> Defensibility (7 Powers). Serves the product's own decisions (a product
  decision, a new vertical, positioning, an equity story, the framing of a whole new app) and product
  assessments of another asset (due diligence, preparing a strategy interview, challenging a vision).
  Use when someone says "assess this opportunity", "is this a good strategy", "where do we play, how
  do we win", "what is our moat, our defensibility", "challenge this vision", "prepare the strategy for
  X", "TAM", "wedge", "/pos-strategy".
---

# Strategy: assess an opportunity or a strategy, properly

A strategy toolbox. Four canonical lenses, wired together, that produce **one one-pager**. Not
everything is run every time: route by the question (Step 0).

Called by `pos-opportunity` when the subject is a whole new app: this skill runs on the whole app,
then `pos-prd` frames the V0.1 scope.

## What it produces

A one-pager: **Posture -> Opportunity (GO/NO-GO) -> Diagnosis and crux -> Cascade and must-be-true ->
7 Powers and risk -> decision**. No fluff, facts required, unknowns named.

---

## Step 0: framing, posture, routing (always)

1. **Subject:** what exactly (the product, a feature, a new vertical, a competitor, an asset under
   assessment)?
2. **Posture** by maturity:
   - **Design** (idea, pre-traction): we *make* the choices. The 7 Powers are a compass ("which Power
     am I architecting towards?"), not an audit.
   - **Assessment** (product-market fit, scale, mature): we *audit* what exists and (re)build the
     defensibility.
   - Anti-theatre rule: *match the tool to the evidence you have*. No heavy 7 Powers on a product
     without traction.
3. **Routing:**
   - The question **"is the opportunity worth it?"** (a new market, an expansion): start at Step 1 (the
     Opportunity gate), then 2, 3, 4 if GO.
   - The question **"does this strategy, this asset, hold?"** (challenging a vision, due diligence):
     you may skip Step 1 and start at the Diagnosis (Step 2).

---

## Step 1: Opportunity: Desirability x Defensibility x Viability (GO/NO-GO gate)

An opportunity is worth it only if **all three** hold. If one collapses: NO-GO or re-scope.

**1a. Desirability: JTBD and the opportunity score (ODI)**
List the users' jobs. For each: `Opportunity = Importance + max(0, Importance - Satisfaction)`.
A job that is important **and poorly served** is white space. An important job **already well
served** is table stakes, not an opportunity.
Output: a table Job | Importance | Satisfaction | Opportunity, and **the wedge** (the most underserved
job).

**1b. Defensibility: 5 Forces, and which of the 7 Powers we would build**
Is the wedge *protectable*? Barriers to entry, substitutes, buyer and supplier power. Above all:
**which of the 7 Powers** this wedge lets us build (often Cornered Resource or Process Power). If it
allows none: a red ocean, be wary.

**1c. Viability: size, willingness to pay, structure**
TAM and SAM (size **by geography** when the market is national or regulated), who pays, how much, how
often, fragmentation.

**Gate:** verdict **GO / NO-GO / RE-SCOPE** in one sentence, and the wedge kept.

---

## Step 2: Diagnosis (Rumelt)

The kernel is **Diagnosis -> Guiding policy -> Coherent actions**. Without all three, it is a wish.

- **Diagnosis:** name the **real obstacle** (two or three sentences, uncomfortable truths included).
- **Bad strategy detector:** fluff? do we avoid naming the obstacle? do we confuse goals and
  strategy? a list of 15 priorities (which is 0)?
- **Crux:** the single hardest element on which everything else depends.

---

## Step 3: Cascade (Playing to Win)

Five choices that **reinforce each other**:

1. **Winning aspiration** (a concrete, measurable success)
2. **Where to play** (segments, geographies, products, channels; **exclude** explicitly: "everybody"
   is no strategy)
3. **How to win** (the advantage: cost or differentiation; *the reason the customer chooses*, not a
   list of features)
4. **Capabilities** (three to five capabilities that reinforce each other)
5. **Management systems** (what builds and sustains those capabilities)

Then the **coherence test** (do the five align?), the **key tension** (what we bet on), and the
**must-be-true** (two or three conditions per choice: the strategic risks to watch, or to ask as
questions).

---

## Step 4: Defensibility (7 Powers)

For each of the 7, a table **Present (Y/N) | Strength (None, Weak, Medium, Strong) | Durability
(Fragile, Medium, Durable)**:

1. **Scale Economies:** unit costs fall with volume
2. **Network Economies:** value rises with the number of users (rare in data SaaS; often the gap to
   fill)
3. **Counter-Positioning:** a model the incumbent *does not want* to copy (it would sabotage itself);
   **the only attacker's Power**
4. **Switching Costs:** leaving costs or hurts the customer
5. **Branding:** we pay or trust for what the brand means
6. **Cornered Resource:** we *own* an exclusive asset (data, patent, talent, rights)
7. **Process Power:** we *do* things in a proprietary, tacit, accumulated way, hard to copy

Each Power is a **Benefit** (close to a USP) **and a Barrier** (close to a moat). Output: the real
Power(s), the one to **build**, the **combinations** that reinforce each other, and the
**counter-positioning risk** (who could do this to us?).
Reminder: **Cornered Resource = you own** (a stock); **Process Power = you do** (a flow).

---

## Output: the one-pager

```
SUBJECT: [name]            POSTURE: [Design | Assessment]

OPPORTUNITY (when applicable)
  Wedge: ...
  Desirability: ...  Defensibility: ...  Viability: ...
  -> GO / NO-GO / RE-SCOPE

DIAGNOSIS (Rumelt)
  Real obstacle: ...
  Bad-strategy tells: ...
  CRUX: ...

CASCADE (Playing to Win)
  Aspiration / Where to play / How to win / Capabilities / Management systems
  Key tension: ...
  Must-be-true (risks, questions): ...

DEFENSIBILITY (7 Powers)
  [7-row table]  ->  Real Power: ...  Power to build: ...  Counter-positioning risk: ...

DECISION / NEXT STEP: one sentence.
```

---

## Guardrails

- **No fluff.** Every claim is a fact or a named unknown. Never jargon that hides emptiness.
- **Demand the facts:** when a figure is missing (TAM, revenue split, satisfaction), say so and mark
  it "to confirm"; never invent it.
- **15 priorities = 0.** Force the choice and the exclusion.
- **Match the tool to the evidence:** an honest Design or Assessment posture.
- **The crux first.** If we cannot name the hardest element, the diagnosis is not finished.
- Output in **the language of the context:** `product.team_language` by default; the language of the
  reader when the deliverable is for a customer or a sponsor.
