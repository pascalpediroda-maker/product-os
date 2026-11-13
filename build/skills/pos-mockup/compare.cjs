// Side by side: the real screen (left) and its mockup (right), one PNG per pair, for the fidelity review.
//
//   node compare.cjs <repoDir> <outDir> <name> <real.png> <mockup.png> [<name> <real.png> <mockup.png> ...]
// Needs `playwright` in the repository's node_modules.
const path = require('path');
const fs = require('fs');

const [repo, out, ...rest] = process.argv.slice(2);
if (!repo || !out || rest.length < 3 || rest.length % 3) {
  console.error('usage: node compare.cjs <repoDir> <outDir> <name> <real.png> <mockup.png> [...]');
  process.exit(2);
}
const { chromium } = require(path.join(repo, 'node_modules', 'playwright'));
const uri = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2900, height: 960 } });
  for (let i = 0; i < rest.length; i += 3) {
    const [name, real, mock] = rest.slice(i, i + 3);
    await page.setContent(`<body style="margin:0;font:600 14px sans-serif;background:#fff">
      <div style="display:flex;gap:20px;padding:10px">
        <div><div style="margin:0 0 6px">REAL APP</div><img src="${uri(real)}" width="1440"></div>
        <div><div style="margin:0 0 6px">MOCKUP</div><img src="${uri(mock)}" width="1440"></div>
      </div></body>`);
    await page.screenshot({ path: path.join(out, `compare-${name}.png`), fullPage: true });
    console.log('OK', name);
  }
  await browser.close();
})();
