# Notion

The Notion MCP accepts calls that look right and then render wrong, or wipe values without an error.
Each rule below comes from such a call or from Notion's documentation. Operation names are Notion's
(`notion-fetch`, `notion-update-page`...); find the callable name in the session (SKILL rule 1).

**(observed)** marks a behaviour seen in use and not stated in Notion's documentation.
**(to verify)** marks one that is not confirmed.

---

## 1. Before the first call

- **Know what this connection may do.** Call `notion-get-tool-access` with `{}` once per connection,
  unless its result is already in context, and reuse it. It says whether AI search is available, what
  the SQL quota is, and which parameters the plan restricts. SQL over data sources is unlimited on
  Business and Enterprise plans with Notion AI; other plans share a workspace quota for single-source
  queries and cannot query several data sources at once.
- **Take the base from the config** (`databases.*`) and fetch it. The fetch gives its data sources,
  their `collection://` URLs and the schema: exact property names, types, options. Every later call
  uses those exact names.

## 2. Reading

### Finding a page

- If AI search is available, use `notion-ai-search`; otherwise `notion-search` with short, specific
  keywords. Narrow with `data_source_url` or `page_url` rather than with extra words.
- A base the config names is fetched directly, never searched for.

### Fetching

- `notion-fetch` returns a page as Notion-flavoured Markdown, and a database with its data sources and
  their schema.
- Before relying on fetched content, check `truncated`, `unknown_block_count` and `unknown_block_ids`.
- A very large result may be saved to a file by the client instead of shown. Parse that file with a
  script (targeted extraction; a nesting-aware parser for `<details>` blocks). Don't load it whole into
  context.

### Querying rows: SQL, rows or view

`notion-query-data-sources` has three modes.

| Mode | Use it for | Watch |
|---|---|---|
| SQL (default) | filtering, joining, counting | Read-only SQLite. The table name is the data source URL in double quotes: `FROM "collection://<id>"`. Filters saved on views are not applied: put every filter in `WHERE`. Bind values with `?` and `params`. Checkboxes are `"__YES__"` / `"__NO__"`. Normalise timestamps with `datetime()` or `date()` before comparing them. |
| rows | reading rich text faithfully; always before rewriting a text property | Up to 100 rows per call (default 50). Mentions, link targets, formatting and dates are preserved. Filters and sorts use exact property names. |
| view | running a saved view's filters and sorts | The only mode that can select archived rows. |

- **SQL text is lossy.** Mentions, formatting and link targets can be missing from it. Never conclude
  from SQL that a rich-text value is corrupt, and never rewrite a rich-text property from SQL output:
  read it in rows mode, or fetch the page, first.
- **Properties named `id` or `url`** (any case) carry the prefix `userDefined:`. A unique ID column
  named "ID" reads as `"userDefined:ID"` in SQL (observed for SQL; the prefix is documented for
  writes). Date columns read as `"date:<Property>:start"` and `"date:<Property>:end"` (observed).
  ```sql
  SELECT "userDefined:ID" AS n, "Status", "date:Reported on:start" AS reported
  FROM "collection://<data source id>"
  WHERE "Status" IN (?, ?)
  ```
- Option values (select, status) match exactly, case included.
- An empty result is not "no rows" until you have checked the data source URL (fetch the database),
  the exact option names in the filter, and that the connection can see that part of the workspace
  (collaboration rule 7).

## 3. Writing pages

### Content syntax

Content is Notion-flavoured Markdown. The full specification comes from the server: fetch
`notion://docs/enhanced-markdown-spec` with `notion-fetch`, and read it before writing anything beyond
paragraphs, headings and lists. The traps:

- **Real newlines, never a literal `\n`.** The content value must contain actual line breaks. A
  two-character `\n`, easy to produce when content is built in JSON or in code, renders as text and
  flattens the page into one block.
- **Indent children with tabs.** A toggle, a toggle heading or a callout contains only the indented
  lines under it; an unindented child falls out of it.
  ```
  <details>
  <summary>Toggle title</summary>
  	Child paragraph, indented with a tab
  </details>
  ```
- **Callouts**: `<callout icon="<emoji>" color="yellow_bg">`, indented children, then `</callout>`.
  Background colours end in `_bg` (`gray_bg`, `blue_bg`, `red_bg`...); text colours are bare names
  (`gray`, `blue`, `red`...). Formatting inside a callout uses Markdown (`**bold**`), not HTML.
- **Tables**: `<table header-row="true">` with `<tr>` and `<td>` rows. Cells hold rich text only.
  Merged cells cannot be created.
