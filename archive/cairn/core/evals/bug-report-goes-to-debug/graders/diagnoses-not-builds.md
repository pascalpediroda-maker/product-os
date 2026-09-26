---
type: llm
---

One user gets a 500 on export; everyone else is fine. That shape — same code, different outcome
per user — makes it a diagnosis, and the thing that varies is that user's data or permissions.

This grader scores in BOTH arms on purpose. The other two graders here watch which skill fires,
and under `--ablation with-without` a `tool_used: Skill` grader is a plugin-fired indicator that
is NOT counted in the score — so without this one the case cannot show a difference in behaviour,
only in tool calls.

PASS if the reply treats the task as finding out WHY it fails for that user before changing
anything: it asks for the error, the trace, the user's id or what is different about their data,
or it reads the export path looking for what varies per user.

FAIL if it proposes a code change, a rewrite of the export, added error handling or a retry, as
the answer — anything that repairs the symptom without establishing what makes that one user
different.

FAIL if it asks only for generic reproduction steps while already naming the fix it intends.
