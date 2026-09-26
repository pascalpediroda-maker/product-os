---
name: bug-report-goes-to-debug
description: A report of something already broken must not be routed to the build workflow. The two skills sit next to each other and this is the boundary that matters.
tags: [debug, implement, boundary]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

The export button on the reports page returns a 500 for one of our users, but it works fine for
everyone else. Can you sort it out?
