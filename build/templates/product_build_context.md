# Build context

Skeleton version 1, maintained by `pos-build`.

Copy this file to `<pivots.dir>/product_build_context.md` (by default
`.claude/product/product_build_context.md`) and fill it below the separation line before running a
skill of the Build module. It is the Build pivot: the rules every build session and every build
agent applies (above the line, maintained by the OS), and this product's facts those rules need
(below the line: stack, paths, helpers, tenants and roles, database, runtime, interface, AI agents,
tests, commits).

## Who reads it

| Reader | What it takes from here |
|---|---|
| `pos-build` | all of it before the first code: the rules, then the sections the request touches |
| `pos-dev` | the same, and it injects into each agent's brief the rules and sections that agent needs |
| `pos-check-rls` | rules S7, S16; sections 4 and 6 |
| `pos-post-impl-checklist` | rules S2, S14, S16; sections 3, 6, 7, 8, 10, 11 |
| `pos-audit` and its auditors | the rules as the reference an audit checks against; sections 1 to 9 |
| `db-engineer` | rules S7 to S10, S15, S16; sections 4, 5, 6 |
| `backend-dev` | rules S1 to S10, S14; the AI rules when it touches an LLM call; sections 1, 3, 4, 9 |
| `frontend-dev` | rules S11 to S14; sections 1, 2, 8 |
| `qa-engineer` | rules T1 to T6; section 10 |
| `devsecops` | rules S2, S8, S10, S14, S15; sections 4, 7 |
| `ai-engineer` | the AI rules, all of them; section 9 |
| `prd-ux` | section 8 |

## Rules for everything below the separation line

1. **One fact, one place.** What the product's `CLAUDE.md` already states (the test space, the
   evidence folder, the branch policy) is pointed to, not copied. A section that outgrows a screen
   moves to a reference file in `memory.dir`, listed in the memory index, and this page keeps a
   one-line pointer.
2. **No customer, institution or person names.** Describe by type. People are named by role.
3. **No secret.** No key, token, password or connection string. Name the variable or the file that
   holds it.
4. **A thin section is honest.** "None" and "not known yet" are findings. A skill or an agent that
   reads an empty section says so and continues without inventing what it would have held.
5. **Language.** Headings and table columns stay in English, so skills find them. Content is written
   in `product.team_language`.
6. **Section names are a contract.** Skills and agents cite sections by number and name, and rules
   by their code (S1, AI3, T2). Keep them; add the product's own sections after section 11.
7. **A product may lift a rule.** Write it in the section concerned, with the rule's code and the
   reason in one sentence. Without that line, the rule applies.

---

## Rules: building a multi-tenant SaaS (S)

These rules come from incidents on a product in production. They assume a web app with server routes
and a database with row-level security (RLS). On another stack, apply the equivalent and say which
rule does not apply.

**S1. The server is reached through routes only.** When the framework offers server actions whose
identifiers are derived from the build, none are used. Every deploy invalidates the identifiers held
by tabs already open: the browser posts an identifier the new server never registered, and the
button dies silently (it hit the activation path after every redeploy). A route URL survives the
deploy. Client forms call the route and read JSON.

**S2. Every route authenticates, with a local check.**
- Every route calls the auth helper named in section 3, which verifies the session token locally
  against the auth server's published keys and still refreshes the session. Not authenticated: 401.
  A route that must be public says why in a comment.
- **Never a network "get the user" call in server code.** Each one is a round trip to the auth
  server. All server traffic leaves through one IP and shares one per-IP rate-limit bucket: under page
  fan-out the auth server answers 429, the token refresh riding along fails, and users are logged out
  mid-session (incident: 200 such calls in 8 seconds). Two exceptions only: a user field absent from
  the token (creation date, confirmation date), or a revocation that must be observed at once rather
  than at token expiry. Both are enumerated in a guard test that fails on any new occurrence
  (section 3). In the browser, the network call is forbidden too (a round trip held under the
  cross-tab auth lock): use the client-side helper of section 3.
- **"Could not check" is not "signed out".** The helper returns no user only when there is no
  session or the auth server rejected it. When the auth server cannot be reached, it throws a
  distinct error: let it propagate (the route wrapper answers 503, the middleware shows a page that
  retries). Never catch it into a 401 or a redirect to the login page: that sent users with valid
  sessions back to login, tab after tab. Every database client goes through the guard of section 3,
  so that a 429 or a 5xx on the token refresh never makes the auth library delete the session cookie.

