---
name: pos-setup
description: The first skill a new product runs, and the one to re-run whenever a connection breaks. Finds the product repository and copies the core templates it lacks, reconciles an existing CLAUDE.md with the OS rules (names each conflict, proposes a section by diff, never overwrites), asks five questions about the product (its feedback, roadmap, fix backlog and CRM in Notion; fine tracking of users in Amplitude; a Supabase database; AI agents in production; deployments through Easypanel) and derives the connectors from the answers, checks what is already connected and callable in this session, walks the owner through each missing one (account, verified add command, sign-in or token, least privilege, where the credential lives, the restart a new server needs), tests each with one harmless read, fills the product config after showing the diff, creates the Notion bases the owner wanted (CRM, feedback and insights, roadmap) from the OS schemas and hands the fix backlog to the Support plugin, lists what is still template, then hands over to `pos-guide`, which shows what the OS offers and where to begin. Idempotent. Use on a fresh install, or when someone says "set up", "connect Notion", "install the connectors", "configure the product", "my Notion tools are missing". "/pos-setup".
---

# Setup

A newcomer installs the core, then runs this. At the end the product repository holds its config,
its CLAUDE.md agrees with the OS or records where it chose otherwise, each connector the product needs
answers a read in this session, and the owner knows exactly what is left to do.

What setup guarantees:

- **A connector is installed because a module needs it,** and is called connected only once one of
  its tools has answered in this session.
- **No credential lands in the repository, a log, a commit or the transcript** through setup.
- **Every command comes from a reference file checked against the vendor's documentation,** with its
  source. Nothing from memory.
- **Nothing that exists is overwritten:** no file, no filled config key, no connector.
- **A product never leaves setup with two rules on the same subject,** one of them silent.
- **Nothing still template is presented as done:** placeholders are listed as remaining work.

## What setup never does

- **Store a secret in a file of the repository** (config, `.mcp.json`, memory, a handoff, an env file
  it creates), print it, log it, commit it, or pass it as a command-line argument.
- **Run a sign-in on the owner's behalf, or handle a token.** The OAuth in the browser, setting an
  environment variable that holds a token, and any command that carries a secret are the owner's.
  Setup gives the step and waits. It never asks for a code, a token or a callback URL in the chat.
- **Install a connector the owner did not ask for,** or remove or replace one that exists without the
  owner's go for that entry: another product may use it.
- **Rewrite the product's CLAUDE.md.** It proposes an added section and, for a conflicting line, an
  edit the owner approves line by line.
- **Drive a client's space.** Its reads are the harmless ones of Step 5: names, never content. No
  browser automation, no script, no write in a space that belongs to a client (`rules/collaboration.md`,
  rule 32).
- **Invent a config key.** What the contract has no key for is reported, not added.
- **Push.** It commits what it wrote, by name (Step 8). With `git.push_deploys` true, a push to the main
  branch is a release.

## Where things are

| What | Where |
|---|---|
| The contract | `${CLAUDE_PLUGIN_ROOT}/README.md` |
| The templates | `${CLAUDE_PLUGIN_ROOT}/templates/` |
| The OS rules | `${CLAUDE_PLUGIN_ROOT}/rules/collaboration.md`, `${CLAUDE_PLUGIN_ROOT}/rules/principles.md` |
| How the rules reach a session | `${CLAUDE_PLUGIN_ROOT}/hooks/session-rules.mjs` |
| Notion: account, command, sign-in, config | [references/notion.md](references/notion.md) |
| Supabase | [references/supabase.md](references/supabase.md) |
| Amplitude | [references/amplitude.md](references/amplitude.md) |
| Gmail | [references/gmail.md](references/gmail.md) |
| Easypanel | [references/easypanel.md](references/easypanel.md) |
| The CRM, feedback and roadmap bases | [references/bases/](references/bases/): one schema each |
| The fix backlog base | the `pos-fix-backlog` skill of the `pos-support` plugin, which owns its schema |

