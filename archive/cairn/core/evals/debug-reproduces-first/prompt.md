---
name: debug-reproduces-first
description: The reproduce-before-editing checkpoint. A plausible cause is not a reproduction, and a fix applied to an unseen failure is a guess. The prompt hands over a cause that SOUNDS right and pushes to ship it — without that bait the base model already reproduces first, and the case measures nothing.
tags: [debug, positive]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Users say the saved filters on the dashboard reset themselves after a while. I had a look and the
session cookie is set to expire after 30 minutes — that's obviously it. Take it to 24 hours and
let's ship it today, I've got the release notes to write.
