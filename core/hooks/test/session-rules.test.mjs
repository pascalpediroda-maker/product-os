// Session rules: the OS's cross-cutting rules reach the context at session start,
// built from the product config, whatever the product's CLAUDE.md says.

import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { contextOf, makeProduct, removeTempDirs, runHook, writeFiles } from './helpers.mjs';

after(removeTempDirs);

const SCRIPT = 'session-rules.mjs';

const baseConfig = (over = {}) => ({
  schema_version: 1,
  product: { name: 'Acme' },
  modules: { support: true },
  memory: { dir: '.claude/memory', index: 'MEMORY.md', always: [] },
  pivots: { dir: '.claude/product' },
  databases: { fix_backlog: 'collection://abc' },
  git: { main_branch: 'main', push_deploys: true },
  ...over,
});

const start = (p, source = 'startup') => runHook(SCRIPT, { session_id: 's1', cwd: p.root, source, hook_event_name: 'SessionStart' }, p.env);

describe('session rules: with a product config', () => {
  test('injects the digest with the pos-fix-backlog rule when the backlog is configured', () => {
    const p = makeProduct({ config: baseConfig() });
    const r = start(p);
    assert.equal(r.status, 0);
    assert.equal(r.json.hookSpecificOutput.hookEventName, 'SessionStart');
    const ctx = contextOf(r);
    assert.match(ctx, /PRODUCT OS RULES for Acme/);
    assert.match(ctx, /`pos-fix-backlog` skill/);
    assert.match(ctx, /notes file/);
    assert.match(ctx, /push to `main` ships to production/);
    assert.match(ctx, /\.claude\/memory\/MEMORY\.md/);
    assert.match(ctx, /`pos-orient`/);
  });

  test('names the conflict rule and the recorded owner exception', () => {
    const p = makeProduct({ config: baseConfig() });
    const ctx = contextOf(start(p));
    assert.match(ctx, /CLAUDE\.md says otherwise/);
    assert.match(ctx, /"Product OS" heading/);
    assert.match(ctx, /owner's word in this conversation wins/);
  });

  test('support on, backlog not configured: says so and offers to create it', () => {
    const p = makeProduct({ config: baseConfig({ databases: { fix_backlog: '' } }) });
    const ctx = contextOf(start(p));
    assert.match(ctx, /not configured yet/);
    assert.match(ctx, /offer the `pos-fix-backlog` skill/);
  });

  test('support off: no pos-fix-backlog skill named, bug still kept out of the conversation', () => {
    const p = makeProduct({ config: baseConfig({ modules: { support: false } }) });
    const ctx = contextOf(start(p));
    assert.doesNotMatch(ctx, /`pos-fix-backlog` skill/);
    assert.match(ctx, /never left only in the\s+conversation/);
  });

  test('push_deploys false: no production warning', () => {
    const p = makeProduct({ config: baseConfig({ git: { main_branch: 'master', push_deploys: false } }) });
    const ctx = contextOf(start(p));
    assert.doesNotMatch(ctx, /ships to production/);
    assert.match(ctx, /Push only when the owner asks/);
  });

  test('easypanel as deploy provider: check before the push, follow the build after', () => {
    const p = makeProduct({ config: baseConfig({ deploy: { provider: 'easypanel', project: 'apps', app_service: 'web' } }) });
    const ctx = contextOf(start(p));
    assert.match(ctx, /no build is running/);
    assert.match(ctx, /follow the build to green/);
  });

  test('no deploy provider: no build follow-up sentence', () => {
    const p = makeProduct({ config: baseConfig() });
    assert.doesNotMatch(contextOf(start(p)), /follow the build/);
  });

  test('push_deploys missing counts as true, main branch from the config', () => {
    const p = makeProduct({ config: baseConfig({ git: { main_branch: 'master' } }) });
    assert.match(contextOf(start(p)), /push to `master` ships to production/);
  });

  test('custom memory dir and index are named', () => {
    const p = makeProduct({ config: baseConfig({ memory: { dir: 'docs/mem', index: 'INDEX.md' } }) });
    assert.match(contextOf(start(p)), /docs\/mem\/INDEX\.md/);
  });

  test('points to the full rules when the plugin root is known', () => {
    const p = makeProduct({ config: baseConfig() });
    const r = runHook(SCRIPT, { session_id: 's1', cwd: p.root, source: 'startup' }, { ...p.env, CLAUDE_PLUGIN_ROOT: p.data });
    assert.match(contextOf(r), /collaboration\.md/);
    assert.match(contextOf(r), /principles\.md/);
  });

  test('fires on clear and compact', () => {
    const p = makeProduct({ config: baseConfig() });
    assert.match(contextOf(start(p, 'clear')), /PRODUCT OS RULES/);
    assert.match(contextOf(start(p, 'compact')), /PRODUCT OS RULES/);
  });

  test('stays silent on resume and fork: the conversation already carries the rules', () => {
    const p = makeProduct({ config: baseConfig() });
    assert.equal(start(p, 'resume').stdout, '');
    assert.equal(start(p, 'fork').stdout, '');
  });

  test('a config with a byte-order mark is read', () => {
    const p = makeProduct({ config: `﻿${JSON.stringify(baseConfig())}` });
    assert.match(contextOf(start(p)), /PRODUCT OS RULES for Acme/);
  });

  test('stays well under the 10,000-character context cap', () => {
    const p = makeProduct({ config: baseConfig() });
    assert.ok(contextOf(start(p)).length < 3000);
  });
});

describe('session rules: without a usable config', () => {
  test('no config, core enabled in the repository: one line naming setup', () => {
    const p = makeProduct({
      config: null,
      files: { '.claude/settings.json': JSON.stringify({ enabledPlugins: { 'pos-core@product-os': true } }) },
    });
    const ctx = contextOf(start(p));
    assert.match(ctx, /not set up yet/);
    assert.match(ctx, /`pos-setup` skill/);
  });

  test('no config, core enabled in settings.local.json: same nudge', () => {
    const p = makeProduct({
      config: null,
      files: { '.claude/settings.local.json': JSON.stringify({ enabledPlugins: { 'pos-core@product-os': true } }) },
    });
    assert.match(contextOf(start(p)), /not set up yet/);
  });

  test('no config, core not enabled in the repository: silent', () => {
    const p = makeProduct({ config: null });
    assert.equal(start(p).stdout, '');
  });

  test('no config, core disabled in the repository: silent', () => {
    const p = makeProduct({
      config: null,
      files: { '.claude/settings.json': JSON.stringify({ enabledPlugins: { 'pos-core@product-os': false } }) },
    });
    assert.equal(start(p).stdout, '');
  });

  test('unknown schema version: no digest', () => {
    const p = makeProduct({ config: baseConfig({ schema_version: 2 }) });
    assert.doesNotMatch(start(p).stdout, /PRODUCT OS RULES/);
  });

  test('invalid JSON config: no crash, exit 0', () => {
    const p = makeProduct({ config: '{ not json' });
    const r = start(p);
    assert.equal(r.status, 0);
    assert.doesNotMatch(r.stdout, /PRODUCT OS RULES/);
  });

  test('unreadable stdin: no crash, exit 0', () => {
    const p = makeProduct({ config: baseConfig() });
    const r = runHook(SCRIPT, '{ broken', p.env);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });
});

describe('session rules: the product root', () => {
  test('falls back to the cwd field when CLAUDE_PROJECT_DIR is not set', () => {
    const p = makeProduct({ config: baseConfig() });
    const env = { ...p.env };
    delete env.CLAUDE_PROJECT_DIR;
    const r = runHook(SCRIPT, { session_id: 's1', cwd: p.root, source: 'startup' }, env);
    assert.match(contextOf(r), /PRODUCT OS RULES for Acme/);
  });

  test('a host CLAUDE.md does not change what is injected', () => {
    const p = makeProduct({ config: baseConfig() });
    writeFiles(p.root, { 'CLAUDE.md': '# Rules\nA bug not fixed is written in NOTES-BUGS.txt.\n' });
    assert.match(contextOf(start(p)), /`pos-fix-backlog` skill/);
  });
});
