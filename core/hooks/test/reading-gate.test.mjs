import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  contextOf, decisionOf, git, gitAvailable, hookEnv, makeProduct, reasonOf, removeTempDirs,
  runHook, runHookAsync, tempDir, writeConfig, writeFiles,
} from './helpers.mjs';

const SCRIPT = 'reading-gate.mjs';

after(removeTempDirs);

const MEMORY = {
  'MEMORY.md': '# Index\n',
  'architecture.md': '# Architecture\n',
  'archi-billing.md': '# Billing\n',
  'archi-search.md': '# Search\n',
  'reference-style.md': '# Style\n',
};

const PIVOTS = {
  '.claude/product/product_domain_context.md': '# Domain\n',
  '.claude/product/product_design_context.md': '# Design\n',
};

function config({ always = ['architecture.md'], skills, staleHours = 6, pivotsDir = '.claude/product' } = {}) {
  return {
    schema_version: 1,
    product: { name: 'Test product', one_liner: '', ui_language: 'en', team_language: 'en' },
    memory: { dir: '.claude/memory', index: 'MEMORY.md', always },
    routing: { zones: {} },
    reading_gate: {
      stale_hours: staleHours,
      skills: skills ?? { build: { require: ['archi-billing.md'] } },
    },
    pivots: { dir: pivotsDir, domain: 'product_domain_context.md' },
    git: { main_branch: 'main', push_deploys: true },
  };
}

// One Claude Code session against a product: arm, read, try a tool.
function session(p, sessionId = 'session-1', env = p.env) {
  const base = { session_id: sessionId, cwd: p.root };
  const readInput = (file_path) => ({ ...base, hook_event_name: 'PostToolUse', tool_name: 'Read', tool_input: { file_path }, tool_response: {} });
  return {
    skill: (skill) => runHook(SCRIPT, { ...base, hook_event_name: 'PreToolUse', tool_name: 'Skill', tool_input: { skill } }, env),
    read: (file_path) => runHook(SCRIPT, readInput(file_path), env),
    readAsync: (file_path) => runHookAsync(SCRIPT, readInput(file_path), env),
    tool: (tool_name, tool_input = { command: 'git status' }) => runHook(SCRIPT, { ...base, hook_event_name: 'PreToolUse', tool_name, tool_input }, env),
  };
}

describe('reading gate: activation', () => {
  test('no product config: arming and denying are both no-ops, and the log says why', () => {
    const p = makeProduct({ config: null, memory: MEMORY });
    const s = session(p);
    const armed = s.skill('build');
    assert.equal(armed.status, 0);
    assert.equal(armed.json, null);
    const bash = s.tool('Bash');
    assert.equal(bash.status, 0);
    assert.equal(bash.json, null);
    const logged = readFileSync(join(p.data, 'reading-gate.log'), 'utf8');
    assert.match(logged, /no-op: no product config/);
  });

  test('schema_version other than 1: no-op', () => {
    const p = makeProduct({ config: { ...config(), schema_version: 2 }, memory: MEMORY });
    const s = session(p);
    assert.equal(s.skill('build').json, null);
    assert.equal(s.tool('Bash').json, null);
    assert.match(readFileSync(join(p.data, 'reading-gate.log'), 'utf8'), /schema_version 2/);
  });

  test('config that is not valid JSON: no-op', () => {
    const p = makeProduct({ config: '{ "schema_version": 1, ', memory: MEMORY });
    const s = session(p);
    assert.equal(s.skill('build').json, null);
    assert.equal(s.tool('Bash').json, null);
    assert.match(readFileSync(join(p.data, 'reading-gate.log'), 'utf8'), /not valid JSON/);
  });

  test('a config with a byte-order mark is still read', () => {
    const p = makeProduct({ config: String.fromCharCode(0xfeff) + JSON.stringify(config()), memory: MEMORY });
    const s = session(p);
    s.skill('build');
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
  });

  test('an ungated skill arms nothing', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    assert.equal(s.skill('meeting-notes').json, null);
    assert.equal(s.tool('Bash').json, null);
  });

  test('the product root falls back to the cwd of the hook input', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p, 'session-cwd', hookEnv({ data: p.data }));
    assert.match(contextOf(s.skill('build')), /READING GATE ARMED/);
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
  });

  test('garbage on stdin never blocks: exit 0, no output', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const r = runHook(SCRIPT, 'not json at all', p.env);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });
});

