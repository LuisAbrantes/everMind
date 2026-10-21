const { test, expect, openApp, goTab, progress } = require('../support/fixtures');

test.use({ serviceWorkers: 'allow' });

test('offline reload works after first visit (service worker, Chromium)', async ({ page, context }) => {
  await openApp(page, { clock: false });
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // wait until the SW is active and has cached the shell
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) throw new Error('no active service worker');
  });
  await expect
    .poll(() => page.evaluate(async () => {
      const keys = await caches.keys();
      if (!keys.length) return 0;
      const c = await caches.open(keys[0]);
      return (await c.keys()).length;
    }), { timeout: 15_000 })
    .toBeGreaterThan(30);

  // change state while online so we can see it offline
  await goTab(page, 'Cuidado');
  await page.getByRole('button', { name: /ADICIONAR COPO DE ÁGUA/ }).click();

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#tabbar .tab')).not.toHaveCount(0);
  await expect(page.locator('#screen h1').first()).toBeVisible();
  // styles + scripts came from cache: layout is real, interaction works
  const display = await page.evaluate(() => getComputedStyle(document.querySelector('#tabbar')).display);
  expect(display).not.toBe('inline');
  await goTab(page, 'Cuidado');
  await expect(page.getByText('1 COPO', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /ADICIONAR COPO DE ÁGUA/ }).click();
  await expect(page.getByText('2 COPOS', { exact: true })).toBeVisible();

  // a fresh navigation to the root path also works offline
  await page.goto('/');
  await expect(page.locator('#tabbar .tab')).not.toHaveCount(0);
  // every screen renders offline
  for (const l of ['Mente', 'Corpo', 'Afeto', 'Descobrir', 'Semana']) {
    await goTab(page, l);
    await expect(page.locator('#screen h1, #screen h2').first()).toBeVisible();
  }
  await context.setOffline(false);
});

test('offline pill is calm: hidden online, visible offline, no red', async ({ page, context }) => {
  await openApp(page, { clock: false });
  await expect(page.locator('#offline-pill')).toBeHidden();
  await context.setOffline(true);
  await expect(page.locator('#offline-pill')).toBeVisible();
  await expect(page.locator('#offline-pill')).toContainText('tudo continua funcionando');
  const color = await page.locator('#offline-pill').evaluate((e) => getComputedStyle(e).backgroundColor + getComputedStyle(e).color);
  expect(color).not.toMatch(/rgb\((1[5-9]\d|2\d\d), ?\d{1,2}, ?\d{1,2}\)/);
  await context.setOffline(false);
  await expect(page.locator('#offline-pill')).toBeHidden();
});
