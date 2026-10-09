---
name: pos-social-visual
description: >
  Social post visuals: single images (branded text cards, cropped product captures) and multi-slide
  PDF carousels (LinkedIn document posts), built with sharp and pdf-lib. The image is the Attention of
  AIDA, readable at phone size, every rendered image looked at before delivery, captures anonymised,
  the post delivered ready to publish in the posts base. Brand tokens come from the product's design
  system, the voice from the GTM pivot. Ordered by `pos-gtm` in execute mode. Use when someone says
  "make an image for the post", "a carousel", "a LinkedIn visual", "slides", "a PDF carousel", "crop
  this capture", "blur this screenshot", "/pos-social-visual".
---

# Social post visuals (images and carousels)

## Role

Produce the **visuals of posts**, for the product's account or the owner's own: single images
(branded text cards, cropped product captures) and **multi-slide PDF carousels** (LinkedIn document
post). It is the visual production arm of `pos-gtm`.

It does NOT write the post's copy (that is `pos-gtm` execute mode, with the voice of the GTM pivot,
section 7, and its subsection "The owner's voice" when the owner posts in person), does NOT define
the brand identity or the moodboard (that is the product's design system, owned by the Design
module), and does NOT choose the GTM priority (that is `pos-gtm` coach mode).

Rule numbers refer to the collaboration rules of `pos-core`. Sections of the GTM pivot
(`<pivots.dir>/product_gtm_context.md`) are cited by number.

**Reads before the first script:** the GTM pivot (section 2 personas, 3 pains, 7 voice, 8 proof
points and how a figure is hedged, 16 confidentiality, and the appendix "Canonical sources" for the
posts base and the visuals folder), and the product's design system, found through the memory index
(rule 4).

## Process rule 0 (BEFORE ANYTHING): the image is the A of AIDA, not the product sheet

A post image has **one job: stop the scroll**. It is the A of AIDA: Attention, eye-catching. The
post's text carries the rest (I, D, A). An image that explains, lists or documents has already
failed: nobody stops to read a summary of features.

**The reasoning, in this order, BEFORE opening a script:**

1. **Which persona is scrolling?** One persona of section 2. An image never speaks to "the
   audience"; it speaks to one precise person.
2. **What do they hope for, or dread?** Not what the product does: what they live. The outcome they
   wait for, the rejection they fear, the late discovery of what a judge wrote.
3. **Which VISUAL OBJECT from their world carries that emotion?** The document they wait for
   anxiously, the stamp that falls, the result screen, the person who wins. An object they recognise
   in 0.3 seconds, without reading.
4. **Only then:** layout, tokens, script.

**The recurring mistake not to make again.** Delivering a dark card with a title and three feature
bullets. The owner's verdict: "Engineering work, not communication. A serious, recurring defect." It
cannot be caught by re-reading the render: it is decided at step 1 above.

