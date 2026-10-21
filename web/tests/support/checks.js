const { expect } = require('@playwright/test');

/** Lets finite CSS animations (card flip, reveal) finish: mid-flip boxes are not final geometry. */
async function settleAnimations(page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => null))));
}

/** No horizontal overflow of the document, #screen, or any visible element. */
async function expectNoHorizontalOverflow(page, label = '') {
  await settleAnimations(page);
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    if (document.documentElement.scrollWidth > vw + 1)
      out.push(`document scrollWidth ${document.documentElement.scrollWidth} > ${vw}`);
    const screen = document.getElementById('screen');
    if (screen && screen.scrollWidth > screen.clientWidth + 1)
      out.push(`#screen scrollWidth ${screen.scrollWidth} > clientWidth ${screen.clientWidth}`);
    const app = document.getElementById('app');
    const appRect = app.getBoundingClientRect();
    for (const el of document.querySelectorAll('#app *')) {
      if (el.closest('.chip-row')) continue; // intentionally horizontally scrollable
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > appRect.right + 1.5 || r.left < appRect.left - 1.5) {
        out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} "${(el.textContent || '').trim().slice(0, 30)}" [${Math.round(r.left)}..${Math.round(r.right)}] vs app [${Math.round(appRect.left)}..${Math.round(appRect.right)}]`);
        if (out.length > 5) break;
      }
    }
    return out;
  });
  expect(res, `horizontal overflow ${label}`).toEqual([]);
}

/** Every visible button / tab >= 44x44 CSS px. */
async function expectTapTargets(page, label = '') {
  await settleAnimations(page);
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('button, [role="tab"], a[href]')) {
      if (el.closest('.chip-row') && false) continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (r.width < 44 - 0.5 || r.height < 44 - 0.5)
        out.push(`${el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30)}: ${r.width.toFixed(1)}x${r.height.toFixed(1)}`);
    }
    return out;
  });
  expect(small, `tap targets < 44px ${label}`).toEqual([]);
}

const PUNITIVE = /perdeu|falhou|errou|zerou|atrasad[oa]|puni[cç][aã]o|\bperda\b|\bfalta\b|\bfracass|\bgame over\b/i;

/** Visible text must have no punitive words, and no red-ish computed colors. */
async function expectAntiGuilt(page, label = '') {
  const res = await page.evaluate(() => {
    const text = document.body.innerText;
    const reds = [];
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)|color\(srgb ([^)]+)\)/);
      if (!m) return null;
      if (m[2]) {
        const [r, g, b, , a] = m[2].replace('/', ' ').split(/\s+/).map(Number);
        return { r: r * 255, g: g * 255, b: b * 255, a: a === undefined ? 1 : a };
      }
      const p = m[1].split(/[ ,\/]+/).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
    };
    const isRed = (c) => {
      const x = parse(c);
      if (!x || x.a < 0.2) return false;
      return x.r >= 150 && x.g <= 100 && x.b <= 100 && x.r - Math.max(x.g, x.b) >= 70;
    };
    for (const el of document.querySelectorAll('#app *, #toast-layer *')) {
      const cs = getComputedStyle(el);
      for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'outlineColor', 'fill', 'stroke']) {
        if (isRed(cs[prop])) reds.push(`${el.tagName}.${String(el.className).slice(0, 30)} ${prop}=${cs[prop]}`);
      }
    }
    return { text, reds: reds.slice(0, 8) };
  });
  const hit = res.text.match(PUNITIVE);
  expect(hit && hit[0], `punitive word on screen ${label}`).toBeNull();
  expect(res.reds, `red computed colors ${label}`).toEqual([]);
}

/**
 * WCAG 2.5.3 (label in name): every button with an aria-label must still contain
 * its visible text, and every pair/step control that changes label must carry a
 * stable data-focus-key so keyboard focus survives the re-render.
 */
async function expectLabelInName(page, label = '') {
  const bad = await page.evaluate(() => {
    const norm = (t) => String(t || '').replace(/[\s\u00a0]+/g, ' ').trim().toLowerCase();
    const out = [];
    for (const el of document.querySelectorAll('#screen button[aria-label]')) {
      const visible = norm(el.textContent);
      if (visible && !norm(el.getAttribute('aria-label')).includes(visible)) {
        out.push(`"${el.getAttribute('aria-label')}" hides visible text "${visible}"`);
      }
    }
    for (const el of document.querySelectorAll('#screen .pair-card, #screen .order-step')) {
      if (!el.getAttribute('data-focus-key')) out.push(`missing data-focus-key on ${el.className}`);
    }
    return out;
  });
  expect(bad, `label-in-name ${label}`).toEqual([]);
}

module.exports = { expectNoHorizontalOverflow, expectTapTargets, expectAntiGuilt, expectLabelInName, PUNITIVE };
