// PreToolUse guard: heavy SQL on the database must bound its own duration.
//
// WHY THIS EXISTS. Four regexp queries on a table of 58 rows, with a planner cost of about 1,800,
// took about 25 s each, sent from a session through the database connector during the hour the
// production database degraded. The written rule existed and every session loaded it; it did not
// stop them: a query that looks cheap in the plan is not cheap, and nothing enforced it. This hook
// is the enforcement (rule S15 of the Build pivot).
//
// WHAT IT DOES. Fires on any connector tool whose name ends in `execute_sql` (the matcher in
// hooks.json, checked again here), in every session, whatever skill is or is not invoked. A query
// that contains a heavy construct is DENIED unless it bounds its own duration with
// `set local statement_timeout` of 10 s or less. Everything else passes.
//
// Heavy constructs: any regexp_* function, the ~ / ~* / !~ operators, a `::text` cast of a
// jsonb-looking column (snapshot, payload, data, content, metadata, ...), generate_series,
// pg_sleep, cross joins.
//
// To run a legitimate heavy query, start it with
//   begin; set local statement_timeout = '5s'; ... ; rollback;
// The database then cancels it at 5 s, whatever it was doing.
//
// It reads nothing from the product: an unbounded query costs the same on every database.
//
// OBSERVABLE: every decision is appended to guard-heavy-sql.log under the plugin's data directory.
// A hook that silently does not run looks like protection; the log is the proof it is alive. It
// never records query text, which can carry customer data, and it rotates at 1 MB.

import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HOOK = 'guard-heavy-sql';
const MAX_TIMEOUT_MS = 10_000;
const SQL_TOOL = /execute_sql$/i;

const dataDir = () => process.env.CLAUDE_PLUGIN_DATA || join(tmpdir(), 'product-os');

function log(message) {
  try {
    const dir = dataDir();
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${HOOK}.log`);
    try { if (statSync(file).size > 1_000_000) renameSync(file, `${file}.1`); } catch { /* no log yet */ }
    appendFileSync(file, `${new Date().toISOString()} ${message}\n`);
  } catch { /* logging is best effort and must never block a tool */ }
}

async function readInput() {
  if (process.stdin.isTTY) return {};
  let raw = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) raw += chunk;
  const parsed = JSON.parse(raw.replace(/^﻿/, '') || '{}');
  return parsed && typeof parsed === 'object' ? parsed : {};
}

const HEAVY = [
  [/\bregexp_[a-z_]+\s*\(/i, 'regexp_* function'],
  [/\bregexp_split_to_table\b/i, 'regexp_split_to_table'],
  [/\b(?:snapshot|payload|data|content|metadata|body|raw|document|result|response)\s*::\s*text\b/i, '::text cast of a jsonb-looking column'],
  [/\bto_jsonb\s*\([^)]*\)\s*::\s*text\b/i, 'to_jsonb(...)::text'],
  [/\bgenerate_series\s*\(/i, 'generate_series'],
  [/\bpg_sleep\s*\(/i, 'pg_sleep'],
  [/\bcross\s+join\b/i, 'cross join'],
  [/\s(?:!~|~\*?)\s/, 'regex operator (~, ~*, !~)'],
];

// `set [local] statement_timeout = '5s'` (or 5000, '5000ms', '2min'...) in milliseconds.
function toMs(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return Infinity;
  const u = String(unit ?? 'ms').toLowerCase();
  if (u === 's' || u === 'sec') return n * 1000;
  if (u === 'min') return n * 60_000;
  if (u === 'h') return n * 3_600_000;
  return n; // Postgres reads a bare number as ms
}

async function main() {
  const input = await readInput();
  const tool = String(input.tool_name ?? '');
  if (!SQL_TOOL.test(tool)) return;

  const query = String(input.tool_input?.query ?? input.tool_input?.sql ?? '');
  if (!query) return;

  // Strip comments and string literals so a word inside a comment or a value does not count.
  const code = query
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ');
  const bare = code.replace(/'(?:[^']|'')*'/g, "''");

  const hits = HEAVY.filter(([re]) => re.test(bare)).map(([, name]) => name);

  let timeoutMs = Infinity;
  const m = /set\s+(?:local\s+)?statement_timeout\s*(?:=|to)\s*'?\s*(\d+(?:\.\d+)?)\s*(ms|s|sec|min|h)?\s*'?/i.exec(code);
  if (m) timeoutMs = toMs(m[1], m[2]);

  const bounded = timeoutMs <= MAX_TIMEOUT_MS;
  const denied = hits.length > 0 && !bounded;
  log(`tool=${tool} heavy=[${hits.join(', ')}] timeoutMs=${Number.isFinite(timeoutMs) ? timeoutMs : 'none'} decision=${denied ? 'DENY' : 'allow'} len=${query.length}`);

  if (!denied) return;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: [
        'HEAVY SQL GUARD: this query contains ' + hits.join(', ') + ' and does not bound its own duration.',
        'Four regexp queries on a table of 58 rows (planner cost about 1,800) once ran 25 s each on a production database while its API degraded. A cheap plan proves nothing.',
        'Run it inside a transaction that starts with a short statement timeout (10 s at most), for example:',
        "  begin; set local statement_timeout = '5s'; <your query>; rollback;",
        'The database then cancels the query at 5 s. A heavier analysis belongs on a local export (a file), not on the production database.',
      ].join('\n'),
    },
  }));
}

// A parse error or a crash does nothing: never block a query because the guard failed.
try { await main(); } catch (err) { log(`crash: ${err?.stack ?? err}`); }
process.exitCode = 0;
