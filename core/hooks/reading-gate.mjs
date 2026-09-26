// Reading gate: a gated skill may not run a shell or change a file before it has
// read the memory the product config requires for it.
//
// WHY THIS EXISTS. The rule "a skill unfolds before it acts" once lived in three
// places at the same time: in the skill itself, marked non-negotiable; in a memory
// note written after the first incident; and in an advisory hook that injected a
// reminder whenever the skill was invoked. The reminder fired, it was read, and the
// skill was still skipped: skill invoked, one handoff file read, straight to a shell
// command, zero memory files opened.
//
// Invoking a skill LOOKS like executing it. Its text lands in context, nothing has to
// be produced, and the turn moves on. Neither the model nor the person watching gets
// a signal between "skill loaded" and "skill applied". Advisory text cannot close that
// gap, because advisory text is the very thing being skipped.
//
// So this hook does not say anything new. It checks. Once a gated skill is invoked,
// shell and mutation tools are denied until the files the config requires for that
// skill have actually been read. Read, Grep and Glob stay open, so the only way
// through the gate is to do the reading.
//
// What counts, and why:
// - The required set is `memory.always` plus the skill's `require`, as the config
//   names them. An earlier version counted "any two files under the memory
//   directory": the count could be met while the one file that mattered for the zone
//   stayed unread.
// - A bare name resolves under `memory.dir`; a `pivot:` name resolves under
//   `pivots.dir`, where the per-function pivot files and the product config live.
//   A read under either directory counts.
// - `min_reads` is a floor on distinct files read, required ones included, for a
//   skill whose zone is wider than the files it names.
// - A read counts in the product root AND in any other worktree of the same git
//   repository. The real work often happens in a worktree, whose memory can be newer
//   than the primary checkout's; an earlier version that only looked at one checkout
//   silently did nothing where the work was. A file is identified by its path
//   relative to the memory or pivots directory, so the same name matches in every
//   worktree. Git is asked only when a read path contains the memory or pivots
//   segment, and its answer is cached for the session.
// - Paths are normalised (slashes, drive letter and case on Windows, symlinks),
//   because the same file reaches this hook as C:\x, c:/x or /c/x depending on the
//   shell.
// - Reads are appended to a per-session log, never read-modify-written: parallel Read
//   calls fire their hooks concurrently, and a lost update would deny a file that was
//   in fact read.
// - A required file that does not exist is dropped from the gate and named. It can
//   never be read, and Write is denied, so keeping it would lock the session until the
//   gate goes stale with no way to fix it from inside.
//
// One script, three registrations (hooks.json):
//   PreToolUse  Skill                                    -> arm the gate
//   PostToolUse Read                                     -> record a read
//   PreToolUse  Bash|PowerShell|Edit|Write|NotebookEdit  -> deny while unsatisfied
//
// Without a readable product config (schema_version 1) the hook does nothing: the OS
// is not set up in this repository, and guessing a memory layout would gate on files
// nobody wrote.

import { spawnSync } from 'node:child_process';
import {
  appendFileSync, mkdirSync, readFileSync, readdirSync, realpathSync,
  renameSync, statSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const HOOK = 'reading-gate';
const WIN = process.platform === 'win32';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DEFAULT_STALE_HOURS = 6;
const DEFAULT_MEMORY_DIR = '.claude/memory';
const DEFAULT_PIVOTS_DIR = '.claude/product';
const PIVOT_PREFIX = /^pivot:/i;
const GUARDED_TOOLS = new Set(['Bash', 'PowerShell', 'Edit', 'Write', 'NotebookEdit']);

// ---------------------------------------------------------------------------
// Shared prelude. Every core hook carries its own copy on purpose: the hooks are
// independent safety nets, and one broken shared module would disable all of them.

const dataDir = () => process.env.CLAUDE_PLUGIN_DATA || join(tmpdir(), 'product-os');

// Observable trace. A hook that silently fails to run is worse than no hook: it looks
// like protection. The log is the proof the hook is alive. It never records command
// text or file contents, and it rotates at 1 MB because it fires on every tool call.
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
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, '') || '{}');
  return parsed && typeof parsed === 'object' ? parsed : {};
}

// A path as the OS resolves it. On Windows a Git Bash path (/c/Users/x) becomes C:/Users/x.
function toNative(p, base) {
  let s = String(p);
  if (WIN) {
    const msys = /^\/([a-zA-Z])(?:[\\/](.*))?$/.exec(s);
    if (msys) s = `${msys[1]}:/${msys[2] ?? ''}`;
  }
  return base === undefined ? resolve(s) : resolve(base, s);
}

