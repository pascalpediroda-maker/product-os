---
name: pos-guide
description: >
  The tour of the product OS for the product in front of it: which skill to start a session with
  depending on the situation, what each of those skills calls (skills and agents), the agents grouped
  by trade, and where to begin (the domain first, start small and see, or foundations first), with one
  recommendation drawn from the product's state. Shows what is installed and usable now, and what is
  planned and not built, never the second as the first. Reads and recommends; changes nothing. Use
  after `pos-setup`, when someone asks "what can the OS do", "which skills are there", "where are the
  agents", "I don't see any skills or agents", "where do I start", "what next", "/pos-guide". An argument
  narrows it to one part: `start`, `skills`, `agents` or `begin`.
---

# Guide

A plugin's skills and agents are loaded from the plugin, not copied into the product's `.claude`
folders, so a person who opens those folders sees nothing and concludes nothing is there. And a list of
twenty names says nothing about which one to type on Monday morning. This skill answers both: what
there is, and what to do first, for this product.

What the guide guarantees:

- **Only what is installed is offered as usable.** A planned skill or agent is shown as planned, with
  the module that will bring it.
- **What it says about this product was read in this session:** the config, the session's own lists of
  skills and agents, the files it names. Nothing from memory.
- **It ends on one recommendation** the owner answers with yes or no.

## What the guide never does

- Write a file, change the config, spawn an agent, or connect a tool.
- Present a planned skill as something to run, or do a planned skill's work in its place
  (principle 10).
- Copy the catalog whole into the answer. It picks what fits the product.

---

## Step 1: read

1. **The catalog,** [references/catalog.md](references/catalog.md), in full.
2. **The product config,** `.claude/product/product.config.json`, if it exists: `product.name`,
   `product.team_language`, `modules.*`, `pivots.*`, `memory.*`, `databases.*`.
   - **No config:** the OS is installed but not set up. Say so in one line, recommend `pos-setup`, and show
     only part 1 of Step 3 (the entry points), marked "after setup".
3. **What this session can use,** from the session itself, not from files:
   - the skills it lists, matched to the catalog by name (`pos-setup` and `pos-core:pos-setup` are the
     same skill);
   - the agent types the Agent tool offers.

   A skill the catalog marks installed and the session does not list: its plugin is not installed, or
   the session started before it was. Give the install command (`claude plugin install
   <plugin>@product-os --scope project`) and say a new session is needed. Never call it usable.
4. **The product's state,** cheap reads only, enough to recommend a way in:
   - **the domain pivot** (`<pivots.dir>/<pivots.domain>`): below its separation line, is there content
     beyond the template's guidance comments?
   - **architecture memory:** do the files `memory.always` names exist in `memory.dir`?
   - **code:** does the repository hold application code (a `package.json` with dependencies, a source
     folder)?
   - **a design system written down:** a design system file in memory or the pivots, or a design system
     folder in the repository;
   - **the fix backlog:** is `databases.fix_backlog` set?

## Step 2: choose the recommendation

Take the first line that applies.

| The product's state | Recommend | Why, in one sentence |
|---|---|---|
| no config | `pos-setup` | nothing else works before the config exists |
| the domain pivot is still the template | **the domain first**: `pos-domain` on the unit the product already serves | every later skill reads the domain; written once, it stops sessions guessing the trade |
| Discovery, Design and Delivery installed | **start small and see**: two or three real signals, then `pos-opportunity` | the owner learns the OS on a real result |
| Delivery or Design installed, code started without architecture memory or without a design system | **foundations first**: the data model (Delivery) or the design system (Design), whichever is missing | building on an unwritten model or interface multiplies rework |
| none of the above | what is usable now (the domain for another unit, `pos-fix-backlog`, `pos-bug-kill`), and which module would open each way in that is not available | say what is missing, do not fill it |

When a way in needs a module that is not installed, say which one. When that module is planned and not
built, say so: there is nothing to install yet.

## Step 3: present

In `product.team_language` (the owner's language when there is no config). Status first: one line on
what is installed and usable now. Then the four parts below, short, in this order. An argument shows
only its part: `start` part 1, `skills` part 2, `agents` part 3, `begin` part 4. Write each skill as
the session lists it (with its plugin prefix when the session shows one).

1. **Starting a session.** The catalog's section 1, the installed entries only, as a table: situation,
   skill. Then one line: "Planned: `pos-opportunity` and `pos-meeting-notes` (Discovery), `pos-prd` (Design),
   `pos-dev` (Delivery), ..." from the planned rows.
2. **What each skill calls.** For each installed entry skill: the skills it calls and the agents it
   spawns, one line each, from the catalog's section 2. Then one sentence: agents are never typed; the
   skill that needs one spawns it, and `/agents` lists them.
3. **The agents, by trade.** The installed agents, grouped by trade, one line each: what it does, which
   skill calls it. The planned trades in one line each, with their module.
4. **Where to begin.** The three ways in, each with "available now" or "needs <module>, planned", then
   the recommendation of Step 2 with its reason, as one question answerable yes or no.

Close on that question, nothing after it.

## Step 4: on the answer

- **Yes:** follow the recommended skill in full, from its own first step. The guide's part is done.
- **Another way in:** if it is available, follow its first skill in full; if it needs a module that is
  not installed or not built, say so and offer what is usable now.
- **No, or no answer:** nothing. The guide changed nothing.

## Claims

- "Installed" means the session lists it, not that the catalog says so.
- "Planned" is said as planned: no date, no promise of what it will do beyond the catalog's line.
- A state of the product (pivot empty, memory missing, code present) is said from a file read in this
  session, with its path.
