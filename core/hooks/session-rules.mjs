// Session rules: put the OS's cross-cutting rules in context at the start of every
// session, whatever the product's own CLAUDE.md says.
//
// WHY THIS EXISTS. The OS's rules live in this plugin's `rules/` folder, and nothing
// loads a folder: Claude Code loads CLAUDE.md, skill descriptions, agents and hooks.
// The only bridge was the CLAUDE.md template, and `setup` never overwrites an existing
// CLAUDE.md. Every real product has one. Measured on a product with its own CLAUDE.md:
// a session told "a user reports a bug, I can't fix it now" wrote the bug into the
// notes file the product's CLAUDE.md prescribed. The fix-backlog skill was listed and
// never fired, and the rule that should have fired it was not in context at all. A
// skill description alone did not carry it: that is what failed.
//
// So this hook injects a short digest once per session (new, cleared, compacted), built
// from the product config: where a deferred bug goes, who pushes, where memory is read,
// and where the full rules are. It is short on purpose: a rule repeated at every tool
// call becomes noise, and noise is skipped.
//
// Precedence. The digest settles only what the product config settles (a configured fix
// backlog, `git.push_deploys`, `memory.dir`). Where the product's CLAUDE.md says
// otherwise on one of those subjects, the config wins, because it is the more specific
// and more recent declaration of the same owner, and the session names the conflict
// once. An exception the owner chose is recorded in CLAUDE.md under a "Product OS"
// heading (the `setup` skill writes it), and that record wins. The owner's word in the
// conversation wins over everything.
//
// Without a product config: if this repository enabled the core plugin in its own
// settings, one line says the OS is installed but not set up and names `setup`.
// Otherwise nothing: a plugin installed for the user reaches every repository, and a
// repository that did not adopt the OS gets no text from it.

