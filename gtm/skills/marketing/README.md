# Marketing skills library, vendored in pos-gtm

**Source** : [github.com/coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), MIT.
**Cloned** : 2026-05-04, v1.x.
**Path** : `${CLAUDE_PLUGIN_ROOT}/skills/marketing/<skill-name>/SKILL.md` (inside the `pos-gtm` plugin)
**License** : `LICENSE` in this folder. The upstream LICENSE file was missing in the copy this library was vendored from; its MIT text was restored from the upstream repository github.com/coreyhaines31/marketingskills and is to verify there.

## ⚠ NOT auto-discovered

These skills are **intentionally nested** under `marketing/` so Claude Code does NOT auto-register them as top-level skills. They are a **knowledge base library** consumed by the GTM router (`pos-gtm`), not directly invokable as `/skill-name`.

Why : 40 marketing skills polluting the global namespace would clash with the product OS naming convention (`pos-<name>`, one entry point per need). Better to have one entry point (`pos-gtm`) that reads the right library SKILL.md inline based on context.

## Pivot dependency

Every library skill expects to read a `product-marketing-context.md` file (`.agents/product-marketing-context.md` or `.claude/product-marketing-context.md`). In the product OS, that file is the GTM pivot at `<pivots.dir>/product_gtm_context.md` (template: `templates/product_gtm_context.md` of `pos-gtm`). Always honor the GTM pivot: never auto-draft a new context at the library default path.

## Skills inventory (40)

### Core (read first)
- `product-marketing-context`: pivot scaffolding (we have our own, more complete version)

### Content & Copy
- `copywriting`, `copy-editing`, `cold-email`, `email-sequence`, `social-content`, `image`, `video`

### Conversion Optimization (CRO)
- `page-cro`, `signup-flow-cro`, `onboarding-cro`, `form-cro`, `popup-cro`, `paywall-upgrade-cro`

### SEO & Discovery
- `seo-audit`, `ai-seo`, `programmatic-seo`, `site-architecture`, `competitor-alternatives`, `schema-markup`, `aso-audit`, `directory-submissions`

### Paid & Distribution
- `paid-ads`, `ad-creative`

### Measurement
- `analytics-tracking`, `ab-test-setup`

### Retention & Growth Eng
- `churn-prevention`, `free-tool-strategy`, `referral-program`, `lead-magnets`

### Strategy & Monetization
- `marketing-ideas`, `marketing-psychology`, `launch-strategy`, `pricing-strategy`, `content-strategy`, `community-marketing`

### Sales & RevOps
- `revops`, `sales-enablement`, `customer-research`, `competitor-profiling`

## How `pos-gtm` should consume these

When `pos-gtm` (mode execute) routes to a library skill :

1. Read the GTM pivot at `<pivots.dir>/product_gtm_context.md`.
2. Read the relevant library SKILL.md at `${CLAUDE_PLUGIN_ROOT}/skills/marketing/<skill-name>/SKILL.md`.
3. Apply the library methodology BUT enforce the constraints the GTM pivot lists :
   - No client/institution names in public copy (collaboration rule 41)
   - Use the brand voice from pivot section 7
   - Use verbatims from pivot section 5
   - Respect the motion taxonomy from pivot section 13 (one motion per copy, never blended)
   - The moat narrative the pivot gives for the audience (section 4)
4. Save outputs in appropriate location :
   - Social posts → the posts base the pivot names (appendix "Canonical sources")
   - Email drafts → response to user
   - Pricing decisions → update pivot section 15
   - Customer research → the feedback base (`databases.feedback`)
   - GTM actions → the GTM actions base the pivot names (appendix "Canonical sources")

## Updates

To pull updates from upstream : re-clone and `cp -r skills/. <pos-gtm>/skills/marketing/`. Don't fork: keep skills upstream-clean. Product customisation lives in the GTM pivot and in `pos-gtm`.
