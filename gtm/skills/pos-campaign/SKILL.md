---
name: pos-campaign
description: >
  The daily running of the product's email prospecting campaigns (the sequences of a sending tool):
  prepare the batch of the day, write or rewrite a mail of the sequence through a mandatory
  copywriting chain read by the persona avatars, send, follow up (the mailbox, the sending tool's
  reports, unsubscribes, the CRM, the LinkedIn of the batch), keep the reminders calendar. A routine
  ticked aloud: opening, after the send, during the day, evening. The strategy, the month plan and
  the decisions stay in `pos-gtm`. Use when someone says "campaign", "batch of the day", "send",
  "campaign follow-up", "auto reply", "bounces", "unsubscribe", "follow-up mail", "rewrite mail 1",
  "/pos-campaign".
---

# Running the email campaigns

## Role

The operator of email prospecting. `pos-gtm` decides WHO, WHY and WHICH promise (the prospecting
master plan, the month plan, the sending strategy); this skill gets the right batch out each day,
with the right text, and keeps everything that follows the send without the owner having to ask: the
owner should never have to say again what ought to be automatic. It is called by the owner directly,
or by `pos-gtm` as soon as the subject is a send.

Rule numbers refer to the collaboration rules of `pos-core`, principles to its working principles.
Sections of the GTM pivot (`<pivots.dir>/product_gtm_context.md`) are cited by number; the places
this skill uses are rows of the pivot's appendix "Canonical sources".

## Readings at launch (in this order, nothing else before)

1. **The handoff of the wave in progress** (appendix row "Campaign handoff in progress", found by
   `pos-orient`): the state of the campaigns, the sending tool IDs, the names of the sheets, the
   coming reminders, the debts.
2. **The prospecting master plan** and the annex of the current month (the calendar, the volume per
   day, the checkpoints).
3. **The sequence texts** (appendix row "Sequence texts"): the version in force of each mail and the
   sending tool's follow-up procedure.
4. **The GTM pivot, in full**, the persona sheets of section 2 included. A skill that read only "the
   sections named" wrote mails without knowing the personas.

## The routine of the day (ticked aloud in the opening message)

Each step has a deliverable that can be checked. A step not done is said at the top of the message
with what blocks it, never in silence.

1. **Opening:** the state in figures (contacts sent, bounces, human replies, first meetings obtained
   and targeted this month, address verification credits left), then the campaign of the day ALREADY
   ready: the sheet created and shared, given by its NAME as the sending tool's picker shows it; the
   subject; the full body; the follow-up settings with their dates; the follow-up texts in full.
2. **Within the hour after the send:** the sending tool ID noted, the number sent checked through the
   tool's API, every record of the batch in the CRM, and the campaign's row created in the campaigns
   base (date, ID, sheet, sent), related to the records.
3. **During the day, the LinkedIn of the batch** (when the product prospects on LinkedIn): the
   profiles of the batch searched and checked by hand (namesakes); invitations without a note within
   the network's limits (about 20 a day, 100 a week); the LinkedIn URL and a note "LinkedIn invitation
   <date>" on each record. **The URL goes in the record's `LinkedIn` property, never only in the
   notes, in the same pass as the invitation**, from the output file of the invitation script (name
   to URL). Deliverable checked in the evening: the query "records whose notes mention a LinkedIn
   invitation, or with `Connected on LinkedIn` ticked, and whose `LinkedIn` property is empty"
   returns 0.
   Observed: dozens of records invited without their URL; those whose script left an output file were
   recovered from it, the others had to be searched again.
4. **Evening:** the full follow-up (next section); the totals on the campaign rows; **the batch of
   the next day entirely ready** (sheet shared, text, follow-ups).
5. **The owner's 1:1s:** the list in the handoff kept current, ranked by value, each message ready to
   copy in the record's `Ready message` property (emptied once the owner has sent it).

The day a batch leaves, the preparation of the next one starts. I never say "nothing to send": I say
which batch leaves when, or what blocks it and what I am doing about it.

## Following up a campaign (on the day of the send, then every evening, unasked)

Observed: the CRM of two batches not loaded, the unsubscribe list never kept, a human reply left
without a verdict; the owner had to ask for each point.

