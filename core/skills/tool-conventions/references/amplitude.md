# Amplitude

Product analytics, when `analytics.provider` is Amplitude. With another provider, sections 2 to 4 still
hold in principle (identify by the product's user id; client events go missing; cross with server-side
sources); the tool details do not. Operation names are Amplitude's (`get_amplitude_context`,
`get_amp_user_data`); find the callable name in the session (SKILL rule 1).

**(observed)** marks a behaviour seen in use and not stated in Amplitude's documentation.

---

## 1. The project

- The project is `analytics.project_id` (Amplitude calls it `appId` or `projectId`). Empty: say that
  analytics are not configured. Don't pick a project from the list by its name.
- At the start, call `get_amplitude_context` without a project: it returns the organisation and the
  projects this account can open. Check that `analytics.project_id` is among them. Then call it with
  the project: it returns the timezone, the session definition, the currency and the project's AI
  context.
- **Note the project timezone.** Every timestamp you report is converted, and its zone stated
  (collaboration rule 8).
- Event and property names belong to the project. Look them up in the taxonomy before filtering on one;
  never guess an event name.
- Access follows Amplitude roles: "Use MCP (read)" and "Use MCP (write)" are separate permissions, and
  without them a call fails even for an administrator.

## 2. Identifying a user

- **By the product's user id**: the id the product passes to the analytics SDK when the user signs in,
  usually the auth user id. Read it from the product's database first (a SELECT, read only), then look
  the user up with `userId`.
- **Not by email.** `get_amp_user_data` resolves an email only when the project uses the email as its
  user id, or through a fallback search. That lookup has failed on users who exist (observed). A failed
  email lookup proves nothing.
- If several users match, the tool answers "ambiguous" with candidates: call again with the
  `amplitudeId`.
- Activity before sign-up carries only a device id. Look it up with `deviceId` when you have one.

## 3. Reading a timeline

- Call `get_amp_user_data` with `include: "timeline"` (or `"both"` to add the profile). Set
  `includeEventProperties: true` when you need the page URL, the referrer or what was clicked; it is off
  by default.
- The timeline returns the most recent events: 50 by default, up to 1000 (`eventLimit`). `timestamp`
  anchors it, returning the events before that moment: for an older period, anchor it at the end of
  that period.
- A timeline is large. Summarise it with a script rather than reading it into context: drop the SDK's
  automatic events (`[Amplitude] ...`) unless they matter, sort by time, write one line per event (time
  in the project timezone, event, page, the properties that matter).
- Cite the source of every fact: "Amplitude timeline", "server event log", "current table state".
- Profiles hold personal data (email, country, device). Copy into shared pages only what the purpose
  needs, and never a client's name (collaboration rule 41).

## 4. Events that are not there

- **Client-side events can be missing.** Amplitude's SDK documentation: ad blockers can drop events. A
  product may also send client events only from production, not from local or preview environments;
  the product's analytics memory says which.
- **An empty or short timeline is not inactivity.** Never write "the user did nothing" or "never came
  back" from Amplitude alone.
- **Cross with server-side sources**: the product's own event or audit log, its session table, its
  business tables (what exists now). Events that the server emits, or mirrors to Amplitude, survive ad
  blockers; the product's analytics memory lists them.
- A statement about what a user did or did not do crosses at least two sources before it is written as
  a fact.

## 5. Writes

Reading users, timelines and charts is a read: announce it. The Amplitude tools also create, change and
delete events and properties in the taxonomy, manage cohorts, dashboards, experiments and flags, and
share content. Those change what the whole team sees, or what users get: each needs a go (SKILL
rule 6).

## 6. Checklist

- [ ] Callable name found; `analytics.project_id` read from the config and present in the accessible
      projects.
- [ ] Project timezone noted.
- [ ] User identified by the product's user id, read from the database.
- [ ] Event names taken from the taxonomy, not guessed.
- [ ] Timeline summarised by script; each fact cites its source.
- [ ] No conclusion of inactivity from Amplitude alone; a server-side source crossed.
- [ ] No taxonomy, cohort, flag, experiment or sharing change without a go.

---

## Sources

- Amplitude MCP server (tools; `get_amp_user_data` for profiles, properties and timelines; project
  settings including timezone; separate read and write MCP permissions):
  https://amplitude.com/docs/amplitude-ai/amplitude-mcp
- Amplitude Browser SDK 2, "Common issues" (ad blockers can drop events; a proxy is recommended):
  https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2
- Tool descriptions and schemas of `get_amp_user_data` and `get_amplitude_context`, and the server's
  instructions, read on 2026-09-26 (identifiers `userId`, `email` with its resolution and fallback,
  `deviceId`, `amplitudeId`; ambiguous matches; `eventLimit` default 50, maximum 1000; the `timestamp`
  anchor; event properties off by default; call the context first; discover event names before
  filtering).
- Observed in use: email lookups failing for existing users; client events absent for users behind ad
  blockers and outside production.
