import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  decisionOf, git, gitAvailable, makeProduct, reasonOf, removeTempDirs, runHook, tempDir,
} from './helpers.mjs';

const SCRIPT = 'guard-destructive-git.mjs';
const HAS_GIT = gitAvailable();

after(removeTempDirs);

// null leaves the key out of the config.
function config({ mainBranch = 'main', pushDeploys = true } = {}) {
  const git = {};
  if (mainBranch !== null) git.main_branch = mainBranch;
  if (pushDeploys !== null) git.push_deploys = pushDeploys;
  return { schema_version: 1, memory: { dir: '.claude/memory', index: 'MEMORY.md', always: [] }, git };
}

function check(p, command, { tool = 'Bash', cwd = p.root } = {}) {
  return runHook(SCRIPT, {
    session_id: 'git-session', cwd, hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { command },
  }, p.env);
}

const product = makeProduct({ config: config() });
const bare = makeProduct({ config: null });

describe('git guard: with and without a product config', () => {
  test('no product config: destructive rules still ask, and the log says why', () => {
    const r = check(bare, 'git reset --hard');
    assert.equal(r.status, 0);
    assert.equal(decisionOf(r), 'ask');
    const logged = readFileSync(join(bare.data, 'guard-destructive-git.log'), 'utf8');
    assert.match(logged, /no product config .*destructive rules only, no push-to-main rule/);
    assert.match(logged, /ASK rules=reset/);
  });

  test('no product config: a push to main passes, a force push still asks', () => {
    assert.equal(check(bare, 'git push origin main').json, null);
    const forced = check(bare, 'git push --force origin main');
    assert.equal(decisionOf(forced), 'ask');
    assert.ok(!reasonOf(forced).includes('ships to production'));
  });

  test('a config with an unknown schema_version counts as no config', () => {
    const p = makeProduct({ config: { ...config(), schema_version: 3 } });
    assert.equal(decisionOf(check(p, 'git push --force origin feature')), 'ask');
    assert.equal(check(p, 'git push origin main').json, null);
  });

  test('garbage on stdin never blocks', () => {
    const r = runHook(SCRIPT, '{{{', product.env);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });

  test('the log records the rule, never the command text', () => {
    const p = makeProduct({ config: config() });
    check(p, 'git reset --hard SECRET_TOKEN_123');
    const logged = readFileSync(join(p.data, 'guard-destructive-git.log'), 'utf8');
    assert.match(logged, /ASK rules=reset/);
    assert.ok(!logged.includes('SECRET_TOKEN_123'));
  });
});

// Every rule of the shell guard this replaces, then the cases it missed.
const ASK = {
  worktree: [
    'git worktree remove ../feature',
    'git worktree remove --force ../feature',
    'git worktree prune',
    'git -C ../repo worktree remove ../feature',
    'git --no-pager -c core.quotepath=off worktree prune',
  ],
  branch: [
    'git branch -D feature',
    'git branch -d feature',
    'git branch --delete --force feature',
    'git branch --delete feature',
    'git branch -f feature HEAD~1',
    'git branch --force feature origin/feature',
    'git branch -r -d origin/feature',
    'git branch -df feature',
  ],
  reset: [
    'git reset --hard',
    'git reset --hard HEAD~1',
    'git reset -q --hard origin/main',
    'GIT RESET --HARD',
  ],
  'push-force': [
    'git push --force origin feature',
    'git push origin feature --force-with-lease',
    'git push --force-with-lease=feature:abc123 origin feature',
    'git push -f origin feature',
    'git push -uf origin feature',
    'git push origin +feature',
  ],
  'push-delete': [
    'git push origin --delete feature',
    'git push -d origin feature',
    'git push origin :feature',
  ],
  clean: [
    'git clean -f',
    'git clean -fd',
    'git clean -xdf',
    'git clean -d -f',
    'git clean --force',
  ],
};

