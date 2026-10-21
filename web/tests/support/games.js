// Shared helpers for the minigame specs (games / newgames / antiguilt / layout).
const { expect } = require('@playwright/test');
const { progress, readJson, KEY } = require('./fixtures');

const MIND_KEY = KEY('evermind_mind_activities_count');

/** Every game id of the Mente menu, in menu order. */
const ALL_GAMES = ['MEMORY', 'SEQUENCE', 'WORDS', 'ATTENTION', 'MUSIC', 'PAIRS', 'PROVERBS', 'MARKET', 'ORDER'];
const NEW_GAMES = ['PAIRS', 'PROVERBS', 'MARKET', 'ORDER'];

/** Counters that a completed game must bump by exactly +1 / +10. */
async function snapshot(page) {
  const p = await progress(page);
  return {
    total: p.totalCompletedChallenges,
    points: p.growthPoints,
    mind: (await readJson(page, MIND_KEY)) || 0,
    mindPillar: p.pillarTotals.MIND,
    log: (p.completionLog || []).length,
  };
}

async function expectAwarded(page, before, n = 1) {
  const after = await snapshot(page);
  expect(after.total, 'totalCompletedChallenges').toBe(before.total + n);
  expect(after.points, 'growthPoints').toBe(before.points + 10 * n);
  expect(after.mind, 'mind activities counter').toBe(before.mind + n);
  expect(after.mindPillar, 'MIND pillar total').toBe(before.mindPillar + n);
  expect(after.log, 'completion log entries').toBe(before.log + n);
}

/** The last completion-log entry (`{d, p, k}`) of the user. */
async function lastLogEntry(page) {
  const p = await progress(page);
  return p.completionLog[p.completionLog.length - 1];
}

module.exports = { snapshot, expectAwarded, lastLogEntry, MIND_KEY, ALL_GAMES, NEW_GAMES };