**S3. Prefer the shared route wrapper** (section 3) for consistent authentication and error logging.
A route that does not use it follows the manual pattern of S2 and S5.

**S4. Response format and status codes.**
- Success: `{ data }`, whose shape varies by endpoint. Error: `{ error: string }` with the status.
  Paginated: `{ items, total, offset, pageSize, hasMore }`.

| Code | When |
|---|---|
| 200 | success (GET, PATCH) |
| 201 | resource created (POST) |
| 400 | invalid input, missing fields |
| 401 | not authenticated |
| 403 | authenticated but not authorised (not a member, not an admin) |
| 404 | resource not found |
| 409 | conflict (duplicate, already exists) |
| 500 | server error (database failure, unexpected) |
| 503 | the auth server could not be reached (S2) |

**S5. Errors are handled and logged, never swallowed.** Multi-step operations in try/catch. The
structured logger of section 3, never a bare console error. Log the context (user, item, operation),
never the content.

**S6. One table turns a role into capabilities.** Section 4 holds it. It is enforced at three
levels: the access policies, the routes, the interface.
- Server: the helper of the capability the route needs (writing content needs the editor capability,
  an anchored comment the commenter capability, a read or a discussion message membership, members,
  settings and restore the admin capability). Same contract for all (the member's id and role, or a
  403). A guard test fails when a write route falls back to a membership check (section 4).
- Client: the permissions context of section 4, mounted once. Buttons are gated on capabilities;
  editors take their lock from the field layer, not field by field.

**S7. Tenant isolation.**
- Every query is scoped: by the tenant's id, with membership verified. Never data across tenants,
  even in an admin or debug route.
- RLS is the primary gate; application code is the second gate (defence in depth).
- A new table: its access policies first, then the code that reads it.
- Never send data from tenant A to an LLM call made for tenant B.

**S8. The admin client is the exception.** The database client that bypasses RLS (the service role)
is used only when RLS genuinely cannot do the operation (for example a cross-user insert during an
invitation), with a comment that says why. Its key never reaches client code.

**S9. Coupled writes are one transaction.** A flow that inserts into more than one coupled table
(parent and children, parent and junction tables), or replaces rows (delete then insert), is one
transactional database function, never a sequence of inserts in a route. Why: a sequence of inserts
in application code is not transactional. A creation route chained eight inserts; the fourth could
fail silently, the route still answered 200, and orphan items reached production.
- One insert: a plain route. Two or more inserts on tables linked by a foreign key: a transactional
  function, always. Two or more on independent, non-critical tables: may stay in the route, with an
  error log and a status flag.
- The function: `SECURITY DEFINER`, `SET search_path = public`, inputs validated by `RAISE EXCEPTION`
  first (Postgres rolls everything back on a raise), inserts in foreign-key order, a JSONB result
  when the route needs several ids; then `REVOKE ALL ... FROM PUBLIC` and `GRANT EXECUTE ... TO
  service_role` (S16). Section 6 names the product's reference example.

**S10. Customer data is confidential.**
- Private storage buckets only; file access through time-limited signed URLs.
- No customer content in logs (texts, amounts, names of people or organisations).
- No public API route (S2).
- The service-role key stays on the server.
- LLM context is sanitised per tenant (S7).

**S11. Interface states follow the design system** (section 8).
- Loading: the design system's spinner. Empty: its empty-state container. Error: an inline alert
  box. Never `alert()` or `confirm()`.
- A large or growing list loads by infinite scroll (an observer on a sentinel element, a `hasMore`
  flag), never by pagination buttons.

**S12. Performance.**
- Heavy components (rich text editors, document editors, anything over about 30 KB with complex
  dependencies) are lazy-loaded.
- Server components by default; a client directive only when hooks are genuinely needed, never on a
  layout file unless there is no other way.
- Server-only modules (file system, paths) are never imported at the top level of a shared file.

**S13. Real-time and navigation.**
- Real-time subscriptions rather than a full page refresh. A one-shot refresh is acceptable for a
  rare action (creating an item).
- Never wrap the router refresh in a transition: the interface freezes.
- Drag and drop: optimistic local state, then a debounced save.
- Navigation state lives in the URL query parameters; every link is a real navigation with history.

