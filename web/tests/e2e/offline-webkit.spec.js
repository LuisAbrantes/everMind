const { test, expect } = require('@playwright/test');
const { start } = require('../support/server');

// context.setOffline não é confiável no WebKit do Playwright; aqui o servidor é
// derrubado de verdade, então só o service worker consegue servir a página.
test.use({ serviceWorkers: 'allow' });

test('offline real (servidor fora do ar): recarrega e navega pelo cache (WebKit)', async ({ page }) => {
  const srv = await start();
  await page.addInitScript(() => {
    try {
      localStorage.setItem('evermind:onboarding_done', 'true');
      localStorage.setItem('evermind:settings_sound', 'false');
    } catch (e) { /* ignore */ }
  });
  try {
    await page.goto(srv.url + '/index.html');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect
      .poll(() => page.evaluate(async () => {
        const keys = await caches.keys();
        return keys.length ? (await (await caches.open(keys[0])).keys()).length : 0;
      }), { timeout: 15_000 })
      .toBeGreaterThan(30);
    await page.reload(); // passa a ser controlada pelo service worker
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  } catch (e) {
    await srv.kill();
    throw e;
  }

  await srv.kill();
  await page.reload({ timeout: 15_000 });
  await expect(page.locator('#screen h1').first()).toBeVisible();
  await page.locator('#tabbar button').nth(1).click();
  await expect(page.locator('#screen h1').first()).toContainText('Ginástica Cerebral');
});
