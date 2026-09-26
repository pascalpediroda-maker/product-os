---
name: orient
description: Run at the start of a session, after a compaction, or whenever you cannot say for sure which checkout, branch or task you are on. Reads the product config, the memory index and the routing table, fetches the remote and states where the local work stands against the deployed reference, lists worktrees and open handoffs, and ends with a status-first summary. It reports; it never acts.
---

# Orient

A session's context is not memory. It decays, it gets compacted, and nothing tells you that what
you recall was read hours ago and has changed since. Other sessions work in the same repository at
the same time: they commit, push and open worktrees while you are not looking.

So re-anchor, do not recall. Orient reads what the product has written down, asks git where things
stand now, and reports. It changes nothing.

## What orient never does

- No stage, commit, checkout, merge, rebase, reset, stash, pull or push.
- No removal of a worktree or a branch, not even one this session created. Cleaning is done by the
  session at the end of its own task (skill `handoff`).
- No fix to memory, config or handoffs. It reports inconsistencies; the work that follows fixes them.
- No reading of a handoff's body (step 5).

Its only write is `git fetch`, which moves remote-tracking refs and nothing else.

---

## Step 1: the contract

1. Read `.claude/product/product.config.json`. If it is missing, stop and say the product is not
   configured, and which templates the core README asks to fill first. If `schema_version` is one
   you do not know, stop and say so.
2. Note what the rest of the run depends on:
   - `git.main_branch` (written `<main>` below) and `git.push_deploys`;
   - `modules.*`: the product functions installed. When the task in view needs a module that is
     `false`, say so. Never do from memory what that module would have brought;
   - `product.team_language`: the language of your report.
3. Read `CLAUDE.md` at the repository root, in full.

## Step 2: memory

Memory first, the code confirms. Reading the code first costs several times more context and
teaches you what without why, so you re-derive decisions that were already made and paid for.
Loading everything is no better: it leaves no room when it matters.

1. Read `memory.index` inside `memory.dir`, in full.
2. Read every file listed in `memory.always`, in full.
3. Read `routing.zones`. If the task in view is known, name the zones it touches and the files they
   list. The skill that does the work reads those files in full before it acts (its Step 0). If no
   skill will run and you are about to answer a question, read them yourself first.
4. Check, cheaply, and report without fixing:
   - files in `memory.dir` that the index does not list, and index lines that point to no file;
   - files named in `memory.always` or `routing.zones` that do not exist;
   - a contradiction between two memory files you read. Do not hunt for them; report the ones you
     meet. A contradiction means information is missing, not that one side wins.

These reads come before any shell command, so a reading gate on the shell lets orient through.

## Step 3: the local work against the deployed reference

The deployed reference is `origin/<main>` as fetched now. A ref fetched earlier in the session is
already stale: other sessions push, and with `git.push_deploys` true every push to `<main>` ships.

Use `git -C <path>` and absolute paths for every command. The shell's working directory can reset
between calls, and a relative command then runs in the default checkout, which is the easiest
wrong place to write.

```
git -C <repo> fetch origin --prune
git -C <cwd> rev-parse --show-toplevel
git -C <cwd> rev-parse --abbrev-ref HEAD
git -C <repo> rev-list --left-right --count origin/<main>...HEAD   # behind, ahead
git -C <repo> cherry -v origin/<main> HEAD                          # + missing from origin, - already there under another hash
git -C <repo> status --short
git -C <repo> diff --name-only HEAD...origin/<main> -- <memory.dir> # memory changed on origin, stale on disk
git -C <repo> diff --name-only origin/<main>...HEAD -- <memory.dir> # memory changed here, not on origin
```

State:

- **Where this session is**: checkout path and branch. If the worktree the task should happen in
  is not obvious, that is a question for the human, not a guess.
- **Behind and ahead** of `origin/<main>`. Among the commits ahead, `git cherry` separates those
  missing from origin (`+`) from those already shipped under another hash by a cherry-pick (`-`).
  Among the `+`, say which this session made (their hashes are in your own transcript, or the
  handoff you follow names them) and which belong to other sessions. The author name tells you
  nothing: sessions share one identity.