describe('git guard: destructive commands ask, with or without a config', () => {
  for (const [label, p] of [['config', product], ['no config', bare]]) {
    for (const [rule, commands] of Object.entries(ASK)) {
      for (const command of commands) {
        test(`${label} / ${rule}: ${command}`, () => {
          const r = check(p, command);
          assert.equal(decisionOf(r), 'ask');
          assert.match(reasonOf(r), /GUARDRAIL: destructive git command/);
          assert.match(readFileSync(join(p.data, 'guard-destructive-git.log'), 'utf8'), new RegExp(`rules=[a-z,-]*${rule}`));
        });
      }
    }
  }

  test('a destructive command later in a chain is still caught', () => {
    assert.equal(decisionOf(check(product, 'git status && git reset --hard')), 'ask');
    assert.equal(decisionOf(check(product, 'git fetch; git clean -fdx')), 'ask');
    assert.equal(decisionOf(check(product, 'git branch --merged | xargs git branch -d')), 'ask');
    assert.equal(decisionOf(check(product, 'cd ../other && git worktree prune')), 'ask');
  });

  test('a line continuation does not hide a flag', () => {
    assert.equal(decisionOf(check(product, 'git push origin feature \\\n  --force')), 'ask');
  });

  test('git by full path is caught', () => {
    assert.equal(decisionOf(check(product, '/usr/bin/git reset --hard')), 'ask');
  });

  test('the worktree reason keeps the incident', () => {
    assert.match(reasonOf(check(product, 'git worktree remove ../x')), /active workspace, not a disposable cache/);
  });
});

describe('git guard: harmless commands pass', () => {
  const ALLOW = [
    'git status',
    'git log --oneline -5',
    'git diff --stat',
    'git branch',
    'git branch -a',
    'git branch -vv',
    'git branch --merged',
    'git branch new-feature',
    'git worktree list',
    'git worktree add ../x -b x',
    'git reset --soft HEAD~1',
    'git reset HEAD file.txt',
    'git clean -n',
    'git clean -nd',
    'git push origin feature',
    'git push -u origin feature',
    'git push origin feature:feature',
    'git push origin v1.2.0',
    'git push --tags',
    'git fetch --prune',
    'git commit -m "tidy the header"',
    'git checkout -b fix/header',
    'cat .git/config',
    'npm test',
    'digit reset --hard',
  ];
  for (const [label, p] of [['config', product], ['no config', bare]]) {
    for (const command of ALLOW) {
      test(`${label}: ${command}`, () => {
        const r = check(p, command);
        assert.equal(r.status, 0);
        assert.equal(r.json, null);
      });
    }
  }
});