function productRoot(input) {
  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : '';
  return toNative(process.env.CLAUDE_PROJECT_DIR || cwd || process.cwd());
}

function loadConfig(root) {
  const file = join(root, '.claude', 'product', 'product.config.json');
  let raw;
  try { raw = readFileSync(file, 'utf8'); } catch (err) {
    return { reason: `no product config at ${file} (${err.code ?? err.message})` };
  }
  let config;
  try { config = JSON.parse(raw.replace(/^\uFEFF/, '')); } catch (err) {
    return { reason: `product config at ${file} is not valid JSON (${err.message})` };
  }
  if (!config || typeof config !== 'object' || config.schema_version !== 1) {
    return { reason: `product config at ${file} has schema_version ${JSON.stringify(config?.schema_version)}; this hook knows 1` };
  }
  return { config };
}

const emit = (hookSpecificOutput) => process.stdout.write(JSON.stringify({ hookSpecificOutput }));

// ---------------------------------------------------------------------------
// Paths

// The form two paths are compared in: forward slashes and lower case on Windows.
const comparable = (p) => (WIN ? p.replace(/\\/g, '/').toLowerCase() : p);

// The path as given and, when it exists, its real path: a symlinked checkout, a
// macOS /var -> /private/var temp dir or a Windows short name must not hide a read.
function pathForms(abs) {
  const forms = [comparable(abs)];
  try {
    const real = comparable(realpathSync.native(abs));
    if (!forms.includes(real)) forms.push(real);
  } catch { /* not on disk */ }
  return forms;
}

const realKey = (abs) => { try { return comparable(realpathSync.native(abs)); } catch { return comparable(abs); } };

// A directory setting relative to the root, with forward slashes and no ./ or trailing /.
const dirSetting = (value, fallback) => (typeof value === 'string' && value.trim() ? value.trim() : fallback)
  .replace(/\\/g, '/').replace(/^(\.\/)+/, '').replace(/\/+$/, '');

// The memory and pivots directories of one checkout, in comparable forms.
function scopeDirs(root, dirs, withRealPath = true) {
  return Object.entries(dirs).map(([scope, rel]) => {
    const abs = resolve(root, rel);
    return { scope, forms: withRealPath ? pathForms(abs) : [comparable(abs)] };
  });
}

// `memory:<rel>` or `pivot:<rel>` for a file under one of the directories, else null.
// When the directories are nested, the innermost one names the file, so a file has
// one key whichever way the config spells it.
function classify(absForms, dirs) {
  let best = null;
  for (const { scope, forms } of dirs) {
    for (const d of forms) {
      const base = d.endsWith('/') ? d : `${d}/`;
      for (const f of absForms) {
        if (f.startsWith(base) && f.length > base.length) {
          const rel = f.slice(base.length);
          if (!best || rel.length < best.rel.length) best = { scope, rel };
        }
      }
    }
  }
  return best && `${best.scope}:${best.rel}`;
}

// A name from the config: bare under the memory directory, `pivot:` under the pivots one.
function requiredEntry(name, absDirs) {
  const raw = String(name).trim();
  const pivot = PIVOT_PREFIX.test(raw);
  const scope = pivot ? absDirs.pivot : absDirs.memory;
  const rel = raw.replace(PIVOT_PREFIX, '').replace(/\\/g, '/').replace(/^(\.\/)+/, '');
  if (!rel) return null;
  const abs = resolve(scope, rel);
  const within = relative(scope, abs);
  if (!within || isAbsolute(within) || /^\.\.(?:[\\/]|$)/.test(within)) {
    return { name: raw, abs, problem: `outside the ${pivot ? 'pivots' : 'memory'} directory` };
  }
  const clean = within.replace(/\\/g, '/');
  return { name: pivot ? `pivot:${clean}` : clean, abs };
}