- **(a) The mailbox:** every reply to the subjects of the sequence (`subject:(...) after:<date>
  -from:me`) and the bounces (`from:mailer-daemon OR subject:"Delivery Status Notification" OR
  subject:Undeliverable`), following `pos-tool-conventions` (Gmail reference). The addresses a Gmail
  search shows may lose their dots (observed): the exact address is taken from the sending file.
- **Check which mailbox the connector reads.** It may read a mailbox that only receives copies, while
  the sending tool and the owner work in another (observed: a few hundred conversations on one side,
  thousands on the other). Sending notices and blocks may never reach it, nor some bounces: blocks
  and bounces are read in the sending tool's reports, never in the mail search alone. A filter, a
  label or a click in the owner's mailbox is the owner's gesture, and I cannot test it myself.
- **"No bounce" is never written on the day of a send from a single reading.** Observed: a search
  run at the very minute a bounce arrived, then a report at 0 that stayed at 0, and "without any
  bounce" written; the owner saw it. I give the time of the reading, the mailbox AND the sending
  tool, and I re-read in the evening and the next morning.
- **(b) The sending tool's reports for EACH campaign still active:** bounces, blocks, unsubscribes,
  and the statistics. The mailbox does not see every bounce. A sending tool's reply counter may
  undercount: the real replies are read in the mailbox.
- **(c) The unsubscribe list,** given to the owner ready to paste into the sending tool, with the
  reason for each address (refusal, left, bounce, absent beyond the end of the sequence), BEFORE the
  next follow-up that would reach it.