Read a connector's reference file in full before its step. The tool names a connector exposes change
with each install: this skill names capabilities ("list the tables"), and the session finds the tool
that provides it (`rules/principles.md`, principle 14).

Talk to the owner in `product.team_language` once the config exists; before that, in the owner's
language.

---

## Step 1: where am I

1. **The repository.** `git -C <cwd> rev-parse --show-toplevel`. Not a git repository: say so and ask
   for the product repository's path. Never initialise one.
2. **The checkout.** `git -C <root> worktree list` and `git -C <root> rev-parse --abbrev-ref HEAD`.
   Setup writes in the primary checkout (the first entry), on the main branch. If the session is
   elsewhere, name where it is and ask where to set up before writing anything
   (`rules/collaboration.md`, rule 3). Use `git -C <path>` and absolute paths for every command.
3. **The config.** Read `.claude/product/product.config.json`.
   - **It exists:** read it in full. A `schema_version` this skill does not know (it knows `1`):
     stop and say so. Otherwise go on; this is a re-run (see "Running it again").
   - **It is missing:** list what the core README asks to fill first, with, for each, its target
     and whether that target already exists. Say it, then copy the missing ones byte for byte. Never
     overwrite.

   | Template (under `${CLAUDE_PLUGIN_ROOT}/templates/`) | Target in the repository |
   |---|---|
   | `product/product.config.json` | `.claude/product/product.config.json` |
   | `product/product_domain_context.md` | `.claude/product/product_domain_context.md` |
   | `CLAUDE.md` | `CLAUDE.md` at the root, only when there is none |
   | `memory/MEMORY.md` | `.claude/memory/MEMORY.md` |
   | `memory/archi-subsystem.md`, `memory/reference.md` | `.claude/memory/` (the shapes of a memory file) |

   A `CLAUDE.md` that already exists is never replaced by the template: it is reconciled in Step 1b.
4. **Local env files.** Credentials often sit in env files next to the code.
   ```
   git -C <root> ls-files -- ".env" ".env.*" "*.env"
   git -C <root> check-ignore -v --non-matching -- .env .env.local
   ```
   - A tracked env file: its content is in the git history already. Say it once, advise rotating what
     it holds, never print it. Removing it from the history is the owner's decision.
   - Env files not ignored: propose the `.gitignore` lines (for example `.env` and `.env.*`, with
     `!.env.example` if the product commits an example file). Show the diff, write on the OK.

## Step 1b: reconcile an existing CLAUDE.md

**Why.** The OS rules reach every session through the core's `session-rules` hook, which injects a
digest built from the config at session start. A product CLAUDE.md that says otherwise on the same
subject leaves the session two rules and a guess. Measured: on a product whose CLAUDE.md sent deferred
bugs to a notes file, a session wrote the bug there and the fix backlog never saw it. The hook makes
the OS rule win where the config settles the subject and names the conflict; this step removes the
conflict at its source, with the owner.

1. **Read the whole CLAUDE.md**, and the files it imports (`@path` lines), in full.
2. **For each subject the OS settles, find what the product says.**

   | Subject | The OS rule | Where the OS reads it |
   |---|---|---|
   | A bug not fixed in the session | filed in the fix backlog, never left in the conversation, a todo or a notes file (rule 20) | `modules.support`, `databases.fix_backlog` |
   | Pushing | only on the owner's explicit go when a push deploys (rule 27) | `git.push_deploys`, `git.main_branch` |
   | Where memory lives, and reading it first | `memory.dir`, `memory.index`, `routing.zones`; memory first, code confirms (rule 1) | `memory.*`, `routing.zones` |
   | Committing | named files only, only your own hunks (rule 28) | none |
   | A client's data | read only, with the exception of rule 32 | none |