- **Uncommitted changes**, split the same way. A file you did not modify is another session's work
  in progress.
- **Memory against origin.** A file changed on origin and not here: you read an old version in
  step 2, read `git show origin/<main>:<path>` now. A file changed here and not on origin: it may
  describe code that exists only on this disk. Report both.
- **What it implies**, in one line, when it applies: a local `<main>` that carries other sessions'
  commits is never pushed as it is and never reset. Shipping starts from a fresh `origin/<main>`
  and takes only the commits it means to ship.
- **What `origin/<main>` means here.** With `git.push_deploys` true, it is what production runs
  once its deploy has finished. With it false, it is the shared reference, and orient does not
  know what is deployed: say so.

Any claim about what production does is read from `origin/<main>` now
(`git show origin/<main>:<path>`, `git grep <pattern> origin/<main>`). Never from the disk, never
from memory, never from an earlier fetch.

## Step 4: worktrees

```
git -C <repo> worktree list --porcelain
git -C <repo> cherry origin/<main> <branch>     # per worktree: lines starting with + are unshipped work
git -C <worktree> status --porcelain            # per worktree: uncommitted work
```

A worktree belongs to this session only if this session ran the `git worktree add` that created
it, or the handoff this session follows hands it over by path. Everything else belongs to another
session, and so does anything you are unsure about. "Merged and clean" says nothing about whether
someone is working in it.

Report two lists. **Yours**: this session removes them itself at the end of its task, without
asking. **Others'**: never removed, reset or force-pushed without the human's explicit go for that
command. Orient removes neither.

## Step 5: open handoffs

Handoffs are `.claude/plans/<YYYY-MM-DD>-handoff-<subject>.md` in the primary checkout (the first
entry of `git worktree list`). Add the ones that exist only on the remote:
`git -C <repo> ls-tree --name-only origin/<main> .claude/plans/`, compared with the disk.

For each, read the header only: line 1 (the skill to follow), the title, the `Status:` line, the
first line under "Where it stands", and the numbered list under "Waiting on the human".

- `Status: open` is listed. `closed` and `superseded by <path>` are skipped.
- A handoff with no `Status:` line predates the convention. List the five most recent as "status
  unknown", not all of them.

Read nothing else in it. A handoff is read after its skill has run in full, with every memory that
skill requires. A session that opens the handoff first goes straight to the subject and skips the
method, and the method's gates exist because skipping them has already cost something.

## Step 6: the report

Status first. The first line says whether the ground is clean and what is in flight; a reader who
stops there knows enough. Then three short blocks. Commit lists, file lists and commands only if
asked.

```
<One line. "Clean: on <main>, level with origin/<main>, no open handoff."
 or "In flight: 2 open handoffs; local <main> is 142 behind and 97 ahead of origin/<main>, none of the 97 from this session.">

Where things stand
- <checkout> on <branch>: <behind> behind, <ahead> ahead of origin/<main> (<n> this session's, <m> already on origin under another hash).
- Uncommitted: <n files>, <whose>.
- Worktrees: <n>. Yours: <paths, or none>. Others': <n>, not touched.
- Memory: <in order | unlisted files | index lines to missing files | stale on disk | ahead of origin>.
- Modules the task needs that are not installed: <list, or none>.

Waiting on the human
1. <decision or question, once, with the handoff it comes from>

Next
1. <"Follow the skill `<name>` in full, then read <handoff path>.", or the first step of the task>
```

---

## Claims

Nothing is asserted beyond what was read.

- Say what you read, not what you infer from it. "Checked files A to D, no match" is a fact; "it
  is not there" is not. Say by which method a negative was obtained: a partial scan and a full
  read are different claims.
- A statement of how something works cites `path:line` at a named ref. If you cannot cite it,
  verify it.
- A single reading settles nothing, not a name and not a behaviour.
