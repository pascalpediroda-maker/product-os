import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { decisionOf, makeProduct, reasonOf, removeTempDirs, runHook } from './helpers.mjs';

const SCRIPT = 'guard-destructive-delete.mjs';

after(removeTempDirs);

const product = makeProduct({ config: { schema_version: 1 } });

const check = (command, { tool = 'Bash', p = product } = {}) => runHook(SCRIPT, {
  session_id: 'delete-session', cwd: p.root, hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { command },
}, p.env);

describe('delete guard', () => {
  test('no product config: the guard still asks, since it protects every repository', () => {
    const p = makeProduct({ config: null });
    const r = check('rm -rf build', { p });
    assert.equal(r.status, 0);
    assert.equal(decisionOf(r), 'ask');
    assert.match(readFileSync(join(p.data, 'guard-destructive-delete.log'), 'utf8'), /ASK deletion verb/);
    assert.equal(check('ls -la', { p }).json, null);
  });

  test('Bash deletions ask, wherever they sit in the command', () => {
    for (const command of [
      'rm file.txt',
      'rm -rf dist',
      'cd src && rm -f old.ts',
      'ls *.log | xargs rm',
      'find . -name "*.tmp" -exec rm {} \\;',
      'rmdir build',
      'git rm old.txt',
      'echo x; rm/tmp/x',
    ]) {
      const r = check(command);
      assert.equal(decisionOf(r), 'ask', command);
      assert.match(reasonOf(r), /Destructive file-deletion command/);
    }
  });

  test('PowerShell deletions ask, aliases included', () => {
    for (const command of [
      'Remove-Item -Recurse -Force build',
      'Get-ChildItem *.log | Remove-Item',
      'ri old.txt',
      'rd /s /q build',
      'del old.txt',
      'erase old.txt',
      '(Remove-Item x)',
    ]) {
      assert.equal(decisionOf(check(command, { tool: 'PowerShell' })), 'ask', command);
    }
  });

  test('commands that only contain the letters pass', () => {
    for (const command of [
      'ls -la',
      'echo removed',
      'npm run format',
      'git status',
      'grep -r "rm" src',
      'perform-task --dry-run',
      'Get-ChildItem -Force',
      'cat README.md',
    ]) {
      const r = check(command);
      assert.equal(r.status, 0);
      assert.equal(r.json, null, command);
    }
  });

  test('garbage on stdin never blocks', () => {
    const r = runHook(SCRIPT, 'rm -rf /', product.env);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });
});
