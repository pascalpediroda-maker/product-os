---
description: Non-regression for the 2026-10-03 field test. On a product that has its own CLAUDE.md, whose rule sends a deferred bug to a notes file, a bug the owner defers must still go to the fix backlog through the pos-fix-backlog skill, and the session must name the conflict with CLAUDE.md. Before the session-start rules digest existed, the OS rule never reached the context, the skill did not fire, and the bug went into the notes file.
tags: [support, pos-fix-backlog, host-claude-md, regression]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

A user reports that the CSV export breaks on files over 10 MB. I can't fix it now.
