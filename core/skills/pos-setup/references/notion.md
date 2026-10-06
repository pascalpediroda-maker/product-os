# Notion connector

Serves the shared bases: `databases.feedback`, `databases.roadmap`, `databases.fix_backlog`,
`databases.crm`. Everything below was checked against the sources at the end, on 2026-09-26. A
command that fails because the vendor changed it is re-verified on the vendor's page and fixed here,
with the new source and date. Never patched from memory.

## Account

- **No account yet:** sign up on notion.com. The pricing page lists Free, Plus, Business and
  Enterprise. Free costs nothing. Its blocks are "Unlimited for individuals" and "limited for 2+
  members": a team of two or more that shares the bases will outgrow it. Read the current prices on
  the pricing page when the owner asks; they are shown in the reader's currency and change.
- **What the plan gives the connector:** the pricing page has no row for MCP. Notion's MCP
  documentation restricts some tools: "Full Notion MCP on Business or Enterprise is required to
  filter by editor, last-edited date, multiple teamspaces, title only, or content status", and the
  meeting notes query "requires a Business plan or higher with Notion AI". Setup needs none of these:
  it searches, fetches, creates one base and updates a schema. Once connected, the connector has a
  tool that checks which tools are available on the workspace's plan: use it if a call is refused.
- **Enterprise workspaces:** "Workspace owners on the Enterprise Plan can control whether members can
  connect external AI apps through Notion MCP." If the sign-in is refused, the workspace owner has to
  approve the client.

## Add it to Claude Code

```
claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp
```

Notion's page gives `claude mcp add --transport http notion https://mcp.notion.com/mcp`, which uses
Claude Code's default scope, local. Setup adds `--scope user`, a documented Claude Code flag:

- **User scope**, because the Notion account is personal and used across products, and the URL says
  nothing about this repository. The entry goes in `~/.claude.json`, private to the owner, outside
  the repository.
- **Local scope** (`--scope local`) instead, when this product uses another Notion workspace or
  account than the owner's other products.
- **Not project scope:** the workspace is not a fact of the repository, and each person who works in
  it may use a different account or none.

The command carries no secret: setup can run it after the owner's OK.

Already connected as a claude.ai connector? If its tools are callable in this session, it serves the
same purpose. Do not add a second one: two connectors to one workspace load two sets of tools.

## Sign in

- **Method: OAuth in the browser, by the owner.** In Claude Code, run `/mcp`, select the server,
  authenticate, choose the workspace in the browser. From a terminal, `claude mcp login notion` does
  the same.
- **No token route.** The hosted server takes OAuth only. The open-source Notion server that took
  integration tokens is deprecated: do not install it.
- **What access it grants:** Notion's help page says MCP tools act with your full Notion permissions
  and can access everything you can access. It also says "MCP does not bypass Notion permissions".
- **Least privilege:** the hosted server documents no read-only mode and no way to restrict it to
  some pages. What is left:
  - sign in with the account whose access fits the product's work;
  - in Claude Code, never add an allow rule for the whole server (`mcp__notion` or `mcp__notion__*`).
    Allow read tools one by one if the prompts tire the owner; tools that create, update, move or
    trash stay on ask.

## Where the credential lives

The OAuth token is held by Claude Code, outside the repository ("stored securely and refreshed
automatically"). `claude mcp logout notion` clears it. Nothing goes in a file of the repository.

## Harmless read

Search for one page whose title the owner gives, or fetch one base the owner names. Show its title
and nothing else.

## Fill the config

For each shared base that already exists (feedback, roadmap, fix backlog, CRM):

1. The owner gives its link or its name. Search by name if needed, and have the owner confirm the hit.
2. Fetch it. The response carries its data source in a `collection://...` tag. Notion's MCP docs:
   "Pass a data source ID (from `collection://...` tags in database responses)".
3. A database with several data sources: ask which one is the base.
4. Propose `collection://<id>` for `databases.<key>` in setup's config step.

A base that does not exist is created in setup's Step 7 when the owner wanted it (question 1 of
Step 2): the CRM, feedback and roadmap from the schemas in `references/bases/`, the fix backlog by the
`pos-fix-backlog` skill. A base the owner did not want stays empty; the skill that needs it will say
so.

A key already filled is checked by fetching it. One that does not resolve is reported as "configured,
not reachable": the page may not be shared with the signed-in account. Share the page; never create a
duplicate base.

## Traps

- Search is rate-limited: "notion-search (including user lookups): 30 requests per minute".
- Two Notion connectors (one added in Claude Code, one from claude.ai or from a plugin) load under
  different names. Keep one; turn the other off for this project in `/mcp`.

## To verify

- Which tools the Free plan gets. The pages read do not say. Verify per workspace with the
  connector's tool-access check once connected.

## Sources

Read on 2026-09-26.

- Notion, get started with MCP: https://developers.notion.com/docs/get-started-with-mcp (URL
  `https://mcp.notion.com/mcp`, the Claude Code command, OAuth, no token for the hosted server, the
  deprecated open-source server).
- Notion, MCP supported tools: https://developers.notion.com/guides/mcp/mcp-supported-tools (plan
  restrictions, tool-access check, search rate limit, `collection://` data source IDs).
- Notion Help, Notion MCP: https://www.notion.com/help/notion-mcp (full user permissions, Enterprise
  controls).
- Notion pricing: https://www.notion.com/pricing (plans, Free limits).
- Claude Code, MCP: https://code.claude.com/docs/en/mcp (`--scope` values and where each is stored,
  `/mcp`, `claude mcp login` and `logout`, token storage wording).
- Claude Code, permissions: https://code.claude.com/docs/en/permissions (`mcp__<server>` rule syntax).