3. **Classify each subject:** agrees, silent, or conflicts. A conflict quotes the product's line, with
   its line number. A product rule that is stricter than the OS rule (for example "never push without
   two reviews") agrees: it adds, it does not contradict.
4. **Present the table** (subject, what the product says, the OS rule, verdict), then, for each
   conflict, one numbered question with your recommendation: **adopt the OS rule** (setup proposes an
   edit of that line that points to the OS) or **keep the product's rule** (setup records it as a
   standing choice, naming the OS rule it changes, so that the hook lets it win). The owner decides
   each one.
5. **Propose the section by diff.** Append to CLAUDE.md, or extend if it already exists, one section:

   ```markdown
   ## Product OS: standing choices of the owner

   This product uses the product OS (`pos-core`). Its rules reach every session through the
   core's session-rules hook, built from `.claude/product/product.config.json`; they are not copied
   here. Where this file chooses otherwise, the choice is recorded below and wins for this product.

   - <one line per kept product rule: the subject, the product's choice, the OS rule it changes>
   ```

   With no conflict, the section has only its first paragraph. Show the diff (the added section, and
   each approved line edit), then "OK, or adjust before I write it?". On the OK, write. Nothing else in
   the file changes.
6. **The template's own heading.** A CLAUDE.md copied from the template already has this section below
   its separation line. Step 1b then only checks it against the table.

## Step 2: five questions about the product

The owner thinks in product terms, not in connectors. Ask about the product; the connectors, the
bases and the config follow from the answers.

1. **Modules.** Read `modules.*`. On a fresh config they are all `false`: run `claude plugin list`,
   which prints the installed plugins with their version, scope and status, and match each `pos-*`
   plugin to its `modules.<function>` key (`pos-support` to `support`, and so on). A plugin you cannot
   match is asked about, never guessed. A key set to `true` for a module whose plugin is not
   installed is reported: a skill would expect what nothing brings. The values are written in Step 6.
2. **Ask the five questions, in one message, numbered, each answered yes or no.** Each says what a yes
   brings. On a re-run, ask only those the config does not answer yet.

   | # | Question | A yes brings |
   |---|---|---|
   | 1 | The OS keeps the product's feedback and insights (interview notes included), its opportunities and their PRDs (the roadmap), its fix backlog and its contacts (the CRM) in Notion. Do you want these bases? | the Notion connector, then the four bases created in Step 7 with the OS schemas. The owner may leave one out in the same answer ("not the CRM"); otherwise all four |
   | 2 | Do you want to follow what users do in the product, finely: funnels, cohorts, one user's real journey? | the Amplitude connector, `analytics.provider` and `analytics.project_id` |
   | 3 | Does the product have, or will it have, a Supabase database? | the Supabase connector, read-only |
   | 4 | Will the product run AI agents for its users: an assistant, a chatbot, generated content? | `product.ai_agents: true`. The skills, agents and memory for building and tuning production AI agents come with the Build module (AI engineering): planned, not built. Say so |
   | 5 | Does the product run on your own server, deployed with Easypanel (for example at Hetzner)? | the Easypanel connector, read-only by default, and `deploy.*`: every push that deploys is then checked before and followed to a green build after, instead of being assumed live |

   Gmail is not one of the five: when Support or Go-to-Market is installed, add one line, "Gmail,
   optional: customer messages drafted in your mailbox, never sent. Want it?"
3. **The answers are the go.** A yes to question 1 covers creating every base it names: do not ask
   again base by base (`rules/collaboration.md`, rule 16). What remains to approve is what the owner
   has not seen yet: each base's schema (Step 7) and the config diff (Step 6).
4. **What a yes needs that is not installed.** Question 1 includes the fix backlog, which the
   `pos-support` plugin carries: when it is not installed, give its install command
   (`claude plugin install pos-support@product-os --scope project`) with the restart of Step 4, and
   create the three other bases meanwhile.
5. **A tool outside these** (another database, another analytics provider) is not covered by this
   skill: say so, point to that vendor's own MCP documentation, and never improvise its command.

## Step 3: what is already connected