**What was validated instead:** a reproduction of the very document the target audience waits for
(its official layout, its issuer's mark at the top, identifying fields masked), stamped with the
result they dream of, in red. The audience recognises the document instantly, and the stamp is
exactly the outcome they hope for. Zero feature on screen.

**Corollary:** if the punchline is already the first line of the post, the image does not repeat it.
Read twice, it is dead the second time. The image shows what the text cannot show.

**Confidentiality guardrail:** these visual objects often come from real documents (reports,
evaluations, captures). A real customer document NEVER serves as the source, even cropped: reproduce
the layout and mask the identifying fields (rule 2 below, and section 16).

## Process rule 0 bis: legibility in a mobile feed, and nothing else

A visual is seen at the size of a phone thumbnail, not full screen on a 27-inch display. Anything
"readable when zoomed" is unreadable.

**Floor sizes** (portrait 1080x1350): title 70 to 80 px, subtitle 34 to 38 px, list body 32 to 36 px,
source line 28 to 30 px. Below that, it is not published. Observed: a card delivered with a 26 px
title and 20 px captions; the owner's verdict: "unreadable, the text is 20 times too small. Better to
write less and more legibly."

**Air between blocks.** The reflex is to fill; the right gesture is to remove. Fewer words, bigger,
more line spacing. One slide carries ONE idea.

**Every slide must be understood on its own.** A carousel is read slide by slide, often out of the
post's context. A vague noun says nothing; a qualified one ("your scientific references", not "your
references") places it at once. Same rule for the title of the PDF uploaded to the network.

**The source is written in full on the slide that carries the data** (authors, year, short
reference). A statistic without a visible source casts doubt on everything else.

**No soft title, no vague phrasing.** Use the word the audience uses, not a paraphrase. Observed: a
paraphrase was refused in favour of the exact term the audience employs.

**Name the actors.** An anonymised ranking interests nobody. If the study names the models or the
tools, the visual names them. And **if the product, or the model provider it relies on, appears in
the study, it must appear in the visual**, even when the figure is not flattering: an absence is
noticed and ruins the credibility of the whole table.

**Missing data is fetched, never given up.** When the values exist only in a figure of a PDF, extract
the embedded images and read them, rather than deliver a table with holes:
`new PDFParse({data}).getImage()` (pdf-parse), then `Read` on the PNGs produced. Note in the script's
header which values come from the article's text and which were read on a chart.

**Windows gotcha:** a PDF open in a viewer locks the file (`EBUSY`). The script tests opening for
writing and falls back to a numbered name (`-v2`) rather than failing.

## Process rule 1 (NON-NEGOTIABLE): check your own output

**After EVERY generation, `Read` the PNGs produced and really look at them before delivering
(rule 10).** Never deliver blind. This catches: accent bars crossing the text, misplaced callouts,
truncated text, unreadable UI. If there is a defect, fix the script, regenerate, and look again.

## Process rule 2: product captures that work

Failed product captures almost always come from **a screen that is too wide** (1900 px and more).
Shrunk into a portrait slide, the UI becomes tiny and swims in white.

- **Ask the owner to capture on a narrow window** (about 1000 to 1200 px wide, side panels folded).
  The app recomposes more vertically and legibly.
- **Always on the test space** the product's `CLAUDE.md` names, never a real customer item: a
  capture exposes confidential content (rules 32 and 33, section 16). Confirm it is test data before
  publication.
- When a capture must be anonymised (a private message, a profile), blur by zone (see "Anonymise a
  capture").

## Copy constraints (inherited)

- **Zero em dash**, no hashtags, the language the post targets (section 7).
- **No customer, institution or project names** in public (rule 41, section 16).
- **Figures:** hedge them ("in our tests"), an asterisk with the method (the date, the number and kind
  of cases), never a confidential raw figure (section 8).

## Technical pipeline

- **`sharp`**: PNG compositing. Backgrounds, text through inline SVG, cropping captures, compositing
  the logo.
- **`pdf-lib`** to assemble the PNG slides into a multi-page PDF (the network's document carousel).
  **Install it in the scratchpad**, not in the project: `cd <scratchpad> && npm install pdf-lib
  --silent`, then `require('pdf-lib')` with absolute paths to the PNGs. Do not pollute the product's
  `package.json`.
- Write a **re-runnable `.cjs` script** in the visuals folder the pivot names (for example
  `build-<post>-carousel.cjs`), never a throwaway one-shot: the owner iterates (changes a caption,
  moves a callout) and the visual is regenerated in seconds.
- **Gotcha:** a PNG or PDF open in a Windows viewer gives `EBUSY: resource busy or locked`. Write
  under a new name (`-v2`) or ask for it to be closed.
- **Fonts:** librsvg has a limited set; use `font-family='Arial,Helvetica,sans-serif'`. **SVG text
  does not wrap:** split lines by hand (one `<text>` per line). Check that no accent bar falls on a
  line of text.

## Brand tokens

Taken from the product's design system (found through the memory index), never invented: the primary
colour, the dark, the tint, the light accent, the muted greys; the logo file and the wordmark (and
how it is coloured); the reusable visual assets. A visual primitive the design system lacks is
proposed to the Design module, not improvised here.

## Carousel recipe (portrait 1080x1350, LinkedIn document)

Keep the first carousel built for the product as the reference template to copy and adapt, and name
it in the visuals folder.

Typical structure:

- **Cover slide (dark):** logo and wordmark centred, a two-line title in white, an accent bar UNDER
  the title (never over it), a muted subtitle, the product's domain (section 1) at the foot.
- **Screenshot slides (full frame):** the key lesson:
  - the capture **full width, flush with the left, right and top margins** (`resize({width:1080})`,
    placed at (0,0)), as large as possible;
  - **a one-line title** in a **dark bottom band** under the capture, with a small logo, the wordmark
    and the domain;
  - an optional **callout**: `<rect rx=12 stroke=<primary> width=5 fill=none>` that **highlights ONE
    finding** to create focus (everything need not be legible). Adjust the coordinates by looking at
    the render;
  - DO NOT put a big product name at the top plus a redundant footer: it wastes space. The capture
    dominates.
- **Text or concept slide (tint):** a kicker in the primary colour, a dark title, a flow `A -> B -> C`.
- **CTA slide (dark):** a figure with its method asterisk, a punchline in the primary colour, a muted
  call to action, the domain.

Then assemble the PNGs into a PDF with pdf-lib (pages `[1080,1350]`).

## Single image recipe

- **Branded text card** (dark or tint): background, two-tone wordmark, title, a stamp if needed.
- **Cropped capture:** the capture on a tinted canvas, a caption (one line of the post), the domain, a
  light border.
- **Stamp** (for example "TESTED"): a double-bordered red rectangle rotated `rotate(-12)`, with a
  semi-opaque cream backing for legibility on a busy background.

## Anonymise a capture

Gaussian blur by zone: `sharp(f).extract({left,top,width,height}).blur(16)`, then recomposite at the
same position. Locate the zones by looking at the image first (name, photo, header). A strong blur
(sigma 16 or more) is not reversible. Careful: blurring a name and a photo does not anonymise the
**text** that can identify (a programme and a duration, a place and a role).

## LinkedIn formats

- **Carousel** = document post (PDF), rendered swipeable with a counter. Portrait 1080x1350 (the most
  space in the feed) or square 1080x1080 if the content is square. A document title is asked at
  upload.
- **Multi-image:** up to about 20 PNGs, swipeable too. Simpler, less "carousel".
- **Single image:** 1200x1200 or 1200x1350.
- A link to the product's domain in the post pulls the site's thumbnail; posting the rich visual as
  the first comment is a valid tactic.

## Save and follow-up

- Output in the visuals folder the pivot names.
- Log the image reference in the content backlog file the pivot names, if any, and on the post's
  page in the posts base (through `pos-gtm`).

## Deliver a post ready to publish

The posts base is the one the pivot's appendix "Canonical sources" names, with its title property,
its exact status values (a status cannot be created through the API), its account property (the
owner's own or the product's) and its axis property. Fetch its schema first, following
`pos-tool-conventions` (Notion reference).

1. Upload the carousel PDF: `notion-create-file-upload {filename}`, then ONE multipart POST to
   `upload_url` with the headers it returns (`curl -F "file=@<path>;type=application/pdf"`). The
   answer gives `<pdf src="file-upload://..."></pdf>`.
2. `notion-create-pages` in the base, status = the base's "ready to publish" value, content: the
   post's text in a `plain text` code block (line breaks kept, copyable as is), then the PDF, then
   three lines on the slides and the path of the `.cjs` script that regenerates them.
3. Nothing is posted on the network: the owner publishes.

**A data slide is a chart:** when the owner says "like slide 1 of the last post", it means the same
chart, rendered and looked at, never a text description.

## No posts base

When the pivot names no posts base: the post's text and the paths of the PNGs or the PDF are given in
the reply, said in one line.

## How it fits

| Skill | Relation |
|---|---|
| `pos-gtm` | orders the production (execute mode), writes the copy, and logs the follow-up |
| The GTM pivot | the personas, the voice (and the owner's voice), the proof points, the posts base, the visuals folder |
| The product's design system (Design module) | the source of tokens and brand; a new visual primitive is proposed there |
