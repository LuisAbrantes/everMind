import { GentleStreakManager } from '../GentleStreakManager';

describe('GentleStreakManager (ADR-0003: Anti-Guilt & Gentle Fallback)', () => {
  describe('evaluateDailyStreak', () => {
    it('should welcome new users warmly on first access', () => {
      const result = GentleStreakManager.evaluateDailyStreak(null, 0, 0, new Date('2026-08-19'));
      expect(result.currentStreak).toBe(1);
      expect(result.totalActiveDays).toBe(1);
      expect(result.encouragementMessage).toContain('Bem-vindo');
      expect(result.isNewDay).toBe(true);
    });

    it('should increment streak on consecutive day', () => {
      const result = GentleStreakManager.evaluateDailyStreak(
        '2026-08-18',
        3,
        10,
        new Date('2026-08-19')
      );
      expect(result.currentStreak).toBe(4);
      expect(result.totalActiveDays).toBe(11);
      expect(result.encouragementMessage).toContain('4 dias');
      expect(result.isNewDay).toBe(true);
    });

    it('should maintain streak without double incrementing on same day', () => {
      const result = GentleStreakManager.evaluateDailyStreak(
        '2026-08-19',
        4,
        11,
        new Date('2026-08-19')
      );
      expect(result.currentStreak).toBe(4);
      expect(result.totalActiveDays).toBe(11);
      expect(result.encouragementMessage).toContain('firme hoje');
      expect(result.isNewDay).toBe(false);
    });

    it('should gracefully handle gaps (e.g. 5 days) with gentle anti-guilt message', () => {
      const result = GentleStreakManager.evaluateDailyStreak(
        '2026-08-14',
        7,
        20,
        new Date('2026-08-19')
      );
      expect(result.currentStreak).toBe(1);
      expect(result.totalActiveDays).toBe(21);
      expect(result.encouragementMessage).toContain('Tudo bem');
      expect(result.encouragementMessage).toContain('próprio ritmo');
      expect(result.isNewDay).toBe(true);

      // Verify that no punitive words exist in output
      for (const word of GentleStreakManager.PROHIBITED_WORDS) {
        expect(result.encouragementMessage.toLowerCase()).not.toContain(word);
      }
    });
  });

  describe('sanitizeMessage', () => {
    it('should replace prohibited words with gentle phrasing', () => {
      const input = 'Você perdeu seu streak e falhou a meta';
      const sanitized = GentleStreakManager.sanitizeMessage(input);
      expect(sanitized).not.toContain('perdeu');
      expect(sanitized).not.toContain('falhou');
      expect(sanitized).toContain('recomeço gentil');
    });
  });
});