**S14. Load is costed before it ships.**
- Any mechanism that runs per page open, per tab or per element (a real-time subscription, a
  re-read, an automatic relaunch, a check) is costed before delivery: requests per trigger x triggers
  per minute x tabs x users, against the database's connection limit (section 7). Count the
  reconnections, the tab wake-ups and every change of identity of an array or object in a hook's
  dependencies.
- No client loop without a server guard (grouping, a cap per item). Incident: one item open in two
  tabs made about 2,000 requests a minute and production went down.
- For a load incident, the costing is set at RED, before any fix is proposed: the formula written,
  the inputs measured (cost of one cycle, cycles per minute read in the logs, the saturation threshold
  observed), the result in requests per minute for 1, 2, then N tabs and users. A load report
  without that line is incomplete, even when the mechanism is found. The mechanism that amplifies is
  not the cause that starts it: a cause is stated only once its trigger is measured.

**S15. One production database: analysis is bounded.**
- Every analysis query sent through the database connector runs inside a transaction that starts with
  `set local statement_timeout` of 10 s at most:
  `begin; set local statement_timeout = '5s'; <query>; rollback;`. A cheap plan proves nothing: four
  regex queries on a table of 58 rows, with a planner cost of about 1,800, ran 25 s each while the
  production API timed out. Regex, a text cast of a JSONB column, an unbounded join and
  `generate_series` are heavy by default. A bigger analysis runs on a local export, never on the
  database. The `guard-heavy-sql` hook of this plugin refuses such a query when it is not bounded.
- No `ALTER TABLE`, `LOCK TABLE`, `TRUNCATE` or `DISABLE TRIGGER` for a test, except in a time window
  the owner chose, with the owner's go: each takes a lock on the whole table for every tenant until
  the transaction ends, and users' saves wait behind it. To neutralise a trigger in a test, use a
  transaction-local setting that the trigger function reads (`set_config('<flag>', 'on', true)`), or
  measure with the triggers active.
- A test transaction lasts a few seconds. After a series of tests, check `pg_stat_activity`: no
  session idle in transaction, no strong lock left.
- A function time measured through the connector is not the real time: the application's API layer
  has its own statement timeout, and a timeout set on a function does not extend the call in progress.
- Shared services (a document parser, a background worker): one heavy test job at a time, never
  during a deploy.

**S16. Migrations.**
- Through the connector's migration operation only. Never `CREATE TABLE` in direct SQL outside a
  migration: backup tables of customer data created that way sat exposed to the anonymous key.
- **RLS on every table, reference tables included.** "No tenant filter" does not mean "no RLS": read
  that way, dozens of tables stayed readable and writable with the publishable key for months. A
  reference table: RLS enabled, a read policy `USING (true)` for the signed-in role, no write policy
  (the server writes, and the service role bypasses RLS).
- The policies are written in the same migration as the table. When the product has an event trigger
  that enables RLS on every new table (section 6), a new table is closed to everyone but the server
  until its policies exist.
- **A `SECURITY DEFINER` function** runs with its owner's rights and bypasses RLS: either it checks its
  caller (a membership helper, `auth.uid() = <param>`), or `REVOKE ALL ... FROM PUBLIC, anon,
  authenticated` then `GRANT EXECUTE ... TO service_role`. Revoking `anon` and `authenticated`
  without `PUBLIC` changes nothing: Postgres grants EXECUTE to PUBLIC by default.
- After any DDL, read the database's security advisors.
- Before a `DROP` or an irreversible `ALTER`, list the consumers and their history
  (`git log --all --source -- <consumer>`). Without that check written down, the migration is not
  applied.
- **Additive or behaviour-changing.** An additive migration (a new table with its policies, a new
  column that live code does not read yet) follows the normal path of development. A migration that
  changes what exists (GRANT or REVOKE, a policy of a table in service, a function the policies call,
  a column live code reads, a deletion) is written with its rollback migration, presented on its own
  line of the risk card (`pos-post-impl-checklist`, Gate 5b) and never applied before the go that
  names it. It never rides along in the go of a code batch.
- The public-surface invariant test (section 6) stays green.

---

## Rules: engineering the product's AI (AI)

They apply when `product.ai_agents` is true. Section 9 holds the product's facts.

**AI1. Every LLM call on user data goes through the abstraction.** Section 9 names the abstraction
and the resolver that picks the provider per tenant (a tenant may bring its own key). Never import a
vendor SDK or call a vendor API outside its provider class. A new capability (tools, streaming, a
reasoning setting) is added to the shared options interface and implemented in every provider.
Exception: a surface that processes only public data may call a provider directly; such surfaces are
listed in section 9. Before calling a surface an "own-key gap", check that list.