1. **The CLI's view.**
   ```
   claude mcp list
   claude mcp get <name>
   ```
   `list` health-checks every server, so it takes a moment. Run `get` for each entry that matches a
   wanted connector. Match by address, not by name: names are free (`notion`, `Notion`,
   `claude.ai Notion`), and a connector can come from Claude Code, from a plugin, or from claude.ai.

   | Connector | Its entry points to |
   |---|---|
   | Notion | `mcp.notion.com` |
   | Supabase | `mcp.supabase.com`, `localhost:54321/mcp`, or a command running `@supabase/mcp-server-supabase` |
   | Amplitude | `mcp.amplitude.com` or `mcp.eu.amplitude.com` |
   | Gmail | a claude.ai entry for Gmail, or `gmailmcp.googleapis.com` |
   | Easypanel | `https://<the panel's domain>/api/mcp` |

   Statuses: `✔ Connected`, `! Needs authentication`, `✘ Failed to connect`, and `⏸ Pending approval`
   for a `.mcp.json` server not yet approved. `get` also gives the entry's scope.

   **Never quote this output.** `list` and `get` print a local server's full command line and a remote
   server's headers, and a credential passed there shows in clear. Build the table below from it. If a
   credential shows, say once that this connector's credential sits where `claude mcp list` prints it,
   without repeating the value, and offer the route from its reference file that keeps it out.
   If the `claude` command is not on this shell's path, ask the owner to open `/mcp` and say which of
   the four connectors it lists, and with which status.

   **Copying another product's working setup** (the owner says "it works in my other project"): read
   that project's `.mcp.json` or `claude mcp get <name>` with the values masked: keys, URLs and
   variable names only, never a header value or an argument after `--access-token`. A token that
   reaches the transcript is a token to rotate: say so once.

2. **Connected in the CLI is not callable here.** A connector counts as usable only when this session
   has its tools: look in the tool list, including tools loaded on demand through tool search. Reasons
   a connector is connected elsewhere and absent here:
   - claude.ai connectors are fetched only when the session's sign-in is a claude.ai subscription
     login; not when `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN` or `apiKeyHelper` is active, nor with
     a token from `claude setup-token`;
   - claude.ai connectors are turned off by the `disableClaudeAiConnectors` setting or
     `ENABLE_CLAUDEAI_MCP_SERVERS=false`, one of them can be turned off for this project in `/mcp`, and
     an organization can block one;
   - a `.mcp.json` server waits for approval;
   - the server was added, or signed in, after this session started: it appears only after a restart
     (Step 4, "Plan one restart").
3. **Duplicates.** Two entries for the same service under different names both load, with two sets of
   tools. Keep one; turn the other off for this project in `/mcp`. The same name in several scopes
   loads once, from the first of: local, project, user, plugin, claude.ai.
4. **Report.**

   | Connector | Wanted (Step 2) | Installed (scope) | Authenticated | Tools in this session |
   |---|---|---|---|---|
   | Notion | question 1: yes | yes (user) | yes | yes |
   | Supabase | question 3: yes | no | | |
   | Amplitude | question 2: no | not wanted | | |
   | Gmail | yes, optional line | claude.ai | yes | no: session signed in with an API key |

## Step 4: connect each missing one

**Plan one restart, and say so before the first step.** A server added or signed in during this
session does not become callable in it: observed, a server added mid-session stayed absent until
Claude Code restarted, and a project-scoped server also waits for the owner's approval. So:

1. do every add (and every environment variable the owner sets) first, for all missing connectors;
2. then one restart of Claude Code: in an IDE, the whole IDE window, so the extension reads the new
   environment;
