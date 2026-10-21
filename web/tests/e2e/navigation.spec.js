const { test, expect, openApp, goTab, tab, TABS, progress } = require('../support/fixtures');

test.describe('navigation', () => {
  test('bottom bar has the primary tabs and all 7 product screens are reachable', async ({ page }) => {
    await openApp(page);
    const tabs = page.locator('#tabbar .tab');
    expect(await tabs.count()).toBeGreaterThanOrEqual(5);
    await expect(tab(page, 'Hoje')).toHaveAttribute('aria-current', 'page');

    for (const t of TABS) {
      await goTab(page, t.label);
      await expect(page.locator('#screen h1, #screen h2').first()).toContainText(t.h);
      // exactly one bottom tab is marked current (Afeto/Descobrir/Semana live under "Mais")
      await expect(page.locator('#tabbar .tab[aria-current="page"]')).toHaveCount(1);
    }
    // Home is reachable again
    await goTab(page, 'Hoje');
    await expect(page.locator('#screen h1').first()).toContainText(/Bom dia|Boa tarde|Boa noite/);
  });

  test('"Mais" lists Afeto, Descobrir, Semana (and Ajustes) and sub-screens have a Voltar button', async ({ page }) => {
    await openApp(page);
    await tab(page, 'Mais').click();
    for (const l of ['Afeto', 'Descobrir', 'Semana']) await expect(page.locator('.more-item', { hasText: l })).toBeVisible();
    await page.locator('.more-item', { hasText: 'Afeto' }).click();
    await page.getByRole('button', { name: 'Voltar para Mais' }).click();
    await expect(page.locator('#screen h1').first()).toContainText('Mais');
  });

  test('keyboard arrows move between tabs', async ({ page }) => {
    await openApp(page);
    await tab(page, 'Hoje').focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, 'Mente')).toHaveAttribute('aria-current', 'page');
    await page.keyboard.press('End');
    await expect(tab(page, 'Mais')).toHaveAttribute('aria-current', 'page');
  });

  test('"INÍCIO" buttons return to Home from inner screens', async ({ page }) => {
    await openApp(page);
    for (const label of ['Corpo', 'Cuidado', 'Afeto', 'Descobrir']) {
      await goTab(page, label);
      await page.getByRole('button', { name: /INÍCIO/ }).click();
      await expect(tab(page, 'Hoje')).toHaveAttribute('aria-current', 'page');
    }
  });

  test('first run starts from zero (no demo profile): Brain Baby, 0 challenges, streak 0', async ({ page }) => {
    await openApp(page);
    const p = await progress(page);
    expect(p).toMatchObject({ totalCompletedChallenges: 0, highestBrainStageAchieved: 'BABY', currentStreak: 0, growthPoints: 0 });
    await expect(page.locator('#screen')).toContainText('Brain Baby');
    await expect(page.locator('#screen')).toContainText('0 / 3 CONCLUÍDOS');
  });

  test('document title follows the screen', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Mente');
    await expect(page).toHaveTitle(/Mente/);
  });
});

test.describe('onboarding (first run)', () => {
  test('appears once, saves the name, greets by name, never returns; can be skipped', async ({ page }) => {
    await openApp(page, { onboarding: true });
    const dlg = page.getByRole('dialog', { name: /Boas-vindas/ });
    await expect(dlg).toBeVisible();
    await expect(dlg).toContainText('Passo 1 de 3');
    await dlg.getByRole('button', { name: 'Continuar' }).click();
    await dlg.locator('input').fill('Dona Lúcia');
    await dlg.getByRole('button', { name: 'Continuar' }).click();
    await expect(dlg).toContainText('Passo 3 de 3');
    await dlg.getByRole('button', { name: 'Começar' }).click();
    await expect(dlg).toHaveCount(0);
    await expect(page.locator('#screen h1').first()).toContainText('Dona Lúcia');
    await page.reload();
    await page.locator('#screen h1').first().waitFor();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#screen h1').first()).toContainText('Dona Lúcia');
  });

  test('"Pular" skips without storing a name', async ({ page }) => {
    await openApp(page, { onboarding: true });
    await page.getByRole('button', { name: 'Pular' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#screen h1').first()).toContainText(/Bom dia|Boa tarde|Boa noite/);
    expect(await page.evaluate(() => localStorage.getItem('evermind:evermind_user_name'))).toBeNull();
  });
});
