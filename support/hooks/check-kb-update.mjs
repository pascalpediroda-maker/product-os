// PostToolUse(Bash|PowerShell): after a `git commit`, say when the files it changed may
// leave a help article, the copy the product's AI reads, or the help center's
// screenshots out of date.
//
// WHY THIS EXISTS. Help content drifts silently: a screen changes, the article that
// describes it and its screenshot do not, and the product's AI keeps answering from the
// old copy. Nobody notices until a user follows a help article that no longer matches the
// screen. The commit is the moment the change is known, so the reminder comes there.
//
// It only reminds: it never blocks a commit and never writes anything. The paths it
// watches belong to the product, so they are read from the Support pivot, section 9
// (Help center), in the fenced block whose info string is `json pos-help-paths`:
//
//   { "help_content": [{ "pattern": "<regex>", "label": "<what changed>" }],
//     "screenshots":  [{ "pattern": "<regex>", "label": "<which view>" }] }
//
// Each pattern is a regular expression matched against the paths the last commit changed,
// relative to the repository root, with forward slashes.
//
// Without a product config, with `modules.support` not true, without the pivot or the
// block, or with an empty block: it does nothing, and logs why.

import { execFileSync } from 'node:child_process';
import {
  appendFileSync, mkdirSync, readFileSync, renameSync, statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';

const HOOK = 'check-kb-update';
const WIN = process.platform === 'win32';
const DEFAULT_PIVOTS_DIR = '.claude/product';
const PIVOT = 'product_support_context.md';
const SEPARATION = 'PRODUCT-OS SEPARATION LINE';
const BLOCK = /```json[ \t]+pos-help-paths[^\n]*\n([\s\S]*?)```/;

// A `git commit`, optionally with `-C <path>` (sessions work across worktrees and are told
// to use `git -C`), anywhere in the command.
const COMMIT = /(?:^|[\s;&|(])git(?:\s+-C\s+("[^"]+"|'[^']+'|\S+))?\s+commit\b/;

// ---------------------------------------------------------------------------
// Shared prelude, the same as the core hooks': each hook carries its own copy, so one
// broken shared module never disables the others.

const dataDir = () => process.env.CLAUDE_PLUGIN_DATA || join(tmpdir(), 'product-os');

// Never records command text or file names, which can carry secrets or customer names.
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

function toNative(p) {
  let s = String(p);
  if (WIN) {
    const msys = /^\/([a-zA-Z])(?:[\\/](.*))?$/.exec(s);
    if (msys) s = `${msys[1]}:/${msys[2] ?? ''}`;
  }
  return resolve(s);
}

function readText(file) {
  try { return readFileSync(file, 'utf8').replace(/^﻿/, ''); } catch { return null; }
}

function readJson(file) {
  const text = readText(file);
  if (text === null) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// ---------------------------------------------------------------------------

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 8000,
  }).trim();
}

const unquote = (s) => s.replace(/^(["'])(.*)\1$/, '$2');

function commitDir(input, match) {
  const base = toNative(
    (typeof input.cwd === 'string' && input.cwd) || process.env.CLAUDE_PROJECT_DIR || process.cwd(),
  );
  if (!match[1]) return base;
  const dir = unquote(match[1]);
  return isAbsolute(dir) || /^\/[a-zA-Z](\/|$)/.test(dir) ? toNative(dir) : resolve(base, dir);
}

// The config of the repository the commit landed in, else of the project.
function loadConfig(roots) {
  for (const root of roots) {
    const config = readJson(join(root, '.claude', 'product', 'product.config.json'));
    if (config && typeof config === 'object') return { root, config };
  }
  return {};
}

function readPaths(pivotText) {
  const at = pivotText.indexOf(SEPARATION);
  const below = at >= 0 ? pivotText.slice(at) : pivotText;
  const m = BLOCK.exec(below);
  if (!m) return null;
  const parsed = JSON.parse(m[1]);
  const rules = (list) => (Array.isArray(list) ? list : [])
    .filter((r) => r && typeof r.pattern === 'string' && r.pattern)
    .map((r) => ({ re: new RegExp(r.pattern), label: typeof r.label === 'string' && r.label ? r.label : r.pattern }));
  return { help: rules(parsed.help_content), shots: rules(parsed.screenshots) };
}

function hits(rules, files) {
  const labels = [];
  for (const { re, label } of rules) {
    if (files.some((f) => re.test(f)) && !labels.includes(label)) labels.push(label);
  }
  return labels;
}

async function main() {
  const input = await readInput();
  const command = String(input.tool_input?.command ?? '');
  const match = COMMIT.exec(command);
  if (!match) { log('not a commit; no-op'); return; }

  const dir = commitDir(input, match);
  let top;
  let changed;
  try {
    top = toNative(git(['rev-parse', '--show-toplevel'], dir));
    changed = git(['diff', '--name-only', 'HEAD~1..HEAD'], top).split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    log('no last commit to read (not a repository, or a first commit); no-op');
    return;
  }
  if (changed.length === 0) { log('last commit changed no file; no-op'); return; }

  const project = process.env.CLAUDE_PROJECT_DIR ? toNative(process.env.CLAUDE_PROJECT_DIR) : null;
  const { root, config } = loadConfig([top, project].filter(Boolean));
  if (!config) { log('no readable product config; no-op'); return; }
  if (config.schema_version !== 1) { log(`schema_version ${JSON.stringify(config.schema_version)} unknown; no-op`); return; }
  if (config.modules?.support !== true) { log('modules.support is not true; no-op'); return; }

  const pivotsDir = typeof config.pivots?.dir === 'string' && config.pivots.dir.trim() ? config.pivots.dir.trim() : DEFAULT_PIVOTS_DIR;
  const pivotText = readText(join(root, pivotsDir, PIVOT));
  if (pivotText === null) { log('no Support pivot; no-op'); return; }

  let paths;
  try { paths = readPaths(pivotText); } catch (err) { log(`help paths block unreadable (${err.message}); no-op`); return; }
  if (!paths) { log('no pos-help-paths block in the Support pivot; no-op'); return; }
  if (paths.help.length === 0 && paths.shots.length === 0) { log('help paths block is empty; no-op'); return; }

  const help = hits(paths.help, changed);
  const shots = hits(paths.shots, changed);
  if (help.length === 0 && shots.length === 0) { log(`${changed.length} files, none watched; no-op`); return; }

  const lines = [];
  if (help.length) {
    lines.push(
      `HELP CONTENT UPDATE SUGGESTED: this commit changed ${help.join(', ')}.`,
      'Consider updating, with the `pos-kb-article` skill:',
      '  1. the help center article that describes it (a how-to or a feature description that changed);',
      '  2. the copy the product\'s AI reads, then re-ingest it (Support pivot, section 9).',
    );
  }
  if (shots.length) {
    if (lines.length) lines.push('');
    lines.push(
      `HELP CENTER SCREENSHOTS may be stale: this commit touched ${shots.join(', ')}.`,
      'Re-run the capture and upload commands of Support pivot section 9, and look at each image before it replaces the old one.',
    );
  }
  lines.push('', `Changed files: ${changed.join(' ')}`);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: lines.join('\n') },
  }));
  log(`reminder: ${help.length} help labels, ${shots.length} screenshot labels`);
}

// A crash does nothing: a reminder must never get in the way of a commit.
try { await main(); } catch (err) { log(`crash: ${err?.message ?? err}`); }
process.exitCode = 0;
