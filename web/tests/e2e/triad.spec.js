const { test, expect, openApp, progress, tab } = require('../support/fixtures');

test.describe('Daily Triad', () => {
  test('2026-08-19 -> SELFCARE, CONNECTION, MIND (hash 1161874306), shown in that order', async ({ page }) => {
    await openApp(page, { time: '2026-08-19T12:00:00-03:00' });

    expect(await page.evaluate(() => EM.domain.dailyTriadCoordinator.javaStringHash('2026-08-19'))).toBe(1161874306);
    const triad = await page.evaluate(() =>
      EM.domain.dailyTriadCoordinator.generateTriadForDate('2026-08-19', []).map((c) => ({ pillar: c.pillar, title: c.title }))
    );
    expect(triad.map((c) => c.pillar)).toEqual(['SELFCARE', 'CONNECTION', 'MIND']);

    // the screen shows exactly those, in that order, for the mocked "today"
    await expect(page.locator('#screen')).toContainText(/1\. Autocuidado[\s\S]*2\. Conexão[\s\S]*3\. Mente/);
    for (const [i, c] of triad.entries()) {
      await expect(page.getByRole('button', { name: new RegExp(`desafio ${i + 1} de 3.*${c.title.replace(/[()]/g, '.')}`) })).toBeVisible();
    }
  });

  test('is deterministic across reloads and always 3 distinct pillars (365 dates)', async ({ page }) => {
    await openApp(page);
    const a = await page.locator('#screen').innerText();
    await page.reload();
    await page.locator('#screen h1').waitFor();
    expect(await page.locator('#screen').innerText()).toBe(a);

    const bad = await page.evaluate(() => {
      const out = [];
      for (let d = 0; d < 365; d++) {
        const dt = new Date(2026, 0, 1 + d);
        const date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        const t1 = EM.domain.dailyTriadCoordinator.generateTriadForDate(date, []);
        const t2 = EM.domain.dailyTriadCoordinator.generateTriadForDate(date, []);
        if (t1.length !== 3 || new Set(t1.map((c) => c.pillar)).size !== 3) out.push(date);
        if (JSON.stringify(t1) !== JSON.stringify(t2)) out.push(date + ' nondeterministic');
      }
      return out;
    });
    expect(bad).toEqual([]);
  });

  test('a challenge is completed only by doing the real activity, never by opening it', async ({ page }) => {
    await openApp(page, { time: '2026-08-19T12:00:00-03:00' });
    await expect(page.getByText('0 / 3 CONCLUÍDOS')).toBeVisible();
    const before = await progress(page);

    // Challenge 1 (SELFCARE, fruit): opening it only navigates
    await page.getByRole('button', { name: /desafio 1 de 3/ }).click();
    expect((await progress(page)).totalCompletedChallenges).toBe(before.totalCompletedChallenges);
    await expect(tab(page, 'Cuidado')).toHaveAttribute('aria-current', 'page');

    // do the real thing: confirm fruit
    await page.getByRole('button', { name: /SIM, COMI HOJE/ }).click();
    expect((await progress(page)).totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1);
    await tab(page, 'Hoje').click();
    await expect(page.getByText('1 / 3 CONCLUÍDOS')).toBeVisible();
    await expect(page.getByRole('button', { name: /desafio 1 de 3.*já concluído/ })).toBeVisible();
  });
});
