---
name: pos-meeting-notes
description: >
  Analyse a meeting transcript (a PDF or text export from a transcription tool, or raw notes) and
  write a structured write-up as one entry of the feedback base (databases.feedback), the write-up in
  the page body. Use when someone shares a call transcript, a transcript PDF, meeting notes or an
  email with insights, or says "write up this call", "analyse this transcript", "add this meeting to
  the feedback base", "meeting notes for X", "/pos-meeting-notes". Produces an actionable write-up:
  contact profile, discovery insights, pain points, pricing signals, bugs observed, actions, food for
  thought; links it to the roadmap opportunities, the fix backlog entries and the CRM contacts,
  creates what is missing (bugs, contacts), proposes the new opportunities to create, and drafts the
  recap email to send to the participants.
---

# Meeting notes from a transcript

## Why this skill exists

The team holds discovery, demo and follow-up calls with prospects, partners and users of the
product. The transcripts come from a transcription tool (a meeting extension, or the
`pos-meeting-transcript` skill for a recording). The write-up must be structured, actionable, and
written into the feedback base, so it feeds product discovery.

A write-up on its own is useless: its value comes from its links. Each write-up is linked to the
opportunities it supports (an opportunity's social proof is the list of its write-ups), to the bugs it
surfaced and to the CRM contacts. (The owner once had to link a write-up to three opportunities by
hand.)

Two distinct write-ups come out of a call: the internal write-up (the feedback base, for discovery)
and the **recap email** sent to the participants (what we saw for them, who does what). When the owner
asks for "a write-up for <the participants>", it is the email. (A session once produced CRM entries
instead.)

## Before writing

1. **The product config:** `databases.feedback`, `databases.roadmap`, `databases.fix_backlog`,
   `databases.crm`, `modules.*`, `product.team_language`.
2. **The Discovery pivot,** `<pivots.dir>/product_discovery_context.md`, section 1 (Personas).
3. **The `pos-tool-conventions` skill of the core,** its Notion reference, before the first Notion
   call.

`databases.feedback` empty: say so in one line, give the write-up as text in the report, and propose
running `pos-setup` to create the base. Another base empty: the links to it are skipped, and the
report says so in one line.

---

## Expected input

ONE of these:

- **A transcript PDF:** timestamps, speaker, text;
- **Raw text:** a transcript pasted in the chat;
- **An email:** an email holding insights (not a transcript, but it can be processed);
- **Notes:** key points dictated by the owner.

The owner may also give context:

- the contact's name and organisation;
- the type of meeting (Discovery, Demo, Onboarding, Follow-up, Partnership);
- what to highlight.

---

## Structure of the write-up (MANDATORY)

Each write-up follows this structure. Adapt the sections to the content available; never invent what
is not in the transcript.

### Header

```
**{Name}**, {Title / role}, {Organisation}
**Based in:** {City, Country}
**Date:** {date}, {duration} min, {meeting tool} + {transcription tool}
**Type:** {Discovery / Demo / Onboarding / Follow-up / Partnership}
```

### 1. Contact profile and context

- The person (role, expertise, relevant background)
- The organisation (what it does, size, market)
- Context of the call (how we connected, existing relationship)

### 2. Summary of the discussion and reactions

- What was shown or discussed
- Verbatim reactions (exact quotes from the transcript, in quotation marks)
- Points of interest, enthusiasm
- Points of friction, doubts

### 3. Pain points identified

- The problems the contact meets in their current workflow
- Verbatims when available

### 4. Pricing and business signals

- Anything about pricing, willingness to pay, business model
- Comparisons with other tools or consultants

### 5. Bugs and malfunctions observed (when there was a demo)

- A table with #, Journey, Bug, Follow-up (the mention of the fix backlog entry)
- Only when the call included a live demo
- An interface friction (a button hard to find) is not a bug: it goes in section 2 or 7

### 6. Actions

- **The team:** what the team must do (send an access, a security document, and so on)
- **The contact:** what the contact will do (test, plan a follow-up, and so on)
- The dates mentioned (deadlines, planned follow-up)
- The announcements the team made during the meeting ("within the month", "in a few weeks") are
  actions to keep, with the deadline as it was said

### 7. Discovery insights

- What is new or surprising for the product
- Patterns confirmed (the third person to say X)
- Market signals
- Food for thought, roadmap implications

---

## The entry in the feedback base

One entry per meeting, in `databases.feedback`, with the property names of the OS feedback base:

```
Name: "{Name}, {Organisation}"
date:Date:start: "YYYY-MM-DD"
Type: one of ["🧪 Discovery", "📞 Call Client", "📞 Call Client onboarding", "📧 Ticket Support / Mail", "💬 Discord / Chat", "Publication / Article", "Message linkedin", "Demo", "self-onboarding"]
Persona: one of the option names of the Discovery pivot, section 1
Tags: JSON array from ["Onboarding", "Testimony", "Follow-up", "Usage"], plus the product's own options
Verbatim: the contact's most striking quote (200 characters at most)
Contact CRM: the contact's entry in databases.crm
Opportunities / Features: the roadmap entries this write-up supports (below)
Fix backlog: the fix backlog entries this write-up surfaced (below)
```

The page body is the write-up.

---

## Rules

1. **Read the transcript IN FULL** before writing anything. Don't start writing after the first
   pages.
2. **Never invent** quotes or information absent from the transcript.
3. **Keep the verbatims** in their original language.
4. **No customer or institution names in generic insights**: only in the write-up specific to the
   contact.
5. **Identify the persona** of the contact from their role and context.
6. **Detect bugs** automatically when the transcript mentions errors, "it doesn't work", "I have a
   problem", and so on.
7. **Cross with what exists:** when the contact is already in the feedback base, mention the history.
8. **Actionable over descriptive:** actions are concrete, with dates when mentioned.
9. **A fact the team reported during the meeting is a fact** (a customer's figure, an organisation's
   feedback): the write-up reports it as it is, without presenting it as a risky promise. Before
   flagging a figure as unproven, look for it in the proof points of the Go-to-Market pivot (section
   8, when `modules.gtm` is true) and in the roadmap opportunities. (A figure flagged as unproven was
   already written in an opportunity.)
10. **The write-up reports, it does not summarise.** Brevity is for the messages to the owner, never
    for the page in the base: a subject that took several minutes gets a subsection with its
    verbatims, its minutes and who said it. A voice that cannot be named (a room on a single
    microphone) stays in the write-up as "a voice from the room"; it is never dropped. Before creating
    the page, re-read the transcript minute by minute against the write-up and add every exchange that
    is missing. (A long exchange on a key business point was reduced to one line, and nine insights
    were missing: "why didn't you think it worth keeping?")

---

## Workflow

1. Receive the transcript (PDF, text or email).
2. Read it in full.
3. Identify: the contact, the organisation, the type of meeting, the persona.
4. Look for the history: previous write-ups of the contact and their organisation (the feedback base),
   their CRM entries, the fix backlog entries that cite them.
5. Extract: key verbatims, pain points, pricing signals, bugs, actions.
6. Write the write-up with the structure above.
7. **Link it** (below): opportunities, bugs, contacts.
8. Create the entry in the feedback base with the right properties, relations included.
9. **Draft the recap email** to the participants (below).
10. Answer the owner: the email ready to send first, then the Notion link, then the new opportunities
    proposed, one decision each (yes / no).

---

## Linking the write-up

### Opportunities (`databases.roadmap`)

- For each pain point, request, admired function or gap of sections 2, 3 and 7: search the roadmap
  (the Notion search scoped to its data source) by what the function does, with two or three
  phrasings, never by a single word.
- Read the title and the problem of each result before linking: an opportunity is linked when the
  write-up brings it a proof (a verbatim, a real case, a buying signal), not when it only shares a
  word.
- Link through the write-up's `Opportunities / Features` property (the reverse `Feedback & Insights`
  of the opportunity updates itself).
