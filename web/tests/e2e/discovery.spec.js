const { test, expect, openApp, goTab, tab, progress, readJson, KEY } = require('../support/fixtures');

test.describe('Discovery', () => {
  test('chips: active chip is pressed, fully visible in the scroller, height >= 44px', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Descobrir');
    const chips = page.locator('.chip-row .chip');
    const n = await chips.count();
    expect(n).toBe(8); // Todas + 7 categories
    await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');

    for (let i = 0; i < n; i++) {
      await page.locator('.chip-row .chip').nth(i).scrollIntoViewIfNeeded();
      await page.locator('.chip-row .chip').nth(i).click();
      const active = page.locator('.chip-row .chip[aria-pressed="true"]');
      await expect(active).toHaveCount(1);
      await expect(active).toBeVisible();
      // let scrollIntoView (rAF) settle, then check it is inside the scroller viewport
      await expect
        .poll(() =>
          page.evaluate(() => {
            const a = document.querySelector('.chip-row .chip[aria-pressed="true"]').getBoundingClientRect();
            const row = document.querySelector('.chip-row').getBoundingClientRect();
            return a.left >= row.left - 1 && a.right <= row.right + 1 && a.left >= -0.5 && a.right <= window.innerWidth + 1;
          })
        )
        .toBe(true);
      expect((await active.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    for (const h of await chips.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) {
      expect(h).toBeGreaterThanOrEqual(44);
    }
  });

  test('category filter shows an item of that category', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Descobrir');
    const cats = await page.evaluate(() => EM.domain.discoveryEngine.getCategories().map((c) => c.label));
    expect(cats).toHaveLength(7);
    for (const label of cats) {
      await page.locator('.chip-row .chip', { hasText: label }).click();
      await expect(page.locator('#screen .card').filter({ hasText: /DICA PRÁTICA/ }).first()).toContainText(new RegExp(label, 'i'));
    }
  });

  test('"Surpreender-me" rolls, complete awards +1 / +10 once and persists', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Descobrir');
    await page.getByRole('button', { name: /SURPREENDER-ME AGORA/ }).click();
    const before = await progress(page);
    const btn = page.getByRole('button', { name: /CONCLUÍ ESTA DESCOBERTA|Descoberta de hoje feita/ });
    await btn.click();
    await expect(page.getByRole('button', { name: /Descoberta de hoje feita/ })).toBeVisible();
    await expect(btn).toBeDisabled();
    await btn.click({ force: true });
    const after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1);
    expect(after.growthPoints).toBe(before.growthPoints + 10);
    expect(await readJson(page, KEY('evermind_completed_discoveries_count'))).toBe(1);

    await page.reload();
    await goTab(page, 'Descobrir');
    await expect(page.getByText('1 novos horizontes explorados')).toBeVisible();
  });

  test('Home "Surpreender-me com um hobby" opens Discovery', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: /SURPREENDER-ME COM UM HOBBY/ }).click();
    await expect(page.locator('#screen h1').first()).toContainText('Descubra Algo Novo');
    await expect(tab(page, 'Mais')).toHaveAttribute('aria-current', 'page');
  });
});