- **Blank lines are stripped.** A deliberate empty line is `<empty-block/>` alone on its line; it is
  rarely needed.
- Headings go from `#` to `####`; levels 5 and 6 become level 4.
- Outside code blocks, escape ``\ * ~ ` $ [ ] < > { } | ^`` with a backslash. Inside code blocks, write
  the content literally.
- **A `<page url="...">` tag with an existing page's URL moves that page under this one, and removing
  a `<page>` tag removes that child page.** The same holds for `<database url="...">`. To point at a
  page, use `<mention-page url="..."/>`. When you rewrite a fetched page, keep every `<page>` and
  `<database>` tag it had.
- On creation, the title goes in the properties, not at the top of the content.

### Update or replace

`notion-update-page` takes one command per call.

| Command | Does | Use it for |
|---|---|---|
| `update_content` | a list of search-and-replace operations (`old_str`, `new_str`), up to 100 | a targeted edit |
| `insert_content` | inserts at the start or at the end | appending a section or a log line |
| `replace_content` | replaces the **whole** page content | rewriting or restructuring |
| `update_properties` | changes property values; omitted properties are left unchanged | title, status, tags, dates, relations |

- **Fetch right before any content update.** Each `old_str` must match the current content exactly,
  whitespace and newlines included, at exactly one place; otherwise the call returns an error (unless
  `replace_all_matches` is set). Copy `old_str` from that fetch, never from memory or from an earlier
  fetch.
- When the `old_str` pieces would cover most of the page, use `replace_content` with the full new
  content, built from the fetch.
- Both content commands refuse to delete child pages or databases that are absent from the new
  content, and list them, unless `allow_deleting_content` is true. Read that list. Never set the flag
  without a go.
- Writes may run in the background (`allow_async`, on by default for page updates and creations): the
  call can return a task. Wait until it has succeeded (`notion-get-async-task`) before fetching or
  writing that page again. Set `allow_async` to false when the next step needs the page at once.
- Fetch after writing and check the render: no literal `\n`, children inside their toggles, nothing
  lost.
- A page the owner is editing: propose the wording in chat and write on "write it" (collaboration
  rule 16).

### Property values

- Use the exact property names from the fetched schema.
- Formats: a date splits into `date:<Property>:start`, `date:<Property>:end` and
  `date:<Property>:is_datetime` (0 or 1); a number is a number, not a string; a checkbox is
  `"__YES__"` or `"__NO__"`; **a relation is an array of page URLs** (page IDs are also accepted); a
  person is an array of user IDs; `null` clears a value.
- Properties named `id` or `url` take the `userDefined:` prefix here too.
- A page outside a database has a single property: `title`.

### Creating pages

- In a base, the parent is the data source (`data_source_id`, the `collection://` ID from the fetch).
  Use a database ID only when the database has a single data source, and never `page_id` for a
  database.
- Up to 100 pages per call; split larger batches.
- Search before creating: you cannot delete a duplicate (section 5).
- No destination named: create a private draft (`creation_mode: "draft"`) and say that it is private.
- Shared pages name no client or institution (collaboration rule 41).

## 4. Databases

Schema changes go through `notion-update-data-source` as DDL statements: `ADD COLUMN`, `DROP COLUMN`,
`RENAME COLUMN`, `ALTER COLUMN ... SET`. Fetch the data source before and after each change, and check
the names, types and options it returns. `DROP COLUMN` erases the column's values: go required.

### Columns

- **Renaming a column keeps its values**: the property keeps its ID.

### Select and multi-select options

- **An option name cannot contain a comma.** Names must also be unique regardless of case.
- **Renaming an option erases the values of the renamed options.** `ALTER COLUMN ... SET SELECT(...)`
  sets the full option list: an option left out is removed, and the API does not rename an existing
  option. A new name is a new option, so the rows that carried the old name are left empty. Options
  whose name is unchanged keep their values.
- So **fix option names before importing rows.** Once rows hold values:
  - to rename an option, ask the owner to rename it in the Notion UI, which keeps the values; or, with
    a go, read and keep the affected rows (page id and value), change the options, write each value back
    with `update_properties`, and check;
  - to add an option, list every current option plus the new one.
- **Status columns**: their options cannot be changed through the MCP. The DDL takes `STATUS` without
  an option list, and changes failed (observed). Plan with the existing options, or ask the owner to
  change them in the UI. Notion's REST API documents status option updates; whether the MCP will expose
  them is to verify.

### Unique IDs

- A `UNIQUE_ID` column is numbered by Notion: you cannot write a page's number. Only the prefix is
  configurable (`UNIQUE_ID PREFIX 'X'`).
