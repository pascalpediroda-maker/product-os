// Stop hook — the post-implementation gates, run instead of recited.
//
// WHY THIS EXISTS, AND WHY IT IS A HOOK.
//
// The checklist this replaces was a good one. It consolidated seven separate lessons
// into eight ordered gates, and it lived in a commands folder, reached only by a prose
// reference at step five of two workflows — that is, at the very end of a long task,
// exactly when context is fullest and instructions decay. It almost never fired, and
// nobody noticed, because a rule that stops firing produces silence, not an error.
//
// In the same repository, a small hook wired to a shell event fired every single time.
// The difference was not the quality of the rule. It was where the rule lived.
//
// So: an event, not a reference. And of the eight gates, the ones a script can check
// are checked here rather than asked for. Only three need judgement, and those are the
// only three still addressed to the model.
//
// WHY Stop AND NOT PostToolUse ON `git commit`.
// Committing is itself one of the gates. A hook that waits for the commit runs the
// checks after the thing they were supposed to gate.
//
// WHY THE FINGERPRINT.
// A hook that runs a type-checker at the end of every turn is a hook that gets
// switched off within a week. This one stays silent unless the working tree actually
// changed since it last spoke — so a turn spent reading, planning or answering costs
// nothing.
//
// CONFIGURATION — optional. `.cairn.json` at the repository root:
//
//   {
//     "postImpl": {
//       "run": true,                                  // false = remind only, run nothing
//       "timeoutMs": 90000,
//       "checks": { "lint": "npm run lint", "types": "npx tsc --noEmit" },
//       "codeGlobs": ["src/", "app/", "lib/"],        // what counts as "code changed"
//       "commitScope": ["src/", "public/"]            // what a commit is allowed to touch
//     }
//   }
//
// Without it, commands are inferred from package.json scripts. Nothing inferred, nothing
// run — the hook then only asks the three questions a script cannot answer.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const OUT = [];
const say = (s = '') => OUT.push(s);

/** Run a command, never throw. Returns { ok, out }. */
function run(cmd, args, opts = {}) {
  try {
    const out = execFileSync(cmd, args, {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: opts.timeoutMs ?? 15000, cwd: opts.cwd, shell: opts.shell ?? false,
    });
    return { ok: true, out: String(out) };
  } catch (e) {
    return { ok: false, out: String(e?.stdout ?? '') + String(e?.stderr ?? e?.message ?? '') };
  }
}

function gitRoot() {
  const r = run('git', ['rev-parse', '--show-toplevel']);
  return r.ok ? r.out.trim() : null;
}

const root = gitRoot();
if (!root) process.exit(0);           // not a git repository → nothing to gate

// ---------------------------------------------------------------- configuration
let cfg = {};
try {
  const p = join(root, '.cairn.json');
  if (existsSync(p)) cfg = JSON.parse(readFileSync(p, 'utf8'))?.postImpl ?? {};
} catch { /* a broken config must not break the turn */ }

const CODE = cfg.codeGlobs ?? ['src/', 'app/', 'lib/', 'packages/', 'server/', 'components/'];
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|rb|java|kt|swift|php|sql|css|scss)$/i;
const SCOPE = cfg.commitScope ?? null;

// ---------------------------------------------------------------- what changed
//
// `-uall` matters more than it looks. Plain `--porcelain` collapses an untracked
// directory into a single `?? core/` line instead of listing what is inside it — so a
// brand-new feature folder, which is exactly the case worth gating, would register as
// one path that matches no code pattern and the hook would stay silent.
const status = run('git', ['status', '--porcelain', '-uall'], { cwd: root });
if (!status.ok) process.exit(0);

const entries = status.out.split('\n').filter(Boolean).map((l) => ({
  staged: l[0] !== ' ' && l[0] !== '?',
  path: l.slice(3).trim().replace(/^"|"$/g, ''),
}));

const isCode = (p) => CODE_EXT.test(p) || CODE.some((d) => p.startsWith(d));
const changedCode = entries.filter((e) => isCode(e.path));

if (changedCode.length === 0) process.exit(0);   // nothing to gate → stay silent

// ---------------------------------------------------------------- debounce
// Fingerprint the working tree, not the clock: the same state never asks twice.
const head = run('git', ['rev-parse', 'HEAD'], { cwd: root }).out.trim();
const fingerprint = createHash('sha256')
  .update(head + '\n' + status.out).digest('hex').slice(0, 16);

const dataDir = process.env.CLAUDE_PLUGIN_DATA;
const stateFile = dataDir
  ? join(dataDir, 'post-impl-' + createHash('sha256').update(root).digest('hex').slice(0, 12) + '.json')
  : null;

