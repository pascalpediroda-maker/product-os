// PreToolUse guard: destructive git commands wait for the user's explicit approval,
// one command at a time.
//
// WHY THIS EXISTS. A session once deleted eight git worktrees, one of them in active
// use, because they looked "merged and clean", and it asked nobody. A worktree is an
// active workspace, not a disposable cache. The same holds for a branch, for the
// working tree behind `reset --hard`, for the untracked files behind `clean -f` and
// for the remote history behind a force or delete push: none of it can be recovered
// from inside the session once it is gone.
//
// The decision is "ask", not "deny": it blocks by default, even under a matching
// allow rule, and still lets the user approve the rare legitimate case.
//
// These rules protect every repository, with or without a product config: losing a
// worktree costs the same whether the OS is set up there or not.
//
// The product config only refines. When a config exists and `git.push_deploys` is
// true (a missing key counts as true), a push to the main branch ships to production,
// so it too waits for an explicit go. The main branch is `git.main_branch`; when the
// config does not name it, it is the remote's default branch as git knows it
// (origin/HEAD), and `main` when git cannot say. A push that names no branch goes
// wherever the current branch goes, so the current branch is asked of git too; when
// git cannot say, the push is treated as going to the main branch.
//
// How the command is read: split into shell segments (; && || | & and newlines,
// line continuations joined first), then token by token, for Bash and PowerShell
// alike. Git's global options are skipped, so `git -C <dir> worktree remove` is caught
// like `git worktree remove`. Flags count anywhere in the segment and case is
// ignored, as in the grep this replaces: over-matching costs one approval prompt,
// under-matching costs work nobody can get back.

import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, renameSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const HOOK = 'guard-destructive-git';
const WIN = process.platform === 'win32';
const FALLBACK_MAIN_BRANCH = 'main';

// ---------------------------------------------------------------------------
// Shared prelude. Every core hook carries its own copy on purpose: the hooks are
// independent safety nets, and one broken shared module would disable all of them.

const dataDir = () => process.env.CLAUDE_PLUGIN_DATA || join(tmpdir(), 'product-os');

// Observable trace. A hook that silently fails to run is worse than no hook: it looks
// like protection. The log is the proof the hook is alive. It never records command
// text, which can carry secrets, and it rotates at 1 MB.
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

// ---------------------------------------------------------------------------
// Asking git

function gitOut(dir, args) {
  try {
    const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', timeout: 3000, windowsHide: true });
    return { status: r.status, out: (r.stdout ?? '').trim() };
  } catch { return { status: null, out: '' }; }
}

// The branch checked out in dir: a name, '' when HEAD is detached, null when unknown.
function currentBranch(dir) {
  const { status, out } = gitOut(dir, ['symbolic-ref', '--quiet', '--short', 'HEAD']);
  if (status === 0) return out;
  if (status === 1) return '';
  return null;
}

