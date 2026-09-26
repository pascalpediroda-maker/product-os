---
name: handoff
description: Write a handoff that another session, or this one after a compaction, can pick up without redoing anything and without skipping the method. Use when stopping before the work is finished, when splitting work across parallel sessions, or when the human asks for one. Covers the cleanup that comes first, the reading-order line, the status-first structure, where the file goes, how it is committed, and how a handoff is closed or superseded.
---

# Handoff

A handoff exists so that the next session does not redo what this one established, and does not
skip the method that governs the work. It carries the state and the pointers. The detail lives
elsewhere: in a plan, in memory, in a database.

---

## Before writing: clean your own artefacts

Clean first, so that the handoff describes what is really left.

**Yours** are what this session created (worktrees, branches, scratch and temp files, captures,
copies of config files, processes it started) and what a handoff you followed handed over to you
by path. Remove them without asking, and say so in one line. Nobody was asked when you created
them; asking to remove them hands the human a decision that costs them nothing to delegate.

**Not yours** is everything else, including anything whose origin you are unsure of. Never remove,
reset or force anything there without the human's explicit go for that command. "Merged and
clean" does not make another session's worktree disposable.

For a worktree and its branch, in this order:

1. Stop any process you started from it.
2. Check that every commit is on origin: `git -C <repo> fetch origin`, then
   `git -C <repo> cherry origin/<main> <branch>` shows no line starting with `+`. A `+` is
   unshipped work: the worktree is not temporary. Keep it and hand it over (below).
3. Remove a dependency folder that is a link (junction or symlink) as a link, never recursively: a
   recursive delete through a link empties its target. Check that the target is intact.
4. Delete the ignored files you put there: copied env files, build caches, archives already
   delivered.
5. `git -C <repo> worktree remove <path>` without `--force`. If it refuses, look at what is left:
   only generated files, then force; anything else, stop and keep it.
6. `git -C <repo> branch -d <branch>`. Use `-D` only when step 2 showed every commit already on
   origin under another hash (a cherry-pick is not a merge, so `-d` refuses it).
7. Empty your scratch directory and your temp files. Remove a capture that has become misleading.

What the next session still needs is not temporary: a worktree with unpushed commits, a branch
with work in progress, a server it will use. Name it by path in the handoff. That transfers it:
the next session cleans it when its own task ends.

Never point a handoff to a scratch or temp path. The session that owns it empties it. If the next
session needs a file from there, move it into the repository or into memory first, or drop it.

## Line 1: the reading order

Every handoff starts with this line, before the title:

```
1. Follow the skill `<name>` in full (its Step 0 memories). 2. Read this handoff.
```

`<name>` is the skill that governs the remaining work. Its Step 0 is everything it requires before
acting: the files in `memory.always`, those in `reading_gate.skills.<name>.require`, and those
`routing.zones` lists for the zone. If no skill fits, name `orient`.

A session told "read the handoff" opens it first, goes straight to the subject and skips the
method, with its memories and its gates. The handoff is an input to the method, never a shortcut
past it. Line 1 is the only place sure to be read before that happens.

## What goes in it, in this order

1. **`Status: open`**, on its own line under the title. `orient` reads it to list open handoffs.
2. **Where it stands.** Its first line is "Finished." or "Not finished: X and Y remain." Then:
   - the working base: repository, worktree path, branch, and the `origin/<main>` commit it
     started from;
   - what is done, each item with its commit hash and whether it is pushed. A cherry-picked
     commit has a new hash on origin: give that one. With `git.push_deploys` true, pushed to
     `<main>` means deployed once the deploy has run: say whether you checked that it ran.
3. **Waiting on the human.** Decisions and questions, numbered, each listed once. Other sections
   refer to them by number. Keep them apart from the next steps: a list that mixes "to build" and
   "waiting on an answer" stalls on the first blocked item.
4. **Next.** The steps, in order. Each says where its detail lives.
5. **Where the detail lives.** Pointers, not copies:
   - a database by its config key (`databases.fix_backlog`, `databases.roadmap`, and so on) and
     the entry IDs;
   - the plan in `.claude/plans/`, with the section;
   - memory files by name, in the order to read them.

   A decision, a finding or a study result that exists only in this conversation is written where
   it belongs first (the plan, a memory file, the database), then pointed to.
