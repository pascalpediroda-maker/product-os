---
name: pos-kb-article
description: >
  Write or update a help center article AND keep the copy the product's AI reads in sync. The whole
  pipeline: read the work center, read the code, write the article as a product manager, create or
  update the page, capture the screenshots and look at them, store them privately (never a public
  bucket, signed URLs only) and put them in the article, update the AI's copy and re-ingest it, update
  the work center, report. Where the help center lives, its scripts and the screenshot test space are
  read from the Support pivot (section 9). Skipping a step leaves the help center inconsistent. Use
  every time someone wants to create, expand or refresh a help article: "write a help article on X",
  "document this feature", "update the help center for Y", "the help center is missing X", "we just
  shipped Z, document it", a stub to expand, screenshots to add or refresh, a gap flagged in the work
  center, or a fix a user can see. "/pos-kb-article".
---

# Help center article

The help center can be **dual**: pages for people, and a short copy the product's AI assistant reads
(ingested into its search index). The pipeline that keeps the two in sync, and that adds screenshots,
has too many moving parts to remember on the fly. Every step below comes from a real session; skipping
one produces a half-broken article.

Articles are **written as a product manager**, in `product.ui_language`, **with screenshots**, under
the product's name (never a former name), and **never name a customer or an institution**. The owner
hates having to ask twice: run the pipeline autonomously.

Rule numbers refer to the collaboration rules of `pos-core`. Sections of the Support pivot,
`<pivots.dir>/product_support_context.md`, are cited by number: 8 Test space, 9 Help center.
Everything product-specific below (pages, bases, scripts, commands, the screenshot space) is read from
section 9; nothing is written from memory (`pos-tool-conventions` rule 5).

---

## Mandatory pre-flight: read the work center

**Before writing anything:**

1. Read section 9 of the Support pivot, and section 8 for the test space.
2. Read the `pos-tool-conventions` skill: its rules, then its Notion reference (or the reference of the
   tool section 9 names), before the first call.
3. Fetch the **work center** page section 9 names, to know the current state: the gap analysis, the
   audited pages, what is already done.

The work center tells you:

- which features still need an article (the gap analysis);
- which existing articles are stubs, describe a former product, or document something the code no
  longer has, and need rewriting or flagging;
- the current state of the screenshot pipeline.

If the request is about a specific feature, check that it is not already covered or already flagged
obsolete.

Section 9 is empty, or says the product has no help center yet: say so, and ask the owner where it
should live before writing anything.

---

## Step 1: read the actual code (never invent)

Rule 41: before writing a technical note, a spec or a help article, read the source files. Never invent
or assume how the product works.

For each article, identify and read:

1. the page or component files of the view you document (search for them, never assume);
2. the route and its URL parameters;
3. the API routes the view calls;
4. the data model: which tables are queried (names only);
5. any dialog, menu, sub-tab or hidden behaviour the view exposes.

Read the architecture memory of the zone first (`routing.zones` for the area, Support pivot section 3):
it gives the big picture quickly.

If the feature is large, spawn a read-only exploration agent to summarise it in parallel, but always
cross-check its claims against the actual files before writing (rule 37).

**What you write must be defensible against a search of the code.** If it is not in the code, it does
not go in the article.

---

## Step 2: write the article

### Voice and format

- **As a product manager:** functional behaviour, what the user sees, what the user does, what the
  system does in response. The what and the why, never the how in code (no function names, no SQL, no
  implementation details that will not survive a refactor).
- **`product.ui_language` only,** whatever language the team speaks.
- **Sentence case** for headings and button labels, or the convention of the design system memory.
- **The product's name** from section 9, never a former name it lists.
- **Never a customer or institution name.** Use a generic description ("a research university", "an
  institution with on-premise requirements").
- **No em dash** (rule 40): a comma, a period, a colon or parentheses.
- **Concise:** about 1.5 to 3 screens per article. Cut filler.

### Article skeleton

Every article follows this structure, adapted to the topic:

```
<callout icon="🎯" color="gray_background">
One-sentence pitch: what this feature is, why it matters.
</callout>

<the main screenshot, placed as section 9 says>

## Where to find it

The direct route and the navigation entry. One short paragraph.

## Layout / Sections / Sub-tabs (whichever applies)

A table or a short list of the panels, tabs or sub-views, with what each one holds.
For tab-based views, a table:
| Tab | What it holds |

## How to do common things

Step by step for the 3 to 6 most common actions. Numbered lists.
This is the meat of the article: most readers come for "how do I X?".

## Tips

3 to 6 bullets of good practice and gotchas. For example:
- **Start with X.** Why.
- **Watch out for Y.** Why.

## Related articles

3 to 5 links to other help articles.
```

Write in the tool's own markup (for Notion, its markdown dialect with real newlines, never a literal
`\n`: the `pos-tool-conventions` Notion reference). Tables with `| col | col |`; callouts as
`<callout icon="..." color="..._background">...</callout>`.

### Known limitations

Section 9 lists the limitations an article must state when it touches the feature (for example a
button disabled until a field is filled, a check that covers the narrative but not the budget, a choice
that cannot be changed after creation, a view that lives inside another as a sub-tab). State them as
current limitations, until the list changes.

---

## Step 3: create or update the page

### Where the articles live

Section 9 gives one row per topic: its parent page, the base that holds its articles, and the name of
its title property. A new article can go into the base of the main features topic without setting a
category; the owner re-categorises later. **Do not block on categorisation.**

### Creating an article

