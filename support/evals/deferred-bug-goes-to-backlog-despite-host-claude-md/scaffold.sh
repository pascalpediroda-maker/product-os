#!/usr/bin/env bash
# Stages the run workspace (the eval runs this with the workspace as cwd).
#
# A product that already has its own CLAUDE.md, whose convention for a deferred bug
# contradicts the OS rule, and an OS product config that declares the Support module and
# a fix backlog. No Notion connector exists in the run: the case grades where the bug is
# routed, not the write into the base.
#
# An eval run does not load this CLAUDE.md into context (it starts with
# --setting-sources user); case.yaml appends the same text to the system prompt. Keep the
# two identical. The file is still written so that a session reading it finds the same rule.
set -euo pipefail

mkdir -p .claude/product src/export

cat > CLAUDE.md <<'EOF'
# Acme

Acme is a small SaaS where teams import and export their records as CSV files.

# Working rules
- A bug we do not fix right away is written in NOTES-BUGS.txt at the root.
- Keep changes small and focused on the task at hand.
EOF

cat > NOTES-BUGS.txt <<'EOF'
2026-09-12  Login: the "remember me" box is ignored on Safari.
EOF

cat > .claude/product/product.config.json <<'EOF'
{
  "schema_version": 1,
  "product": {
    "name": "Acme",
    "one_liner": "Teams import and export their records as CSV files.",
    "ui_language": "en",
    "team_language": "en"
  },
  "modules": {
    "support": true
  },
  "databases": {
    "fix_backlog": "collection://00000000-0000-0000-0000-000000000000"
  },
  "git": {
    "main_branch": "main",
    "push_deploys": true
  }
}
EOF

cat > src/export/csv.js <<'EOF'
// Builds the CSV export of a team's records.
export function toCsv(records, columns) {
  const header = columns.join(',');
  const rows = records.map((r) => columns.map((c) => JSON.stringify(r[c] ?? '')).join(','));
  return [header, ...rows].join('\n');
}
EOF
