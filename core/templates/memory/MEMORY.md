# Memory index

Skeleton version 1, maintained by `pos-core`.

Copy this file to `<memory.dir>/<memory.index>` (by default `.claude/memory/MEMORY.md`). It is the
index of the repo memory: a session reads it to decide which files to open. A file missing from the
index is a file nobody reads.

## Line format

One line per memory file:

```
- [<file name without .md>](<file name>.md): <hook> (<YYYY-MM-DD>)
```

- **Link**: the file, relative to `memory.dir`.
- **Hook**: one line, under about 150 characters, that says **when to read the file** and what it
  settles. Not a summary. Good: "Read before any change to billing; covers plan limits, proration,
  webhook retries." Weak: "Billing notes."
- **Date**: the day the file was last verified against the code or its source.

## Rules

- Put each line under its section below. The `archi-*` and `reference_*` sections come first.
- Add the line in the same change that creates the file. Remove it in the same change that deletes
  the file. Update the date when the file is re-verified.
- Every file listed in `memory.always` or in `routing.zones` appears here.
- The index holds no content. Facts go in the file, not in the hook.
- No link to the assistant's auto-memory: versioned memory never points to local memory.
- A file that is historical and no longer describes the product says so in its hook ("historical,
  not active"), or moves to an archive folder and leaves the index.

---

<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->

## archi-*: how our subsystems are built

<!-- One line per archi-<subsystem>.md. Shape: the core template memory/archi-subsystem.md. -->

- [archi-example](archi-example.md): Read before any change to <subsystem>; entry points, data flow, pitfalls. (YYYY-MM-DD)

## reference_*: domain, conventions, gotchas, rules, catalogues

<!-- One line per reference_<topic>.md. Shape: the core template memory/reference.md. -->

- [reference_example](reference_example.md): Read before <task>; settles <question>. (YYYY-MM-DD)

## Global architecture and domain

<!-- The root architecture file (usually in memory.always), the methodology of the users' trade,
and other product-wide files. -->

- [architecture](architecture.md): Root architecture of the product; read by every gated skill. (YYYY-MM-DD)

## Design system

<!-- The design system file that every UI change reads first, and its rationale if kept apart. -->

## Other

<!-- Anything that fits none of the sections above. If this section grows, a section is missing. -->
