import { BrainStage, BRAIN_STAGES_CONFIG, IBrainStageConfig } from '../domain/types';

/**
 * Brain Evolution Engine (Strict Monotonic Growth)
 * ADR-0003 & rewards-and-brain-evolution.md
 * 
 * Rules:
 * 1. Brain Baby: 1 to 5 completed challenges
 * 2. Brain Kid: 6 to 20 completed challenges
 * 3. Brain Teen: 21 to 50 completed challenges
 * 4. Mega Brain: 51+ completed challenges
 * 5. Monotonicity: A brain stage NEVER regresses.
 */
export class BrainEvolutionEngine {
  public static readonly STAGE_ORDER: BrainStage[] = ['BABY', 'KID', 'TEEN', 'MEGA'];

  public static evaluateStage(
    totalCompletedChallenges: number,
    previousHighestStage: BrainStage = 'BABY'
  ): IBrainStageConfig {
    let calculatedStage: BrainStage = 'BABY';

    if (totalCompletedChallenges >= 51) {
      calculatedStage = 'MEGA';
    } else if (totalCompletedChallenges >= 21) {
      calculatedStage = 'TEEN';
    } else if (totalCompletedChallenges >= 6) {
      calculatedStage = 'KID';
    } else {
      calculatedStage = 'BABY';
    }

    // Monotonic enforcement: Never downgrade from a higher previously reached stage
    const prevIndex = this.STAGE_ORDER.indexOf(previousHighestStage);
    const currIndex = this.STAGE_ORDER.indexOf(calculatedStage);
    const effectiveStage = currIndex >= prevIndex ? calculatedStage : previousHighestStage;

    return BRAIN_STAGES_CONFIG[effectiveStage];
  }

  public static calculateProgress(
    totalCompletedChallenges: number,
    currentStage: BrainStage
  ): {
    current: number;
    target: number;
    percentage: number;
  } {
    const config = BRAIN_STAGES_CONFIG[currentStage];

    if (config.stage === 'BABY') {
      const current = Math.min(totalCompletedChallenges, 5);
      const target = 5;
      const percentage = Math.min(100, Math.round((current / target) * 100));
      return { current, target, percentage };
    }

    if (config.stage === 'KID') {
      const current = Math.min(totalCompletedChallenges, 20);
      const target = 20;
      const percentage = Math.min(100, Math.round((current / target) * 100));
      return { current, target, percentage };
    }

    if (config.stage === 'TEEN') {
      const current = Math.min(totalCompletedChallenges, 50);
      const target = 50;
      const percentage = Math.min(100, Math.round((current / target) * 100));
      return { current, target, percentage };
    }

    // MEGA stage (Master)
    return {
      current: totalCompletedChallenges,
      target: totalCompletedChallenges,
      percentage: 100,
    };
  }

  public static calculateGrowthPoints(completedChallengesCount: number): number {
    return completedChallengesCount * 10;
  }
}