**AI2. No vendor name in shared code.** Not in function names, variables, types, error messages, nor
user-facing text ("the AI provider"). Allowed: inside the provider class, metadata strings, constants
scoped to one provider, a comment that documents a quirk. A deliberate exception (a model picker that
names models) is recorded in section 9. Test: would the name still make sense if the tenant ran on
another provider?

**AI3. Temperature by family. This table rules; any other statement yields to it.**

| Family | Temperature | Why |
|---|---|---|
| factual, extraction (any agent that produces a ground truth, an audit, an import) | 0.30 at most, 0.20 by default | determinism on facts |
| drafting, generative (text the user will read and edit) | 0.5 | clamping generation degrades the writing |
| creative (divergence wanted) | up to 0.7, bounded by explicit grounding | |

Why: a file that said both "writers at 0.30 at most" and "0.30 to 0.50", and a compliance gate at
0.3 for all, led to every generator being lowered to the same value by one mass update. Nobody could
date it: the agents table had no versioning. Section 9 maps the product's agent families to these
rows.

**AI4. Grounding.** A factual agent receives its source content explicitly in the user prompt, never
"recall it". It receives a JSON schema or a strict structure when its output is parsed downstream. Its
system prompt says, concretely, "if a value is not in the source, return null or an empty array; do
not infer". An agent that produces a list cites the source location of each item. Anti-hallucination
forbids fabricated facts, not drafting latitude: a drafting agent keeps its freedom to phrase,
structure and propose angles. Base snippet, to adapt:

```
ANTI-HALLUCINATION GUARDRAILS:
- Use ONLY data provided in the context. Do NOT invent statistics, references, names, or capabilities.
- If data is insufficient for a section, state what is missing rather than fabricating content.
- Quantitative claims MUST be traceable to the input data or flagged as needing verification.
- Do NOT cite sources not present in the provided library.
```

For a generative agent, keep the first two lines and drop what constrains the writing.

**AI5. Malformed JSON is fixed with an output example, never a retry loop.** A JSON agent that
intermittently returns invalid JSON gets a concrete, fully escaped, valid output example in its
prompt, mirroring the agents that already carry one. No ad-hoc retry loop in the agent runner: it is
the wrong layer, it widens the blast radius and masks the fix. A bounded exception (one more ask in a
long pipeline where one malformed answer in dozens is random, then a loud failure, every attempt
logged without content) is recorded in section 9 and never replaces the example. An agent running
inside a parallel batch aborts the whole batch with one malformed output: harden it promptly, never
swallow the error.

**AI6. Forcing a tool call.** A prompt alone does not make a model call a tool first: an agent told
"never invent, call the search first" still produced invented results without calling it. When an
intent requires a tool, force the tool on round 1 only, then let the model choose (`auto`) from
round 2 so it composes the answer from the tool's results. Never force on a greeting, never on every
round, never a post-hoc "retry if no tool was called". **Never force a tool on a reasoning model:** it
writes its reasoning as a malformed tool call, at about thirty times the latency. Providers spell it
differently (`required`, `{ type: "any" }`); check that the abstraction supports the form before
using it.

**AI7. Tool loops that are persisted.** An assistant message that carries tool calls keeps
`content: null`, never an empty string. A provider silently drops an assistant message with empty
content and tool calls; the next tool message then follows the system message and the API rejects
the request (message order error). No intermediate layer converts null to an empty string.