- Never change the body, the priority or the status of an existing opportunity from this skill.

### New opportunities: propose, don't create

- A **product** need that finds no existing opportunity after the search becomes a **proposal** in the
  answer to the owner: a title in the roadmap's format (the FO(E)CUSED template of `pos-prd`, "Writing
  to the roadmap base"), the problem in one sentence, the proof (contact, verbatim, minute), the
  closest neighbouring opportunity.
- Only a function of the product is an opportunity. A partnership or commercial activity (calibrating
  with a partner's material, co-building, a pilot) is not one: it goes into the write-up's actions,
  not into the roadmap.
- Creation happens only on the owner's yes: an entry in the roadmap, `Status` = the first working
  status of the method (`Discovery` in the OS roadmap base, or a later one when the work is further
  along; never an untriaged `Unqualified`), the problem, the proof (a mention of the write-up), leads, neighbours, the `Feedback & Insights`
  relation to the write-up; `Priority` only when the owner gave one. The full framing goes through
  `pos-opportunity` when the owner asks for it. Never a page nested under another one.

### Bugs (`databases.fix_backlog`)

- Each bug of section 5: look for the existing entry. When it exists, link it to the write-up and
  complete its body with the new report (contact, date, journey).
- When it does not: create the entry as the `pos-fix-backlog` skill says ("File an entry"; the title
  is the symptom the user sees, the journey, the customer to notify), linked to the write-up. No
  question to the owner: filing a fix backlog entry is tracking. When `modules.support` is false, the
  bug stays in section 5 and the report says that no fix backlog is configured.
- A symptom that happened during an incident already known is linked to the incident and marked "to
  re-check outside the incident", with no new entry.

### Contacts (`databases.crm`)

- Each participant on the customer side: look for their entry. When it exists, link the write-up
  (`Contact CRM`) and update `Last touch`, `Next step`, `Next step date`.
- When it does not: create it with the properties of the OS CRM base (`Name`, `Email`, `Org`,
  `Country`, `Persona`, `Motion`, `Status`, `Source`, `Target tier`, `Contact mode` = `1:1 owner` for
  anyone met in a call, `LinkedIn` when known, `Last touch`, `Next step`, `Next step date`, `Owner`,
  `Interactions` = the write-up), with in the body a short follow-up of their actions and of what the
  team owes them. The CRM is the single register of people: a person in `1:1 owner` never enters a
  sequence or an automatic action.
- The base has no `Contact mode` (created before it was in the schema): say so in one line, write the
  one-to-one mark in `Notes` for this contact, and point to `pos-setup` ("When the base already
  exists"), which adds the property on the owner's go.

---

## The recap email

The email the team member who led the call sends to the participants afterwards, signed by them, in
the language of the call (formal address unless an informal one is established). The register is the
brand voice of the Go-to-Market pivot, section 7 (the owner's own voice when the owner signs), when
`modules.gtm` is true; in every case factual, no superlative, no em dash.

- **Thanks**, one line.
- **What we saw, in light of your needs:** three to five points, each tied to a need a participant
  stated in the call, in the product's vocabulary (the glossary of the domain pivot). No exhaustive
  tour of the demo.
- **Next steps:** per person (the participants, then the team), what was said, with the date said.
  Nothing that was not said in the meeting.
- No promise of a function not shipped, unless the team announced it in the meeting, and then with
  its deadline as it was said. A figure about the product's results follows the proof points of the
  Go-to-Market pivot (section 8) and how it hedges them.
- An attachment announced (a security plan...) is flagged to the owner in one line under the email:
  the owner attaches it.