if (stateFile) {
  try {
    if (existsSync(stateFile)) {
      const prev = JSON.parse(readFileSync(stateFile, 'utf8'));
      if (prev.fingerprint === fingerprint) process.exit(0);  // already spoken about this state
    }
  } catch { /* unreadable state → speak anyway, it is the safe direction */ }
}

// ---------------------------------------------------------------- gates a script can check
say('── post-implementation gates ' + '─'.repeat(44));
say('');
say(`Code changed: ${changedCode.length} file(s).`);
say(changedCode.slice(0, 12).map((e) => '  ' + e.path).join('\n')
  + (changedCode.length > 12 ? `\n  … and ${changedCode.length - 12} more` : ''));
say('');

// Gate — commit scope. A commit that sweeps the whole tree takes other sessions' work
// with it, and the history then lies about who found what.
if (SCOPE) {
  const stray = entries.filter((e) => e.staged && !SCOPE.some((d) => e.path.startsWith(d)));
  if (stray.length) {
    say('✗ COMMIT SCOPE — staged files outside the declared scope:');
    stray.slice(0, 8).forEach((e) => say('    ' + e.path));
    say('    Stage named paths, never `git add -A` or `git add .`.');
  } else {
    say('✓ commit scope — staged files are all inside the declared scope');
  }
}

// Gate — secrets. Cheap, and the failure mode is expensive.
const diff = run('git', ['diff', 'HEAD', '--unified=0'], { cwd: root, timeoutMs: 20000 });
if (diff.ok) {
  const added = diff.out.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  const SECRET = /(service_role|SERVICE_ROLE_KEY|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{20,}|xox[baprs]-)/;
  const hits = added.filter((l) => SECRET.test(l));
  if (hits.length) {
    say('✗ SECRETS — added lines look like credentials:');
    hits.slice(0, 5).forEach((l) => say('    ' + l.slice(0, 110)));
  } else {
    say('✓ secrets — no credential-shaped strings in added lines');
  }
} else {
  // A check that could not run says so. A silent skip reads exactly like a pass,
  // which is the failure mode this whole plugin is about.
  say('· secrets — not checked (no diff against HEAD; is this repository empty?)');
}

// Gate — lint and types. Declared commands, or inferred from package.json scripts.
let checks = cfg.checks ?? null;
if (!checks) {
  try {
    const pkgPath = join(root, 'package.json');
    if (existsSync(pkgPath)) {
      const scripts = JSON.parse(readFileSync(pkgPath, 'utf8'))?.scripts ?? {};
      checks = {};
      if (scripts.lint) checks.lint = 'npm run lint';
      if (scripts.typecheck) checks.types = 'npm run typecheck';
      else if (scripts.build && existsSync(join(root, 'tsconfig.json'))) checks.types = 'npx tsc --noEmit';
    }
  } catch { /* inference is a convenience, never a requirement */ }
}

if (cfg.run === false) {
  say('');
  say('· lint / types — not run (postImpl.run is false). Commands:');
  Object.entries(checks ?? {}).forEach(([k, c]) => say(`    ${k}: ${c}`));
} else if (checks && Object.keys(checks).length) {
  say('');
  for (const [label, command] of Object.entries(checks)) {
    const r = run(command, [], { cwd: root, shell: true, timeoutMs: cfg.timeoutMs ?? 90000 });
    if (r.ok) {
      say(`✓ ${label} — clean  (${command})`);
    } else {
      const tail = r.out.trim().split('\n').slice(-12).join('\n    ');
      say(`✗ ${label} — FAILED  (${command})`);
      say('    ' + tail);
    }
  }
} else {
  say('');
  say('· lint / types — no command found. Declare them in .cairn.json → postImpl.checks');
}

// ---------------------------------------------------------------- gates only a human answers
say('');
say('Three gates no script can close. Answer them before proposing the next step:');
say('');
say('  1. WHAT WAS NOT TESTED — components touched but never exercised, data written but');
say('     never read back, integrations downstream never called, edge cases noticed and');
say('     skipped. An honest gap inventory, not a reassurance.');
say('  2. WHAT THE HUMAN MUST CHECK — exact route or command, the sequence of actions, the');
say('     expected outcome, and how a failure would show. Skip only if nothing is visible.');
say('  3. THE REPORT — files touched, tests added, what is now known to work and by which');
say('     method it was verified. A sub-agent report is an intention, not a proof: reopen');
say('     the files.');
say('');
say('─'.repeat(72));

// ---------------------------------------------------------------- remember, then speak
if (stateFile) {
  try {
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(stateFile, JSON.stringify({ fingerprint, at: new Date().toISOString() }));
  } catch { /* best-effort: failing to remember means asking twice, which is survivable */ }
}

process.stdout.write(OUT.join('\n') + '\n');
process.exit(0);