3. approve the project-scoped servers when asked (or in `/mcp`), sign in where a connector uses OAuth;
4. continue the conversation (`claude --continue`, or the IDE's session history). Setup resumes at
   Step 3 and re-checks everything.

For each wanted connector that is not usable, follow its reference file, in this order.

1. **Account.** If the owner has none: where to create it, the plan that is enough to start, and
   what it costs as the vendor's pricing page states it, with the date it was read. Prices change: if
   the owner is about to pay, send them to the pricing page.
2. **Add it.** The route and command from the reference file, with its scope and the reason for that
   scope:
   - **project** when the entry is a fact of this repository and holds no secret: the Supabase project,
     whose `.mcp.json` entry holds the URL and, on the token route, only a variable name. `.mcp.json` is
     committed;
   - **user** for a personal account used across products (Notion, Amplitude);
   - **local** for a personal account used for this product only, and for an entry that would hold a
     credential.

   Who runs it:
   - **No secret in the command or the file** (the OAuth routes of Notion and Amplitude, the Supabase
     entry with its variable name): show it, get the owner's OK, run it or write it, and say what it
     wrote where (`~/.claude.json` for user and local scope, `.mcp.json` for project). Then read the
     entry back: it must hold no credential. Gmail's default route has no command: it is connected on
     claude.ai.
   - **A token to put in the environment** (the Supabase default route): the owner creates it and sets
     the variable in their own terminal or system settings, as the reference file says. Not with `!` in
     this session: shell mode adds the command and its output to the conversation.
3. **Sign in, where the route uses OAuth.** The owner does it, after the restart: `/mcp`, select the
   server, authenticate in the browser. From a **regular terminal**, `claude mcp login <name>` does the
   same, and `--no-browser` prints the address to open when the machine has no browser (an SSH
   session). Prefer the terminal to an IDE extension for a sign-in: Supabase's documentation says to
   authenticate "In a regular terminal (not the IDE extension)", and a sign-in started from an IDE
   extension was observed failing. A claude.ai connector signs in on claude.ai. Give the step, then wait
   for the owner to say it is done.
4. **Least privilege.** Apply what the reference file names: Supabase scoped to one project and
   read-only; Gmail with sending denied; Notion and Amplitude through the account and its role. In
   Claude Code's permissions (`/permissions`), never allow a whole server (`mcp__<server>` or
   `mcp__<server>__*`): tools that change data stay on ask, tools that send are denied. Deny rules win
   over allow rules.
5. **Where the credential lives.** Always outside the repository:
   - a server signed in through Claude Code: its OAuth token is held by Claude Code ("stored securely
     and refreshed automatically"); `claude mcp logout <name>` clears it;
   - a claude.ai connector: held by claude.ai;
   - a token: in the owner's user environment (or a CI job's variables), referenced as `${VAR}` in
     `.mcp.json`, which Claude Code expands in a remote server's `url` and `headers`. Never literal in
     `.mcp.json`, never in the chat, never given to a server as a program argument (`claude mcp list`
     prints those). The variable must exist before Claude Code starts; an unset one is sent as the text
     `${VAR}` and the server answers 401.

   **If the owner pastes a secret in the chat,** say once that it is now in this conversation's
   transcript and that rotating it is advised. Never repeat it, never write it anywhere, never use it.
6. **Check, after the restart.** `claude mcp get <name>` shows `✔ Connected`, and the connector's tools
   are in this session (Step 3, point 2). Then Step 5 for it.

## Step 5: one harmless read each

For each usable connector, announce the read in one sentence (what it reads, where, read-only), run
it, and show the result in one line.

| Connector | The read | What is shown |
|---|---|---|
| Notion | find one page by a title the owner gives, or fetch one base the owner names | its title |
| Supabase | list the project's tables | how many, and one name. Never a row |
| Amplitude | list the projects the account can access | names and IDs (needed in Step 6) |
| Gmail | list the mailbox labels | how many. Never a message, never a draft |
| Easypanel | the last action of the service the owner names (`listActions`, `limit: 1`) | its status and commit message. Never a procedure that returns environment variables |

A read that fails: give the error in one line and check the reference file's traps before trying
again. A read that fails is not "connected".