**AI8. Output token cap.** Not sent by default: a cap truncates JSON or cuts text mid-sentence. Set it
only for short, predictable agents (a classification, a single field) or a benchmark that must stop
early. Cost is observed through usage tracking, not capped. Exception: a provider whose default cap,
when none is sent, is low (8,192 tokens) gets the model's real maximum set explicitly. A thinking
model can spend that budget before writing: on extraction, disable thinking with the smallest value
the model accepts (an alias may refuse zero). A truncated answer fails loud (finish reason "max
tokens" raises an error) and nothing partial is written.

**AI9. Model aliases move.** What an alias ending in `-latest` designates can be re-pointed by the
vendor without notice. Pin a dated version where behaviour must be stable. Read what an alias
designates from the vendor's model list, never from memory.

**AI10. Long calls under concurrency** use a fresh connection (no keep-alive) and an abort signal
with a timeout, so a dropped connection gives a clean timeout instead of a vague fetch failure.

**AI11. Diagnose a provider error from the server log line** that carries the provider's status and
body (logged long enough to read), never from the message shown to the user: a friendly message
replaced the raw one and named the wrong provider for two weeks.

**AI12. Compliance of every agent.**
- User-facing output in `product.ui_language`, declared in the prompt.
- No vendor or model name in prompts or outputs (AI2).
- The output format declared: HTML (the format, examples, sanitisation: no script, no inline
  JavaScript), JSON (a schema or an example, and validation downstream), markdown (the heading
  hierarchy).
- No customer or institution name, no internal data (tenant ids, slugs, table names) in user-facing
  content.
- Missing input is stated ("the source does not contain X"), never invented.
- The compliance query of section 9 runs after every agent insert or update; its temperature gate is
  calibrated per family (AI3). A gate that contradicts the rule it enforces is worse than none.

**AI13. The change protocol.** Any change to a prompt, a tool definition, a tool executor, a stream
route (intent, tool choice, loop), the LLM abstraction, the agent registry or a pipeline of agents
follows it, without exception.
1. **Read before editing:** these AI rules, section 9, and the current version in full (select the
   stored prompt, read the file). Identify which assistant the change concerns (section 9 lists the
   product's assistants and their zones): a change made to the wrong one breaks the wrong AI.
2. **The AI engineer role does the change,** even a small tuning. The lead does not edit these zones
   unless the owner explicitly accepts the shortcut (a clear revert).
3. **Verify each delivery:** open the files and rows actually changed and check them item by item
   against the brief.
4. **Never test on the live row.** A prompt stored in a database that local and production share is
   live the moment it changes. Put a copy under another key that production never resolves, select
   it locally only (section 9 says how), run the local QA on the copy, push on the owner's go, then
   promote byte for byte after a full snapshot of the live value, and deactivate the copy. Every brief
   carries the line "LIVE <row> FORBIDDEN; only <copy> may change".
5. **A bench before and after,** several runs, with a judge per item rather than a string match
   (collaboration rule 9).
6. **A full snapshot before any update of a stored prompt:** the complete text, not its length. A
   rollback delivered truncated made a revert impossible.

**AI14. Anti-patterns, forbidden.**

| Anti-pattern | Why |
|---|---|
| Detecting intent by keyword matching on the user's message | false positives and negatives; breaks the intent the request already carries |
| Forcing a tool unconditionally, by view | breaks conversations (the assistant can no longer ask a clarifying question) |
| Prompt bloat: stacking "NEVER fabricate X" sections | models ignore repeated instructions; the fix is a tool that rejects, not a prompt rule |
| String magic on the user's message (`if message.includes('[MARKER]')`) | couples interface and route through text; use the request's intent field |
| Renaming a field of a tool response without tracing its consumers | breaks downstream agents and code; search the field name everywhere first |
| Editing a prompt without reading its current version in full | adds a section that duplicates or contradicts what is there |
| Applying a change meant for one assistant to another | distinct architectures; the wrong AI breaks |
| Forcing a tool by name without checking that the abstraction supports that form | providers expect a precise format |
| Editing a stored prompt without a full rollback snapshot | no version history on the database side |
| A global regex guard to catch one agent's fabrication | over-reaching (threatens tuned flows, false positives) and covers one format only; fix the prompt and ground through a tool |
| Asking the model to compose an identifier from several sources | the tool returns a pre-formatted field (a link, an internal URL) |
| Leaving to the prompt what a tool can enforce | the tool rejects invalid input explicitly (hallucinated ids), and the model corrects |

**AI15. Reflexes.**
- A tool rejection beats a prompt instruction: when a behaviour must be forbidden, the tool returns
  an explicit error the model reads and corrects.
- The request's intent field beats keyword matching: an interface element that must trigger a special
  behaviour sends an explicit intent.
- A format instruction does not hold once large tool results follow it. What holds: the model writes
  only its own part through a tool that validates it and rejects otherwise; the code composes the
  rest from declared data.
- A tool that answers empty to an invalid argument is a silent failure: the model reads "nothing" as
  "there is nothing" and answers confidently beside the point. A missing or out-of-range argument is
  rejected explicitly (valid values, examples, "this does not mean it is empty"). A failed read never
  becomes an empty list.
- Measure with the real inputs: the real text a button sends, and the real tool arguments read in the
  server logs or the stored messages, not in a truncated display.

**AI16. Drift.** Symptoms: an output schema that breaks, invented values, a format regression, the
same input pattern giving very different outputs, a judge score that drops on the bench. Then: RED,
capture the bad output with its real inputs; compare with a known-good output to localise; GREEN, fix
the prompt at the root, never a parser downstream; REFACTOR, add the case to the bench with a judge
per item, so the regression cannot pass silently again.

---

## Rules: tests (T)

**T1. One dev server.** End-to-end tests reuse the server already running; never start a second one
(memory exhaustion and a corrupted build cache on a single machine). If none runs, the test runner
may start one itself when its configuration reuses an existing server. A session asks the owner
before starting a server (collaboration rule 8).

**T2. Authentication in tests.** A setup step signs in with a test account's password and saves the
session state that the authenticated tests reuse. Credentials live in the local environment file,
never in the repository. The setup lands on a neutral page, never inside a tenant's space (the first
one listed may be a customer's). A test never clicks "log out": it destroys the session for every
test after it. A session token expires: a run longer than its lifetime fails mid-way. Before
concluding that tests are blocked from a stale file, read `origin/<main>`.

**T3. Selectors that survive the build.** Role, text, test id, href and HTML id. Never a CSS-module
class name: it is hashed at build time and will not match.

**T4. Independent, patient, clean tests.** Each test runs alone. No arbitrary sleep: wait for a
visible element, a URL or a response. A test that creates data removes it, or uses isolated
fixtures. A writing test uses the test copies of section 10, never a reference or an imported item
(collaboration rule 33).

**T5. What a feature's tests cover:** the happy path; the error cases (correct messages, no crash);
the permissions (a non-member is refused, each role sees what it should); the interface states
(loading, empty, error).

**T6. A failing test is triaged.** A bug in the code goes to whoever owns that code, with the
detail. A bug in the test is fixed in the test.

---

## The product sections

| # | Section | What it must answer |
|---|---|---|
| 1 | Stack | the framework, language, styling, database and auth, AI provider layer, rich text, document generation, hosting |
| 2 | Where things are | the code, the specs, the tests, the design system file, the architecture root in memory, the foundation files a lead reads first-hand, the registries of services and pipelines |
| 3 | Routes and authentication | the server and browser database clients, the auth helper, the client-side user helper, the auth-unavailable error, the session-cookie guard, the route wrapper, the logger, the guard tests |
| 4 | Tenants, roles and sensitive data | the tenant levels, the tables scoped to each, the global reference tables, the role table and its capabilities, the permission helpers on server and client, the membership helpers the policies call, what data is sensitive |
| 5 | Data conventions | identifiers, timestamps, soft delete, status encodings, identity traps, rows that may never change |
| 6 | Database | where it runs, how many instances, the connection limit, the API statement timeout, the RLS event trigger, the public-surface invariant test, the reference example of an atomic function |
| 7 | Runtime and failure modes | the services and how each ships, the health probe, where logs are read, the known failure modes a change is checked against, the cost constraint |
| 8 | Interface | the design system and its component library, the interface language, dark mode, mobile primitives, display levels, the real-time conventions |
| 9 | AI agents | where agents live, the assistants and their sensitive zones, the abstraction, the public-data exceptions, the families mapped to AI3, the compliance query, how a copy is tested, the bench |
| 10 | Tests | the runners, their configuration and folders, the dev server port, the test setup, the test accounts by role, the test space and copies, the guard tests |
| 11 | Commits and help content | what is committed and what never is, where build artefacts go, how the help articles are updated |

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

# Product content

## 1. Stack

<!--
Guidance: one line per layer, with the version when it matters. Name what the code imports, not the
marketing name.
- Framework and language, styling.
- Database, auth, storage, real-time (and whether the database is hosted or self-hosted).
- AI: the abstraction layer (never "the provider X"; the providers live in section 9). Leave empty
  when `product.ai_agents` is false.
- Rich text, document generation, other heavy libraries.
- Hosting and orchestration (the details live in section 7).
- Rules that do not apply to this stack (for example S1 when the framework has no server actions),
  with the reason.
-->

| Layer | What the product uses |
|---|---|
| Framework, language | |
| Styling | |
| Database, auth, storage, real-time | |
| AI layer | |
| Rich text, documents | |
| Hosting | |

**Rules that do not apply here:**

## 2. Where things are

<!--
Guidance: paths from the repository root.
- Code, specs (target specs and archived ones), tests, scripts.
- The design system file in `memory.dir` (the same one section 8 names).
- The architecture root in `memory.dir` (the file that indexes the subsystem architecture files), and
  which `routing.zones` key loads it.
- Foundation files: the few files a lead reads first-hand rather than through an agent's report (the
  LLM abstraction, the agent runner, a pipeline at the heart of the product).
- Registries: a memory file that lists the services, workers and pipelines, with what each one is NOT
  for; a generated inventory of views and navigation. "None" if the product has none.
-->

| What | Path |
|---|---|
| Code | |
| Specs | |
| Tests | |
| Design system | |
| Architecture root | |
| Foundation files | |
| Registries | |

## 3. Routes and authentication

<!--
Guidance: the names rules S1 to S5 need. Paths and exported names, as the code spells them.
- Server database client (runs as the signed-in user) and browser database client.
- Auth helper for server code (local token check, S2), and the error it throws when the auth server
  cannot be reached.
- Client-side user helper (S2).
- The guard every database client goes through so a failed token refresh never deletes the session.
- Route wrapper (S3) and structured logger (S5).
- Guard tests: the one that lists the allowed network "get user" calls (S2), server and browser.
- Middleware behaviour when auth is unavailable (the retry page).
-->

| What | Name and path |
|---|---|
| Server database client | |
| Browser database client | |
| Auth helper (server) | |
| Auth-unavailable error | |
| Client-side user helper | |
| Session-cookie guard | |
| Route wrapper | |
| Logger | |
| Guard tests | |

## 4. Tenants, roles and sensitive data

<!--
Guidance: the tenant model rules S6 to S8 and S10 apply to.
- Tenant levels: the top tenant (for example a workspace or an organisation) and any level below it
  (a project). One line each: the table, the membership table.
- Tables scoped to each level, and the global reference tables (no tenant filter, RLS still on).
- The role table: each role's id, name and capabilities (manage, edit, comment, read). The file that
  turns a role into capabilities.
- Permission helpers on the server (one per capability, their contract) and the guard test that fails
  when a write route falls back to membership. The permissions context on the client.
- Membership helpers the access policies call (one per tenant level).
- Sensitive data: what the product treats as confidential (by type), and anything that must never be
  logged or sent across tenants.
-->

**Tenant levels:**

| Level | Table | Membership table | Membership helper (policies) |
|---|---|---|---|
| | | | |

**Tables scoped to each level:**

**Global reference tables:**

| Role id | Role | Capabilities |
|---|---|---|
| | | |

**Role to capabilities file:**

**Server permission helpers:**

**Client permissions context:**

**Guard test for write routes:**

**Sensitive data:**

## 5. Data conventions

<!--
Guidance: the conventions a migration and a query must follow, and the traps of this schema.
- Identifiers (for example a UUID primary key with a default), timestamps (created, updated), soft
  delete (the column, and that every count checks it).
- Encoded values (a status stored as an integer, its meaning, its default; never the string).
- Identity traps (for example a profile id that differs from the auth user id, and which one the
  access policies use).
- Rows or nodes that may never be deleted, hidden or reordered, and which ones may.
-->

## 6. Database

<!--
Guidance: the facts rules S9, S15 and S16 need.
- Where it runs, and whether a separate development database exists. When there is only production,
  write it here: every test touches production.
- The plan and its connection limit (the number S14 costs against), the API statement timeout.
- The event trigger that enables RLS on new tables, and the migration that created it, or "none".
- The public-surface invariant test: its path, and what it fails on.
- The reference example of a transactional function (S9): its name and migration.
-->

**Where it runs:**

**Connection limit, API statement timeout:**

**RLS event trigger:**

**Public-surface invariant test:**

**Reference atomic function:**

## 7. Runtime and failure modes

<!--
Guidance: what runs, and how the product breaks.
- Services: one row each (the app, a background worker, a renderer), its port, how it ships (a push
  that a pipeline deploys, an archive uploaded by the owner), and where its version is read. When the
  Release & Operations module is installed, point to its pivot instead.
- Health probe: the route, what it measures (response time, not "no error"), its verdicts. Whether a
  container health check may point at it (often: never).
- Logs: where the application's logs are read (a tail route, a file, the database's log query).
- Known failure modes: the list a risk card (pos-post-impl-checklist, Gate 5b) runs every change
  against. For example: a session that drops (requests of a signed-in user arriving without a
  session), several tabs (the auth lock, real-time sockets), the auth server's rate limit on the
  single server IP, the database connection limit under a burst, automatic client relaunches, a
  deploy during a long job.
