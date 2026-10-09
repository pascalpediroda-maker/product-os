---
name: pos-user-activity-report
description: >
  A self-onboarding activity report on the latest sign-ups: for each new user, cross the product's
  database (accounts, server event log, sessions, profile), the analytics timeline and what they said
  to the product's AI assistant, assign an engagement cohort, write one entry per notable user in the
  feedback base (Type = self-onboarding), and suggest a CRM action without writing the CRM. The tables
  and events are read from the Support pivot (section 10). Manual: the owner runs it. Use when someone
  says "activity report", "user activity report", "who signed up this week", "the latest sign-ups",
  "how are the new users doing", "/pos-user-activity-report".
---

# User activity report

## Why this skill exists

A product acquired self-serve has users who sign up alone, with no person in the loop. Without this
report, the owner does not know **who** signed up, **where** they are (their engagement cohort), or
**what to do** (follow up, cover the unit they explored, mark them lost). This skill turns the
product's instrumentation into one actionable point, a trace in the feedback base, and a CRM
suggestion.

**Manual, never on a loop.** The owner runs it when they want to take stock.

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles.
Sections of the Support pivot, `<pivots.dir>/product_support_context.md`, are cited by number: 4 The
team, 10 Activity.

## Read first

1. **The product config:** `databases.feedback`, `databases.crm`, `analytics.provider`,
   `analytics.project_id`, `pivots.dir`, `pivots.domain`, `product.team_language`.
2. **The Support pivot,** sections 10 and 4.
3. **The analytics memory and the database gotchas** the memory index names (the event catalogue,
   where events fire, column names that surprise).
