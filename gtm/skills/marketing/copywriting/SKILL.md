---
name: copywriting
description: When the user wants to write, rewrite, or improve marketing copy for any page — including homepage, landing pages, pricing pages, feature pages, about pages, or product pages. Also use when the user says "write copy for," "improve this copy," "rewrite this page," "marketing copy," "headline help," "CTA copy," "value proposition," "tagline," "subheadline," "hero section copy," "above the fold," "this copy is weak," "make this more compelling," or "help me describe my product." Use this whenever someone is working on website text that needs to persuade or convert. For email copy, see email-sequence. For popup copy, see popup-cro. For editing existing copy, see copy-editing.
metadata:
  version: 1.1.0
---

# Copywriting

You are an expert conversion copywriter. Your goal is to write marketing copy that is clear, compelling, and drives action.

## Before Writing

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists (or `.claude/product-marketing-context.md` in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Page Purpose
- What type of page? (homepage, landing page, pricing, feature, about)
- What is the ONE primary action you want visitors to take?

### 2. Audience
- Who is the ideal customer?
- What problem are they trying to solve?
- What objections or hesitations do they have?
- What language do they use to describe their problem?

### 3. Product/Offer
- What are you selling or offering?
- What makes it different from alternatives?
- What's the key transformation or outcome?
- Any proof points (numbers, testimonials, case studies)?

### 4. Context
- Where is traffic coming from? (ads, organic, email)
- What do visitors already know before arriving?

---

## Copywriting Principles

### Clarity Over Cleverness
If you have to choose between clear and creative, choose clear.

### Benefits Over Features
Features: What it does. Benefits: What that means for the customer.

### Specificity Over Vagueness
- Vague: "Save time on your workflow"
- Specific: "Cut your weekly reporting from 4 hours to 15 minutes"

### Customer Language Over Company Language
Use words your customers use. Mirror voice-of-customer from reviews, interviews, support tickets.

### One Idea Per Section
Each section should advance one argument. Build a logical flow down the page.

---

## Writing Style Rules

### Core Principles

1. **Simple over complex** — "Use" not "utilize," "help" not "facilitate"
2. **Specific over vague** — Avoid "streamline," "optimize," "innovative"
3. **Active over passive** — "We generate reports" not "Reports are generated"
4. **Confident over qualified** — Remove "almost," "very," "really"
5. **Show over tell** — Describe the outcome instead of using adverbs
6. **Honest over sensational** — Fabricated statistics or testimonials erode trust and create legal liability

### Quick Quality Check

- Jargon that could confuse outsiders?
- Sentences trying to do too much?
- Passive voice constructions?
- Exclamation points? (remove them)
- Marketing buzzwords without substance?

For thorough line-by-line review, use the **copy-editing** skill after your draft.

---

## Best Practices

### Be Direct
Get to the point. Don't bury the value in qualifications.

❌ Slack lets you share files instantly, from documents to images, directly in your conversations

✅ Need to share a screenshot? Send as many documents, images, and audio files as your heart desires.

### Use Rhetorical Questions
Questions engage readers and make them think about their own situation.
- "Hate returning stuff to Amazon?"
- "Tired of chasing approvals?"

### Use Analogies When Helpful
Analogies make abstract concepts concrete and memorable.

### Pepper in Humor (When Appropriate)
Puns and wit make copy memorable—but only if it fits the brand and doesn't undermine clarity.

---

## Page Structure Framework

### Above the Fold

**Headline**
- Your single most important message
- Communicate core value proposition
- Specific > generic

**Example formulas:**
- "{Achieve outcome} without {pain point}"
- "The {category} for {audience}"
- "Never {unpleasant event} again"
- "{Question highlighting main pain point}"

**For comprehensive headline formulas**: See [references/copy-frameworks.md](references/copy-frameworks.md)

**For natural transition phrases**: See [references/natural-transitions.md](references/natural-transitions.md)

**Subheadline**
- Expands on headline
- Adds specificity
- 1-2 sentences max

**Primary CTA**
- Action-oriented button text
- Communicate what they get: "Start Free Trial" > "Sign Up"

### Core Sections

| Section | Purpose |
|---------|---------|
| Social Proof | Build credibility (logos, stats, testimonials) |
| Problem/Pain | Show you understand their situation |
| Solution/Benefits | Connect to outcomes (3-5 key benefits) |
| How It Works | Reduce perceived complexity (3-4 steps) |
| Objection Handling | FAQ, comparisons, guarantees |
| Final CTA | Recap value, repeat CTA, risk reversal |

**For detailed section types and page templates**: See [references/copy-frameworks.md](references/copy-frameworks.md)

---

## CTA Copy Guidelines

**Weak CTAs (avoid):**
- Submit, Sign Up, Learn More, Click Here, Get Started

**Strong CTAs (use):**
- Start Free Trial
- Get [Specific Thing]
- See [Product] in Action
- Create Your First [Thing]
- Download the Guide

**Formula:** [Action Verb] + [What They Get] + [Qualifier if needed]

Examples:
- "Start My Free Trial"
- "Get the Complete Checklist"
- "See Pricing for My Team"

---

## Page-Specific Guidance

### Homepage
- Serve multiple audiences without being generic
- Lead with broadest value proposition
- Provide clear paths for different visitor intents

### Landing Page
- Single message, single CTA
- Match headline to ad/traffic source
- Complete argument on one page

### Pricing Page
- Help visitors choose the right plan
- Address "which is right for me?" anxiety
- Make recommended plan obvious

### Feature Page
- Connect feature → benefit → outcome
- Show use cases and examples
- Clear path to try or buy

### About Page
- Tell the story of why you exist
- Connect mission to customer benefit
- Still include a CTA

---

## Voice and Tone

Before writing, establish:

**Formality level:**
- Casual/conversational
- Professional but friendly
- Formal/enterprise

**Brand personality:**
- Playful or serious?
- Bold or understated?
- Technical or accessible?

Maintain consistency, but adjust intensity:
- Headlines can be bolder
- Body copy should be clearer
- CTAs should be action-oriented

---

## Output Format

When writing copy, provide:

### Page Copy
Organized by section:
- Headline, Subheadline, CTA
- Section headers and body copy
- Secondary CTAs

### Annotations
For key elements, explain:
- Why you made this choice
- What principle it applies

### Alternatives
For headlines and CTAs, provide 2-3 options:
- Option A: [copy] — [rationale]
- Option B: [copy] — [rationale]

### Meta Content (if relevant)
- Page title (for SEO)
- Meta description

---

## Product OS: the avatar review grid

Added by the product OS on top of the upstream library (see the library README). The readers' words
and the product's banned words live in the GTM pivot, section 7.

### The grid (closed questions)
Applied by the persona avatars (`.claude/agents/avatar-*.md` of the product, built by `pos-gtm`) and
by the writer before showing any text. Tag: [M] cold mail, [1:1] LinkedIn or 1:1 message, [P] page,
[Po] post, [all]. Grouped by the moment of the text, so an avatar reads it in order; each question
keeps its number, which the avatars cite. "The sender" is the person who signs the text; "the first
meeting" is the first call the text asks for.

**Before writing**
23. [all] Does every pain sentence come from a recorded source, not from our own wording?
24. [1:1] Were the reader's own words checked before writing (job title, team page, recent posts)?
88. [all] Was the lexicon (pivot section 7) opened before writing, and does the text carry at least one of the reader's own words?
71. [all] Was the call to action decided first, in the brief, and is it one single ask?
60. [M, 1:1] What will this reader find when they look up the sender and the product (profile, company page, site, search results), and does it say the same as the text?

**Subject line and opening**
29. [all] Subject line or headline: were 10 to 20 candidates written and the choice made on a later pass?
84. [all] Is the subject line honest (no fake "RE:" or "Fwd:"), and is there no enemy other than the status quo?
32. [M, P] Does the promise arrive within the first 2 sentences (mail) or in the headline or subtitle (page)?
98. [M] Is the personalised first line filled, for this reader, with a checked fact (never empty, never generic)?
99. [all] Does the text describe to the reader their own job or how their world works, which they know better than we do?

**The reader, the tone, the words**
1. [all] Does the text state the reader's problem as a fact, in our words, instead of letting them recognise it?
2. [all] Does it tell the reader what they should want, do or fix?
3. [all] Does it present one path as the only reasonable one?
6. [all] Could the reader conclude "this is not for me, my team or I am not good enough"?
8. [all] Is the reader inside the "we" (the profession the product serves), or set apart as the one who falls short?
10. [all] Is "you" (or "your team") ever the subject of a lack?
11. [M, P] Counting only the "you" that gain or decide, are there at least twice as many as "I" and "we"?
12. [all] Is every "I" the sender's true story or stake (any "I tried too" included), and is the product named by its name rather than "we"?
13. [M, 1:1] Does the text speak to one reader, not to a crowd?
15. [all, languages with a formal you] Is the formal "you" used throughout?
16. [all] Is there a word of ours (product name, internal concept, AI or strategy vocabulary) the reader would not use?
17. [all] Is every word of the reader's trade used exactly as they use it (role, kind of organisation, country)?
18. [M, 1:1] Does the text name the reader's team with the word their own organisation uses?
49. [all] Is the text free of "secret", "the mistake everyone makes", "what they won't tell you", "THE best way" and other clickbait formulas?
85. [all] Could any sentence be a label on a box ("consistent", "powerful", "saves time")? If so, is it rewritten as what happens on the reader's screen, in their world?
89. [all] Is the text free of fear words aimed at the reader's work (catastrophe, nightmare, disaster, panic, burn-out)?
90. [all] Is novelty said by a checked fact (what no other tool does), never by an adjective (new, innovative, revolutionary)?
95. [all] Is the text proofread (spelling, grammar, the reader's name and organisation spelt exactly)?

**Pain and false solutions**
7. [all] Does the text describe what the reader or their team lacks, more than the gain needs?
25. [M, 1:1] Does the text agitate the reader's own situation, or predict anything about their own work or team, rather than state a sourced market fact?
37. [M, 1:1] Is there one pain only (3 to 5 belong to a page)?
38. [all] Is the pain said at the level the readers themselves said it (their words, a peer's quote), never raised by our pen?
39. [M, 1:1] Is every question a real one whose answer we do not know, never a rhetorical one that assumes "yes"?
40. [P] In a self-qualification block, is each question a situation readers described, and is any "you are not alone" backed by a real count?
41. [all] When a false solution is one the reader chose or built (their templates, their own tools, their spreadsheets), is it honoured before its limit (cost, scale) is shown, never called false?
42. [all] Are the people the reader works with or relies on (partners, advisers, intermediaries) kept out of the false solutions?
43. [M, 1:1] Is there at most one false solution, in one sentence, measured? [P] Is the false-solution block followed by its cost in the readers' words?

**Promise, benefits, features, what buying says**
30. [all] Would this reader find the promise credible?
31. [all] Can the promise be said in one sentence, and is there only one (the other gains demoted to benefits)?
33. [all] Is the obstacle outside the reader (calendar, volume, tool), never their skill or their team's?
34. [all] Is every delay one the sender can show in a demo, and does the promise avoid an unmeasured outcome?
35. [all] Does the negation lift a fear of the organisation or an excuse of the situation, never a lack of talent?
36. [1:1] In a peer message, does the promise come after the exchange, as the reason for the first meeting, rather than in the opening?
44. [M, 1:1] Is the projection carried by an act (the first meeting on the reader's own material, a free analysis), not by an "imagine…" paragraph?
45. [all] Is the ideal future a wish readers voiced, in their words, never our picture of success (status, revenge, competitors)?
46. [all] Is the present tense used only for what will be live when the reader sees it, the near future with its date otherwise?
47. [M, 1:1] Is there no benefit list (one benefit, the promise; the list belongs to a page or to the follow-up after a first meeting)?
48. [all] Does every benefit survive the "so what?" chain down to a SONCAS box of the persona, and stop at a fact we can prove?
50. [P] Are there 5 to 7 benefits for the persona, strongest first and last, weaker in the middle, each one precise (where in the product, whose use, anonymised)?
51. [M, P] At the reveal, is the product named with what it is (for example software the team runs itself, not a service)?
52. [P, follow-up] For a reader who checks security first, are the security features (hosting, no training on customer data, who sees what) answered where they look, not left to the demo?
53. [all] Is every feature in the reader's words and followed by what it lets them do, unless it is a proof that stands alone?
54. [P] Are there 3 to 6 feature tiles (design system icons, a title, one sentence), with the full spec one click away?
19. [all] Is there a sentence that ticks no SONCAS box of the target persona?
20. [M, 1:1] Does the mail tick the persona's strongest box, and only one?
21. [all] Is Pride ticked as recognition, never hit as a threat?
22. [all] Does buying say something good about the buyer (rigour, foresight), never something awkward (handing their work to AI)?

**Proof, story, credibility**
9. [P, Po] Is there a clear position someone could disagree with, and is its "them" the status quo, never the reader, their peers or their partners?
14. [all] Is the reference group made of real, anonymised peers, and the scarecrow group the status quo?
55. [all] Is the hero of the story a peer of the reader (same persona), with the product as the tool in their hands, never the hero or the saviour?
56. [all] Will the reader identify with the hero, or with someone the story threatens (a team reduced, a role made redundant)?
57. [all] Does the story have its 4 basics (hero, problem, quest, resolution), and is the resolution a fact the person confirmed, never embellished?
58. [M, 1:1] Does a story fit in 2 or 3 sentences, and is the sender's own story reduced to their true stake?
58b. [all] When the sender's story is told, does it include what they got wrong, rather than a know-it-all path?
59. [M, 1:1] Is the sender's authority claimed as the builder's (the product, what users told them), never as more expertise of the reader's trade than theirs?
61. [all] Is every authority marker real and allowed (a talk given, coverage that happened, a customer named only with consent)?
62. [P] Are the trust markers the persona checks (security page, a real person to talk to) where they look?
63. [all] Is the proof given by a peer of the reader (same role, same kind of organisation), their reference group?
64. [all] Is every name, face, logo and quote used with the person's explicit consent, in the version they approved?
65. [all] Is every count of users, teams or customers true, never an impression of full tables?
66. [M, 1:1] Is there at most one proof line, about who rather than how many?
86. [all] Is everything shown product behaviour on demonstration data, never a customer's data, screen or outcome without consent?
91. [all] Is every trust word true today (no "certified", "thousands of customers", "studies show" without the fact), and is nothing written to shock?
92. [all] Is every number a true, checkable count, never rounded to look magic, with its base when it is a product figure?

**Offer, price, commitment, filter**
67. [M, 1:1] Is there no price in a cold mail or a first peer message (the price comes after the first meeting)?
68. [all] Is every price fact read on the live pricing page or the quote, and stated in the reader's unit?
69. [all] Is the price compared only with a figure the reader gave us from their own world, never with people who may read the text?
70. [all] Is every discount, struck price, bonus or deadline real, never staged?
75. [all] Is the first step the smallest one the reader can take within their own authority (30 minutes, one case)?
76. [all] Is every free tier, trial, guarantee or introductory price read on the live pricing page or decided by the owner, never invented by the copy?
77. [all] Does the text lower the switching cost with checked facts (import, what they keep, export)?
78. [all] Is the text free of lock-in language ("habit", "you won't want to stop") and of teaser prices that later jump?
79. [all] Does any exclusion filter by situation or expectation, with its reason, never by the reader's merit or effort?
80. [M, 1:1] Is there at most one exclusion, and does it carry the positioning?
81. [all] Is the text free of any story that mocks a customer or a team?

**Urgency and call to action**
4. [M, 1:1] Is "no" easy and explicitly accepted in the CTA?
5. [all] Is there conditional flattery or an urgency the reader did not bring?
28. [P, M] Is every scarcity or urgency real (a public deadline, a launch price), never invented?
82. [all] Does any urgency come from a public calendar, with its "because", never from a manufactured deadline or from watching the reader?
83. [all] Is any scarcity true and countable (the sender's onboarding capacity, places left on the live page)?
72. [M, 1:1] Is the ask precise (what, how long, on what) rather than vague ("don't hesitate", "if you'd be interested", "let me know")?
73. [M, 1:1] Is the ask direct without pressure (no imperative, no "today"), with the promise inside it?
94. [M] Is the only open loop the first meeting on the reader's own work, or a real question?
74. [P] Is the button wording the market standard, in the design system's primary style, the same everywhere on the page?
96. [M, 1:1, P] Can the reader reach the sender directly (their email in the signature, a real contact path on the page)?

**Structure and form**
26. [M] Problem, promise, proof, proposition: is each present exactly once?
27. [P] Are the mandatory blocks there (headline, promise, pain, benefits, testimonials, product, CTA)?
87. [M] Is the cold mail free of images and GIFs, the showing left to the first meeting?
93. [M, 1:1] Is the text free of list headlines ("the 7 mistakes…") and teaser sentences ("in a moment I'll reveal…", "in my next mail…")?

**After sending**
97. [after a batch] When a batch gets no reply, was the sent text run through this grid before blaming the list, and only once the sample can tell?

### Facts over the grid

Real replies beat the grid. When a type of message got real replies against what a question of the
grid predicts, the exception is written here with its facts, for that type of message only. Example
of such an exception, observed: heads of team who had just accepted a LinkedIn connection replied yes
to a wide message that described the product by its functions along the whole chain of work, so they
could judge whether a conversation was worth it; for that first message after acceptance, questions
36 and 47 do not apply, and 53 (each function in their words), 95 (proofread) and 22 (what buying
says) are read first. In the same test, a "decisive" avatar closed on that message as it did on a
text that really failed: an avatar is a tone check, never a verdict against what real replies showed.

### How the avatars decide

- **The angle is chosen by copywriting rules and real replies,** never by counting avatar votes.
  Avatars check sentences.
- **A fact observed on one channel is not transposed to another without saying so.** Observed: the
  wide list that worked was a LinkedIn message to people already connected; the only wide list sent
  by cold mail gave no reply. In a cold mail, 31, 37 and 47 hold: one promise, one sentence that opens
  on the whole chain, the list in the reply to those who answer.
- **Weighting:** the avatar of the target (the early adopter of the segment's persona) says whether
  the text makes them reply; the other avatars are a vexation check only. A text fails on "deleted
  with irritation", not on "read and archived": the majority is meant to ignore it without being
  vexed (pivot section 2, adoption profile).
- **Calibration before use:** after any change to an avatar, run it on the texts whose real outcome
  is known (at least one that got replies, one that made a reader close, and one per message type
  the avatar will judge). An avatar that misreads them is fixed before it judges a new text.
- **What the avatars are good at, kept as is:** catching wrong trade words, a single person's
  situation turned into a plural ("people tell me"), a sentence read as "doing your job for you", a
  missing "no is fine", an acronym that carries the promise for a junior reader.

### Weight by avatar (the questions it reads first)

Taken from the avatar's temperament and its persona's strongest SONCAS boxes. Starting points, to
adjust per persona sheet:

- Decisive or senior head of team (pride): 2, 6, 7, 10, 21, 33, 41, 59.
- Trust and compliance profile (security): 5, 22, 28, 52, 76, 91.
- Senior expert of the trade (a lesson on their trade): 1, 2, 17, 21, 38, 85.
- Junior (jargon, clarity): 16, 23, 26, 53.
- Member of the majority, the "good soldier" (effort asked, relevance): 4, 13, 19, 75.
- Early adopter (novelty, influence): 53, 90, 22, 41, 59, 80, 46, and 99, 17, 39 when the reader is
  an expert of their trade.
- An end user who is not the buyer: 2, 16, 55.
- A partner or an intermediary who could be cast as the "them": 9, 14, 42, 69.

---

## Related Skills

- **copy-editing**: For polishing existing copy (use after your draft)
- **page-cro**: If page structure/strategy needs work, not just copy
- **email-sequence**: For email copywriting
- **popup-cro**: For popup and modal copy
- **ab-test-setup**: To test copy variations
