// Snapshot of the product's real pages: one PNG and one standalone HTML per page (its real DOM and
// CSS, fonts and images inlined, scripts removed). A mockup of an existing screen starts from this HTML.
// Needs the dev server running (Build pivot T1) and a fresh test session (the test setup of Build pivot
// section 10). The session state file is read from the product config, key `build.test_auth_state`
// (a path relative to the repository). Read only: it never clicks anything that writes.
//
//   node snapshot.cjs <repoDir> <outDir> <name> <url> [<name> <url> ...]
//   node snapshot.cjs /path/to/repo <scratchpad>/<topic>-mockup/base members "http://localhost:3000/<path in the test space>"
// Actions after the url, separated by `||`, run in order (only gestures that open, fold or wait):
//   `||click=<visible text>`  click a button by its exact text (`"...?view=plan||click=Export"`)
//   `||tid=<data-testid>`     click an element by its test id (a button whose text changes)
//   `||aria=<aria-label>`     click an icon button with no text and no test id, by its accessible label
//   `||wait=<text>`           wait up to 5 min for a text to show (a count measured late: `||wait= / 45`)
//   `||sleep=<ms>`            wait a fixed time (a panel that measures after opening)
// Window width: env VW (default 1440), height 900: `VW=1280 node snapshot.cjs ...` for the tight case.
// Needs `playwright` in the repository's node_modules.
const path = require('path');
const fs = require('fs');

const [repo, out, ...pairs] = process.argv.slice(2);
if (!repo || !out || pairs.length < 2 || pairs.length % 2) {
  console.error('usage: node snapshot.cjs <repoDir> <outDir> <name> <url> [<name> <url> ...]');
  process.exit(2);
}

function authState(repoDir) {
  const cfgPath = path.join(repoDir, '.claude', 'product', 'product.config.json');
  let rel;
  try { rel = JSON.parse(fs.readFileSync(cfgPath, 'utf8')).build?.test_auth_state; } catch { /* no config */ }
  if (!rel) {
    console.error(`set build.test_auth_state (the saved session state of the test account) in ${cfgPath}`);
    process.exit(2);
  }
  const file = path.resolve(repoDir, rel);
  if (!fs.existsSync(file)) {
    console.error(`no session state at ${file}: run the test setup of Build pivot section 10 first`);
    process.exit(2);
  }
  return file;
}

const storageState = authState(repo);
const { chromium } = require(path.join(repo, 'node_modules', 'playwright'));

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    storageState,
    viewport: { width: Number(process.env.VW || 1440), height: 900 },
  });
  const page = await ctx.newPage();
  let failed = 0;
  for (let i = 0; i < pairs.length; i += 2) {
    const [name, spec] = [pairs[i], pairs[i + 1]];
    const [url, ...actions] = spec.split('||');
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(2500);
      // A page that redirected to sign-in means the test session expired: renew it, never draw it.
      if (/\/(auth|login|sign-?in)\b/i.test(new URL(page.url()).pathname)) { console.log('LOGIN PAGE', name, '(renew the test session)'); failed++; continue; }
      for (const a of actions) {
        if (a.startsWith('wait=')) { await page.getByText(a.slice(5)).first().waitFor({ timeout: 300000 }); await page.waitForTimeout(1500); continue; }
        if (a.startsWith('tid=')) { await page.getByTestId(a.slice(4)).first().click(); await page.waitForTimeout(1200); continue; }
        if (a.startsWith('aria=')) { await page.getByLabel(a.slice(5), { exact: true }).first().click(); await page.waitForTimeout(1200); continue; }
        if (a.startsWith('sleep=')) { await page.waitForTimeout(Number(a.slice(6))); continue; }
        const text = a.replace(/^click=/, '');
        await page.getByText(text, { exact: true }).first().click();
        await page.waitForTimeout(1200);
      }
      await page.screenshot({ path: path.join(out, `${name}.png`) });
      const html = await page.evaluate(async () => {
        const toData = async (u) => {
          try {
            const r = await fetch(u);
            if (!r.ok) return u;
            const blob = await r.blob();
            return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
          } catch { return u; }
        };
        // A url() in a stylesheet is relative to THAT stylesheet (a framework may serve its fonts as
        // `../media/x.woff2` from its chunks folder), never to the page: resolved against the page,
        // every font came back as an HTML error page and the snapshot fell back to a default font.
        let css = '';
        for (const sheet of [...document.styleSheets]) {
          const base = sheet.href || location.href;
          try {
            for (const rule of [...sheet.cssRules]) {
              css += rule.cssText.replace(/url\(["']?([^"')]+)["']?\)/g, (m, u) => (u.startsWith('data:') ? m : `url("${new URL(u, base).href}")`)) + '\n';
            }
          } catch { /* cross-origin sheet */ }
        }
        const urls = [...new Set([...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => m[1]).filter((u) => !u.startsWith('data:')))];
        for (const u of urls) css = css.split(u).join(await toData(u));
        const doc = document.documentElement.cloneNode(true);
        doc.querySelectorAll('script, link[rel="stylesheet"], link[rel="preload"], link[rel="modulepreload"], style, noscript, next-route-announcer, nextjs-portal')
          .forEach((n) => n.remove());
        for (const img of doc.querySelectorAll('img[src]')) {
          const s = img.getAttribute('src');
          if (!s.startsWith('data:')) img.setAttribute('src', await toData(new URL(s, location.href).href));
        }
        const style = document.createElement('style');
        style.textContent = css;
        doc.querySelector('head').appendChild(style);
        return '<!doctype html>\n' + doc.outerHTML;
      });
      fs.writeFileSync(path.join(out, `${name}.html`), html);
      console.log('OK', name, `${Math.round(html.length / 1024)} KB`);
    } catch (e) {
      console.log('FAIL', name, e.message.split('\n')[0]);
      failed++;
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
