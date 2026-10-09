// Help content hook: after a commit, a reminder when the changed files match the paths
// the Support pivot watches; silence otherwise, and never a failure.

import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'check-kb-update.mjs');
const created = [];
after(() => { for (const d of created) { try { rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } } });

function env(root, data) {
  const e = { ...process.env };
  delete e.CLAUDE_PROJECT_DIR; delete e.CLAUDE_PLUGIN_DATA; delete e.CLAUDE_PLUGIN_ROOT;
  if (root) e.CLAUDE_PROJECT_DIR = root;
  e.CLAUDE_PLUGIN_DATA = data;
  let real = tmpdir();
  try { real = realpathSync.native(tmpdir()); } catch { /* keep */ }
  e.GIT_CEILING_DIRECTORIES = [...new Set([tmpdir(), real])].join(delimiter);
  return e;
}

function write(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  }
}

function git(args, cwd, e) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: e });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
}

const PIVOT = (block) => [
  '# Support context', '', '```json pos-help-paths', '{"help_content": [{"pattern": "ignored"}]}', '```', '',
  '<!-- PRODUCT-OS SEPARATION LINE: an OS update replaces everything above this comment and nothing below it. -->',
  '', '## 9. Help center', '', '```json pos-help-paths', block, '```', '',
].join('\n');

const WATCHED = JSON.stringify({
  help_content: [{ pattern: '^src/app/settings/', label: 'settings view' }],
  screenshots: [{ pattern: '^src/app/dashboard/', label: 'dashboard' }],
});

// A repository with one commit already, then a second commit touching `changed`.
function repo({ support = true, block = WATCHED, changed = ['src/app/settings/page.tsx'], config = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'pos-kb-repo-'));
  const data = mkdtempSync(join(tmpdir(), 'pos-kb-data-'));
  created.push(root, data);
  const e = env(root, data);
  git(['init', '-q'], root, e);
  git(['config', 'user.email', 't@example.com'], root, e);
  git(['config', 'user.name', 't'], root, e);
  if (config) {
    write(root, {
      '.claude/product/product.config.json': JSON.stringify({ schema_version: 1, modules: { support }, pivots: { dir: '.claude/product' } }),
    });
  }
  if (block !== null) write(root, { '.claude/product/product_support_context.md': PIVOT(block) });
  write(root, { 'README.md': 'x' });
  git(['add', '.'], root, e);
  git(['commit', '-q', '-m', 'first'], root, e);
  write(root, Object.fromEntries(changed.map((f) => [f, 'y'])));
  git(['add', '.'], root, e);
  git(['commit', '-q', '-m', 'second'], root, e);
  return { root, e };
}

function run(r, command = 'git commit -m "x"', cwd = r.root) {
  const out = spawnSync(process.execPath, [SCRIPT], {
    input: JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Bash', cwd, tool_input: { command } }),
    env: r.e, encoding: 'utf8', timeout: 20000,
  });
  return { status: out.status, ctx: out.stdout.trim() ? JSON.parse(out.stdout).hookSpecificOutput.additionalContext : '' };
}

describe('check-kb-update', () => {
  test('a commit on a watched help path: reminder naming the label and the skill', () => {
    const r = repo();
    const out = run(r);
    assert.equal(out.status, 0);
    assert.match(out.ctx, /HELP CONTENT UPDATE SUGGESTED: this commit changed settings view\./);
    assert.match(out.ctx, /`pos-kb-article`/);
    assert.doesNotMatch(out.ctx, /SCREENSHOTS/);
  });

  test('a commit on a screenshot path: screenshot reminder', () => {
    const out = run(repo({ changed: ['src/app/dashboard/View.tsx'] }));
    assert.match(out.ctx, /SCREENSHOTS may be stale: this commit touched dashboard\./);
  });

  test('git -C <path> commit is followed to that repository', () => {
    const r = repo();
    const out = run(r, `git -C "${r.root}" commit -m x`, tmpdir());
    assert.match(out.ctx, /settings view/);
  });

  test('the block above the separation line is ignored', () => {
    const out = run(repo({ changed: ['ignored.txt'] }));
    assert.equal(out.ctx, '');
  });

  test('silent: not a commit, nothing watched, support off, empty block, no block, no config', () => {
    const r = repo();
    assert.equal(run(r, 'git status').ctx, '');
    assert.equal(run(repo({ changed: ['docs/other.md'] })).ctx, '');
    assert.equal(run(repo({ support: false })).ctx, '');
    assert.equal(run(repo({ block: '{"help_content": [], "screenshots": []}' })).ctx, '');
    assert.equal(run(repo({ block: null })).ctx, '');
    assert.equal(run(repo({ config: false })).ctx, '');
  });

  test('a broken block never fails the hook', () => {
    const out = run(repo({ block: '{ not json' }));
    assert.equal(out.status, 0);
    assert.equal(out.ctx, '');
  });
});