import {
  appendFileSync, mkdirSync, readFileSync, renameSync, statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const HOOK = 'session-rules';
const WIN = process.platform === 'win32';
const DEFAULT_MEMORY_DIR = '.claude/memory';
const DEFAULT_MEMORY_INDEX = 'MEMORY.md';
const DEFAULT_PIVOTS_DIR = '.claude/product';
const CORE_PLUGIN = 'product-os-core';

// ---------------------------------------------------------------------------
// Shared prelude. Every core hook carries its own copy on purpose: the hooks are
// independent safety nets, and one broken shared module would disable all of them.

const dataDir = () => process.env.CLAUDE_PLUGIN_DATA || join(tmpdir(), 'product-os');

function log(message) {
  try {
    const dir = dataDir();
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${HOOK}.log`);
    try { if (statSync(file).size > 1_000_000) renameSync(file, `${file}.1`); } catch { /* no log yet */ }
    appendFileSync(file, `${new Date().toISOString()} ${message}\n`);
  } catch { /* logging is best effort and must never block a session */ }
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

function productRoot(input) {
  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : '';
  return toNative(process.env.CLAUDE_PROJECT_DIR || cwd || process.cwd());
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { return null; }
}

function loadConfig(root) {
  const file = join(root, '.claude', 'product', 'product.config.json');
  const config = readJson(file);
  if (!config || typeof config !== 'object') return { reason: `no readable product config at ${file}` };
  if (config.schema_version !== 1) {
    return { reason: `product config at ${file} has schema_version ${JSON.stringify(config.schema_version)}; this hook knows 1` };
  }
  return { config };
}

// ---------------------------------------------------------------------------

const text = (v, fallback) => (typeof v === 'string' && v.trim() ? v.trim() : fallback);

// The repository adopted the core when its own settings enable it.
function enabledInRepo(root) {
  for (const name of ['settings.json', 'settings.local.json']) {
    const settings = readJson(join(root, '.claude', name));
    const plugins = settings?.enabledPlugins;
    if (plugins && typeof plugins === 'object'
      && Object.entries(plugins).some(([id, on]) => on === true && id.split('@')[0] === CORE_PLUGIN)) {
      return true;
    }
  }
  return false;
}

function rulesDir() {
  const root = process.env.CLAUDE_PLUGIN_ROOT;
  return root ? join(toNative(root), 'rules') : null;
}

function digest(config) {
  const name = text(config.product?.name, 'this product');
  const support = config.modules?.support === true;
  const backlog = text(config.databases?.fix_backlog, '');
  const main = text(config.git?.main_branch, 'main');
  const pushDeploys = config.git?.push_deploys !== false;
  const memoryDir = text(config.memory?.dir, DEFAULT_MEMORY_DIR);
  const memoryIndex = text(config.memory?.index, DEFAULT_MEMORY_INDEX);
  const pivotsDir = text(config.pivots?.dir, DEFAULT_PIVOTS_DIR);
  const rules = rulesDir();

  let bug;
  if (support && backlog) {
    bug = 'A bug you will not fix in this session is filed in the fix backlog with the `fix-backlog` skill '
      + '(`databases.fix_backlog`), now, with what is needed to pick it up cold. Never left in the '
      + 'conversation, a todo or a notes file.';
  } else if (support) {
    bug = 'A bug you will not fix in this session goes to the fix backlog. Its base is not configured yet '
      + '(`databases.fix_backlog` is empty): say so and offer the `fix-backlog` skill to create it. Never '
      + 'leave the bug only in the conversation.';
  } else {
    bug = 'A bug you will not fix in this session is written down where the next session will find it '
      + '(a handoff, or the backlog this repository\'s CLAUDE.md names), never left only in the '
      + 'conversation. No fix backlog module is installed here (`modules.support` is not true).';
  }

  const push = pushDeploys
    ? `A push to \`${main}\` ships to production: push only on the owner's explicit go, for that push. Commit freely, by named files.`
    : 'Push only when the owner asks. Commit freely, by named files.';

  const lines = [
    `PRODUCT OS RULES for ${name}. They apply to all work in this repository, together with its CLAUDE.md.`,
    '',
    `1. Bugs. ${bug}`,
    `2. Push. ${push}`,
    `3. Memory first. Before proposing or asserting how something works, read \`${memoryDir}/${memoryIndex}\` and the files `
      + '`routing.zones` lists for the zone you touch (product config, `' + `${pivotsDir}/product.config.json` + '`). '
      + 'The code confirms what memory says.',
    '4. Where things stand. Run the `orient` skill at the start of the work, never recall it.',
    rules
      ? `5. The full rules, cited by number in the OS skills: \`${join(rules, 'collaboration.md')}\` and \`${join(rules, 'principles.md')}\`.`
      : '5. The full rules are in the `rules/` folder of the product-os-core plugin.',
    '',
    'If this repository\'s CLAUDE.md says otherwise on bugs, pushes or memory, follow the rule above for that '
      + 'subject and tell the owner the conflict once, in one sentence, suggesting the `setup` skill to reconcile '
      + 'it. Two exceptions: a choice the owner recorded under a "Product OS" heading in CLAUDE.md wins, and '
      + 'the owner\'s word in this conversation wins over everything.',
  ];
  return lines.join('\n');
}

const SETUP_NUDGE = 'PRODUCT OS: product-os-core is enabled in this repository but it is not set up yet '
  + '(no `.claude/product/product.config.json`). Before work the OS covers (bugs, pushes, memory, '
  + 'connectors), run the `setup` skill, or tell the owner it has not been run.';

async function main() {
  let input = {};
  try { input = await readInput(); } catch (err) { log(`unreadable input (${err.message}); no-op`); return; }

  const source = typeof input.source === 'string' ? input.source : '';
  if (source === 'resume' || source === 'fork') {
    log(`source=${source}: the conversation already carries the rules; no-op`);
    return;
  }

  const root = productRoot(input);
  const { config, reason } = loadConfig(root);
  let context = '';
  if (config) {
    context = digest(config);
  } else if (enabledInRepo(root)) {
    context = SETUP_NUDGE;
    log(`${reason}; core enabled in the repository: setup nudge`);
  } else {
    log(`${reason}; core not enabled in the repository: no-op`);
    return;
  }

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
  }));
  log(`source=${source || '?'}: injected ${context.length} characters`);
}

try {
  await main();
} catch (err) {
  log(`unexpected error (${err.message}); no-op`);
}
process.exit(0);