describe('reading gate: required files', () => {
  test('a gated skill lists exactly the required files and denies Bash until all are read', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);

    const ctx = contextOf(s.skill('build'));
    assert.match(ctx, /READING GATE ARMED for \/build/);
    assert.ok(ctx.includes(p.mem('architecture.md')), 'names memory.always');
    assert.ok(ctx.includes(p.mem('archi-billing.md')), 'names the skill require');
    assert.ok(!ctx.includes('archi-search.md'), 'names nothing else');

    const first = s.tool('Bash');
    assert.equal(decisionOf(first), 'deny');
    assert.match(reasonOf(first), /architecture\.md/);
    assert.match(reasonOf(first), /archi-billing\.md/);
    assert.match(reasonOf(first), /Reads remaining: 2/);

    s.read(p.mem('architecture.md'));
    const second = s.tool('Bash');
    assert.equal(decisionOf(second), 'deny', 'one required file read is not enough');
    assert.ok(!reasonOf(second).includes(p.mem('architecture.md')), 'a read file is no longer listed');
    assert.ok(reasonOf(second).includes(p.mem('archi-billing.md')));
    assert.match(reasonOf(second), /Reads remaining: 1/);

    s.read(p.mem('archi-billing.md'));
    assert.equal(s.tool('Bash').json, null, 'all required files read: allowed');
  });

  test('files the config does not require do not open the gate', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    s.skill('build');
    s.read(p.mem('MEMORY.md'));
    s.read(p.mem('archi-search.md'));
    s.read(p.mem('reference-style.md'));
    const r = s.tool('Bash');
    assert.equal(decisionOf(r), 'deny');
    assert.match(reasonOf(r), /Reads remaining: 2/);
  });

  test('every shell and mutation tool is denied; Read, Grep and Glob never are', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    s.skill('build');
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
    assert.equal(decisionOf(s.tool('PowerShell', { command: 'Get-ChildItem' })), 'deny');
    assert.equal(decisionOf(s.tool('Edit', { file_path: join(p.root, 'a.txt') })), 'deny');
    assert.equal(decisionOf(s.tool('Write', { file_path: join(p.root, 'a.txt') })), 'deny');
    assert.equal(decisionOf(s.tool('NotebookEdit', { notebook_path: join(p.root, 'a.ipynb') })), 'deny');
    assert.equal(s.tool('Read', { file_path: p.mem('architecture.md') }).json, null);
    assert.equal(s.tool('Grep', { pattern: 'x' }).json, null);
    assert.equal(s.tool('Glob', { pattern: '**/*.md' }).json, null);
  });

  test('min_reads above the required count needs extra distinct reads', () => {
    const p = makeProduct({
      config: config({ skills: { wide: { require: ['archi-billing.md'], min_reads: 4 } } }),
      memory: MEMORY,
    });
    const s = session(p);
    assert.match(contextOf(s.skill('wide')), /at least 4 distinct files/);
    s.read(p.mem('architecture.md'));
    s.read(p.mem('archi-billing.md'));
    let r = s.tool('Bash');
    assert.equal(decisionOf(r), 'deny', 'required files read, floor not reached');
    assert.match(reasonOf(r), /Every required file is read/);
    assert.match(reasonOf(r), /Reads remaining: 2/);
    s.read(p.mem('archi-billing.md')); // the same file twice counts once
    assert.match(reasonOf(s.tool('Bash')), /Reads remaining: 2/);
    s.read(p.mem('archi-search.md'));
    r = s.tool('Bash');
    assert.equal(decisionOf(r), 'deny');
    assert.match(reasonOf(r), /Reads remaining: 1/);
    s.read(p.mem('reference-style.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('without min_reads and without required files, one read is still needed', () => {
    const p = makeProduct({ config: config({ always: [], skills: { light: {} } }), memory: MEMORY });
    const s = session(p);
    assert.match(contextOf(s.skill('light')), /at least 1 distinct files/);
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
    s.read(p.mem('MEMORY.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('a read outside the memory and pivots directories is not counted, even with the same file name', () => {
    const other = makeProduct({ config: config(), memory: MEMORY });
    const p = makeProduct({
      config: config(),
      memory: MEMORY,
      files: { 'docs/architecture.md': 'x', 'docs/.claude/memory/archi-billing.md': 'x', 'memory-archive/archi-billing.md': 'x' },
    });
    const s = session(p);
    s.skill('build');
    s.read(join(p.root, 'docs', 'architecture.md'));
    s.read(join(p.root, 'docs', '.claude', 'memory', 'archi-billing.md'));
    s.read(join(p.root, 'memory-archive', 'archi-billing.md'));
    s.read(other.mem('architecture.md'));
    s.read(other.mem('archi-billing.md'));
    const r = s.tool('Bash');
    assert.equal(decisionOf(r), 'deny');
    assert.match(reasonOf(r), /Reads remaining: 2/);
  });

  test('a relative read path resolves against the session cwd', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    s.skill('build');
    s.read('.claude/memory/architecture.md');
    s.read('./.claude/memory/archi-billing.md');
    assert.equal(s.tool('Bash').json, null);
  });

  test('config names are normalised: ./prefix, backslashes, duplicates', () => {
    const p = makeProduct({
      config: config({ always: ['./architecture.md'], skills: { build: { require: ['zones\\archi-sub.md', 'architecture.md'] } } }),
      memory: { ...MEMORY, 'zones/archi-sub.md': '# Sub\n' },
    });
    const s = session(p);
    s.skill('build');
    const r = s.tool('Bash');
    assert.match(reasonOf(r), /Reads remaining: 2/, 'architecture.md listed twice counts once');
    s.read(p.mem('architecture.md'));
    s.read(join(p.root, '.claude', 'memory', 'zones', 'archi-sub.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('a required file missing on disk is named and dropped, so it cannot lock the session', () => {
    const p = makeProduct({
      config: config({ always: ['architecture.md', 'ghost.md'], skills: { build: { require: ['../outside.md', 'archi-billing.md'] } } }),
      memory: MEMORY,
    });
    const s = session(p);
    const ctx = contextOf(s.skill('build'));
    assert.match(ctx, /ghost\.md {2}\(missing on disk\)/);
    assert.match(ctx, /outside\.md {2}\(outside the memory directory\)/);
    s.read(p.mem('architecture.md'));
    s.read(p.mem('archi-billing.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('min_reads larger than the files that exist is capped at what exists', () => {
    const p = makeProduct({
      config: config({ always: [], skills: { build: { require: ['architecture.md'], min_reads: 50 } } }),
      memory: { 'architecture.md': 'a', 'MEMORY.md': 'i' },
    });
    const s = session(p);
    // Two memory files plus the product config under the pivots directory.
    assert.match(contextOf(s.skill('build')), /capped at 3/);
    s.read(p.mem('architecture.md'));
    s.read(p.mem('MEMORY.md'));
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
    s.read(join(p.root, '.claude', 'product', 'product.config.json'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('nothing to read under either directory: the gate is not armed, since it could never clear', () => {
    const p = makeProduct({ config: config({ pivotsDir: 'no-pivots-here' }), memory: {} });
    const s = session(p);
    assert.match(contextOf(s.skill('build')), /not armed/);
    assert.equal(s.tool('Bash').json, null);
  });

  test('parallel reads are all recorded', async () => {
    const p = makeProduct({
      config: config({ skills: { build: { require: ['archi-billing.md', 'archi-search.md', 'reference-style.md'] } } }),
      memory: MEMORY,
    });
    const s = session(p);
    s.skill('build');
    await Promise.all(['architecture.md', 'archi-billing.md', 'archi-search.md', 'reference-style.md']
      .map((f) => s.readAsync(p.mem(f))));
    assert.equal(s.tool('Bash').json, null);
  });
});

describe('reading gate: pivots', () => {
  const pivot = (p, name) => join(p.root, '.claude', 'product', name);

  test('a required pivot blocks until it is read, then counts', () => {
    const p = makeProduct({
      config: config({ skills: { build: { require: ['pivot:product_domain_context.md'] } } }),
      memory: MEMORY,
      files: PIVOTS,
    });
    const s = session(p);
    const ctx = contextOf(s.skill('build'));
    assert.ok(ctx.includes('pivot:product_domain_context.md'));
    assert.ok(ctx.includes(pivot(p, 'product_domain_context.md')));
    s.read(p.mem('architecture.md'));
    const r = s.tool('Bash');
    assert.equal(decisionOf(r), 'deny', 'the pivot is unread');
    assert.ok(reasonOf(r).includes(pivot(p, 'product_domain_context.md')));
    assert.match(reasonOf(r), /Reads remaining: 1/);
    s.read(pivot(p, 'product_domain_context.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('a pivot read counts toward min_reads', () => {
    const p = makeProduct({
      config: config({ skills: { wide: { require: ['archi-billing.md'], min_reads: 3 } } }),
      memory: MEMORY,
      files: PIVOTS,
    });
    const s = session(p);
    s.skill('wide');
    s.read(p.mem('architecture.md'));
    s.read(p.mem('archi-billing.md'));
    assert.match(reasonOf(s.tool('Bash')), /Reads remaining: 1/);
    s.read(pivot(p, 'product_design_context.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('the product config itself can be required as pivot:product.config.json', () => {
    const p = makeProduct({
      config: config({ skills: { build: { require: ['pivot:product.config.json'] } } }),
      memory: MEMORY,
    });
    const s = session(p);
    s.skill('build');
    s.read(p.mem('architecture.md'));
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
    s.read(pivot(p, 'product.config.json'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('a bare name resolves under memory.dir, never under pivots.dir', () => {
    const p = makeProduct({
      config: config({ skills: { build: { require: ['product_domain_context.md'] } } }),
      memory: MEMORY,
      files: PIVOTS,
    });
    const s = session(p);
    assert.match(contextOf(s.skill('build')), /product_domain_context\.md {2}\(missing on disk\)/);
  });

  test('pivots.dir comes from the config', () => {
    const p = makeProduct({
      config: config({ pivotsDir: 'docs/pivots', skills: { build: { require: ['pivot:domain.md'], min_reads: 3 } } }),
      memory: MEMORY,
      files: { 'docs/pivots/domain.md': '# Domain\n', ...PIVOTS },
    });
    const s = session(p);
    assert.ok(contextOf(s.skill('build')).includes(join(p.root, 'docs', 'pivots', 'domain.md')));
    s.read(p.mem('architecture.md'));
    s.read(join(p.root, 'docs', 'pivots', 'domain.md'));
    s.read(pivot(p, 'product_design_context.md')); // .claude/product is not the pivots directory here
    assert.match(reasonOf(s.tool('Bash')), /Reads remaining: 1/);
    s.read(p.mem('MEMORY.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('a pivot entry that escapes the pivots directory is dropped and named', () => {
    const p = makeProduct({
      config: config({ skills: { build: { require: ['pivot:../../secrets.md'] } } }),
      memory: MEMORY,
    });
    assert.match(contextOf(session(p).skill('build')), /pivot:\.\.\/\.\.\/secrets\.md {2}\(outside the pivots directory\)/);
  });

  test('pivots nested inside the memory directory: one file is one read', () => {
    const p = makeProduct({
      config: config({ always: [], pivotsDir: '.claude/memory/pivots', skills: { build: { require: ['pivots/domain.md', 'pivot:domain.md'] } } }),
      memory: { ...MEMORY, 'pivots/domain.md': '# Domain\n' },
    });
    const s = session(p);
    s.skill('build');
    assert.match(reasonOf(s.tool('Bash')), /Reads remaining: 1/, 'the same file named twice is required once');
    s.read(p.mem('pivots/domain.md'));
    assert.equal(s.tool('Bash').json, null);
  });
});

describe('reading gate: skill names, sessions, staleness', () => {
  test('a plugin-prefixed skill name arms the gate of its bare name', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    assert.match(contextOf(s.skill('product-os-delivery:build')), /READING GATE ARMED for \/product-os-delivery:build/);
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
  });

  test('a plugin-prefixed key in the config matches exactly, case-insensitively', () => {
    const p = makeProduct({ config: config({ skills: { 'my-plugin:Build': { require: [] } } }), memory: MEMORY });
    const s = session(p);
    assert.match(contextOf(s.skill('my-plugin:build')), /READING GATE ARMED/);
    assert.equal(session(p, 'session-2').skill('other-plugin:build').json, null);
  });

  test('a name that only contains a gated name is not gated', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    assert.equal(s.skill('rebuild').json, null);
    assert.equal(s.skill('build-docs').json, null);
    assert.equal(s.tool('Bash').json, null);
  });

  test('a gate belongs to its session', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    session(p, 'session-a').skill('build');
    assert.equal(decisionOf(session(p, 'session-a').tool('Bash')), 'deny');
    assert.equal(session(p, 'session-b').tool('Bash').json, null);
    session(p, 'session-b').read(p.mem('architecture.md'));
    session(p, 'session-b').read(p.mem('archi-billing.md'));
    assert.equal(decisionOf(session(p, 'session-a').tool('Bash')), 'deny', 'reads of another session do not count');
  });

  test('a stale gate is ignored', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    s.skill('build');
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
    writeConfig(p.root, config({ staleHours: 1e-9 })); // any gate armed before now is stale
    assert.equal(s.tool('Bash').json, null);
    assert.match(readFileSync(join(p.data, 'reading-gate.log'), 'utf8'), /stale, ignored/);
  });

  test('invoking the skill again re-arms it with a fresh count', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    s.skill('build');
    s.read(p.mem('architecture.md'));
    s.read(p.mem('archi-billing.md'));
    assert.equal(s.tool('Bash').json, null);
    s.skill('build');
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
  });

  test('reads before the skill is invoked are not counted', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    s.read(p.mem('architecture.md'));
    s.read(p.mem('archi-billing.md'));
    s.skill('build');
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
  });

  test('every firing is logged', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    s.skill('build');
    s.tool('Bash');
    s.read(p.mem('architecture.md'));
    const logged = readFileSync(join(p.data, 'reading-gate.log'), 'utf8');
    assert.match(logged, /ARMED \/build/);
    assert.match(logged, /DENIED/);
    assert.match(logged, /recorded \S*architecture\.md/);
    assert.ok(existsSync(join(p.data, 'reading-gate')), 'state lives under CLAUDE_PLUGIN_DATA');
  });
});

describe('reading gate: git worktrees', { skip: !gitAvailable() && 'git not installed' }, () => {
  const IDENTITY = ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid'];

  // A product whose root is a git repository, plus a sibling worktree of it holding
  // its own copy of the memory (untracked files, so the two copies can diverge).
  function productWithWorktree(cfg = config()) {
    const p = makeProduct({ config: cfg, memory: MEMORY, files: PIVOTS });
    git(['init', '-q', '-b', 'main', p.root]);
    git([...IDENTITY, 'commit', '-q', '--allow-empty', '-m', 'init'], p.root);
    const wt = join(tempDir('product-os-wt-'), 'feature');
    git(['worktree', 'add', '-q', '-b', 'feature', wt], p.root);
    writeFiles(wt, Object.fromEntries(Object.entries(MEMORY).map(([k, v]) => [`.claude/memory/${k}`, v])));
    writeFiles(wt, PIVOTS);
    const inWt = (...parts) => join(wt, ...parts);
    return { p, wt, inWt };
  }

  const lookups = (p) => (readFileSync(join(p.data, 'reading-gate.log'), 'utf8').match(/git lookup/g) ?? []).length;

  test('a read in a sibling worktree of the same repository counts', () => {
    const { p, inWt } = productWithWorktree();
    const s = session(p);
    const ctx = contextOf(s.skill('build'));
    assert.match(ctx, /another git worktree/);
    s.read(inWt('.claude', 'memory', 'architecture.md'));
    const r = s.tool('Bash');
    assert.equal(decisionOf(r), 'deny');
    assert.match(reasonOf(r), /Reads remaining: 1/, 'architecture.md from the worktree counted');
    s.read(inWt('.claude', 'memory', 'archi-billing.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('a pivot read in a sibling worktree counts', () => {
    const { p, inWt } = productWithWorktree(config({ always: [], skills: { build: { require: ['pivot:product_domain_context.md'] } } }));
    const s = session(p);
    s.skill('build');
    s.read(inWt('.claude', 'product', 'product_domain_context.md'));
    assert.equal(s.tool('Bash').json, null);
  });

  test('a read in another repository\'s .claude/memory does not count', () => {
    const { p } = productWithWorktree();
    const other = makeProduct({ config: config(), memory: MEMORY });
    git(['init', '-q', '-b', 'main', other.root]);
    const s = session(p);
    s.skill('build');
    s.read(other.mem('architecture.md'));
    s.read(other.mem('archi-billing.md'));
    const r = s.tool('Bash');
    assert.equal(decisionOf(r), 'deny');
    assert.match(reasonOf(r), /Reads remaining: 2/);
  });

  test('a .claude/memory folder deeper inside a worktree does not count', () => {
    const { p, wt, inWt } = productWithWorktree();
    writeFiles(wt, { 'docs/.claude/memory/architecture.md': 'x', 'docs/.claude/memory/archi-billing.md': 'x' });
    const s = session(p);
    s.skill('build');
    s.read(inWt('docs', '.claude', 'memory', 'architecture.md'));
    s.read(inWt('docs', '.claude', 'memory', 'archi-billing.md'));
    assert.match(reasonOf(s.tool('Bash')), /Reads remaining: 2/);
  });

  test('git is asked only for reads under a memory or pivots segment, once per checkout', () => {
    const { p, inWt } = productWithWorktree();
    const s = session(p);
    s.skill('build');
    s.read(inWt('src', 'index.ts'));
    s.read(p.mem('MEMORY.md'));
    assert.equal(lookups(p), 0, 'no git for a read elsewhere or in the product root');
    s.read(inWt('.claude', 'memory', 'architecture.md'));
    assert.equal(lookups(p), 2, 'the product root and the worktree');
    s.read(inWt('.claude', 'memory', 'archi-billing.md'));
    s.read(inWt('.claude', 'product', 'product_domain_context.md'));
    assert.equal(lookups(p), 2, 'answers are cached for the session');
    assert.equal(s.tool('Bash').json, null);
  });

  test('a product root outside any repository only counts its own reads', () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const repo = tempDir('product-os-repo2-');
    git(['init', '-q', '-b', 'main', repo]);
    writeFiles(repo, { '.claude/memory/architecture.md': 'x', '.claude/memory/archi-billing.md': 'x' });
    const s = session(p);
    s.skill('build');
    s.read(join(repo, '.claude', 'memory', 'architecture.md'));
    s.read(join(repo, '.claude', 'memory', 'archi-billing.md'));
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
  });
});

describe('reading gate: path forms', () => {
  const onWindows = process.platform === 'win32';

  test('Windows: back slashes, forward slashes, case and Git Bash paths all count', { skip: !onWindows && 'Windows only' }, () => {
    const p = makeProduct({
      config: config({ skills: { build: { require: ['archi-billing.md', 'archi-search.md', 'reference-style.md'] } } }),
      memory: MEMORY,
    });
    const s = session(p);
    s.skill('build');
    s.read(p.mem('architecture.md').toUpperCase());
    s.read(p.mem('archi-billing.md').replace(/\\/g, '/'));
    const msys = p.mem('archi-search.md').replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`).replace(/\\/g, '/');
    s.read(msys);
    const r = s.tool('Bash');
    assert.equal(decisionOf(r), 'deny');
    assert.match(reasonOf(r), /Reads remaining: 1/);
    s.read(p.mem('reference-style.md').replace(/^[A-Z]:/, (d) => d.toLowerCase()));
    assert.equal(s.tool('Bash').json, null);
  });

  test('Linux: paths are case-sensitive', { skip: process.platform !== 'linux' && 'Linux only' }, () => {
    const p = makeProduct({ config: config(), memory: MEMORY });
    const s = session(p);
    s.skill('build');
    s.read(p.mem('ARCHITECTURE.md'));
    s.read(p.mem('archi-billing.md'));
    assert.equal(decisionOf(s.tool('Bash')), 'deny');
  });
});