- Cost constraint: the plan the product stays on, and what an increase needs.
- Environment variables: where they live in production, which ones may reach the client (public
  values only).
-->

| Service | Port | Ships by | Version read at |
|---|---|---|---|
| | | | |

**Health probe:**

**Logs read at:**

**Known failure modes:**

-

**Cost constraint:**

**Environment variables:**

## 8. Interface

<!--
Guidance: what a front-end change must follow. Point to the design system; do not copy it.
- Design system file and its living gallery, if any; the component library folder. Tokens only, or
  raw values allowed (say which).
- Interface language (`product.ui_language`), sentence case or not, dark mode or not.
- Mobile primitives (list rows, bottom navigation, sheets) and the minimum touch target.
- Display levels: when the product shows a field only at a deeper level of detail, name the levels
  and the switch, so a new field is placed at its level.
- Real-time conventions: the subscription layer, autosave debounce, what may still use a full refresh.
- Rich text conventions (how mentions or embedded references are stored and displayed).
-->

**Design system:**

**Component library:**

**Language, case, dark mode:**

**Mobile:**

**Display levels:**

**Real-time:**

**Rich text:**

## 9. AI agents

<!--
Guidance: fill only when `product.ai_agents` is true; otherwise write "No AI agents."
- Where agents live: a database table, code files, or both; the agent runner.
- The assistants: one row each (its level, the agents behind it, where its prompt lives, its tools,
  its views). A change meant for one never touches another (AI13).
