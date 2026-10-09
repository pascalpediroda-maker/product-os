---
name: pos-guide
description: >
  Where the product is in its path, and which router to start the next session with. Shows the four
  routers (pos-build, pos-opportunity, pos-support, pos-gtm), what each loads and what each leads to,
  the path of a product (frame the app, build the V0.1, ship the V0.1, evolve, with go-to-market
  alongside), the step this product is at, read from its state, and the router that comes next.
  Reads and recommends; changes nothing. Use after pos-setup, or when someone asks "what can the OS
  do", "where do I start", "what next", "I don't see any skills or agents", "/pos-guide". An argument
  narrows it: `routers`, `build`, `opportunity`, `support`, `gtm`, `path`.
---

# Guide

The OS is used through routers: a session starts with the router of what it comes to do, which loads
only that use's pivot, memory and connectors, then shows what can be done from there. The product
moves along a path: frame the app, build the V0.1, ship it, then evolve it. This skill says where the
product is on that path and which router comes next.

## What the guide never does

- Write a file, change the config, spawn an agent, or connect a tool.
- Present a skill as usable when the session does not list it.
- Send a product with nothing built to `pos-domain`.

## Step 1: read

1. **The map,** [references/catalog.md](references/catalog.md), in full.
2. **The product config,** `.claude/product/product.config.json`: `product.*`, `modules.*`,
   `pivots.*`, `memory.*`, `databases.*`, `deploy.*`. No config: say `pos-setup` comes first, show
   section 1 of the map, stop.
3. **What this session can use:** the skills it lists (`pos-build` and `pos-core:pos-build` are the
   same), the agent types the Agent tool offers. A router the map names and the session does not
   list: give its plugin's install command (`claude plugin install <plugin>@product-os --scope
   project`) and say a new session is needed.
4. **The product's state,** cheap reads only, each with the path it was read from:
   - **framed:** a V0.1 scope written down (a PRD page in `databases.roadmap`, or a spec or framing
     file the memory index names);
   - **built:** application code and a database schema in the repository (migrations, a schema file,
     application routes and screens);
   - **shipped:** `deploy.*` filled and the deployed service answering, or the owner says it is
     live;
   - **in use:** entries in the feedback base or the fix backlog.

## Step 2: the step the product is at

Take the first line that applies.

| State | Step | Next router |
|---|---|---|
| no V0.1 scope written | 1. Frame the app | `/pos-opportunity`: `/pos-strategy` on the app, then `/pos-prd` for the V0.1 |
| framed, nothing built, or built partly | 2. Build the V0.1 | `/pos-build`: the data model and its access policies first |
| built, not shipped | 3. Ship the V0.1 | `/pos-build`: the first deployment, followed to green |
| shipped | 4. Evolve | the router of what the owner comes to do: `/pos-opportunity`, `/pos-support`, `/pos-build`; `/pos-gtm` alongside |

`/pos-gtm` runs alongside from step 1: when the GTM pivot is still the template, say so once.

## Step 3: present

In `product.team_language`. Status first, one line: where the product is and the router that comes
next. Then, short:

1. **The four routers:** the table of section 1 of the map, installed ones only, with what each
   loads.
2. **The path:** the four steps, the one the product is at marked, what "done" means for it.
3. **What the next router leads to:** its table from section 2 of the map. The other families only
   when asked (an argument, or "show me support").

Close on one recommendation answerable yes or no: "Start the next session with `/pos-<router>` for
<what>?". On yes, run that router in full from its own first step.

## Claims

- "Installed" means the session lists it.
- A state of the product is said from a file read in this session, with its path.