describe('git guard: pushes to the main branch', () => {
  test('explicit pushes to main ask when push_deploys is true', () => {
    for (const command of [
      'git push origin main',
      'git push -u origin main',
      'git push origin HEAD:main',
      'git push origin feature:refs/heads/main',
      'git push origin main:main',
      'git push --all origin',
      'git push --mirror origin',
    ]) {
      const r = check(product, command);
      assert.equal(decisionOf(r), 'ask', command);
      assert.match(reasonOf(r), /A push to main ships to production/, command);
    }
  });

  test('the protected branch comes from git.main_branch', () => {
    const p = makeProduct({ config: config({ mainBranch: 'master' }) });
    assert.equal(decisionOf(check(p, 'git push origin master')), 'ask');
    assert.match(reasonOf(check(p, 'git push origin master')), /A push to master ships to production/);
    assert.equal(check(p, 'git push origin main').json, null);
  });

  test('a missing push_deploys counts as true', () => {
    const p = makeProduct({ config: config({ pushDeploys: null }) });
    assert.equal(decisionOf(check(p, 'git push origin main')), 'ask');
  });

  test('push_deploys false: a push to main passes, a force push still asks', () => {
    const p = makeProduct({ config: config({ pushDeploys: false }) });
    assert.equal(check(p, 'git push origin main').json, null);
    const forced = check(p, 'git push --force origin main');
    assert.equal(decisionOf(forced), 'ask');
    assert.ok(!reasonOf(forced).includes('ships to production'));
  });

  test('no git.main_branch and no remote default: the protected branch is main', () => {
    const p = makeProduct({ config: config({ mainBranch: null }) });
    assert.equal(decisionOf(check(p, 'git push origin main')), 'ask');
    assert.equal(check(p, 'git push origin trunk').json, null);
  });

  test('no git.main_branch: the protected branch is the remote default (origin/HEAD)', { skip: !HAS_GIT && 'git not installed' }, () => {
    const repo = tempDir('product-os-git-');
    git(['init', '-q', '-b', 'trunk', repo]);
    git(['symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/trunk'], repo);

    const unnamed = makeProduct({ config: config({ mainBranch: null }) });
    const r = check(unnamed, 'git push origin trunk', { cwd: repo });
    assert.equal(decisionOf(r), 'ask');
    assert.match(reasonOf(r), /A push to trunk ships to production/);
    assert.equal(check(unnamed, 'git push origin main', { cwd: repo }).json, null);

    const named = makeProduct({ config: config({ mainBranch: 'main' }) });
    assert.equal(decisionOf(check(named, 'git push origin main', { cwd: repo })), 'ask', 'the config wins over git');
    assert.equal(check(named, 'git push origin trunk', { cwd: repo }).json, null);
  });

  test('a push that names no branch follows the current branch', { skip: !HAS_GIT && 'git not installed' }, () => {
    const repo = tempDir('product-os-git-');
    git(['init', '-q', '-b', 'main', repo]);
    const elsewhere = tempDir('product-os-elsewhere-');

    assert.equal(decisionOf(check(product, 'git push', { cwd: repo })), 'ask', 'on main');
    assert.equal(decisionOf(check(product, 'git push origin', { cwd: repo })), 'ask', 'on main, remote only');
    assert.equal(decisionOf(check(product, 'git push origin HEAD', { cwd: repo })), 'ask', 'HEAD on main');
    assert.equal(decisionOf(check(product, `git -C "${repo}" push`, { cwd: elsewhere })), 'ask', 'git -C into main');
    assert.equal(decisionOf(check(product, `cd "${repo}" && git push`, { cwd: elsewhere })), 'ask', 'cd into main');
    assert.equal(decisionOf(check(product, 'git push > push.log 2>&1', { cwd: repo })), 'ask', 'redirections are not refspecs');

    git(['symbolic-ref', 'HEAD', 'refs/heads/feature'], repo);
    assert.equal(check(product, 'git push', { cwd: repo }).json, null, 'on feature');
    assert.equal(check(product, 'git push origin HEAD', { cwd: repo }).json, null, 'HEAD on feature');
  });

  test('a push that names no branch, where git cannot tell the branch, asks', () => {
    const notARepo = tempDir('product-os-norepo-');
    assert.equal(decisionOf(check(product, 'git push', { cwd: notARepo })), 'ask');
  });
});

describe('git guard: PowerShell', () => {
  const ps = (p, command) => check(p, command, { tool: 'PowerShell' });

  test('destructive commands ask, with or without a config', () => {
    for (const p of [product, bare]) {
      for (const command of [
        'git reset --hard; Write-Host done',
        '& git.exe push --force origin feature',
        '& "C:\\Program Files\\Git\\cmd\\git.exe" worktree remove ..\\feature',
        'Set-Location ..\\repo; git clean -fdx',
        'git push origin feature `\n  --force',
        '(git branch -D feature)',
        'git -C "C:\\work\\repo" branch --delete feature',
      ]) {
        assert.equal(decisionOf(ps(p, command)), 'ask', command);
      }
    }
  });

  test('a push to main asks through a PowerShell redirection', () => {
    assert.equal(decisionOf(ps(product, 'git push origin main *> push.log')), 'ask');
  });

  test('harmless commands pass', () => {
    for (const command of [
      'git status | Out-String',
      'Get-ChildItem -Force',
      'git log -n 5; git branch -a',
      'git push origin feature 2>&1 | Out-Null',
    ]) {
      assert.equal(ps(product, command).json, null, command);
    }
  });
});
