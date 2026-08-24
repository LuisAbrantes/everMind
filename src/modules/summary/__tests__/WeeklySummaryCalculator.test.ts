import { WeeklySummaryCalculator } from '../WeeklySummaryCalculator';

describe('WeeklySummaryCalculator (Mission 05 - Positive Retrospective)', () => {
  it('should formulate affirmative report without zero guilt', () => {
    const report = WeeklySummaryCalculator.calculateReport({
      mindPillarTotal: 4,
      movementPillarTotal: 3,
      selfCarePillarTotal: 5,
      connectionPillarTotal: 2,
      consecutiveDays: 7,
    });

    expect(report.totalActivitiesCompleted).toBe(14);
    expect(report.isPerfectActiveWeek).toBe(true);
    expect(report.affirmativeMessage).toContain('Muito bem');
    expect(report.badges.some((b) => b.id === 'BADGE_ACTIVE_WEEK')).toBe(true);
  });

  it('should deliver warm encouraging message even with 1 activity', () => {
    const report = WeeklySummaryCalculator.calculateReport({
      mindPillarTotal: 1,
      movementPillarTotal: 0,
      selfCarePillarTotal: 0,
      connectionPillarTotal: 0,
      consecutiveDays: 1,
    });

    expect(report.totalActivitiesCompleted).toBe(1);
    expect(report.affirmativeMessage).toContain('Que ótimo');
  });
});
