// PreToolUse guard: file deletions must be approved explicitly, every time.
//
// Inspects the FULL shell command, so `cd x && rm ...`, pipes and `xargs rm` are
// caught, not just a leading-token prefix rule. Covers Bash and PowerShell. When a
// deletion verb is present it returns permissionDecision "ask", which forces an
// approval prompt even under acceptEdits or a matching allow rule. Anything else:
// stay silent, so normal flow is untouched.
//
// WHY THIS EXISTS. A file-matching tool returned "no files found" for a directory
// whose path contained a dynamic route segment, the `[id]` folders that framework
// routers use. The negative was believed, `rm -rf` followed, and seven live route
// files went with it. Recovered from git; the trust was not.
//
// The discipline comes first: never conclude "empty" from one tool's negative.
// This hook is the net under the discipline, not a replacement for it.
//
// It reads nothing from the product: a deletion costs the same in every repository,
// so the guard protects everywhere, with or without a product config.

import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HOOK = 'guard-destructive-delete';

// A deletion verb as its own command-segment token: at string start or right after a
// separator or space, followed by a space, a slash, or end of string.
// Bash: rm, rmdir, git rm. PowerShell: Remove-Item and its aliases ri, rd, del, erase.
const DELETE = /(^|[\s;&|(){}<>`])(remove-item|rmdir|erase|rm|rd|del|ri)([\s/]|$)/i;

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
  const parsed = JSON.parse(raw.replace(/^﻿/, '') || '{}');
  return parsed && typeof parsed === 'object' ? parsed : {};
}

async function main() {
  const input = await readInput();
  const where = `event=${input.hook_event_name ?? ''} tool=${input.tool_name ?? ''}`;

  const command = String(input.tool_input?.command ?? '');
  if (!DELETE.test(command)) { log(`${where} allowed`); return; }

  log(`${where} ASK deletion verb`);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        'Destructive file-deletion command. Approve each deletion explicitly: '
        + 'no silent rm / Remove-Item.',
    },
  }));
}

// A parse error or a crash does nothing: never block a command that is not a deletion.
try { await main(); } catch (err) { log(`crash: ${err?.stack ?? err}`); }
process.exitCode = 0;
