// Gate of a mockup before anyone sees it: one PNG per step (1440 x 900) and the colour-contrast audit
// of axe-core (WCAG AA) on every step. A step-by-step mockup exposes `STEPS` and `go(i)` (the contract
// of scenario.js); a plain page is checked as one step. Exit code 1 if any text fails, if Next cannot
// be clicked on a step, or if a CTA a step declares in `next` is missing from the screen.
//
//   node check.cjs <repoDir> <mockup.html> <shotsDir> [<baselineReport.json> ...]
// Baseline: the contrast-report.json of the real app's snapshots (run this script on each snapshot
// HTML first). A failure the real app already has (same text, same colours) is reported apart and does
// not fail the gate: an app may already fail AA somewhere (small labels in a navigation rail).
// Needs `playwright` and `axe-core` in the repository's node_modules.
const path = require('path');
const fs = require('fs');

const [repo, html, out, ...baselines] = process.argv.slice(2);
if (!repo || !html || !out) { console.error('usage: node check.cjs <repoDir> <mockup.html> <shotsDir> [<baselineReport.json> ...]'); process.exit(2); }
const keyOf = (f) => `${f.text}|${(f.why.match(/foreground color: [^,]+, background color: [^,]+/) || [''])[0]}`;
const known = new Set(baselines.flatMap((b) => JSON.parse(fs.readFileSync(b, 'utf8')).flatMap((s) => s.failures.map(keyOf))));
const { chromium } = require(path.join(repo, 'node_modules', 'playwright'));
const axePath = path.join(repo, 'node_modules', 'axe-core', 'axe.min.js');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  // Window size: env VW / VH (default 1440 x 900); a short laptop screen is 1440 x 800 or 1280 x 800.
  const page = await browser.newPage({ viewport: { width: Number(process.env.VW || 1440), height: Number(process.env.VH || 900) } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file:///' + path.resolve(html).split(String.fromCharCode(92)).join('/'));
  await page.waitForTimeout(1500);
  const n = await page.evaluate(() => (typeof STEPS !== 'undefined' && typeof go === 'function') ? STEPS.length : 1);
  const report = [];
  let failures = 0;
  for (let i = 1; i <= n; i++) {
    if (n > 1) { await page.evaluate((k) => go(k), i - 1); await page.waitForTimeout(600); }
    await page.screenshot({ path: path.join(out, `step-${String(i).padStart(2, '0')}.png`) });
    if (n > 1) {
      // The scenario bar must stay clickable above any dialog, and the story's CTAs must exist.
      const click = await page.evaluate(() => {
        const next = document.querySelector('#bar [data-scenario="next"]') || [...document.querySelectorAll('#bar button')].find((b) => /Next/.test(b.textContent));
        let blocked = !next;
        if (next && !next.disabled) {
          const r = next.getBoundingClientRect();
          const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          blocked = !(top && (top === next || next.contains(top)));
        }
        const step = STEPS[typeof cur !== 'undefined' ? cur : 0];
        const wanted = (step && step.next) || [];
        const found = wanted.filter((label) => [...document.querySelectorAll('#root button, #root a, #root [role="button"], #root [role="menuitem"], #root [data-cta]')]
          .some((el) => (el.textContent || '').replace(/\s+/g, ' ').trim().replace(/^[^A-Za-z0-9]+/, '').startsWith(label)));
        return { blocked, missing: wanted.filter((l) => !found.includes(l)) };
      });
      if (click.blocked) { failures++; console.log(`step ${i}: Next cannot be clicked (something covers the scenario bar)`); }
      if (click.missing.length) { failures++; console.log(`step ${i}: CTA not found on the screen: ${click.missing.join(', ')}`); }
    }
    await page.addScriptTag({ path: axePath });
    const res = await page.evaluate(async () => {
      const r = await axe.run(document, { runOnly: ['color-contrast'] });
      return r.violations.flatMap((v) => v.nodes.map((nd) => ({
        text: (nd.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 70),
        why: (nd.any[0] && nd.any[0].message || '').slice(0, 140),
      })));
    });
    const fresh = res.filter((f) => !known.has(keyOf(f)));
    failures += fresh.length;
    report.push({ step: i, failures: res, new_failures: fresh });
    console.log(`step ${i}: ${fresh.length ? fresh.length + ' new contrast failure(s)' : 'ok'}${res.length - fresh.length ? ` (${res.length - fresh.length} already in the app)` : ''}`);
    fresh.slice(0, 5).forEach((f) => console.log(`   - "${f.text}" : ${f.why}`));
  }
  fs.writeFileSync(path.join(out, 'contrast-report.json'), JSON.stringify(report, null, 2));
  console.log(`steps ${n}, contrast failures ${failures}, page errors ${errors.length}`);
  await browser.close();
  process.exit(failures || errors.length ? 1 : 0);
})();