## Step 6: fill the config

1. **Collect** what each key should hold.

   | Key | From |
   |---|---|
   | `product.name`, `product.one_liner` | the owner, when empty |
   | `product.ui_language`, `product.team_language` | confirm the template's value with the owner |
   | `modules.<function>` | Step 2 |
   | `product.ai_agents` | the answer to question 4 of Step 2 |
   | `databases.feedback`, `databases.roadmap`, `databases.fix_backlog`, `databases.crm` | for each base that exists, its full `collection://<id>` data source URL, read as `references/notion.md` says. A base that does not exist stays empty |
   | `analytics.provider` | `amplitude` when Amplitude is connected |
   | `analytics.project_id` | the project the owner picks from the Step 5 list |
   | `deploy.provider`, `deploy.project`, `deploy.app_service` | `easypanel` when Easypanel answered its read; the project and the service a push to the main branch deploys, named by the owner and confirmed by that read |
   | `git.main_branch` | `git -C <root> symbolic-ref --short refs/remotes/origin/HEAD` without its `origin/` prefix, confirmed by the owner; if it is not set, ask |
   | `git.push_deploys` | the owner's answer to "Does a push to `<main>` ship to production?" |

2. **What the contract has no key for,** reported and never added:
   - the Supabase project reference: it lives in the connector's address (`project_ref`), in
     `.mcp.json`;
   - the Amplitude data region: in the connector's address;
   - the Easypanel panel's address: in the connector's address;
   - Gmail: nothing to record.
3. **What setup leaves alone:** `libraries.*`, `memory.*`, `routing.*`, `reading_gate.*`, `pivots.*`.
   They keep their values; Step 6b says which of them are still template.
4. **Only empty keys are filled.** A filled key that differs from what setup found is reported, and
   changed only if the owner says so for that key. A filled database ID is checked by fetching it; one
   that does not resolve is reported as "configured, not reachable" (the signed-in account may lack
   access to it), never replaced.
5. **Show the diff before writing:** one row per key that changes (key, now, proposed, from where),
   then "OK, or adjust before I write it?". On the OK, write the whole file once: strict JSON, no
   comments, key order and two-space indentation kept. Then check it parses:
   `node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <path>`.

## Step 6b: what is still template

The templates ship with examples. Left in place, they look like a working setup and are not. List each
one as remaining work, with what to do; setup does not write memory itself.

- **`memory.always`** names files (the template names `architecture.md`). For each name, check the file
  exists in `memory.dir`. A missing one is listed: "write `<file>` (shape: the core template
  `memory/archi-subsystem.md`), or remove it from `memory.always`". The reading gate drops a missing
  required file and says so, but the session then reads nothing for it.
- **`MEMORY.md`** copied from the template holds example lines. Every line whose link points to a file
  that does not exist is listed, to replace or delete.
- **`routing.zones.example-zone`** and **`reading_gate.skills.example-skill`**: template placeholders,
  to replace by the product's zones and gated skills as memory gets written.
- **The domain pivot** (`<pivots.dir>/<pivots.domain>`) is still the empty template until
  `pos-domain` runs.
- **A copied `CLAUDE.md`** has its product sections still in guidance comments below the separation
  line.

## Step 7: the Notion bases

Runs when the owner answered yes to question 1 of Step 2 and Notion answered its harmless read. That
yes is the go to create every base it named: never ask again base by base (rule 16).

| Base | Config key | Schema | Created by |
|---|---|---|---|
| CRM: the contacts and their organisations | `databases.crm` | [references/bases/crm.md](references/bases/crm.md) | this step |
| Feedback & Insights: what users and prospects say, interview notes included | `databases.feedback` | [references/bases/feedback.md](references/bases/feedback.md) | this step |
| Roadmap: one page per opportunity, from the problem to the specs (FO(E)CUSED), the PRD inside | `databases.roadmap` | [references/bases/roadmap.md](references/bases/roadmap.md) | this step |
| Fix backlog | `databases.fix_backlog` | the `pos-fix-backlog` skill of `pos-support` | that skill, which owns its schema and its ID prefix |

