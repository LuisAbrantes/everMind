const { test, expect, openApp, goTab, progress, seedAndReload, PROGRESS_KEY, KEY } = require('../support/fixtures');

test.describe('persistence', () => {
  test('progress survives reload (and a second reload)', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: /SIM, COMI/ }).click();
    const saved = await progress(page);
    for (let i = 0; i < 2; i++) {
      await page.reload();
      await page.locator('#screen h1').waitFor();
      expect(await progress(page)).toEqual(saved);
    }
    await expect(page.locator('#screen')).toContainText('1 / 5'); // Brain Baby 1/5
    await expect(page.locator('#screen')).toContainText('1 DIA'); // streak persisted too
  });

  test('app always reopens on Hoje (no URL routing)', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Cuidado');
    await page.reload();
    await expect(page.locator('#tabbar .tab[aria-current="page"]')).toContainText('Hoje');
  });

  test('stored progress is honored (stage shown)', async ({ page }) => {
    await openApp(page);
    const p = await progress(page);
    await seedAndReload(page, {
      [PROGRESS_KEY]: { ...p, totalCompletedChallenges: 25, highestBrainStageAchieved: 'TEEN', growthPoints: 250 },
    });
    await expect(page.locator('#screen')).toContainText('Brain Teen');
    expect((await progress(page)).growthPoints).toBe(250);
  });

  test('corrupted storage does not crash the app, and is backed up gently', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
      localStorage.setItem('evermind:evermind_habits_state_v1', '{not json');
      localStorage.setItem('evermind:evermind_user_progress_v1', '{"totalCompletedChallenges":"x"}');
    });
    await page.reload();
    await expect(page.locator('#tabbar .tab')).not.toHaveCount(0);
    await expect(page.locator('#screen h1').first()).toBeVisible();
    await goTab(page, 'Cuidado');
    await expect(page.locator('#screen h1').first()).toContainText('Cuide de Você');
    expect((await progress(page)).totalCompletedChallenges).toBe(0);
    // unreadable value is kept as a backup, not silently destroyed
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys.some((k) => /backup/.test(k)), `keys: ${keys.join(',')}`).toBe(true);
  });

  test('a new day resets daily habits but keeps accumulated totals', async ({ page }) => {
    await openApp(page, { time: '2026-08-19T12:00:00-03:00' });
    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: /SIM, COMI/ }).click();
    await goTab(page, 'Corpo');
    await page.getByRole('button', { name: /MARCAR COMO CONCLUÍDO/ }).click();

    await page.clock.setSystemTime(new Date('2026-08-20T09:00:00-03:00'));
    await page.reload();
    await page.locator('#screen h1').waitFor();
    await goTab(page, 'Cuidado');
    await expect(page.getByRole('button', { name: /SIM, COMI HOJE/ })).toBeEnabled();
    await goTab(page, 'Corpo');
    await expect(page.getByRole('button', { name: /MARCAR COMO CONCLUÍDO/ })).toBeVisible();
    const p = await progress(page);
    expect(p.totalCompletedChallenges).toBe(2);
    expect(p.growthPoints).toBe(20);
    // doing something on the new day continues the streak
    await page.getByRole('button', { name: /MARCAR COMO CONCLUÍDO/ }).click();
    const p2 = await progress(page);
    expect(p2.currentStreak).toBe(2);
    expect(p2.totalActiveDays).toBe(2);
    expect(p2.totalCompletedChallenges).toBe(3);
  });
});
