const { test, expect, openApp, goTab, progress, habits, readJson, KEY } = require('../support/fixtures');

const WALK = /MARCAR COMO CONCLUÍDO/;
const WALK_DONE = /Caminhada de hoje feita|CAMINHADA CONCLUÍDA/; // done-state button label
const WATER = /ADICIONAR COPO DE ÁGUA/;
const FRUIT = /SIM, COMI|Fruta ou vegetal de hoje registrado/;
const SLEEP = /PREPARAR PARA DORMIR|Preparo para dormir de hoje feito/;
const CALL = /JÁ LIGUEI|Ligação de hoje feita/;

test.describe('Body Movement', () => {
  test('timer start / pause / resume / reset', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Corpo');
    const timer = page.locator('#body-movement-timer');
    await expect(timer).toHaveText('00:00');
    await expect(page.getByRole('button', { name: /ZERAR|RECOMEÇAR/ })).toHaveCount(0);

    await page.getByRole('button', { name: /INICIAR TEMPO/ }).click();
    await page.clock.runFor(3100);
    await expect(timer).toHaveText(/^00:0[3-4]$/);

    await page.getByRole('button', { name: /PAUSAR/ }).click();
    const paused = await timer.innerText();
    await page.clock.runFor(5000);
    await expect(timer).toHaveText(paused);

    await page.getByRole('button', { name: /INICIAR TEMPO/ }).click(); // resume
    await page.clock.runFor(2000);
    await expect(timer).not.toHaveText(paused);

    await page.getByRole('button', { name: /ZERAR|RECOMEÇAR/ }).click();
    await expect(timer).toHaveText('00:00');
    await page.clock.runFor(3000);
    await expect(timer).toHaveText('00:00'); // idle: not ticking
    await expect(page.getByRole('button', { name: /INICIAR TEMPO/ })).toBeVisible();
  });

  test('timer survives tab switches without duplicating intervals', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Corpo');
    await page.getByRole('button', { name: /INICIAR TEMPO/ }).click();
    await goTab(page, 'Cuidado');
    await goTab(page, 'Corpo');
    await page.clock.runFor(10_000);
    const secs = Number((await page.locator('#body-movement-timer').innerText()).split(':')[1]);
    expect(secs).toBeGreaterThanOrEqual(9);
    expect(secs).toBeLessThanOrEqual(11); // ~20 if an interval were duplicated
  });

  test('mark walk done: +1 challenge / +10 points once per day, persisted', async ({ page }) => {
    await openApp(page);
    const before = await progress(page);
    await goTab(page, 'Corpo');
    await page.getByRole('button', { name: WALK }).click();
    await expect(page.getByRole('button', { name: WALK_DONE })).toBeVisible();
    await expect(page.getByText(/Suas pernas e coração agradecem/)).toBeVisible();
    let after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1);
    expect(after.growthPoints).toBe(before.growthPoints + 10);
    expect(after.currentStreak).toBe(1);

    // second tap the same day: no extra reward (ADR-0009)
    await page.getByRole('button', { name: WALK_DONE }).click({ force: true });
    after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1);

    await page.reload();
    await goTab(page, 'Corpo');
    await expect(page.getByRole('button', { name: WALK_DONE })).toBeVisible();
  });
});

test.describe('Self-care', () => {
  test('water: glasses show immediately, reward (+1 / +10) comes once when the 4-glass goal is met', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Cuidado');
    const before = await progress(page);
    const add = page.getByRole('button', { name: WATER });

    await add.click();
    await expect(page.getByText('1 COPO', { exact: true })).toBeVisible();
    await expect(page.locator('.glass[data-filled="true"]')).toHaveCount(1);
    expect((await progress(page)).totalCompletedChallenges).toBe(before.totalCompletedChallenges); // not yet

    for (let i = 0; i < 3; i++) await add.click();
    await expect(page.getByText('4 COPOS', { exact: true })).toBeVisible();
    let after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1);
    expect(after.growthPoints).toBe(before.growthPoints + 10);
    expect((await habits(page)).selfCare.isWaterGoalMet).toBe(true);

    await add.click(); // 5th glass: shown, but no more reward
    await expect(page.getByText('5 COPOS', { exact: true })).toBeVisible();
    after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1);

    await page.reload();
    await goTab(page, 'Cuidado');
    await expect(page.locator('.glass[data-filled="true"]')).toHaveCount(5);
  });

  test('fruit & sleep are idempotent (+1 / +10 each, only once)', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Cuidado');
    const before = await progress(page);

    const fruit = page.getByRole('button', { name: FRUIT });
    await fruit.click();
    await expect(page.getByText('✓ INCLUÍDO')).toBeVisible();
    await expect(fruit).toBeDisabled();
    await fruit.click({ force: true });

    const sleep = page.getByRole('button', { name: SLEEP });
    await sleep.click();
    await expect(page.getByText('✓ RITUAL CONFIRMADO')).toBeVisible();
    await expect(sleep).toBeDisabled();
    await sleep.click({ force: true });

    const after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 2);
    expect(after.growthPoints).toBe(before.growthPoints + 20);
    expect((await habits(page)).selfCare.totalSelfCareActions).toBe(2);

    await page.reload();
    await goTab(page, 'Cuidado');
    await expect(page.getByText('✓ INCLUÍDO')).toBeVisible();
    await expect(page.getByText('✓ RITUAL CONFIRMADO')).toBeVisible();
    expect((await progress(page)).growthPoints).toBe(before.growthPoints + 20);
  });
});

