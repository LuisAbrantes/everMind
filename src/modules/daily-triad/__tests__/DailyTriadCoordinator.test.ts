import { DailyTriadCoordinator, MASTER_CHALLENGE_CATALOG } from '../DailyTriadCoordinator';

describe('DailyTriadCoordinator (CONTEXT.md 3.1 & 3.2)', () => {
  it('should generate exactly 3 challenges for any given date', () => {
    const triad = DailyTriadCoordinator.generateTriadForDate('2026-08-19');
    expect(triad).toHaveLength(3);
    expect(triad[0]).toBeDefined();
    expect(triad[1]).toBeDefined();
    expect(triad[2]).toBeDefined();
  });

  it('should be deterministic for the same date', () => {
    const triad1 = DailyTriadCoordinator.generateTriadForDate('2026-08-19');
    const triad2 = DailyTriadCoordinator.generateTriadForDate('2026-08-19');
    expect(triad1[0].id).toBe(triad2[0].id);
    expect(triad1[1].id).toBe(triad2[1].id);
    expect(triad1[2].id).toBe(triad2[2].id);
  });

  it('should ensure all 3 challenges belong to distinct pillars', () => {
    const triad = DailyTriadCoordinator.generateTriadForDate('2026-08-19');
    const pillars = triad.map((t) => t.pillar);
    const uniquePillars = new Set(pillars);
    expect(uniquePillars.size).toBe(3);
  });

  it('should mark challenge as completed when id is in completedIds', () => {
    const initialTriad = DailyTriadCoordinator.generateTriadForDate('2026-08-19');
    const targetId = initialTriad[1].id;

    const triadWithCompletion = DailyTriadCoordinator.generateTriadForDate('2026-08-19', [targetId]);
    expect(triadWithCompletion[0].isCompleted).toBe(false);
    expect(triadWithCompletion[1].isCompleted).toBe(true);
    expect(triadWithCompletion[2].isCompleted).toBe(false);
  });
});