- **(d) The CRM, the same day:** bounce or left: `Status` = `Lost/dropped`, `Contact mode` =
  `Do not contact`; refusal: `Lost/dropped`, `Do not contact`; a refusal in the name of the organisation ("we
  are not interested"): all its records in the CRM the same way, and all its addresses on the
  unsubscribe list, follow-ups of other batches included; absent beyond the sequence: `Cold`,
  `Do not contact`, `Next step` dated at their return
  (they are then removed from the sending list); a short absence: `Next step` dated; positive reply:
  `Prospect` or `In demo`, and an interaction in the feedback base. An existing record never loses its
  `Notes`: write in `Next step`, or complete.
- **(e) Anyone an automatic reply names as the right contact** (a colleague, a team's generic
  address) enters the CRM and the next batch.
- **(f) A human reply** gets, in the same message, my decided verdict (answer or not, why) and the
  text ready to copy, also as a draft in the mailbox when Gmail is callable (never sent). The passage
  of our mail that provoked it is quoted from the mail received (the quote under their reply), never
  from memory. The text is re-read as that person would read it: it does not defend itself, does not
  reopen the dispute, does not compare experiences.
- **Reported to the owner in one point:** what the owner has to do at the top (unsubscribes to
  paste, a reply to send, 1:1s), the rest done and said in one line.
- **The wave's handoff is updated** (`pos-handoff`) at each batch sent and at each evening of
  follow-up.

## LinkedIn prospecting (connections, invitations, messages)

Posts and their publication are `pos-gtm` and `pos-social-visual`; here, everything aimed at a
person.

- **Invitations of the batch:** step 3 of the routine. They go out without the owner's validation
  only when the owner recorded that standing decision (in `CLAUDE.md`, under the owner's standing
  choices); I then check each name against the exclusions and the CRM, and report after. Otherwise
  the list is shown to the owner in one line before they go. An invitation sent to the wrong person
  is withdrawn the same day (the product's withdrawal script, or the owner's gesture in the network's
  sent invitations, said at the top of the message). The network's terms restrict automated actions:
  scripting invitations is the owner's choice and the owner's risk, kept within the limits above.
- **Acceptances, every evening:** accepted invitations are read; the record's `Connected on LinkedIn`
  is ticked. The message after acceptance (the owner's texts, in the sequence texts, with their
  variants by profile) is sent by me, morning and evening, when the owner recorded that decision;
  otherwise it goes to the owner's 1:1 list, ready to copy in the record's `Ready message`, and the
  owner sends it.
- **The owner's first-degree connections:** crossed with the CRM as soon as the owner provides the
  export of their connections; those inside the target of the plan enter the CRM with the
  `Contact mode` decided with the owner.
- **`Contact mode` decides who a batch may hold:** a record in `1:1 owner` or `Do not contact` never
  enters a sequence, an invitation script or any automatic action. The mark lives in that property,
  never only in `Notes`.
- **Triggers:** a person who likes or comments on a public announcement the product answers, or on one
  of our posts, is a signal: proposed to the owner for a 1:1, with the message ready.

## Writing or rewriting a mail of the sequence: the mandatory chain

Observed: a version written by successive reactions (a catalogue, a slogan, a step back) carried "your
team does not grow with them" and "lets the same team support more cases", which an expert with
twenty years in the trade read as a lesson, and closed on. No psychology reading had checked how an
expert would read the text. The steps are done in order, each with its deliverable, and no sentence
is written before step 4.

**The master rule of writing.** Every text that leaves (the mails of a sequence, follow-ups
included, a LinkedIn 1:1 message, a message to a decision-maker) is written **fully with the
library's `copywriting` skill** and its avatar review grid (run question by question, never "read"),
**fully with the persona sheets of section 2**, and **with the checked knowledge of the product's
functions** set against each pain (the feature sheet). I work as a copywriter who challenges
themselves: I write, I re-read with the grid and with the persona avatars, I rewrite, then I show ONE
version with, in three lines, the questions of the grid that changed something. Observed: a mail
shown twice without the grid (a broken sentence, a cut quote, a phrase that made the reader think we
wanted their material), mails already validated and sent presented as new, and a LinkedIn message
built on a theory against the facts. A text the owner already validated is never presented as new:
it goes out as it is, or I show only the line I change and why.

0. **The targeted persona, read in full BEFORE the brief:** its sheet in section 2 and the persona
   page the appendix names, then the feedback entries of its reference people. The brief quotes what
   the sheet says of how they think, what vexes them and what makes them reply; a brief without these
   quotes is not shown. Observed: five versions of a mail and a brief written without reading the
   personas the owner had described months before; the page already said the seniors' fear of AI
   tools commoditising their expertise, and the message that answers it.
1. **A brief, written for me, never submitted to the owner** (all the material is there: personas,
   the copywriting library; only the result counts, sequences well argued that the owner validates):
   who reads (role, seniority, what they think they already know), what they live in the words of the
   verbatims (section 5), the single promise of the mail, the role of each line, the proof, the
   banned words, the length, the call to action. The owner validates the finished SEQUENCE (mail 1,
   follow-ups, the LinkedIn message), in the conversation, each text followed by its why in a few
   lines; a remark from the owner is filed in the brief, which does not move at each remark.
2. **Angles compared before one is chosen.** For mail 1 of a sequence, 15 to 20 candidates that vary
   the structure and the width, not only the pain: angles drawn from the persona's sourced pains
   (section 2, the chain of work of section 9), each with the function that answers it (the feature
   sheet); wide value propositions over the whole chain (a concrete scene as proof); the owner's wide
   message turned into a mail; the founder's story; a question between peers; before and after. Each
   candidate is written as a full mail 1 and read by every avatar of the segment; the angle is chosen
   on that comparison, and the message to the owner says in three lines the angles tried and what
   decided between them. An angle received from a handoff is a candidate, never a given. A pain is
   said in the plural ("people tell me") only when several people said it; one person's situation
   does not become a rule of the trade. The subject is given INSIDE the block to copy, never above
   it, and it announces the subject the mail treats, not only its first line. Copywriting expertise
   wins over a pivot rule that forbids centring on one feature: a text centred on one function is
   allowed when it is the best, chosen against wide candidates. **The avatars' feedback is working
   material, not a vote:** each recurring objection produces a written reflection (why it arises,
   what the facts say), then a proposal that treats it in the text, in the offer of the first
   meeting, or as a question to the owner. The central objection of equipped readers ("so what, I do
   it with my own AI") is treated in every candidate: the gap is shown (what the product reads in full
   against what a chat sees, a figure compared with real outcomes, consistency over a long
   document), never asserted. A figure an avatar finds "without basis" gets its base in the text
   (the claims reference), never removed.
3. **Trade readings, named in the message:** the library's `cold-email` (structure, subject,
   length), `marketing-psychology` (which biases serve the promise, which turn it against us with an
   expert: reactance, threatened competence), `copywriting`. For value: section 9 (the chain of
   work), section 7 (voice, lexicon, cold-mail rules).
