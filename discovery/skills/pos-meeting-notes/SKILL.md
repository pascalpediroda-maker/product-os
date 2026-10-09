---
name: pos-meeting-notes
description: >
  Analyse a meeting transcript (a PDF or text export from a transcription tool, or raw notes) and
  write a structured write-up as one entry of the feedback base (databases.feedback), the write-up in
  the page body. Use when someone shares a call transcript, a transcript PDF, meeting notes or an
  email with insights, or says "write up this call", "analyse this transcript", "add this meeting to
  the feedback base", "meeting notes for X", "/pos-meeting-notes". Produces an actionable write-up:
  contact profile, discovery insights, pain points, pricing signals, bugs observed, actions, food for
  thought.
---

# Meeting notes from a transcript

## Why this skill exists

The team holds discovery, demo and follow-up calls with prospects, partners and users of the
product. The transcripts come from a transcription tool (a meeting extension, or the
`pos-meeting-transcript` skill for a recording). The write-up must be structured, actionable, and
written into the feedback base, so it feeds product discovery.

## Before writing

1. **The product config:** `databases.feedback`, `databases.crm`, `product.team_language`.
2. **The Discovery pivot,** `<pivots.dir>/product_discovery_context.md`, section 1 (Personas).
3. **The `pos-tool-conventions` skill of the core,** its Notion reference, before the first Notion
   call.

`databases.feedback` empty: say so in one line, give the write-up as text in the report, and propose
running `pos-setup` to create the base.

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

- A table with #, Journey, Bug
- Only when the call included a live demo

### 6. Actions

- **The team:** what the team must do (send an access, a security document, and so on)
- **The contact:** what the contact will do (test, plan a follow-up, and so on)
- The dates mentioned (deadlines, planned follow-up)

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
Type: one of ["🧪 Discovery", "📞 Call Client", "📞 Call Client onboarding", "💬 Discord / Chat", "Demo"]
Persona: one of the option names of the Discovery pivot, section 1
Tags: JSON array from ["Onboarding", "Testimony", "Follow-up"], plus the product's own options
Verbatim: the contact's most striking quote (200 characters at most)
Contact CRM: the contact's entry in databases.crm, when one exists
```

The page body is the write-up. When `databases.crm` is configured and no entry matches the contact,
say so when confirming; the write-up still goes in.

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

---

## Workflow

1. Receive the transcript (PDF, text or email).
2. Read it in full.
3. Identify: the contact, the organisation, the type of meeting, the persona.
4. Extract: key verbatims, pain points, pricing signals, bugs, actions.
5. Write the write-up with the structure above.
6. Create the entry in the feedback base with the right properties.
7. Confirm to the owner with the Notion link.