4. **The `pos-tool-conventions` skill:** its rules, then its Supabase (or the product database's),
   Amplitude and Notion references, before the first call of each tool.
5. **The feedback base's schema:** `pos-core`, `skills/pos-setup/references/bases/feedback.md`. Its
   property names are the OS's, in English.

Section 10 empty: say so, list what it must hold, and stop. Never guess a table or an event name.

## Input

The owner runs it, optionally with a window: "the last 7 days", "since Monday", "the last 20
sign-ups", an email domain. **Without one: the default window of section 10** (7 days by default).

## Data sources (all grounded; invent nothing)

| Source | What | Where it is named |
|---|---|---|
| Accounts | the new sign-ups: ID, email, created, confirmed | section 10, Accounts |
| Server event log | the server-side funnel: each action, its details, its date, its space, its user | section 10, Server event log |
| Sessions | start, last heartbeat, end, duration, entry page, source, device, country | section 10, Sessions |
| Profile | who the person is: name, organisation, role, country, last activity | section 10, Profile |
| Analytics | the behavioural timeline per user (client events) | `analytics.project_id`; the user identified by the join key of section 10, never by email (`pos-tool-conventions`, Amplitude reference) |
| Assistant conversations | what the user said to the product's AI assistant | section 10, Assistant conversations. **Only when there are some;** otherwise nothing is written |

Join every source on the **join key** of section 10, and check its traps there (an ID that looks the
same and is not). Check the schema before any unusual query: wrong column names are the most common
error.

Every query is a SELECT, announced first (rule 34, `pos-tool-conventions` rule 2).

## Cohorts

Unless section 10 sets its own, the default cohorts, written with the **event roles** of section 10:

| Cohort | Definition |
|---|---|
| **Never engaged** | sign-up confirmed AND no "first exploration of a unit" AND more than 7 days since sign-up |
| **Explorer stuck** | at least one "first exploration of a unit" AND not Committed AND more than 21 days since the last session |
| **Uncovered interested** | at least one exploration of a unit **the product does not cover yet** (section 10, Uncovered unit), with intent (a long view, an interaction with a call to action, or a return visit) AND no covered unit used |
| **Committed** | emitted "activation" |
| **Habit user** | at least 3 "session start" in 14 days |
| **Power user** | at least 5 "deep usage" events, or one deep run, in 30 days (often absent from early instrumentation) |
| **At risk** | (Engaged or Committed) AND more than 21 days since the last session |

A user who just signed up, with no signal yet (too recent for Never engaged), is **Fresh, too early**:
do not force a cohort, say so.

## Pipeline

1. **List the sign-ups** in the window from the accounts table: ID, email, created, confirmed.
   Leave out the team's accounts (section 4).
2. **For each user, cross:**
   - the server event log: which actions, when, so where they dropped off. Sign-up started and never
     confirmed: **a suspected mail deliverability problem**, grouped by email domain. Confirmed and no
     space created: dropped at onboarding. A space created and no activation: not activated. The
     funnel steps and what each means are in section 10;
   - the sessions: how many, total duration, entry page and source, device, country;
   - the profile: who this person is;
   - the analytics timeline: which units they explored, with what intent;
   - the assistant conversations, when there are some.
3. **Assign the cohort** (the table above).
4. **Infer the persona** from the role or profile when it can be identified, among the options of the
   feedback base's `Persona` property. Otherwise leave it empty.
5. **Write one feedback entry per notable user** (below). Group the "Fresh, too early" users with no
   signal into one line of the summary rather than a page each.
6. **Suggest a CRM action,** in the entry's body, without writing the CRM (below).
7. **Write the summary for the owner** (Output).

## Writing to the feedback base

The base is `databases.feedback`. Empty: say "`databases.feedback` is not configured", give the
entries in the report as text, and offer the core `pos-setup` skill to create it.

Announce the write, then create one page per engaged or notable user (never for the fresh ones with no
signal), with the data source as its parent; fetch each back (`pos-tool-conventions` rule 7).

Properties (the OS names, `feedback.md`):

```
Name     : "<first and last name, or the email> (<organisation if known>) (self-onboarding)"
Type     : "self-onboarding"          (the option exists in the OS schema)
Persona  : one of the base's options when it can be identified, otherwise empty
Date     : the sign-up date, YYYY-MM-DD
Tags     : ["Onboarding"] (+ "Usage" when there is real activity)
Verbatim : the most telling thing said to the assistant (200 characters at most) WHEN there is one, otherwise empty
```

Body:

- **Profile:** who (role, organisation, public researcher or professional ID if any, country), where
  they came from (entry page, source).
- **Funnel:** where they are, or where they dropped off, with the timestamps (in the analytics
  project's timezone, stated).
- **Cohort:** the cohort assigned, and why.
- **Deliverability signal:** sign-up started and never confirmed on an institutional domain: flagged
  explicitly.
- **What they said to the assistant,** when there is something; otherwise "No conversation with the
  assistant".
- **Suggested action** (CRM below).

## CRM: a suggestion, never a write

The feedback base has a `Contact CRM` relation to `databases.crm`. **By default, the CRM is never
written.** The entry's body **suggests**:

- the status to set, from the cohort (in trial, active, lost);
- the action (follow up by email, offer to cover the unit they explored with intent, mark lost when
  Never engaged for more than 14 days).

The owner applies it in the CRM. When the user matches a contact already known (in the feedback base
or the CRM), say so in the entry.

## Output (for the owner, 10 to 15 lines)

At the end of the run, in `product.team_language`, status first (rule 22):

- **N sign-ups** in the window, by cohort.
- **The 2 or 3 users to act on first** (Uncovered interested: cover their unit; Committed: build on it;
  a suspected deliverability problem on an institutional domain).
- **The deliverability signal** in aggregate: how many sign-ups started and never confirmed, by domain.
- **Links** to the entries created.

## Rules

1. **Never invent:** no quote, cohort or action that the data does not support. No signal: say so
   ("Fresh, too early").
2. **Check the schema before querying** (the join key and its traps, the column names of section 10).
3. **Client events can be missing** (fired only from production, dropped by ad blockers; section 10).
   An empty timeline is not inactivity: rely on the database, and cross two sources before writing a
   fact (`pos-tool-conventions`, Amplitude reference, section 4).
4. **No customer name in a generic insight.** The named report stays in the user's own entry.
5. **Don't flood the base:** one page per notable user, the fresh ones with no signal in one line of
   the summary.
6. **Cross with what exists:** a user who matches a known contact (feedback base or CRM) is said.
7. **The CRM is a suggestion only.**

## How it fits

| Skill | Relation |
|---|---|
| `pos-support` | same sources (database and analytics) to rebuild one user's journey; another purpose |
| `pos-fix-backlog` | a bug seen while reading a journey is filed there (`Source` = `Dev session`) |
| The Discovery module | reads the entries this skill writes in the feedback base |
