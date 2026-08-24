import { BrainEvolutionEngine } from '../BrainEvolutionEngine';

describe('BrainEvolutionEngine (ADR-0003 & rewards-and-brain-evolution.md)', () => {
  describe('Stage Progression Rules', () => {
    it('should assign BABY stage for 0 to 5 completed challenges', () => {
      expect(BrainEvolutionEngine.evaluateStage(0).stage).toBe('BABY');
      expect(BrainEvolutionEngine.evaluateStage(1).stage).toBe('BABY');
      expect(BrainEvolutionEngine.evaluateStage(5).stage).toBe('BABY');
      expect(BrainEvolutionEngine.evaluateStage(5).label).toBe('Brain Baby');
      expect(BrainEvolutionEngine.evaluateStage(5).emoji).toBe('🌱');
    });

    it('should assign KID stage for 6 to 20 completed challenges', () => {
      expect(BrainEvolutionEngine.evaluateStage(6).stage).toBe('KID');
      expect(BrainEvolutionEngine.evaluateStage(14).stage).toBe('KID');
      expect(BrainEvolutionEngine.evaluateStage(20).stage).toBe('KID');
      expect(BrainEvolutionEngine.evaluateStage(20).label).toBe('Brain Kid');
      expect(BrainEvolutionEngine.evaluateStage(20).emoji).toBe('✨');
    });

    it('should assign TEEN stage for 21 to 50 completed challenges', () => {
      expect(BrainEvolutionEngine.evaluateStage(21).stage).toBe('TEEN');
      expect(BrainEvolutionEngine.evaluateStage(35).stage).toBe('TEEN');
      expect(BrainEvolutionEngine.evaluateStage(50).stage).toBe('TEEN');
      expect(BrainEvolutionEngine.evaluateStage(50).label).toBe('Brain Teen');
      expect(BrainEvolutionEngine.evaluateStage(50).emoji).toBe('⚡');
    });

    it('should assign MEGA stage for 51+ completed challenges', () => {
      expect(BrainEvolutionEngine.evaluateStage(51).stage).toBe('MEGA');
      expect(BrainEvolutionEngine.evaluateStage(100).stage).toBe('MEGA');
      expect(BrainEvolutionEngine.evaluateStage(100).label).toBe('Mega Brain');
      expect(BrainEvolutionEngine.evaluateStage(100).emoji).toBe('👑');
    });
  });

  describe('Monotonicity (No Regression / Zero Involuntary Downgrade)', () => {
    it('should never regress from MEGA even if count drops', () => {
      const stage = BrainEvolutionEngine.evaluateStage(10, 'MEGA');
      expect(stage.stage).toBe('MEGA');
    });

    it('should never regress from TEEN to KID even if count drops', () => {
      const stage = BrainEvolutionEngine.evaluateStage(4, 'TEEN');
      expect(stage.stage).toBe('TEEN');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate accurate percentage within BABY stage', () => {
      const progress = BrainEvolutionEngine.calculateProgress(3, 'BABY');
      expect(progress.current).toBe(3);
      expect(progress.target).toBe(5);
      expect(progress.percentage).toBe(60);
    });

    it('should calculate accurate percentage within KID stage', () => {
      const progress = BrainEvolutionEngine.calculateProgress(14, 'KID');
      expect(progress.current).toBe(14);
      expect(progress.target).toBe(20);
      expect(progress.percentage).toBe(70);
    });

    it('should return 100% for MEGA stage', () => {
      const progress = BrainEvolutionEngine.calculateProgress(55, 'MEGA');
      expect(progress.percentage).toBe(100);
    });
  });

  describe('Growth Points', () => {
    it('should assign 10 growth points per completed challenge', () => {
      expect(BrainEvolutionEngine.calculateGrowthPoints(14)).toBe(140);
      expect(BrainEvolutionEngine.calculateGrowthPoints(0)).toBe(0);
    });
  });
});