- Sensitive zones: the files and tables whose change triggers the change protocol (AI13).
- The abstraction and the per-tenant resolver (AI1). Providers in use, and the deliberate exception to
  AI2 if any.
- Public-data exceptions (AI1): one row per surface that calls a provider directly, its file, its
  data source.
- Families: the product's agent prefixes or names mapped to the rows of AI3.
- Constraints injected into every writer, so prompts do not repeat them.
- Compliance query (AI12): the SQL or the script, with the temperature gate per family.
- Testing a copy (AI13 step 4): how a copy is made unreachable by production, and the local override
  that selects it.
- Bench: where it lives, how a run is launched, how results are judged.
- Bounded exceptions to AI5, if any, with where they live.
-->

**Agents live in:**

| Assistant | Level | Agents | Prompt lives in | Tools |
|---|---|---|---|---|
| | | | | |

**Sensitive zones:**

**Abstraction and resolver:**

**Public-data exceptions:**

| Surface | File | Data source |
|---|---|---|
| | | |

**Families (AI3):**

| Agents | Family | Temperature |
|---|---|---|
| | | |

**Injected constraints:**

**Compliance query:**

**Testing a copy:**

**Bench:**

## 10. Tests

<!--
Guidance: the facts rules T1 to T6 need.
- Runners (end-to-end, unit), their configuration files and test folders; the commands to run one
  file and all.