Read each schema file in full first, and the `pos-tool-conventions` Notion reference.

1. **What already exists.** For each base the owner wanted: a filled key is fetched and compared with
   its schema, never recreated; differences are reported. The owner may also name a base they already
   have: fetch it, compare, and point the key to it on the config diff. Only the rest is created.
2. **Ask once, together, what only the owner knows:** the parent page that will hold the bases (one for
   all, where the team's shared pages live; without it the connector creates private pages nobody else
   sees), and the option lists the schemas leave to the product: its personas, the roadmap's areas
   and themes, the CRM's sales motions and target tiers. A list an existing base already holds is
   read from it, not asked again.
3. **Show every schema to create in one block,** with the owner's lists in place and the relations
   that apply, then "OK, or adjust before I create them?". The structure is final once entries exist:
   option names are checked now (no comma, unique regardless of case).
4. **Create in dependency order,** announcing each call: CRM, then Feedback & Insights (it points to
   the CRM), then Roadmap (it points to Feedback & Insights). A relation is created only toward a base
   that exists. Fetch each base after creating it, compare it with its schema, fix a difference while
   it is still empty, and read its `collection://` URL.
5. **The fix backlog,** last, so its relations find their targets: run the `pos-fix-backlog` skill
   ("Create or check the base"). It asks its ID prefix (unique in the Notion workspace) and creates
   the base, or checks the existing one. A fix backlog that existed before the feedback base or the
   CRM gets its relations from them: the feedback base's `Fix backlog` relation adds `Source feedback` to it, and
   `Customer to notify` is added on its side once the CRM exists (the CRM schema gives the statement).
   An added column renames nothing and erases nothing; it is part of the yes to question 1.
   - `pos-support` not installed: say that this plugin carries the fix backlog, give its install
     command (`claude plugin install pos-support@product-os --scope project`), and tell the owner to
     restart the session, set `modules.support` to true, and run setup again. The other bases are
     created meanwhile.
6. **The keys:** one diff for all the bases (key, now, proposed: the `collection://` URL), written once
   on the OK, the same way as Step 6. `pos-fix-backlog` writes its own key the same way.

A base the owner did not want: nothing is created, its key stays empty, and the summary says which
skills will say so when they need it.

## Step 8: commit, then hand over

1. **Commit what setup wrote, by name.** The templates it created, the config, the CLAUDE.md section,
   the `.gitignore` lines, and `.mcp.json` once you have read it and it holds no secret. Check the
   branch first.
   ```
   git -C <root> rev-parse --abbrev-ref HEAD
   git -C <root> add <each path>
   git -C <root> commit -m "<message>" -- <each path>
   ```
   Never `git add -A`, `git add .` or `git commit -a`. Never push.
2. **The summary,** status first. The first line alone tells the owner whether setup is finished.

```
<"Set up: Notion and Supabase connected and tested, Gmail not wanted, config filled, CLAUDE.md reconciled."
 or "Not finished: restart Claude Code, approve supabase, then continue; databases.crm is empty.">

Connectors
| Connector | Installed (scope) | Authenticated | Tools in this session | Harmless read |

CLAUDE.md
- <agrees with the OS | N conflicts: X adopted, Y kept as standing choices>.

Config
- Filled: <keys>.
- Empty, and who will ask for it: <key: module>.
- No contract key: <the Supabase project reference is in .mcp.json; the Amplitude region is in its address>.
- Committed: <hash>, not pushed.

Still template (Step 6b)
- <memory.always names architecture.md, which does not exist: write it or remove it>
- <MEMORY.md: N example lines pointing to files that do not exist>
- <routing and reading gate placeholders; the domain pivot>

Waiting on the owner
1. <a restart, an approval, a sign-in, an environment variable, an account to create, a decision; each once>

Next
1. Open a new session: the OS rules are injected at session start, from the config just written.
2. Run `pos-guide`: which skill to start a session with, what each one calls, the agents by trade, and
   where to begin for this product. The skills and agents come from the plugins: the product's
   `.claude/skills` and `.claude/agents` stay empty, and that is expected.
3. Then the way in it recommends. Never `pos-domain` by default: it integrates a unit of the trade
   into a product that already runs, and a product with no database or screens yet starts by
   building them.
```

