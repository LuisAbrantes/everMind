import { BadgeEvaluator, CANONICAL_BADGES } from '../BadgeEvaluator';

describe('BadgeEvaluator (rewards-and-brain-evolution.md)', () => {
  it('should not unlock badges before thresholds are met', () => {
    const result = BadgeEvaluator.evaluateBadges({
      totalCompletedChallenges: 2,
      consecutiveActiveDays: 3,
      mindCount: 5,
      movementCount: 4,
      connectionCount: 2,
      currentBadges: CANONICAL_BADGES,
      currentDate: '2026-08-19T10:00:00Z',
    });

    expect(result.newlyUnlocked).toHaveLength(0);
    expect(result.updatedBadges.every((b) => b.unlockedAt === null)).toBe(true);
  });

  it('should unlock BADGE_FIRST_STEPS when reaching 5 completed challenges', () => {
    const result = BadgeEvaluator.evaluateBadges({
      totalCompletedChallenges: 5,
      consecutiveActiveDays: 3,
      mindCount: 2,
      movementCount: 2,
      connectionCount: 1,
      currentBadges: CANONICAL_BADGES,
      currentDate: '2026-08-19T10:00:00Z',
    });

    expect(result.newlyUnlocked).toHaveLength(1);
    expect(result.newlyUnlocked[0].id).toBe('BADGE_FIRST_STEPS');
    expect(result.newlyUnlocked[0].unlockedAt).toBe('2026-08-19T10:00:00Z');
  });

  it('should unlock BADGE_ACTIVE_WEEK when consecutive active days reaches 7', () => {
    const result = BadgeEvaluator.evaluateBadges({
      totalCompletedChallenges: 10,
      consecutiveActiveDays: 7,
      mindCount: 4,
      movementCount: 3,
      connectionCount: 3,
      currentBadges: CANONICAL_BADGES,
      currentDate: '2026-08-19T10:00:00Z',
    });

    const unlockedIds = result.newlyUnlocked.map((b) => b.id);
    expect(unlockedIds).toContain('BADGE_FIRST_STEPS');
    expect(unlockedIds).toContain('BADGE_ACTIVE_WEEK');
  });

  it('should unlock pillar specific badges (MIND, MOVEMENT, CONNECTION)', () => {
    const result = BadgeEvaluator.evaluateBadges({
      totalCompletedChallenges: 65,
      consecutiveActiveDays: 14,
      mindCount: 30,
      movementCount: 20,
      connectionCount: 10,
      currentBadges: CANONICAL_BADGES,
      currentDate: '2026-08-19T10:00:00Z',
    });

    expect(result.newlyUnlocked).toHaveLength(5);
  });
});
