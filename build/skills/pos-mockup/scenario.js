/* The scenario bar of every step-by-step mockup (skill pos-mockup): one look, one behaviour.
 * Paste this file inside the mockup's <script>, AFTER the CSS of the app's snapshot and after STEPS.
 *
 * The mockup provides:
 *   const STEPS = [{ when, title, who: { initial, name, role }, outside?: true, render(), after?(),
 *                    next?: ['Confirm', 'Merge'] }, ...];
 *   render() draws the step into #root; `outside` = a screen outside the app (an email, a spreadsheet):
 *   full width.
 *   `next`: the visible labels of the controls that carry the story on (the real CTA of the step). A click
 *   on one of them goes to the next step; they get a focus ring so the viewer sees what to click.
 * The page has <div id="root"></div><div id="bar"></div>.
 *
 * Set once per product, before this file (the product's values, not the mockup's):
 *   window.SCENARIO_INSETS  = { left: <px>, right: <px> }  the width of the app's navigation rail and of
 *                             a side panel the bar must not cover (default 16 / 16).
 *   window.SCENARIO_CLASSES = { bar, avatar, name, sub, eyebrow, title, prev, next }  the design system's
 *                             classes for a dark surface, its primary button and its secondary button on a
 *                             dark surface, read in the snapshot's CSS. Without them, neutral inline styles
 *                             apply, with the primary colour taken from the CSS variable --color-primary.
 *
 * The bar is always above any dialog or overlay of the step (z-index 10000), Previous / Next and the arrow
 * keys always work, the step is in the URL (#step-n). check.cjs fails if Next cannot be clicked on a step.
 */
(function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const C = window.SCENARIO_CLASSES || null;
  const PRIMARY = 'var(--color-primary, #3D4FD6)';
  const S = {
    bar: 'border-radius:12px;background:#1f2430;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;align-items:center;gap:14px;padding:10px 16px;font-family:inherit',
    avatar: `width:28px;height:28px;border-radius:50%;background:${PRIMARY};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800`,
    name: 'display:block;font-size:13px;font-weight:650;color:#fff',
    sub: 'display:block;font-size:11px;color:#fff',
    eyebrow: 'font-size:11px;font-weight:650;text-transform:uppercase;letter-spacing:.07em;color:#fff',
    title: 'font-size:13px;font-weight:600;color:#fff;line-height:1.35',
    btn: 'display:inline-flex;align-items:center;justify-content:center;border-radius:6px;font-weight:650;white-space:nowrap;cursor:pointer;height:28px;padding:0 12px;font-size:11.5px',
  };
  const cls = (k) => (C && C[k] ? ` class="${C[k]}"` : '');
  const sty = (k, css) => (C && C[k] ? '' : ` style="${css}"`);
  let cur = 0;

  function wireCtas(step) {
    if (!step.next || !step.next.length) return;
    const root = document.getElementById('root');
    const nodes = root.querySelectorAll('button, a, [role="button"], [role="menuitem"], [data-cta]');
    nodes.forEach((el) => {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim().replace(/^[^A-Za-z0-9]+/, '');
      if (!step.next.some((label) => text.startsWith(label))) return;
      el.style.outline = `2px solid ${PRIMARY}`;
      el.style.outlineOffset = '2px';
      el.style.cursor = 'pointer';
      el.title = 'Click to continue';
      el.onclick = null;                 // the CTA's own handler would move the story a second time
      el.removeAttribute('onclick');
      el.removeAttribute('href');
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); go(cur + 1); }, { once: true });
    });
  }

  function go(i) {
    const steps = window.STEPS;
    cur = Math.max(0, Math.min(steps.length - 1, i));
    window.cur = cur;
    const s = steps[cur];
    s.render();
    if (s.after) s.after();
    wireCtas(s);
    const w = s.who || { initial: '', name: '', role: '' };
    const ins = Object.assign({ left: 16, right: 16 }, window.SCENARIO_INSETS || {});
    const left = s.outside ? 16 : ins.left;
    const right = s.outside ? 16 : ins.right;
    const first = cur === 0, last = cur === steps.length - 1;
    const off = 'opacity:.45;cursor:not-allowed';
    const prevStyle = C && C.prev ? (first ? ` style="${off}"` : '') : ` style="${S.btn};border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff${first ? ';' + off : ''}"`;
    const nextStyle = C && C.next ? (last ? ` style="${off}"` : '') : ` style="${S.btn};border:0;background:${PRIMARY};color:#fff${last ? ';' + off : ''}"`;
    document.getElementById('bar').innerHTML =
      `<div data-scenario-bar${cls('bar')} style="position:fixed;z-index:10000;bottom:16px;left:${left}px;right:${right}px;${C && C.bar ? '' : S.bar}">` +
      `<span style="display:inline-flex;align-items:center;gap:8px;flex-shrink:0"><span${cls('avatar')}${sty('avatar', S.avatar)}>${esc(w.initial)}</span>` +
      `<span style="line-height:1.2"><b${cls('name')}${sty('name', S.name)}>${esc(w.name)}</b><span${cls('sub')}${sty('sub', S.sub)}>${esc(w.role)}</span></span></span>` +
      `<div style="flex:1;min-width:0"><div${cls('eyebrow')}${sty('eyebrow', S.eyebrow)}>Step ${cur + 1} of ${steps.length} · ${esc(s.when)}</div>` +
      `<div${cls('title')}${sty('title', S.title)}>${s.title}</div></div>` +
      `<div style="display:flex;gap:6px;flex-shrink:0">` +
      `<button data-scenario="prev"${cls('prev')}${prevStyle} ${first ? 'disabled' : ''}>‹ Previous</button>` +
      `<button data-scenario="next"${cls('next')}${nextStyle} ${last ? 'disabled' : ''}>Next ›</button></div></div>`;
    const bar = document.getElementById('bar');
    bar.querySelector('[data-scenario="prev"]').onclick = () => go(cur - 1);
    bar.querySelector('[data-scenario="next"]').onclick = () => go(cur + 1);
    history.replaceState(null, '', '#step-' + (cur + 1));
  }

  window.go = go;
  document.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });
  const m = location.hash.match(/step-(\d+)/);
  go(m ? parseInt(m[1], 10) - 1 : 0);
})();