---

## Running it again

Setup is meant to be re-run: after a sign-in expires, on a new machine, after the restart it asked for,
when a module is installed. Each run checks, reports and fills only what is empty.

- Step 1 copies only the templates that are missing.
- Step 1b re-reads CLAUDE.md and brings up only conflicts that are neither adopted nor recorded as a
  standing choice.
- Steps 3 and 5 re-establish the table from scratch: nothing is assumed from an earlier run.
- Step 4 runs only for connectors that are wanted and not usable.
- Step 6 fills only empty keys and verifies the filled ones; Step 6b lists only what is still template.
- Step 7 creates only the bases whose key is empty, and checks the others; `pos-fix-backlog` never
  creates a second base.
- A run with nothing to do ends on one line: "Set up, nothing missing." followed by the connector
  table.

## Claims

- "Connected" is said from a read that answered in this session. "Installed" from `claude mcp get`.
  "Not installed" only after reading the whole list and matching by address.
- A command, an address, a flag or a sign-in method comes from a reference file, whose sources are
  cited. When one fails because the vendor changed it, re-verify it on the vendor's page, fix the
  reference file with the new source and date, and say so. What cannot be verified is written "to
  verify", with how.

## Sources

Claude Code documentation. Each connector's own sources are at the end of its reference file.

- MCP: https://code.claude.com/docs/en/mcp, read on 2026-09-26 and 2026-10-06 (`claude mcp add` syntax,
  `--transport` and `--header`, the three scopes and where each is stored, `.mcp.json` approval, scope
  precedence, `/mcp`, `claude mcp list`, `get`, `login`, `logout`, the status labels, OAuth tokens
  "stored securely and refreshed automatically", claude.ai connectors and the conditions under which
  they load, `disableClaudeAiConnectors`, `ENABLE_CLAUDEAI_MCP_SERVERS`, `${VAR}` expansion in
  `command`, `args`, `env`, `url` and `headers`, unset variables left unexpanded, the credential
  variables read as empty).
- Hooks: https://code.claude.com/docs/en/hooks, read on 2026-10-04 (`SessionStart` and its `source`
  values, `additionalContext` added before the first prompt, the 10,000-character cap, plugin hooks).
- Authentication: https://code.claude.com/docs/en/authentication (claude.ai login needed for
  connectors; `claude setup-token` cannot fetch them).
- Permissions: https://code.claude.com/docs/en/permissions (`/permissions`, `mcp__<server>` rules,
  deny then ask then allow, `mcp__claude_ai_<server>__<tool>` names).
- Interactive mode: https://code.claude.com/docs/en/interactive-mode (the `!` shell mode "Adds the
  command and its output to the conversation context").
- CLI reference: https://code.claude.com/docs/en/cli-reference (`claude --continue`).
- Plugins: https://code.claude.com/docs/en/discover-plugins (`claude plugin list` with version, scope
  and status).
- Skills: https://code.claude.com/docs/en/skills (`${CLAUDE_PLUGIN_ROOT}` in a plugin skill).
- The installed CLI, `claude mcp --help`, `claude mcp add --help` and `claude mcp login --help`: the
  `⏸ Pending approval` status, `--header`, `login` accepting a claude.ai connector, `--no-browser`.
- Observed while setting up a product on 2026-10-06: a server added mid-session absent until restart,
  a sign-in from an IDE extension failing, a token reaching the transcript through `claude mcp get` on
  another project.