// The remote's default branch (origin/HEAD) as git knows it in dir, else null.
function remoteDefaultBranch(dir) {
  const { status, out } = gitOut(dir, ['symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD']);
  const m = status === 0 ? /^refs\/remotes\/origin\/(.+)$/.exec(out) : null;
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Reading the command

// Git global options that take their value as the next token.
const GIT_VALUE_OPTIONS = new Set(['-c', '-C', '--git-dir', '--work-tree', '--namespace', '--super-prefix', '--config-env']);
// `git push` options that take their value as the next token.
const PUSH_VALUE_OPTIONS = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec']);
// Commands that change directory for the segments after them (Bash and PowerShell).
const CD_COMMANDS = new Set(['cd', 'chdir', 'pushd', 'set-location', 'sl']);

function segments(command) {
  return command
    .replace(/[`\\]\r?\n/g, ' ') // line continuations: PowerShell backtick, bash backslash
    .replace(/[\d*]?>&\d/g, ' ') // 2>&1, *>&1 are redirections, not separators
    .replace(/&>/g, '>') // bash &>file
    .split(/&&|\|\||[;&|\r\n]/);
}

// Whitespace-separated words, quoted parts kept whole, quotes removed.
const tokens = (segment) => (segment.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [])
  .map((t) => t.replace(/["']/g, ''));

// Redirections are not arguments: `git push > out.txt` names no branch.
function withoutRedirects(list) {
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const m = /^[\d*&]?(?:>>?|<)(.*)$/.exec(list[i]);
    if (!m) out.push(list[i]);
    else if (m[1] === '') i += 1; // the target is the next token
  }
  return out;
}

// `git`, `git.exe`, `/usr/bin/git`, `C:\...\git.exe`, `(git`, `$(git`.
function isGit(token) {
  const base = token.replace(/^[$({`]+/, '').split(/[\\/]/).pop();
  return /^git(?:\.exe)?$/i.test(base);
}

// A short-option cluster (`-fd`, `-xdf`) containing one of the given letters, any case.
const cluster = (t, letters) => /^-[a-z0-9]+$/i.test(t) && new RegExp(`[${letters}]`, 'i').test(t.slice(1));

const sameBranch = (a, b) => a.toLowerCase() === b.toLowerCase();

function pushTargetsMain(flags, refspecs, dir, main) {
  if (flags.some((f) => f === '--all' || f === '--branches' || f === '--mirror')) return true;
  const onMain = () => { const cur = currentBranch(dir); return cur === null || sameBranch(cur, main); };
  if (refspecs.length === 0) return flags.includes('--tags') ? false : onMain();
  return refspecs.some((spec) => {
    const s = spec.replace(/^\+/, '');
    const colon = s.indexOf(':');
    let dst = colon >= 0 ? s.slice(colon + 1) : s;
    if (!dst) dst = s.slice(0, colon);
    if (/^(?:head|@)$/i.test(dst)) return onMain();
    return sameBranch(dst.replace(/^refs\/heads\//i, ''), main);
  });
}

// The rules a single git invocation breaks, as { rule, main? }.
function rulesFor(sub, args, dir, git) {
  const hits = [];
  const lower = args.map((a) => a.toLowerCase());
  switch (sub) {
    case 'worktree':
      if (lower[0] === 'remove' || lower[0] === 'prune') hits.push({ rule: 'worktree' });
      break;
    case 'branch':
      if (lower.some((a) => a === '--delete' || a === '--force' || cluster(a, 'df'))) hits.push({ rule: 'branch' });
      break;
    case 'reset':
      if (lower.includes('--hard')) hits.push({ rule: 'reset' });
      break;
    case 'clean':
      if (lower.some((a) => a === '--force' || cluster(a, 'f'))) hits.push({ rule: 'clean' });
      break;
    case 'push': {
      const flags = [];
      const positional = [];
      for (let i = 0; i < args.length; i += 1) {
        const a = args[i];
        if (a.length > 1 && a.startsWith('-')) {
          flags.push(a.toLowerCase());
          if (PUSH_VALUE_OPTIONS.has(a)) i += 1;
        } else positional.push(a);
      }
      const refspecs = positional.slice(1); // the first positional is the remote
      if (flags.some((f) => f.startsWith('--force') || cluster(f, 'f')) || refspecs.some((r) => r.startsWith('+'))) {
        hits.push({ rule: 'push-force' });
      }
      if (flags.some((f) => f === '--delete' || cluster(f, 'd')) || refspecs.some((r) => r.startsWith(':'))) {
        hits.push({ rule: 'push-delete' });
      }
      if (git.pushDeploys) {
        const main = git.mainBranchFor(dir);
        if (pushTargetsMain(flags, refspecs, dir, main)) hits.push({ rule: 'push-main', main });
      }
      break;
    }
    default:
      break;
  }
  return hits;
}

function findRules(command, startDir, git) {
  const hits = new Map();
  let cwd = startDir;
  for (const segment of segments(command)) {
    const list = withoutRedirects(tokens(segment));
    if (!list.length) continue;
    if (CD_COMMANDS.has(list[0].toLowerCase())) {
      const target = list.slice(1).find((t) => !t.startsWith('-'));
      if (target) cwd = toNative(target, cwd);
      continue;
    }
    for (let i = 0; i < list.length; i += 1) {
      if (!isGit(list[i])) continue;
      let dir = cwd;
      let j = i + 1;
      while (j < list.length && list[j].startsWith('-')) {
        if (GIT_VALUE_OPTIONS.has(list[j])) {
          if (list[j] === '-C' && list[j + 1] !== undefined) dir = toNative(list[j + 1], dir);
          j += 2;
        } else j += 1;
      }
      const sub = (list[j] ?? '').toLowerCase();
      for (const hit of rulesFor(sub, list.slice(j + 1), dir, git)) if (!hits.has(hit.rule)) hits.set(hit.rule, hit);
    }
  }
  return [...hits.values()];
}

const REASONS = {
  worktree: () => 'Removing or pruning a git worktree. A worktree is an active workspace, not a disposable cache: "merged and clean" is not a licence to delete it. A past session removed eight worktrees, one of them in active use, on exactly that heuristic.',
  branch: () => 'Deleting or force-moving a branch. A merged branch can still be someone\'s work in progress.',
  reset: () => '`git reset --hard` throws away uncommitted work, with nothing to recover it from.',
  clean: () => '`git clean -f` deletes untracked files, which git never recorded and cannot restore.',
  'push-force': () => 'A force push rewrites remote history that other people, and deployments, build on.',
  'push-delete': () => 'Deleting a remote branch removes it for everyone who works from it.',
  'push-main': (hit) => `A push to ${hit.main} ships to production (git.push_deploys in the product config). It happens only on an explicit go for this push.`,
};

// ---------------------------------------------------------------------------

async function main() {
  const input = await readInput();
  const tool = String(input.tool_name ?? '');
  const where = `event=${input.hook_event_name ?? ''} tool=${tool}`;

  const root = productRoot(input);
  const { config, reason } = loadConfig(root);
  if (!config) log(`${where} no product config (${reason}): destructive rules only, no push-to-main rule`);

  const command = input.tool_input?.command;
  if (typeof command !== 'string' || !command.trim()) { log(`${where} no command`); return; }

  const configured = typeof config?.git?.main_branch === 'string' && config.git.main_branch.trim()
    ? config.git.main_branch.trim() : null;
  const mainByDir = new Map();
  const git = {
    pushDeploys: Boolean(config) && config.git?.push_deploys !== false,
    mainBranchFor(dir) {
      if (configured) return configured;
      if (!mainByDir.has(dir)) mainByDir.set(dir, remoteDefaultBranch(dir) ?? FALLBACK_MAIN_BRANCH);
      return mainByDir.get(dir);
    },
  };
  const startDir = typeof input.cwd === 'string' && input.cwd ? toNative(input.cwd) : root;
  const hits = findRules(command, startDir, git);
  if (!hits.length) { log(`${where} allowed`); return; }

  log(`${where} ASK rules=${hits.map((h) => h.rule).join(',')}`);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: [
        'GUARDRAIL: destructive git command.',
        ...hits.map((h) => REASONS[h.rule](h)),
        'Do not proceed without the user\'s explicit approval for this exact command.',
      ].join('\n'),
    },
  }));
}

// A crash must never block a tool: log it and exit 0.
try { await main(); } catch (err) { log(`crash: ${err?.stack ?? err}`); }
process.exitCode = 0;
