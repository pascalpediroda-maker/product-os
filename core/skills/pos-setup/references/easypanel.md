# Easypanel connector

Serves deployments: `deploy.provider`, `deploy.project`, `deploy.app_service`. It reads the server the
product runs on (builds, services, logs, machine load) and can restart or redeploy a service. Every
fact below was checked against Easypanel's documentation on 2026-10-07, or is marked as observed or
derived. A command that fails because the vendor changed it is re-verified on the vendor's page and
fixed here, with the new source and date. Never patched from memory.

How a session uses it once connected (before and after a push, following a build to green, what never
to call casually) is in the `pos-tool-conventions` Easypanel reference.

## Account and licence

- **Easypanel runs on the owner's own server** (a VPS, for example at Hetzner). Easypanel: "One license
  is a right to use Easypanel on one server (node, VM, or instance)."
- **The MCP server needs a paid licence.** The pricing page's comparison table lists API, MCP and CLI
  on Hobby, Growth and Business, not on Free. Hobby is described as "your one-person operation" ($14.9
  per server per month, $10.9 billed annually, read 2026-10-07). "If you cancel, Easypanel will
  continue to work on the free plan."
- **The version:** MCP arrived in 2.33.0: "Added MCP support. Connection instructions are available
  next to each user's API key." No setting turns it on.

## The key

1. In Easypanel, **Settings → Server → Users**, then **Generate API Key** for the user the AI client
   should act as.
2. **Connect → MCP** beside that user shows the connection details.

- **What it grants:** "An MCP connection acts as the user whose API key it contains." The key "can
  modify or delete resources that user is allowed to manage."
- **Least privilege:** the only lever Easypanel documents is the user: "If your license supports
  multiple users, create a dedicated user when you want to limit the projects available to an AI
  client." Multiple users need the Growth plan. On Hobby, the key carries the owner's own rights: say
  so.
- Whether a key expires, or can be made read-only, is not documented.
- **Revoking:** from the same screen. "Regenerating or revoking a user's API key immediately
  invalidates MCP clients configured with the previous key."

## Add it to Claude Code

Easypanel documents two forms: the key in a header, "prefer[red]" when the client supports headers,
or the key appended to the URL. **Use the header, never the key in the URL:** a URL is printed by
`claude mcp list` and ends up in transcripts.

**Default route: the key in an environment variable,** like the Supabase connector. The owner sets
`EASYPANEL_API_KEY` in their own environment (Windows: a user environment variable, or `setx`; macOS
and Linux: the shell profile), never in the repository and never in this conversation. Easypanel
itself says: "Prefer an encrypted secret or environment variable when the client supports one."

`.mcp.json` at the repository root (project scope):

```json
{
  "mcpServers": {
    "easypanel": {
      "type": "http",
      "url": "https://<the panel's domain>/api/mcp",
      "headers": {
        "Authorization": "Bearer ${EASYPANEL_API_KEY}"
      }
    }
  }
}
```

This is Easypanel's own client example ("Server URL: https://YOUR_SERVER_DOMAIN/api/mcp",
"Authorization: Bearer YOUR_API_KEY") written in Claude Code's `.mcp.json` form, with the key
replaced by Claude Code's variable expansion. The file holds the panel's address and a variable
name, no secret.

Equivalent command (derived: Claude Code's syntax applied to the documented URL and header; single
quotes keep the shell from expanding the variable):

```
claude mcp add --scope project --transport http easypanel "https://<the panel's domain>/api/mcp" --header 'Authorization: Bearer ${EASYPANEL_API_KEY}'
```

Read `.mcp.json` afterwards: it must hold `${EASYPANEL_API_KEY}`, never the key.

**Several products on one panel:** the owner may prefer one entry for all, at user scope
(`--scope user`). Whether Claude Code expands `${VAR}` in a user-scope entry is to verify; without
it, the key would sit in Claude Code's user config file, outside every repository. Say which, and let
the owner choose.

Then the restart of setup's Step 4: a server added during the session is not callable in it.

## Least privilege in Claude Code

The server has four tools: `search_procedures`, `execute_query`, `execute_mutation`,
`execute_destructive`. Easypanel: "Compatible clients can use the tool annotations to request
additional approval before calling `execute_destructive`."

- Allow without a prompt, if the owner wants: `search_procedures` and `execute_query` (reads).
- `execute_mutation` and `execute_destructive` always stay on ask. Never allow the whole server.

## Harmless read

`search_procedures` for "list actions", then `listActions` with `limit: 1` on the project and service
the owner names (the one a push to the main branch deploys). Show its status and commit message.

Never `listProjectsAndServices` or `inspectAppService` in setup: they return the services'
environment variables in clear (observed). Easypanel warns: "Assume procedure inputs and results may
contain credentials, environment variables, configuration, or executable content."

## Fill the config

- `deploy.provider`: `easypanel`.
- `deploy.project`, `deploy.app_service`: the project and service the owner named, confirmed by the
  harmless read.
- **The panel's address is not a contract key.** It lives in the connector's URL.

## Traps

- **A Free licence has no MCP.** If the server answers nothing, check the plan first.
- **A procedure is missing from search:** "Procedures that are not available in the installed
  Easypanel version, or that are intentionally disabled for MCP, do not appear in results." Search
  with a short action-and-resource query.
- **The key was regenerated:** every client with the old one stops at once; update the variable and
  restart.
- **The header format** must be exactly `Bearer <key>`. A browser session token does not work: it must
  be a generated user API key.
- **A third-party package** named `easypanel-mcp-server` exists on npm. It is not Easypanel's and is
  not this connector.
- **A key that reached a file, a log or the conversation** is revoked and regenerated: "revoke the API
  key immediately if it is exposed."

## Sources

Read on 2026-10-07.

- Easypanel, MCP: https://easypanel.io/docs/mcp (endpoint, Streamable HTTP, header and URL forms, the
  preference for the header, creating the key, Connect → MCP, acting as the user, dedicated user, the
  four tools, annotations, disabled procedures, revocation, the security warnings, the generic client
  example).
- Easypanel, CLI: https://easypanel.io/docs/cli (what a key can modify or delete).
- Easypanel changelog 2.33.0: https://easypanel.io/changelog/2-33-0 (MCP added).
- Easypanel pricing: https://easypanel.io/pricing (MCP on Hobby and above, multiple users on Growth,
  one licence per server, the Free plan after cancelling).
- Claude Code, MCP: https://code.claude.com/docs/en/mcp (project scope, `.mcp.json`, `${VAR}` expansion
  in `url` and `headers`, `--header`).
- Observed in use on a product deploying with Easypanel, September and October 2026: procedures that
  return environment variables in clear.