6. **Already verified.** What the next session must not redo. Each fact with its method and the
   ref it was checked against: "read at `origin/<main>` `<hash>`, `path:line`", "full read of X",
   "query on table Y". The ref tells the next session whether the fact still holds; a date does
   not. A negative says how it was obtained: a partial scan and a full read are different claims.
7. **Traps.** What cost time here and is not in memory. A trap that will recur beyond this work
   goes into memory, or better into a gate or a test; the handoff then carries only the pointer.
8. **Memory inconsistencies found.** The file, what it says, what is true, the evidence. Each
   marked "fixed in `<hash>`" or "to fix".
9. **Cleaned up.** One line: what you removed, what you handed over, which worktrees of other
   sessions you left untouched.

A screen or two is enough. Past that, the handoff is carrying detail that belongs in the plan or
in memory.

## What stays out

- **The story of the session**: what was tried, believed, then dropped. At most one line per
  rejected option, with its reason, and only if the next session would otherwise try it again.
- **Copies**: of a plan, of a database's content, of another handoff, of a commit's file list
  (git has it).
- **Numbers someone else will change.** Count at read time. Counts of your own finished work are
  fine.
- **Secrets.** Name the variable or the file that holds them, never the value.
- **Additions at the bottom.** When the state changes, rewrite the section. A handoff with a
  second status block under the first has two statuses and the reader has to guess which holds.

## Where it goes, and how it is committed

`.claude/plans/<YYYY-MM-DD>-handoff-<subject>.md`, in the primary checkout of the repository (the
first entry of `git worktree list`), where the next session starts, even when the code lives in a
worktree. Dated and named for what it is: never a generated name, never outside the repository.

Commit it by name, and only it:

```
git -C <primary> rev-parse --abbrev-ref HEAD      # the branch you expect
git -C <primary> add .claude/plans/<file>.md
git -C <primary> commit -m "<message>" -- .claude/plans/<file>.md
```

The path after `--` commits that file only, even if another session has staged something in the
same checkout. Never `git add -A`, `git add .` or `git commit -a`. Never push without the human's
go; with `git.push_deploys` true, a push to `<main>` is a release.

Then give the path in full, on its own line, so it opens in one gesture.

## Closing and superseding

- The session that finishes the work sets `Status: closed`, with the commit that finished it, in
  the same commit as its last change.
- A new handoff that replaces an older one sets the older one to
  `Status: superseded by <path>`. For what the older one established, it points to it or moves it
  to memory; it does not copy it.

## Resuming from one

- Line 1 first: the skill in full, then the handoff, in its order.
- Execute it, do not re-survey. A verification listed as done is redone only if `origin/<main>`
  has moved past its ref on the files it cites.
- What the handoff hands over by path is yours now: you clean it at the end of your task.

---

## Template

```markdown
1. Follow the skill `<name>` in full (its Step 0 memories). 2. Read this handoff.

# Handoff: <subject> (<YYYY-MM-DD>)

Status: open

## Where it stands
Not finished: <X> and <Y> remain.
- Base: `<repo>`, worktree `<path>`, branch `<branch>`, from `origin/<main>` `<hash>`.
- Done: <item> (`<hash>`, pushed). <item> (`<hash>`, local, in `<worktree>`).

## Waiting on the human
1. <decision, with the options in one line>
2. <question>

## Next
1. <step>. Detail: `<plan>` section <name>.
2. <step>, once 1 is answered.

## Where the detail lives
- Plan: `.claude/plans/<plan>.md`
- Memory, in this order: `<file>`, `<file>`
- Database: `databases.<key>`, entries <IDs>

## Already verified
- <fact>: <method>, at `origin/<main>` `<hash>`, `<path:line>`.

## Traps
- <trap>. Written to `<memory file>`, or: not in memory yet.

## Memory inconsistencies
- `<file>` says <X>; true: <Y> (<evidence>). To fix.

## Cleaned up
Removed <worktree, branch, scratch files>. Handed over `<worktree path>`. Left untouched: <other sessions' worktrees>.
```
