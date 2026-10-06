# Product OS

A product operating system for Claude Code: the method a Head of Product or a solo product builder
uses to run a SaaS from opportunity to shipment and support, organised by product function.

It is a marketplace of plugins. `pos-core` (Foundation + Domain) is always installed; each
product function is a plugin on top of it, switched on in the product's config.

## Start here

Four steps: the first in a terminal at the root of your product repository, the others in Claude
Code. Nothing else is needed before them: `/pos-setup` copies the templates and fills the config for you.

**1. Declare the marketplace and install the plugins.**

```
claude plugin marketplace add pascalpediroda-maker/product-os --scope project
claude plugin install pos-core@product-os --scope project
claude plugin install pos-support@product-os --scope project
```

- `marketplace add` comes first, once. `marketplace update` only refreshes a marketplace that was
  already added, and fails on a machine where it never was.
- The second line installs the core. The third is optional: it adds the Support & Success function
  (fix backlog, bug kill), and installs the core with it if it is not there yet.
- The marketplace is a GitHub repository. While it is private, your own git access to it is what
  lets the CLI fetch it.

**2. Open a new Claude Code session in the product repository.** Plugins load when a session
starts, not in a session already open.

**3. Run `/pos-setup`.** It may be listed as `/pos-core:pos-setup`. It finds the repository, copies the
templates it lacks without overwriting anything, connects the tools the product needs (Notion,
Supabase, Amplitude, Gmail) with least privilege and no credential in the repository, fills
`.claude/product/product.config.json` after showing you the diff, offers to create the fix backlog
when Support is installed, and says what is left.

**4. Run `/pos-guide`** in a new session. It shows which skill to start a session with depending on the
situation, what each skill calls, the agents grouped by trade, and where to begin for your product,
with one recommendation.

The skills and agents live in the plugins: your repository's `.claude/skills` and `.claude/agents`
stay empty, and that is expected. Every OS skill starts with `pos-`: type `/pos-guide`, `/pos-orient`,
and so on. The menu may show them with their plugin name in front (`/pos-core:pos-orient`); the short
form works as long as no other command has the same name, which is what the prefix ensures. `/agents`
lists the agents. The full map, installed and planned, is the
[catalog](core/skills/pos-guide/references/catalog.md).

**Naming rule for every plugin of this marketplace:** the plugin is `pos-<function>`, each skill it
ships is `pos-<name>`.

Every session then starts with `/pos-orient`: it re-reads the config, the memory and git, and says where
things stand.

## Which scope

| Scope | Written to | Use it for |
|---|---|---|
| `project` | the product's `.claude/settings.json`, committed | a product that adopts the OS: it follows the repository to your other machines and to your team |
| `user` | your own Claude Code settings | trying the OS on a repository without changing its files. An install at project scope leaves `"enabledPlugins": {}` in the committed settings after `uninstall` |
| `local` | the product's `.claude/settings.local.json`, not committed | the OS on one machine only |

## Updating

```
claude plugin marketplace update product-os
claude plugin update pos-core@product-os --scope project
claude plugin update pos-support@product-os --scope project
```

Then start a new session: an update applies at the next start. Use the scope you installed with.

## The plugins

| Plugin | Function | What it carries |
|---|---|---|
| `pos-core` | Foundation + Domain, always installed | product config and routing table, memory templates, the reading gate, guards on destructive commands, collaboration rules and principles, `pos-setup`, `pos-guide`, `pos-tool-conventions`, `pos-orient`, `pos-handoff`, `pos-domain` and its four analysts |
| `pos-support` | Customer Support & Success (`modules.support`) | `pos-fix-backlog` (the base where every bug not fixed at once is filed), `pos-bug-kill` (empties it into a minor fix release and closes the loop with customers), the Support pivot |

Planned, each built the day a product needs it: Discovery, Design, Delivery, Assurance, Release &
Operations, Go-to-Market. A skill that needs a module that is not installed says so and continues; it
never invents what the module would have brought.

Each plugin's own README says what it guarantees and what to fill first: [`core/`](core/README.md),
[`support/`](support/README.md).

## In this repository

| Folder | What |
|---|---|
| `core/`, `support/` | the plugins |
| `.claude-plugin/marketplace.json` | the catalogue the CLI reads |
| `archive/` | sources kept for layers not built yet. Loaded by no plugin |

## License

MIT. See [LICENSE](LICENSE).