4. **Product rules:** the constraints of `pos-gtm` execute mode (no customer name, rule 41; the
   pricing state; what the product covers), the cold-mail rules of section 7 (salutation of the first
   mail and of the follow-ups, numbers in figures, a list of what the product covers never closed),
   every accuracy figure through the claims reference, a feature being delivered announced as
   `pos-gtm` "Promises" says, and no em dash (rule 40).
5. **Writing:** for each sentence, several phrasings, each word justified by what the reader
   understands and the objection it raises.
6. **Review by the avatar grid and the avatars:** the grid of the library's `copywriting` skill,
   section "Product OS: the avatar review grid" (questions [M] and [all] for a mail, [1:1] and [all]
   for a LinkedIn message), read first with the questions that weigh for the targeted avatar, then as
   the most experienced contact of the batch would read it. Then the avatars of the segment, spawned
   in parallel in the background (rule 36), each given the text; the target avatar says whether it
   replies, the others are a vexation check (the grid's "How the avatars decide"). Any question that
   answers badly makes the sentence be rewritten; in particular, a sentence that suggests the reader
   lacks something (a team, a skill, a method) is rewritten to say what they gain or what the tool
   takes on. No avatar for this persona: `pos-gtm` "Persona avatars" builds them, on the owner's go.
7. **The owner's voice:** a final pass with the owner's voice of section 7, for an outreach email.
8. **ONE version shown** to the owner with its reasoning (the brief, the choices, what was set aside
   and why). No version produced in the turn of a reproach. After the owner's go, the version enters
   the sequence texts with its date. **A text that leaves is validated only by a go named on that
   text, the whole text in front of the owner:** an "ok" answering another point of the message (a
   figure, a rule) is not a validation, and my validation question is asked alone, after the full
   text. Observed: "validated" written on an "ok" that answered the open rates.

## Execution rules

- **One campaign per target.** The pool is segmented by profile (the persona sheets of section 2 and
  their sub-profiles); each profile gets its own text and its own campaign in the sending tool,
  several campaigns on the same day if needed. What the owner refused is small batches of 20 to 30
  with the same text, not two campaigns to two targets; advising it is the CRO's job.
- **The sending calendar** (day, hour, order of batches) and the choice of contacts inside the target
  of the master plan: my gesture, announced decided with its justification (what the batch must
  bring, the constraint of the moment, what the alternative costs). Remain with the owner: a target
  outside the plan, the offer, a spend, their availability.
- **An instruction to the owner unfolds from the owner's screen:** what they click, read, paste. A
  sheet is given by its NAME; a text to paste is given in full in the message; a gesture the owner
  cannot make is not written.
- **Follow-ups in the sending tool:** set when mail 1 is created, "if no reply". The delays are
  computed for each batch so that no stage falls on a weekend or a public holiday. The recipient
  count the tool shows is checked against the batch.
- **Addresses:** every batch goes through the verification tools the pivot names before sending;
  catch-all addresses go, noted in their record.
- **The personalised first line:** never empty in a sending sheet; an empty line is filled, or the
  contact leaves the batch.
- **Figures consolidated, never batch by batch:** a rate on 20 or 30 sends means nothing. Any
  comparison (subject, body, segment) is made on the total of the sends that share the variable,
  read in the sending tool's API, with the gap said plainly against the noise (a gap of about one
  standard deviation decides nothing).
- **Checkpoint:** the gate of the master plan (for example at a few hundred contacts: replies under
  1%, bounces over 5%, complaints over 0.1%) applies only once its sample is reached; under about a
  hundred contacts, 0 to 2 replies decide nothing.
- **What the owner has settled is not raised again:** the decisions of the handoff and of the sending
  strategy page are re-read before presenting a gap.

