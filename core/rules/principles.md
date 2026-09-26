# Working principles

A short list of principles that every skill of the OS follows, then the thesis that makes rules
hold: the rungs. The detailed rules between the owner and the assistant are in `collaboration.md`;
they are not repeated here.

## Principles

1. **The main session orchestrates.** A lead launched as a sub-agent stalls or blocks. The session
   that holds the conversation holds the plan: it splits the work, writes the briefs, reviews each
   delivery and reports. Agents apply a design; they do not decide the architecture.

2. **An agent report is not proof.** Reopen the files the agent touched and check the rendered
   result, not only the types. Once verified, the work is yours and you speak for it.

3. **A rule lives in one place.** Copies drift: agents that restated the root rules drifted back to
   patterns the root had banned. A rule scoped to one skill lives in that skill. A cross-cutting rule
   lives in `CLAUDE.md`. A product fact lives in `memory.dir`. Everywhere else, point to it.

4. **Memory first, code confirms.** A session never works from recollection. It reads what the zone
   requires (`memory.always`, `routing.zones.<zone>`), then uses code and tools to confirm a
   hypothesis born from memory. When the code proves memory wrong, the memory file is fixed in the
   same task.

5. **A negative claim needs an exhaustive check.** "I didn't find it" is not "it doesn't exist".
   Read whole files, search with several patterns, confirm with a second tool, before saying that
   something is absent. Nothing is destroyed on a single negative.

6. **Commit freely; push only on an explicit go when a push deploys.** A local commit deploys
   nothing and protects the work. When `git.push_deploys` is true, each push to `git.main_branch` is
   a production release and waits for a go that is valid for that push only.

7. **Verify on the deployed version, not the local copy.** Local green proves nothing to someone
   testing live. The work does not stop at the push: check what actually runs, then tell users what
   changed.

8. **What is not done now goes to a backlog, not the conversation.** A bug noted in a thread is a bug
   lost. It goes to `databases.fix_backlog`, or to a handoff when no backlog is configured, and a fix
   session empties the backlog in one batch.

9. **Load only what the request needs.** Knowledge is found from the zone being touched, through the
   routing table (`routing.zones`), not loaded wholesale.

10. **A missing module is declared, never invented.** When `modules.<function>` is false, a skill that
    needs that function says so and continues. It never fabricates what the module would have
    brought.

11. **Versioned memory never points to local memory.** `memory.dir` travels with the repository; the
    assistant's auto-memory stays on one machine. A link from the first to the second is dead for
    everyone else.

12. **Route to external libraries; never copy them.** When `libraries.<id>` is installed, native
    skills hand over to it. Credit it, respect its license, don't fork it.

13. **A method says what and when; a skill says how.** A method carries the record and the gates of
    a piece of work. Skills perform the steps.

14. **Name capabilities, not tool identifiers.** Connector tool names change with each install. A
    skill names the capability it needs and finds the tool that provides it.

15. **Improvements flow upward.** A lesson learned on one product is generalised into the OS, then
    reaches the other products.

---

## The rungs

**Thesis.** A written rule that is broken again becomes a gate, then a hook or a test. A sentence
informs; it does not stop anything. Every incident moves its rule one rung up, and the test lives
with the rule it locks.

| Rung | Form | Where it lives | What it does |
|---|---|---|---|
| 0 | the incident | the **Why** of the rule it produces, as a generic lesson | explains the rule to the next session |
| 1 | a sentence | the one place the rule belongs: a skill file, the product's `CLAUDE.md`, or `collaboration.md` | states the rule, why, how to apply |
| 2 | a gate | a skill step that must produce something visible; the reading gate (`reading_gate.skills.<skill>`); a blocking QA script | makes skipping visible and stops the procedure |
| 3 | a hook or a test | a hook that refuses or asks before the action; an invariant test that fails the build; a database trigger | makes the breach impossible, or loud |

**Why a sentence is not enough.** A rule required a skill's memory to be read before any action. It
was written in more than one place, and an advisory hook repeated it at session start. It was skipped
again. Loading a skill looks like running it: the content arrives in context and nothing forces
anything. Another reminder would have changed nothing. A gate that refuses the shell and file writes until the
reading is done did.

### How to climb

- **First breach:** write the sentence, or sharpen it, in its one place, with the incident as a
  generic lesson.
- **Second breach of the same rule:** add a gate.
- **Breached again, or any breach that destroyed data or reached production:** a hook or a test.
  Irreversible damage may skip rungs.
- **The lock names its rule, and the rule names its lock** ("Locked by: <hook or test>"). Changing
  one means changing the other. A product keeps the register of its own locks in its `CLAUDE.md`,
  below the separation line.
- **An invariant test lists the allowed exceptions** with their reason, and fails on any new
  occurrence of the pattern it bans.

### How a lock is built

- **It covers every path to the action:** every shell, every working copy, user scope when sessions
  run in several copies. A hook referenced by a relative path that does not exist in a secondary
  working copy is absent exactly where the work happens.
- **It measures the rule, not a proxy.** A reading gate checks the files the config requires
  (`memory.always` plus `reading_gate.skills.<skill>.require`), not any N files.
  `reading_gate.skills.<skill>.min_reads` is a floor. A floor that sessions meet by skimming gets
  raised.
- **It asks rather than denies** when a legitimate case exists, such as a destructive command on
  your own temporary branch.
- **It is tested by triggering the exact action of the incident.**
- **It lapses instead of blocking forever.** A gate armed longer ago than
  `reading_gate.stale_hours` is ignored, so a forgotten invocation does not lock unrelated work.

### When a lock fires

It is the signal, not an obstacle. Do what it asks. Never look for a way around it, never weaken or
remove it to get through. If the lock is wrong, say so, and fix the lock in its own change.