// Distinct files under the given directories, so a nested pivots directory is not
// counted twice.
function countFiles(dirs, limit = 5000) {
  const seen = new Set();
  const stack = [...dirs];
  while (stack.length && seen.size < limit) {
    let entries;
    const current = stack.pop();
    try { entries = readdirSync(current, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const p = join(current, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile()) seen.add(comparable(p));
    }
  }
  return seen.size;
}

const asList = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

// ---------------------------------------------------------------------------
// Per-session state

const stateDir = () => join(dataDir(), 'reading-gate');
const gateFile = (sid) => join(stateDir(), `${sid}.gate.json`);
const readsFile = (sid) => join(stateDir(), `${sid}.reads`);
const reposFile = (sid) => join(stateDir(), `${sid}.repos`);

function staleHours(config) {
  const h = config.reading_gate?.stale_hours;
  return typeof h === 'number' && h > 0 ? h : DEFAULT_STALE_HOURS;
}

function loadGate(sid, config, where) {
  let gate;
  try { gate = JSON.parse(readFileSync(gateFile(sid), 'utf8')); } catch { return null; }
  if (!gate || typeof gate.armedAt !== 'number' || typeof gate.armId !== 'string'
    || typeof gate.root !== 'string' || !gate.dirs || typeof gate.dirs !== 'object'
    || !Array.isArray(gate.rootDirs) || !Array.isArray(gate.required)) return null;
  if (Date.now() - gate.armedAt > staleHours(config) * HOUR_MS) {
    log(`${where} gate for /${gate.skill} is stale, ignored`);
    return null;
  }
  return gate;
}

function readsOf(sid, armId) {
  const keys = new Set();
  let raw = '';
  try { raw = readFileSync(readsFile(sid), 'utf8'); } catch { return keys; }
  for (const line of raw.split('\n')) {
    const tab = line.indexOf('\t');
    if (tab > 0 && line.slice(0, tab) === armId) keys.add(line.slice(tab + 1));
  }
  return keys;
}

// Housekeeping: drop state older than a day so the directory cannot grow forever.
function purgeOldState() {
  try {
    const dir = stateDir();
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      try { if (Date.now() - statSync(p).mtimeMs > DAY_MS) unlinkSync(p); } catch { /* raced */ }
    }
  } catch { /* nothing armed yet */ }
}

// ---------------------------------------------------------------------------
// Git worktrees

// Which repository a directory belongs to, and where it sits in it: the git dir that
// every worktree of the repository shares, and the directory's path below its
// worktree top ('' at the top). null when the directory is not in a git repository.
function repoInfo(dir) {
  try {
    const r = spawnSync('git', ['-C', dir, 'rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir'], {
      encoding: 'utf8', timeout: 3000, windowsHide: true,
    });
    if (r.status !== 0) return null;
    const [top, common] = r.stdout.split(/\r?\n/).map((l) => l.trim());
    if (!top || !common) return null;
    const topKey = realKey(toNative(top));
    const dirKey = realKey(toNative(dir));
    if (dirKey !== topKey && !dirKey.startsWith(`${topKey}/`)) return null;
    return { common: realKey(toNative(common)), prefix: dirKey === topKey ? '' : dirKey.slice(topKey.length + 1) };
  } catch { return null; }
}

// repoInfo, asked of git once per directory per armed gate. The cache is appended, like
// the reads, so parallel Read hooks cannot corrupt it.
function repoInfoCached(dir, sid, where) {
  const key = comparable(dir);
  let raw = '';
  try { raw = readFileSync(reposFile(sid), 'utf8'); } catch { /* empty cache */ }
  for (const line of raw.split('\n')) {
    const [k, common, prefix] = line.split('\t');
    if (k === key && common !== undefined) return common === '-' ? null : { common, prefix: prefix ?? '' };
  }
  log(`${where} git lookup for ${key}`);
  const info = repoInfo(dir);
  try {
    mkdirSync(stateDir(), { recursive: true });
    appendFileSync(reposFile(sid), `${key}\t${info ? info.common : '-'}\t${info ? info.prefix : ''}\n`);
  } catch { /* the lookup just runs again next time */ }
  return info;
}

// The key of a read made in another worktree of the product's repository, else null.
function worktreeKey(absForms, gate, sid, where) {
  const segments = Object.values(gate.dirs)
    .filter((rel) => rel && rel !== '.' && !isAbsolute(rel) && !/^\.\.(?:\/|$)/.test(rel))
    .map((rel) => `/${comparable(rel)}/`);
  // The checkout a read belongs to is whatever precedes the memory or pivots segment.
  const candidates = new Set();
  for (const f of absForms) {
    for (const seg of segments) {
      for (let i = f.indexOf(seg); i > 0; i = f.indexOf(seg, i + 1)) candidates.add(f.slice(0, i));
    }
  }
  if (!candidates.size) return null;
  const home = repoInfoCached(gate.root, sid, where);
  if (!home) return null;
  for (const candidate of candidates) {
    const info = repoInfoCached(candidate, sid, where);
    if (!info || info.common !== home.common || info.prefix !== home.prefix) continue;
    const key = classify(absForms, scopeDirs(candidate, gate.dirs, false));
    if (key) return key;
  }
  return null;
}