test.describe('cross-screen state regression (water in Cuidado, walk in Corpo, reload)', () => {
  test('water in Cuidado then walk in Corpo then reload: both persisted', async ({ page }) => {
    await openApp(page);
    const before = await progress(page);

    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: WATER }).click();
    await expect(page.getByText('1 COPO', { exact: true })).toBeVisible();

    await goTab(page, 'Corpo');
    await page.getByRole('button', { name: WALK }).click();
    await expect(page.getByRole('button', { name: WALK_DONE })).toBeVisible();

    // in-session: coming back to Cuidado must still show the glass (stale-state bug)
    await goTab(page, 'Cuidado');
    await expect(page.getByText('1 COPO', { exact: true })).toBeVisible();

    const h = await habits(page);
    expect(h.selfCare.waterGlassesCount, 'water count in storage').toBe(1);
    expect(h.movement.todayWalkCompleted, 'walk flag in storage').toBe(true);
    expect(h.movement.totalWalkSessions).toBe(1);

    await page.reload();
    await page.locator('#screen h1').waitFor();
    const h2 = await habits(page);
    expect(h2.selfCare.waterGlassesCount).toBe(1);
    expect(h2.movement.todayWalkCompleted).toBe(true);
    const after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1); // walk only; water not at goal yet
    expect(after.growthPoints).toBe(before.growthPoints + 10);

    await goTab(page, 'Cuidado');
    await expect(page.getByText('1 COPO', { exact: true })).toBeVisible();
    await goTab(page, 'Corpo');
    await expect(page.getByRole('button', { name: WALK_DONE })).toBeVisible();
  });

  test('reverse order: walk, then water up to the goal, then reload', async ({ page }) => {
    await openApp(page);
    const before = await progress(page);
    await goTab(page, 'Corpo');
    await page.getByRole('button', { name: WALK }).click();
    await goTab(page, 'Cuidado');
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: WATER }).click();
    await goTab(page, 'Corpo');
    await expect(page.getByRole('button', { name: WALK_DONE })).toBeVisible();
    await page.reload();
    await page.locator('#screen h1').waitFor();
    const h = await habits(page);
    expect(h.movement.todayWalkCompleted).toBe(true);
    expect(h.selfCare).toMatchObject({ waterGlassesCount: 4, isWaterGoalMet: true });
    expect((await progress(page)).totalCompletedChallenges).toBe(before.totalCompletedChallenges + 2);
  });

  test('mixed pillars (walk, fruit, call, water x1) all survive a reload', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Corpo');
    await page.getByRole('button', { name: WALK }).click();
    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: FRUIT }).click();
    await page.getByRole('button', { name: WATER }).click();
    await goTab(page, 'Afeto');
    await page.getByRole('button', { name: CALL }).click();
    await goTab(page, 'Corpo');
    await expect(page.getByRole('button', { name: WALK_DONE })).toBeVisible();

    await page.reload();
    await page.locator('#screen h1').waitFor();
    const h = await habits(page);
    expect(h.movement.todayWalkCompleted).toBe(true);
    expect(h.selfCare).toMatchObject({ waterGlassesCount: 1, fruitVeggieConfirmed: true });
    const social = await readJson(page, KEY('evermind_social_state_v1'));
    expect(social.isConnectionCompletedToday).toBe(true);
    const p = await progress(page);
    expect(p.totalCompletedChallenges).toBe(3); // walk + fruit + call
    expect(p.growthPoints).toBe(30);
    expect(p.pillarTotals).toMatchObject({ MOVEMENT: 1, SELFCARE: 1, CONNECTION: 1 });
  });
});

test.describe('Social connection', () => {
  test('register call (+1 / +10, once per day, persisted) and schedule reminder', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Afeto');
    const before = await progress(page);
    await page.getByRole('button', { name: CALL }).click();
    await expect(page.getByRole('button', { name: /Ligação de hoje feita/ })).toBeVisible();
    await expect(page.getByText('Que gesto lindo e carinhoso!')).toBeVisible();
    let after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1);
    expect(after.growthPoints).toBe(before.growthPoints + 10);

    await page.getByRole('button', { name: CALL }).click({ force: true }); // again: idempotent
    after = await progress(page);
    expect(after.totalCompletedChallenges).toBe(before.totalCompletedChallenges + 1);

    await page.getByRole('button', { name: /LEMBRAR-ME MAIS TARDE|LEMBRETE ATIVADO/ }).click();
    await expect(page.getByText(/LEMBRETE ATIVADO/)).toBeVisible();

    await page.reload();
    await goTab(page, 'Afeto');
    await expect(page.getByRole('button', { name: /Ligação de hoje feita/ })).toBeVisible();
    await expect(page.getByText('1 momentos de carinho')).toBeVisible();
  });
});
