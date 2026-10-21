const base = require('@playwright/test');
const { start } = require('./server');

const FIXED_TIME = '2026-08-19T12:00:00-03:00';
const KEY = (k) => `evermind:${k}`;
const PROGRESS_KEY = KEY('evermind_user_progress_v1');
const HABITS_KEY = KEY('evermind_habits_state_v1');

const test = base.test.extend({
  // One static server per worker, random port.
  server: [
    async ({}, use) => {
      const s = await start();
      await use(s);
      await s.close();
    },
    { scope: 'worker' },
  ],
  baseURL: async ({ server }, use) => use(server.url),

  // When true, "Failed to load resource" console errors are tolerated
  // (tests that deliberately block or fail requests).
  allowResourceErrors: [false, { option: true }],

  // `page` that records console errors / uncaught exceptions and fails the
  // test at the end if any occurred.
  page: async ({ page, allowResourceErrors }, use) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const text = m.text();
      if (allowResourceErrors && /Failed to load resource|net::ERR|due to access control/i.test(text)) return;
      errors.push(`console.error: ${text}`);
    });
    await use(page);
    base.expect(errors, 'no console errors / page errors').toEqual([]);
  },
});

/**
 * Open the app with a mocked clock. By default the first-run onboarding is
 * marked done (so it does not cover the UI); pass `onboarding: true` to see it.
 */
async function openApp(page, { time = FIXED_TIME, clock = true, onboarding = false } = {}) {
  if (clock) await page.clock.install({ time: new Date(time) });
  // Testes nunca devem fazer barulho na máquina de quem os roda.
  await page.addInitScript(() => {
    try {
      if (localStorage.getItem('evermind:settings_sound') == null) {
        localStorage.setItem('evermind:settings_sound', 'false');
      }
    } catch (e) { /* ignore */ }
  });
  if (!onboarding) {
    await page.addInitScript(() => {
      try {
        if (localStorage.getItem('evermind:onboarding_done') == null) {
          localStorage.setItem('evermind:onboarding_done', 'true');
        }
      } catch (e) { /* ignore */ }
    });
  }
  await page.goto('/index.html');
  await page.locator('#tabbar .tab').first().waitFor();
  if (!onboarding) await page.locator('#screen h1').first().waitFor();
}

/** Screens that live behind the "Mais" tab. */
const MORE_LABELS = ['Afeto', 'Descobrir', 'Semana', 'Ajustes'];

const tab = (page, label) => page.locator('#tabbar .tab', { hasText: label });

/** Navigate to a screen by its label (bottom tab, or Mais -> entry). */
async function goTab(page, label) {
  if (MORE_LABELS.includes(label)) {
    if (!(await page.locator('.more-item').first().isVisible().catch(() => false))) {
      await tab(page, 'Mais').click();
    }
    await page.locator('.more-item', { hasText: label }).click();
  } else {
    await tab(page, label).click();
  }
}

const readJson = (page, key) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
const progress = (page) => readJson(page, PROGRESS_KEY);
const habits = (page) => readJson(page, HABITS_KEY);

/** Seed localStorage (values are objects/JSON-able) then reload. */
async function seedAndReload(page, entries) {
  await page.evaluate((e) => {
    for (const [k, v] of Object.entries(e)) localStorage.setItem(k, JSON.stringify(v));
  }, entries);
  await page.reload();
  await page.locator('#screen h1').first().waitFor();
}

/** The 7 product screens (+ Ajustes). h = text expected in the first heading. */
const TABS = [
  { id: 'HOME', label: 'Hoje', h: /Bom dia|Boa tarde|Boa noite/ },
  { id: 'BRAIN_GYM', label: 'Mente', h: /Ginástica Cerebral/ },
  { id: 'BODY_MOVEMENT', label: 'Corpo', h: /Mexa o Corpo/ },
  { id: 'SELF_CARE', label: 'Cuidado', h: /Cuide de Você/ },
  { id: 'SOCIAL_CONNECTION', label: 'Afeto', h: /Desafio da Conexão/ },
  { id: 'DISCOVERY', label: 'Descobrir', h: /Descubra Algo Novo/ },
  { id: 'WEEKLY_SUMMARY', label: 'Semana', h: /Minha Semana/ },
];

/** Tiles (buttons) of the active game, in engine order (labels are not unique). */
const gameTiles = (page) => page.locator('#screen button.tile');

const GAME_TITLES = {
  MEMORY: 'Memória Visual', SEQUENCE: 'Sequência Lógica', WORDS: 'Formação de Palavras',
  ATTENTION: 'Atenção & Diferenças', MUSIC: 'Memória Musical',
  PAIRS: 'Pares', PROVERBS: 'Complete o Ditado', MARKET: 'Conta do Mercado', ORDER: 'Ordem Certa',
};
/** Open a game from the Mente menu. id: MEMORY|SEQUENCE|WORDS|ATTENTION|MUSIC|PAIRS|PROVERBS|MARKET|ORDER */
async function openGame(page, id) {
  await goTab(page, 'Mente');
  const back = page.getByRole('button', { name: /← MENU/ });
  if (await back.count()) await back.click();
  await page.locator('#screen .card', { hasText: new RegExp(`\\d\\. ${GAME_TITLES[id]}`) })
    .getByRole('button', { name: /JOGAR AGORA/ }).click();
}
const gymState = (page, expr) =>
  page.evaluate((e) => new Function('s', `return ${e}`)(EM.screens.brainGym._getState()), expr);

module.exports = {
  test, expect: base.expect, openApp, goTab, tab, gameTiles, openGame, gymState, GAME_TITLES, MORE_LABELS, progress, habits, seedAndReload,
  readJson, TABS, PROGRESS_KEY, HABITS_KEY, KEY, FIXED_TIME,
};