const bullet = (r) => `  - ${r.name}  (${r.abs})`;

// ---------------------------------------------------------------------------
// 1. Arm on a gated skill

function arm({ input, config, root, sid, where }) {
  const ti = input.tool_input ?? {};
  const invoked = String(ti.skill ?? ti.name ?? ti.skill_name ?? '').trim().toLowerCase();

  const table = new Map();
  const skills = config.reading_gate?.skills;
  if (skills && typeof skills === 'object') {
    for (const [k, v] of Object.entries(skills)) {
      table.set(k.trim().toLowerCase(), v && typeof v === 'object' ? v : {});
    }
  }
  // Exact name first, then the name behind a plugin prefix (`plugin:skill`).
  let skill = invoked;
  if (!table.has(skill) && skill.includes(':')) skill = skill.slice(skill.lastIndexOf(':') + 1);
  if (!invoked || !table.has(skill)) {
    log(`${where} skill="${invoked}" not gated`);
    return;
  }
  const rule = table.get(skill);

  const dirs = {
    memory: dirSetting(config.memory?.dir, DEFAULT_MEMORY_DIR),
    pivot: dirSetting(config.pivots?.dir, DEFAULT_PIVOTS_DIR),
  };
  const absDirs = { memory: resolve(root, dirs.memory), pivot: resolve(root, dirs.pivot) };
  const rootDirs = scopeDirs(root, dirs);
  const dirsLabel = `${absDirs.memory} or ${absDirs.pivot}`;

  const required = [];
  const dropped = [];
  const seen = new Set();
  for (const name of [...asList(config.memory?.always), ...asList(rule.require)]) {
    const entry = requiredEntry(name, absDirs);
    if (!entry) continue;
    const key = entry.problem ? null : classify(pathForms(entry.abs), rootDirs);
    const seenKey = key ?? comparable(entry.abs);
    if (seen.has(seenKey)) continue;
    seen.add(seenKey);
    if (entry.problem) { dropped.push(entry); continue; }
    let isFile = false;
    try { isFile = statSync(entry.abs).isFile(); } catch { /* missing */ }
    if (!isFile || !key) { dropped.push({ ...entry, problem: 'missing on disk' }); continue; }
    required.push({ name: entry.name, abs: entry.abs, key });
  }

  const explicit = rule.min_reads;
  let minReads = Math.max(1, Number.isInteger(explicit) && explicit > 0 ? explicit : required.length);
  const available = countFiles([absDirs.memory, absDirs.pivot]);
  let capNote = '';
  if (minReads > available) {
    capNote = `min_reads ${minReads} is more than the ${available} files present under ${dirsLabel}; capped at ${available}.`;
    minReads = available;
  }

  const droppedLines = dropped.length
    ? ['Declared in .claude/product/product.config.json but not enforced, fix the config or create the file:',
      ...dropped.map((d) => `  - ${d.name}  (${d.problem})`)]
    : [];

  if (minReads === 0) {
    log(`${where} /${skill} NOT armed: no file under ${dirsLabel}`);
    emit({
      hookEventName: 'PreToolUse',
      additionalContext: [
        `READING GATE for /${invoked}: not armed, because there is no file to read under ${dirsLabel}.`,
        'Fill the memory directory the product config declares before relying on this skill.',
        ...droppedLines,
      ].join('\n'),
    });
    return;
  }

  const gate = {
    skill: invoked,
    armId: randomUUID(),
    armedAt: Date.now(),
    root,
    dirs,
    rootDirs,
    dirsLabel,
    required,
    minReads,
  };
  mkdirSync(stateDir(), { recursive: true });
  for (const f of [readsFile(sid), reposFile(sid)]) { try { unlinkSync(f); } catch { /* first arming */ } }
  writeFileSync(gateFile(sid), JSON.stringify(gate));
  log(`${where} ARMED /${invoked} required=${required.length} min_reads=${minReads} dropped=${dropped.length}`);

  const index = typeof config.memory?.index === 'string' && config.memory.index
    ? join(absDirs.memory, config.memory.index) : null;
  emit({
    hookEventName: 'PreToolUse',
    additionalContext: [
      `READING GATE ARMED for /${invoked}.`,
      required.length
        ? 'Bash, PowerShell, Edit, Write and NotebookEdit are denied until you have read these files:'
        : 'Bash, PowerShell, Edit, Write and NotebookEdit are denied until you have read memory files.',
      ...required.map(bullet),
      `In total, read at least ${minReads} distinct files under ${dirsLabel}${required.length ? ', these included' : ''}.`,
      ...(minReads > required.length && index ? [`The index ${index} says which files this scope needs.`] : []),
      'If you work in another git worktree of this repository, read them from that worktree instead: the two can diverge, and a read there counts.',
      'Read, Grep and Glob stay available. Read what the skill requires for this scope, not a token sample.',
      'Your first output must be the reading contract: scope detected -> memory files the scope requires -> each one ticked.',
      ...droppedLines,
      ...(capNote ? [capNote] : []),
    ].join('\n'),
  });
}

