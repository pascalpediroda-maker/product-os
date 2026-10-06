# Amplitude connector

Serves product analytics: `analytics.provider` and `analytics.project_id`. Everything below was
checked against the sources at the end, on 2026-09-26. A command that fails because the vendor
changed it is re-verified on the vendor's page and fixed here, with the new source and date. Never
patched from memory.

## Account

- **No account yet:** sign up on amplitude.com. The pricing page lists a Free plan with "2M
  Events/month forever", and "AI Agents and MCP" on every plan, Free included; "Every plan includes
  the full platform and unlimited seats." Read the current terms on the pricing page when the owner
  asks.
- **The organization must allow MCP:** "Amplitude enables MCP server access by default for all users
  in your organization. Organization administrators can opt out or restrict access" under
  _Settings > Content Access > MCP_. If the sign-in works but calls fail, check there.

## Add it to Claude Code

Amplitude gives one command per data region. "Use the Standard Server URL unless your Amplitude data
resides in the EU region." Ask the owner which region their organization is in.

```
claude mcp add -t http -s user Amplitude "https://mcp.amplitude.com/mcp"
```

```
claude mcp add -t http -s user Amplitude "https://mcp.eu.amplitude.com/mcp"
```

- **User scope**, as the vendor recommends: it "registers the MCP server globally for your user
  account, so it's available in every Claude Code session without per-project configuration". The
  account is personal and the URL says nothing about this repository; which Amplitude project this
  product uses is `analytics.project_id`, not the URL.
- **Local scope** (`-s local`) instead when this product uses another Amplitude organization than the
  owner's other products.

The command carries no secret: setup can run it after the owner's OK.

## Sign in

- **Method: OAuth 2.0 in the browser, by the owner.** Amplitude's steps: start Claude Code, run
  `/mcp`, "Follow the Amplitude OAuth authentication flow." From a terminal, `claude mcp login
  Amplitude` does the same. No API key to create.
- **What access it grants:** "The MCP server uses your existing Amplitude user permissions and access
  controls." It reads and writes: charts, dashboards, notebooks, experiments and flags, metrics,
  cohorts, taxonomy, guides and surveys can be created or edited through it.
- **Least privilege:** Amplitude gates the connector with two actions, "Use MCP (read)" and "Use MCP
  (write)": "Every role grants read access, and the Member, Manager, and Admin roles also grant write
  access." "These actions override admin status." So:
  - in Claude Code, never allow the whole server; the tools that create or change anything stay on
    ask;
  - an organization that wants the connector read-only for someone gives that person a role without
    "Use MCP (write)". Which built-in role that is: to verify with the organization's admin.

## Where the credential lives

The OAuth token is held by Claude Code, outside the repository. `claude mcp logout Amplitude` clears
it. Nothing goes in a file of the repository.

## Harmless read

Ask the connector which Amplitude projects the account can access (Amplitude's own check: "What
Amplitude projects can I access?"). Show the project names and IDs.

## Fill the config

- `analytics.provider`: `amplitude`.
- `analytics.project_id`: the ID of the project the owner picks from that list. When the organization
  has one project per environment, the production project is the one analytics are read from; confirm
  with the owner.
- **The data region is not a contract key.** It lives in the connector's URL. Setup says so in its
  report and never adds a key.

## Traps

- The region must match where the organization's data resides. If the sign-in fails or the project
  list comes back empty, check the region first; switching means removing the entry (on the owner's
  go) and adding the other command.
- Amplitude can also arrive through a plugin that bundles its own entry. Two Amplitude entries load
  two sets of tools: keep one, turn the other off for this project in `/mcp`.
- "The AI service you're using (for example, Claude or Gemini) processes your Amplitude data." An
  organization with rules on AI tools checks them before connecting.

## To verify

- Which built-in Amplitude role grants "Use MCP (read)" without "Use MCP (write)". The page read says
  every role grants read and names the roles that grant write; ask the organization's admin.

## Sources

Read on 2026-09-26.

- Amplitude, MCP server: https://amplitude.com/docs/amplitude-ai/amplitude-mcp (US and EU URLs, region
  rule, OAuth 2.0, permissions, "Use MCP (read)" and "Use MCP (write)", organization settings, the
  tools that write, the data processing note).
- Amplitude, connect MCP to Claude Code: https://amplitude.com/docs/amplitude-ai/amplitude-mcp/claude-code
  (both commands, `-s user` and why, the sign-in steps, the verification question).
- Amplitude pricing: https://amplitude.com/pricing (Free plan, MCP on every plan).
- Claude Code, MCP: https://code.claude.com/docs/en/mcp (`/mcp`, `claude mcp login` and `logout`).