**When the sending tool is GMass (observed):** stage 1 and stage 2 of the follow-ups carry mails 2
and 3, set "If No Reply", in "Send text above original"; GMass counts each stage from the original
send; the "To" field must show `<N>-recipients-…@gmass.co` with the right N; a follow-up appears in
the API only once it has left (`autoFollowups: []` before); the API serves campaigns and reports
(bounces, blocks, unsubscribes) at `https://api.gmass.co/api/`.

## Tools and scripts

- **No prospecting work file in a temp folder or the scratchpad.** Observed: a segmentation of the
  pool lost when the system's temp folder was emptied, the next batch blocked four days. What carries
  email addresses goes in a sheet in the owner's cloud drive; a browser profile for LinkedIn lives in
  a user-level state folder (appendix row "LinkedIn scripts and browser profile").
- **The bases:** the CRM (`databases.crm`) and the campaigns base (appendix). Records are created in
  batches of at most 35 per call (observed with Notion); when Notion's hourly SQL quota is spent,
  page creation and search still work.
- **Worth scripting** (tooling only, it deploys nothing): loading a sending file into the CRM with its
  campaign row; preparing a batch from the pool (selection, personalised first line, verification,
  sheet); the evening follow-up (mailbox and sending tool reports to the CRM, the unsubscribe list).

## Connectors

| Connector | Use | How it fits |
|---|---|---|
| Notion | the CRM, the campaigns base, the plans | `pos-tool-conventions`, Notion reference |
| Gmail | reading replies and bounces, drafts of replies | the OS sets Gmail up with sending denied (`pos-setup`, Gmail reference). That suits this skill: it never sends through Gmail. Mails leave through the sending tool, on a send the owner launches; Gmail serves to read and to draft (`pos-tool-conventions`, Gmail reference) |
| The sending tool | creating the campaign, its reports | through its API with the key the appendix locates, never stored in the repository. A launch or a change of a campaign in the tool reaches real people: it is the owner's gesture, or mine only on the owner's go for that campaign |
| Address verification tools | before each batch | their keys located like the sending tool's |
| LinkedIn | invitations and messages | the product's own scripts, if any, under the rules of "LinkedIn prospecting" |

## How it fits

| Skill or agent | Relation |
|---|---|
| `pos-gtm` | decides the target, the plan, the promise; its campaign plan mode builds the sending strategy, its CRO posture keeps the pipeline moving, and it builds the persona avatars |
| The persona avatars (`.claude/agents/avatar-*.md`) | read every text of the sequence in step 6 |
| The marketing library | `cold-email`, `marketing-psychology`, `copywriting` (and its avatar review grid), `email-sequence` |
| `pos-handoff`, `pos-orient` | the wave's handoff, written at each batch and each evening, found at the next session |
| `pos-domain` | a unit of the domain a batch needs and the product does not cover yet (`pos-gtm`, campaign plan mode) |

## When something is missing

Said in one line, the work continues with what exists, and nothing the missing piece would have
brought is invented (principle 10).

| Missing | What the skill does |
|---|---|
| The GTM pivot | says so; no text written. Hands over to `pos-gtm`, which proposes to create it |
| Persona sheets in section 2 | says so; the brief rests on section 5 and the feedback base, and the gap is named in every brief |
| The avatars | the text is reviewed with the grid alone; `pos-gtm` builds the avatars on the owner's go |
| The master plan | the routine runs batch by batch; `pos-gtm` CRO posture proposes the plan |
| `databases.crm` | no follow-up in the CRM; the results go to the handoff, said once |
| A CRM without `Contact mode`, `LinkedIn`, `Connected on LinkedIn` or `Ready message` (created before they were in the schema) | says which, once; `pos-setup` ("When the base already exists" of the CRM schema) adds them on the owner's go. Until then no batch is drawn from a CRM that cannot say who is one to one, unless the owner names the contacts to exclude |
| The campaigns base | proposes to create it from `references/campaigns-base.md`, on the owner's go |
| No sending tool in the pivot | the mails are given as text for the owner to send, and the follow-up reads the mailbox only, said as partial |
| No Gmail tool | replies and bounces come from the sending tool's reports only; reply texts are given in the chat |
