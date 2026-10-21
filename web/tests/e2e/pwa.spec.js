const { test, expect, openApp } = require('../support/fixtures');

function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

test.describe('PWA assets', () => {
  test('manifest is linked, parses, and every icon exists with the declared size', async ({ page, request }) => {
    await openApp(page);
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();
    const res = await request.get(new URL(href, page.url()).toString());
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest).toMatchObject({ short_name: 'everMind', display: 'standalone' });
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    expect(manifest.icons.some((i) => i.sizes === '192x192')).toBe(true);
    expect(manifest.icons.some((i) => i.sizes === '512x512')).toBe(true);
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);

    for (const icon of manifest.icons) {
      const r = await request.get(new URL(icon.src, new URL(href, page.url())).toString());
      expect(r.status(), icon.src).toBe(200);
      expect(r.headers()['content-type'], icon.src).toContain(icon.type);
      if (icon.type === 'image/png') {
        const [w, h] = icon.sizes.split('x').map(Number);
        expect(pngSize(await r.body()), icon.src).toEqual({ w, h });
      }
    }
    const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect((await request.get(new URL(apple, page.url()).toString())).status()).toBe(200);
  });

  test('every file listed in the service-worker app shell exists', async ({ page, request }) => {
    await openApp(page);
    const src = await (await request.get(new URL('sw.js', page.url()).toString())).text();
    const shell = [...src.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
    expect(shell.length).toBeGreaterThan(30);
    const missing = [];
    for (const f of shell) {
      const r = await request.get(new URL(f, page.url()).toString());
      if (r.status() !== 200) missing.push(f);
    }
    expect(missing).toEqual([]);
  });

  test('every <script>/<link rel=stylesheet> of index.html is in the service-worker app shell (offline gets the new games)', async ({ page, request }) => {
    await openApp(page);
    const html = await (await request.get(new URL('index.html', page.url()).toString())).text();
    const src = await (await request.get(new URL('sw.js', page.url()).toString())).text();
    const shell = new Set([...src.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]));
    const used = [
      ...[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]),
    ];
    expect(used.length).toBeGreaterThan(40);
    expect(used.filter((f) => !shell.has(f))).toEqual([]);
    for (const f of ['js/games/game-utils.js', 'js/games/pairs-game-engine.js', 'js/games/proverbs-game-engine.js', 'js/games/market-game-engine.js', 'js/games/order-game-engine.js']) {
      expect(used, f).toContain(f);
      expect(shell.has(f), f).toBe(true);
    }
    // the helper loads before every engine that uses it, and the engines before the screens
    const order = (f) => html.indexOf(f);
    expect(order('game-utils.js')).toBeLessThan(order('pairs-game-engine.js'));
    expect(order('order-game-engine.js')).toBeLessThan(order('components.js'));
    expect(order('order-game-engine.js')).toBeLessThan(order('brain-gym.js'));
  });

  test('the cache name was bumped (evermind-YYYY-MM-DD<letter>) for this release', async ({ page, request }) => {
    await openApp(page);
    const src = await (await request.get(new URL('sw.js', page.url()).toString())).text();
    const name = (src.match(/CACHE_NAME = '([^']+)'/) || [])[1];
    expect(name).toMatch(/^evermind-\d{4}-\d{2}-\d{2}[a-z]$/);
    expect(name).not.toBe('evermind-2026-10-21c');
  });

  test('every script/stylesheet referenced by index.html loads (no 404s)', async ({ page }) => {
    const bad = [];
    page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
    await openApp(page);
    await page.waitForLoadState('networkidle');
    expect(bad).toEqual([]);
  });
});

test.describe('external fonts blocked', () => {
  test.use({ allowResourceErrors: true });
  test('app still renders and is usable when Google Fonts requests fail', async ({ page }) => {
    const blocked = [];
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => { blocked.push(route.request().url()); route.abort(); });
    await openApp(page);
    await expect(page.locator('#tabbar .tab')).not.toHaveCount(0);
    await expect(page.locator('#screen h1').first()).toBeVisible();
    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(font).toMatch(/sans-serif|system-ui|-apple-system|Segoe|Roboto|Geist/i);
    await page.locator('#tabbar .tab', { hasText: 'Mente' }).click();
    await expect(page.locator('#screen h1').first()).toContainText('Ginástica Cerebral');
    // text is actually painted with non-zero size
    const box = await page.locator('#screen h1').first().boundingBox();
    expect(box.width).toBeGreaterThan(50);
  });
});

test('the app loads fonts/scripts only from its own origin (offline-first, private)', async ({ page, baseURL }) => {
  const foreign = [];
  page.on('request', (r) => {
    const u = r.url();
    if (/^https?:/.test(u) && !u.startsWith(baseURL)) foreign.push(u);
  });
  await openApp(page);
  await page.waitForLoadState('networkidle');
  expect(foreign).toEqual([]);
});
