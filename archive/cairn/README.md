# Sources kept from cairn

cairn was an earlier method plugin by the same author, MIT licensed, retired when the product OS
replaced it. These files were copied here, with their original paths, before cairn was deleted, because
the OS design keeps them for layers that are not built yet.

Nothing in this folder is loaded by any plugin: `archive/` is not listed in the marketplace. Each piece
is reworked into its layer when that layer is built, then removed from here.

| Piece | Goes to | What to rework |
|---|---|---|
| `core/hooks/post-impl.mjs` | Product Delivery, Build | the hook that defines a finished delivery (lint, types, commit scope, secrets, then the judgement questions). It reads its settings from `.cairn.json` (`postImpl.checks`, `codeGlobs`, `commitScope`); move them to `product.config.json` and add the invariant tests to its checks |
| `core/skills/debug/SKILL.md` and `core/evals/bug-report-goes-to-debug/`, `core/evals/debug-reproduces-first/` | Customer Support & Success, with Delivery | reproduce first, then fix the cause, then leave a test; merge with the support skill's RED, GREEN, REFACTOR procedure rather than keeping two |
| `core/skills/scope/SKILL.md` and `core/evals/scope-decides-instead-of-asking/` | Product Discovery, triage | sizing a request and deciding instead of asking; reconcile with the opportunity triage (TINY, MEDIUM, BIG) and the FO(E)CUSED lifecycle |
| `gtm/skills/positioning/SKILL.md` and `gtm/evals/positioning-refuses-unprovable-claims/` | Go-to-Market | the positioning template and its separation line between skeleton and product content; becomes the GTM pivot `product_marketing_context.md` |

The eval folders follow the `claude plugin eval` layout (`prompt.md` and `graders/`). They move with
their skill.