// ---------------------------------------------------------------------------
// 2. Record a read under the memory or pivots directory, in any worktree

function record({ input, config, root, sid, where }) {
  const gate = loadGate(sid, config, where);
  if (!gate) { log(`${where} no armed gate, read not recorded`); return; }
  const fp = input.tool_input?.file_path;
  if (typeof fp !== 'string' || !fp) return;
  const base = typeof input.cwd === 'string' && input.cwd ? toNative(input.cwd) : root;
  const absForms = pathForms(toNative(fp, base));
  const key = classify(absForms, gate.rootDirs) ?? worktreeKey(absForms, gate, sid, where);
  if (!key) { log(`${where} read outside ${gate.dirsLabel} and its worktrees, not counted`); return; }
  mkdirSync(stateDir(), { recursive: true });
  appendFileSync(readsFile(sid), `${gate.armId}\t${key}\n`);
  log(`${where} recorded ${key} for /${gate.skill}`);
}

// ---------------------------------------------------------------------------
// 3. Deny while the gate is unsatisfied

function enforce({ config, sid, where }) {
  const gate = loadGate(sid, config, where);
  if (!gate) { log(`${where} allowed: no armed gate`); return; }
  const reads = readsOf(sid, gate.armId);
  const missing = gate.required.filter((r) => !reads.has(r.key));
  const remaining = Math.max(gate.minReads - reads.size, missing.length);
  if (remaining <= 0) { log(`${where} allowed: gate for /${gate.skill} satisfied`); return; }

  log(`${where} DENIED: /${gate.skill} unread_required=${missing.length} reads=${reads.size}/${gate.minReads}`);
  emit({
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: [
      `READING GATE: /${gate.skill} was invoked and has not read the memory it requires yet.`,
      ...(missing.length
        ? ['Required files not read yet (from this checkout or any worktree of the same repository):', ...missing.map(bullet)]
        : [`Every required file is read; read ${remaining} more under ${gate.dirsLabel} that this scope needs.`]),
      `Distinct files read: ${reads.size} of at least ${gate.minReads}. Reads remaining: ${remaining}.`,
      'Execute the skill before acting on it: do the reading, then retry.',
      'Read, Grep and Glob are not blocked. The gate clears itself as soon as the reading is done.',
    ].join('\n'),
  });
}

// ---------------------------------------------------------------------------

async function main() {
  const input = await readInput();
  const event = String(input.hook_event_name ?? '');
  const tool = String(input.tool_name ?? '');
  const sid = String(input.session_id ?? '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 128) || 'nosession';
  const where = `session=${sid} event=${event} tool=${tool}`;

  const root = productRoot(input);
  const { config, reason } = loadConfig(root);
  if (!config) { log(`${where} no-op: ${reason}`); return; }
  purgeOldState();

  const ctx = { input, config, root, sid, where };
  if (event === 'PreToolUse' && tool === 'Skill') arm(ctx);
  else if (event === 'PostToolUse' && tool === 'Read') record(ctx);
  else if (event === 'PreToolUse' && GUARDED_TOOLS.has(tool)) enforce(ctx);
  else log(`${where} ignored: not a gate event`);
}

// A crash must never block a tool: log it and exit 0.
try { await main(); } catch (err) { log(`crash: ${err?.stack ?? err}`); }
process.exitCode = 0;
