const { test, expect, openApp, goTab, progress } = require('../support/fixtures');

test.describe('Weekly summary', () => {
  test('first run: affirmative, no zeros-shaming, lists the 5 badges', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Semana');
    const screen = page.locator('#screen');
    await expect(screen).toContainText('Minha Semana');
    await expect(screen).toContainText('Vitórias da Sua Semana');
    for (const name of ['Primeiros Passos', 'Semana Ativa', 'Mente em Movimento', 'Amigo Presente', 'Caminhante']) {
      await expect(screen).toContainText(name);
    }
    await expect(screen).toContainText('Que alegria ter você aqui');
  });

  test('reflects real activity of the last 7 days (not placeholder numbers)', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Corpo');
    await page.getByRole('button', { name: /MARCAR COMO CONCLUÍDO/ }).click();
    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: /SIM, COMI/ }).click();
    await goTab(page, 'Semana');
    await expect(page.locator('#screen')).toContainText('Que ótimo'); // 1..4 activities band
    const p = await progress(page);
    expect(p.completionLog.map((e) => e.p).sort()).toEqual(['MOVEMENT', 'SELFCARE']);
  });

  test('"share" never throws and gives gentle feedback', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    // desktop engines expose navigator.share (native sheet, no DOM feedback): exercise the clipboard fallback
    await page.addInitScript(() => { try { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); } catch (e) {} });
    await openApp(page);
    await goTab(page, 'Semana');
    await page.getByRole('button', { name: /COMPARTILHAR/ }).click();
    await expect(page.locator('#toast-layer .toast').first()).toBeVisible();
  });
});
