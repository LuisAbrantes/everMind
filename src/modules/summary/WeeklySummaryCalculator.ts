import { IBadgeDefinition } from '../domain/types';
import { BadgeEvaluator, CANONICAL_BADGES } from '../gamification/BadgeEvaluator';

export interface IWeeklySummaryInput {
  mindPillarTotal: number;
  movementPillarTotal: number;
  selfCarePillarTotal: number;
  connectionPillarTotal: number;
  consecutiveDays: number;
  unlockedBadges?: IBadgeDefinition[];
}

export interface IWeeklySummaryReport {
  weekStartDate: string;
  weekEndDate: string;
  mindPillarTotal: number;
  movementPillarTotal: number;
  selfCarePillarTotal: number;
  connectionPillarTotal: number;
  totalActivitiesCompleted: number;
  affirmativeMessage: string;
  isPerfectActiveWeek: boolean;
  badges: IBadgeDefinition[];
}

export class WeeklySummaryCalculator {
  public static calculateReport(
    input: IWeeklySummaryInput,
    currentDate: Date = new Date()
  ): IWeeklySummaryReport {
    const totalActivities =
      input.mindPillarTotal +
      input.movementPillarTotal +
      input.selfCarePillarTotal +
      input.connectionPillarTotal;

    const isPerfectActiveWeek = input.consecutiveDays >= 7 || totalActivities >= 7;

    const affirmativeMessage = this.generateAffirmativeMessage(totalActivities);

    // Calculate dates
    const endDate = currentDate.toISOString().slice(0, 10);
    const startDateObj = new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    const startDate = startDateObj.toISOString().slice(0, 10);

    // Evaluate badges
    const { updatedBadges } = BadgeEvaluator.evaluateBadges({
      totalCompletedChallenges: totalActivities,
      consecutiveActiveDays: input.consecutiveDays,
      mindCount: input.mindPillarTotal,
      movementCount: input.movementPillarTotal,
      connectionCount: input.connectionPillarTotal,
      currentBadges: input.unlockedBadges || CANONICAL_BADGES,
      currentDate: endDate,
    });

    return {
      weekStartDate: startDate,
      weekEndDate: endDate,
      mindPillarTotal: input.mindPillarTotal,
      movementPillarTotal: input.movementPillarTotal,
      selfCarePillarTotal: input.selfCarePillarTotal,
      connectionPillarTotal: input.connectionPillarTotal,
      totalActivitiesCompleted: totalActivities,
      affirmativeMessage,
      isPerfectActiveWeek,
      badges: updatedBadges,
    };
  }

  public static generateAffirmativeMessage(totalActivities: number): string {
    if (totalActivities === 0) {
      return '🌱 Que alegria ter você aqui! Hoje é uma linda oportunidade para começar a cuidar de você no seu ritmo.';
    }
    if (totalActivities <= 4) {
      return '🌿 Que ótimo! Você realizou momentos preciosos de cuidado nesta semana. Cada pequeno passo conta e faz bem!';
    }
    if (totalActivities <= 14) {
      return '✨ Muito bem! Você cultivou uma constância acolhedora e equilibrada ao longo de todos os seus pilares de longevidade!';
    }
    return '🎉 Sensacional! Sua semana foi repleta de vitalidade, afeto e carinho pela sua mente e corpo!';
  }
}