- **A prefix is unique across the workspace** (observed): a second base asking for a prefix that
  another base already uses is refused with a 409. Two products of the same owner in one workspace
  take two prefixes. Propose one per product before creating the column.
- Named "ID", it reads as `"userDefined:ID"` in SQL (section 2), **and SQL returns only the number**,
  without the prefix (observed). A fetch of the database or data source does not show the prefix
  either; a fetch of one entry shows it (`<prefix>-<n>`). To learn an existing base's prefix, fetch its
  latest entry.

### Relations

- A relation column targets a data source: `RELATION('<data source id>')`, or
  `RELATION('<data source id>', DUAL)` for a two-way relation. Share the target database with the
  connection first.
- A relation value is set with page URLs (section 3).

### Moving

- `notion-move-pages` moves pages or databases, up to 100 per call, to a new parent. A data source
  cannot be moved on its own.
- **Moving a database keeps its URL** (observed): the config's `collection://` IDs and the links to it
  stay valid. A move still needs a go: it changes where the content lives and who sees it.
- Writing a `<page>` or `<database>` tag with an existing URL into content also moves it (section 3).

### Trashing a data source

- `in_trash` on `notion-update-data-source` moves a data source to the trash. Only the Notion UI can
  undo it. Go required.

## 5. What the API cannot do

| You want to | Through the MCP | Do instead |
|---|---|---|
| delete or trash a page | no operation exists: the update commands have no trash, only a data source can be trashed | rename the page with a warning prefix through `update_properties` (for example `[TO DELETE] <title>`) and tell the owner to delete it in the UI. Don't hunt for a delete call. |
| change a status column's options | not possible (observed) | the owner changes them in the UI |
| rename a select option and keep its values | not possible | the owner renames it in the UI, or read, change, write back (section 4) |
| write a unique ID number | not possible | nothing: Notion assigns it |
| merge table cells | not possible | the owner merges them in the UI |
| edit a meeting transcript | refused | nothing |

## 6. Pre-flight checklist

Before each write:

- [ ] Callable tool name found in the session; schema loaded; tool access known.
- [ ] Target ID taken from the config or the reference memory, fetched and confirmed.
- [ ] Call announced: what, which base or page, read or write.
- [ ] Content update: page fetched just before; every `old_str` copied from that fetch.
- [ ] Real newlines; children indented with tabs; `_bg` background colours; no `<page>` or
      `<database>` tag with an existing URL unless a move is meant.
- [ ] `replace_content`: the new content is the whole page; `allow_deleting_content` not set without a
      go.
- [ ] Rich text rewritten from rows mode or a fetch, never from SQL output.
- [ ] Select options: no comma in a name; names final before import; no option renamed on a base with
      values without a go.
- [ ] Not trying to delete a page or to change status options.
- [ ] Background task awaited; result fetched and checked.
- [ ] No client or institution named on a shared page.

---

## Sources

- Notion MCP supported tools (operations, rows mode limits, lossy SQL text, `old_str` matching,
  background tasks, moving pages and databases):
  https://developers.notion.com/docs/mcp-supported-tools
- Updating a property schema (omitted options are removed; the API does not rename options; a renamed
  property keeps its ID; share related databases before configuring relations; retrieve the data source
  again after a change; status option updates in the REST API):
  https://developers.notion.com/reference/update-property-schema-object
- Property object (option names unique regardless of case, commas not allowed; unique ID numbers cannot
  be written): https://developers.notion.com/reference/property-object
- Notion-flavoured Markdown: the `notion://docs/enhanced-markdown-spec` resource, read through
  `notion-fetch` on 2026-09-26 (tabs for children, `_bg` colours, `<table>`, `<empty-block/>`, escaping,
  `<page>` and `<database>` tags that move content).
- Tool descriptions and parameter schemas of `notion-fetch`, `notion-search`, `notion-query-data-sources`,
  `notion-update-page`, `notion-create-pages`, `notion-update-data-source` and `notion-move-pages`, read
  from the server on 2026-09-26 (property formats, the `userDefined:` prefix, `allow_deleting_content`,
  `allow_async`, SQL quotas, draft mode, DDL types, trash only for data sources).
- Observed in use, September 2026: renaming select options erased the values of the renamed options;
  status options could not be changed; the unique ID column read as `"userDefined:ID"` in SQL; a moved
  database kept its URL.
- Observed in use, October 2026: SQL on a unique ID column returned the number without its prefix, an
  entry fetch showed `<prefix>-<n>`, and a prefix already used by another base of the same workspace
  was refused with a 409.
