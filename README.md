# Product OS

A product operating system for Claude Code: the method a Head of Product or a solo product builder
uses to run a SaaS from opportunity to shipment and support, organised by product function.

It is a marketplace of plugins. `product-os-core` (Foundation + Domain) is always installed; each
product function is a plugin on top of it, switched on in the product's config.

## Start here

Four steps: the first in a terminal at the root of your product repository, the others in Claude
Code. Nothing else is needed before them: `/setup` copies the templates and fills the config for you.

**1. Declare the marketplace and install the plugins.**

```
claude plugin marketplace add pascalpediroda-maker/product-os --scope project
claude plugin install product-os-core@product-os --scope project
claude plugin install product-os-support@product-os --scope project
```

- `marketplace add` comes first, once. `marketplace update` only refreshes a marketplace that was
  already added, and fails on a machine where it never was.
- The second line installs the core. The third is optional: it adds the Support & Success function
  (fix backlog, bug kill), and installs the core with it if it is not there yet.
- The marketplace is a GitHub repository. While it is private, your own git access to it is what
  lets the CLI fetch it.

**2. Open a new Claude Code session in the product repository.** Plugins load when a session
starts, not in a session already open.

**3. Run `/setup`.** It may be listed as `/product-os-core:setup`. It finds the repository, copies the
templates it lacks without overwriting anything, connects the tools the product needs (Notion,
Supabase, Amplitude, Gmail) with least privilege and no credential in the repository, fills
`.claude/product/product.config.json` after showing you the diff, offers to create the fix backlog
when Support is installed, and says what is left.

**4. Run `/guide`** in a new session. It shows which skill to start a session with depending on the
situation, what each skill calls, the agents grouped by trade, and where to begin for your product,
with one recommendation.

The skills and agents live in the plugins: your repository's `.claude/skills` and `.claude/agents`
stay empty, and that is expected. Type `/` to see the skills (they may show with their plugin name in
front, `/product-os-core:orient`), and `/agents` to see the agents. The full map, installed and
planned, is the [catalog](core/skills/guide/references/catalog.md).

Every session then starts with `/orient`: it re-reads the config, the memory and git, and says where
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
claude plugin update product-os-core@product-os --scope project
claude plugin update product-os-support@product-os --scope project
```

Then start a new session: an update applies at the next start. Use the scope you installed with.

## The plugins

| Plugin | Function | What it carries |
|---|---|---|
| `product-os-core` | Foundation + Domain, always installed | product config and routing table, memory templates, the reading gate, guards on destructive commands, collaboration rules and principles, `setup`, `guide`, `tool-conventions`, `orient`, `handoff`, `domain-onboarding` and its four analysts |
| `product-os-support` | Customer Support & Success (`modules.support`) | `fix-backlog` (the base where every bug not fixed at once is filed), `bug-kill` (empties it into a minor fix release and closes the loop with customers), the Support pivot |

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