Announce the write (`pos-tool-conventions` rule 2), then create the page with the topic's base as its
parent: the title in the title property section 9 names, the content in the tool's markup. Several
articles go in one call when the tool allows it. Fetch each page back (`pos-tool-conventions` rule 7).

### Updating an article

- **A targeted edit:** fetch the page first to get the exact text to replace (real newlines, no
  assumption), then replace that passage only.
- **A full rewrite** of a stub or an obsolete article: replace the whole content.

### Flagging obsolete pages

A help center page often cannot be deleted through the connector. To flag obsolete content (a former
product's text, a page documenting something the code no longer has, a duplicate), rename it with one
of the prefixes section 9 lists. Tell the owner at the end of the session which pages to delete by
hand.

---

## Step 4: capture the screenshots (mandatory, never optional)

**Every how-to article has at least one screenshot.** A how-to without one is not accepted.

The pipeline is the capture command and the upload command section 9 names.

### Adding a shot

Section 9 says how a shot is added to the capture script. For a browser automation script that holds a
list of shots, an entry usually carries: a slug (the file name), the article it serves, the alt text,
the URL in the screenshot space, the viewport, a selector to wait for, an optional preparation (clicks,
scrolls, hovers) and an optional clip of a region. Then capture only that shot, and upload.

### Pre-flight before capturing

1. **The dev server:** probe its port (section 8). A real HTTP code, even an error, means it is up.
   When it is down, ask the owner before starting one (rule 8). A background task that reports
   "completed" does not prove the server died: probe the port.
2. **Sign-in:** the capture script signs in as section 9 says.
3. **The screenshot space** of section 9, never a customer's space (rule 32), never a reference or an
   imported item (rule 33). Views that show an empty state there are still useful: most new users see
   exactly that on day one.

### Selectors that work

- `text=Some Visible Label` for unique text;
- `text=/regex|alt|union/` for one of several;
- CSS selectors as a fallback.

Avoid waiting for network idle on navigation: a dev server with hot reload keeps long-polling, and
network idle never fires. Wait for the DOM, then for the selector.

### Look at every captured image

Read each captured image before uploading it (rule 10). If it shows an empty state you did not expect,
or the sign-in page, debug with a temporary script that prints the page URL, its title and its text.

### Storage

- **A private store only, files reached through signed URLs only. Never a public bucket,** whatever
  the content: a public bucket is the one place where a capture that shows more than intended stays
  readable by anyone.
- Section 9 says how an image reaches an article. A signed link expires: when the help center tool can
  hold the file itself, the image is uploaded into it rather than linked.
- Re-running the upload replaces a file of the same name.

---

## Step 5: put the image in the article

Place the main image right **after the pitch callout**, before the first heading. A long article takes
a second image deeper in (in "Layout" or "How to"), with a different clip that zooms on one element.

Adding an image to an existing article: fetch it first to get the exact text to replace.

---

## Step 6: sync the AI's copy and re-ingest

Skip this step only when section 9 says no AI reads help content.

The page is for people; the copy is for the product's AI assistant. Both are updated.

### Update the copy

Add the matching **how-to entry** in the section of the copy that section 9 names:

```markdown
### How to <action>
1. Step one with **bold key labels**
2. Step two
3. ...
One-line context paragraph.
Full article: [Article title](<page link>)
```

Keep the entry **short and dense**: it is chunked for the search index. The link at the end lets the
assistant send users to the long form.

### Re-ingest

Run the ingest command section 9 names. It re-chunks the copy and re-embeds it, replacing the old
chunks of the same source. Confirm that the chunk count grew (or stayed stable when you only modified
existing entries).

---

## Step 7: update the work center

After every help center session, edit the work center page in place to reflect the new state:

- add the new articles to the tables of articles written;
- move the features from the gap analysis to the done section;
- list the pages newly flagged (obsolete, orphan, stub, duplicate) so the owner can clean them;
- note the code bugs found on the way, and file each one with `pos-fix-backlog` (`Source` =
  `Dev session`).

Fetch the page first to get the exact text to replace.

---

## Step 8: final report

Status first (rule 22), short:

- how many articles created, expanded, flagged;
- links to one or two articles for visual validation;
- what needs the owner's hand (categorise, delete the flagged pages, decide on a code bug filed);
- what remains in the gap analysis.

---

## Common pitfalls

1. **Writing without reading the code first.** Articles must reflect what is in the code. An invented
   behaviour is caught at the next review.
2. **Skipping the screenshot.** The article is rejected. Always capture, look, and place it.
3. **A partial capture run that overwrites the script's list of shots.** When the upload reads a
   manifest the capture rewrites, capturing one shot leaves the others out of it. Files already stored
   persist, but a list of links built from that manifest may be incomplete: keep the merge the upload
   script does, and be aware of it.
4. **A literal `\n` instead of real newlines** in the page content: the tool renders the characters.
5. **Trusting a "completed" notice on a background dev server** as proof it died. Probe the port.
6. **Asking the owner to do what this skill can do.** Capturing, updating the work center,
   re-ingesting: all autonomous. The owner only re-categorises, deletes flagged pages and decides on
   code bugs.
7. **A public link to a capture.** Never: private store, signed URLs.

## When something is missing

Say it in one line, continue with what exists, never invent what is missing (principle 10).

| Missing | What this skill does |
|---|---|
| section 9 empty | asks the owner where the help center lives; writes nothing before |
| no work center page | writes the article, and lists in the report what the work center would have recorded |
| no capture or upload command | writes the article, captures by hand with the session's browser tool when one is callable, and says the pipeline is missing; never a public link |
| no AI copy | skips Step 6 and says so |
| no help center tool callable | the article is written to a file in the evidence folder and the owner is told |
