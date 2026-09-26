// Test helpers: build a throwaway product repository, run a hook the way Claude Code
// does (JSON on stdin, decision on stdout), read its decision back.

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HOOKS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

const created = [];

export function tempDir(prefix = 'product-os-test-') {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  created.push(dir);
  return dir;
}

export function removeTempDirs() {
  for (const dir of created.splice(0)) {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
  }
}

export function writeFiles(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  }
}

export function writeConfig(root, config) {
  writeFiles(root, {
    '.claude/product/product.config.json': typeof config === 'string' ? config : JSON.stringify(config, null, 2),
  });
}

// A product repository with a config (unless config is null) and memory files.
export function makeProduct({ config, memory = {}, files = {} } = {}) {
  const root = tempDir('product-os-repo-');
  const data = tempDir('product-os-data-');
  if (config !== null && config !== undefined) writeConfig(root, config);
  writeFiles(root, Object.fromEntries(Object.entries(memory).map(([k, v]) => [`.claude/memory/${k}`, v])));
  writeFiles(root, files);
  return { root, data, env: hookEnv({ root, data }), mem: (name) => join(root, '.claude', 'memory', name) };
}

// The hook's environment: nothing inherited from a Claude Code session running the tests.
export function hookEnv({ root, data } = {}) {
  const env = { ...process.env };
  delete env.CLAUDE_PROJECT_DIR;
  delete env.CLAUDE_PLUGIN_DATA;
  delete env.CLAUDE_PLUGIN_ROOT;
  if (root) env.CLAUDE_PROJECT_DIR = root;
  if (data) env.CLAUDE_PLUGIN_DATA = data;
  // Keep git from walking up into whatever repository holds the temp directory.
  const tmp = tmpdir();
  let real = tmp;
  try { real = realpathSync.native(tmp); } catch { /* keep tmp */ }
  env.GIT_CEILING_DIRECTORIES = [...new Set([tmp, real])].join(delimiter);
  return env;
}

const parse = (stdout) => (stdout.trim() ? JSON.parse(stdout) : null);

export function runHook(script, input, env) {
  const r = spawnSync(process.execPath, [join(HOOKS_DIR, script)], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    env,
    encoding: 'utf8',
    timeout: 20000,
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, json: parse(r.stdout ?? '') };
}

export function runHookAsync(script, input, env) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [join(HOOKS_DIR, script)], { env });
    let stdout = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (c) => { stdout += c; });
    child.on('error', reject);
    child.on('close', (status) => resolvePromise({ status, stdout, json: parse(stdout) }));
    child.stdin.end(JSON.stringify(input));
  });
}

export const decisionOf = (r) => r.json?.hookSpecificOutput?.permissionDecision ?? null;
export const reasonOf = (r) => r.json?.hookSpecificOutput?.permissionDecisionReason ?? '';
export const contextOf = (r) => r.json?.hookSpecificOutput?.additionalContext ?? '';

export const gitAvailable = () => {
  try { return spawnSync('git', ['--version'], { encoding: 'utf8' }).status === 0; } catch { return false; }
};

export function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: hookEnv() });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}