- Dev server port, and the memory file that says how it is started.
- Test setup: the file that signs in, where the session state is saved, the variables that hold the
  credentials.
- Test accounts by role, credentials by variable name.
- Test space and test copies: if `CLAUDE.md` names them, point to it. What must never be used.
- Guard tests (unit invariants) the checklist runs: one per line, with what each guards.
- Evidence folder: the pointer to `CLAUDE.md`.
-->

| What | Value |
|---|---|
| End-to-end runner, config, folder | |
| Unit runner, folder | |
| Dev server port | |
| Test setup | |
| Test space and copies | |
| Evidence folder | |

| Role | Test account | Credentials held in |
|---|---|---|
| | | |

**Guard tests:**

## 11. Commits and help content

<!--
Guidance: what a build session commits, and how users learn of a change.
- Commit scope: the folders committed, the ones never committed (specs, documents, exports, local
  auth state). Point to `CLAUDE.md` or the git reference memory when it states it.
- Build artefacts (archives, bundles): where they go (never the repository root), and the ignore rule.
- Help articles: the process that updates them after a user-visible change (a skill, a script, a
  person), or "none yet".
-->

**Committed:**

**Never committed:**

**Build artefacts:**

**Help articles:**

## Change log

<!-- One line per change: date, what changed, why. -->
