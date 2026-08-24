import { IBadgeDefinition, PillarType } from '../domain/types';

export const CANONICAL_BADGES: IBadgeDefinition[] = [
  {
    id: 'BADGE_FIRST_STEPS',
    name: 'Primeiros Passos',
    description: 'Concluiu os primeiros 5 desafios de bem-estar.',
    icon: '🥉',
    pillarReward: 'GLOBAL',
    unlockedAt: null,
  },
  {
    id: 'BADGE_ACTIVE_WEEK',
    name: 'Semana Ativa',
    description: 'Manteve hábitos cultivados ao longo de 7 dias.',
    icon: '🥈',
    pillarReward: 'GLOBAL',
    unlockedAt: null,
  },
  {
    id: 'BADGE_MIND_IN_MOTION',
    name: 'Mente em Movimento',
    description: 'Concluiu 30 atividades cognitivas no Pilar Mente.',
    icon: '🥇',
    pillarReward: 'MIND',
    unlockedAt: null,
  },
  {
    id: 'BADGE_PRESENT_FRIEND',
    name: 'Amigo Presente',
    description: 'Concluiu 10 desafios de socialização no Pilar Conexão.',
    icon: '❤️',
    pillarReward: 'CONNECTION',
    unlockedAt: null,
  },
  {
    id: 'BADGE_WALKER',
    name: 'Caminhante',
    description: 'Concluiu 20 sessões de caminhada no Pilar Movimento.',
    icon: '🚶',
    pillarReward: 'MOVEMENT',
    unlockedAt: null,
  },
];

export interface IBadgeEvaluationInput {
  totalCompletedChallenges: number;
  consecutiveActiveDays: number;
  mindCount: number;
  movementCount: number;
  connectionCount: number;
  currentBadges: IBadgeDefinition[];
  currentDate?: string;
}

export class BadgeEvaluator {
  public static evaluateBadges(input: IBadgeEvaluationInput): {
    updatedBadges: IBadgeDefinition[];
    newlyUnlocked: IBadgeDefinition[];
  } {
    const now = input.currentDate || new Date().toISOString();
    const existingUnlockedIds = new Set(
      input.currentBadges.filter((b) => b.unlockedAt !== null).map((b) => b.id)
    );

    const newlyUnlocked: IBadgeDefinition[] = [];
    const updatedBadges = CANONICAL_BADGES.map((badge) => {
      const existing = input.currentBadges.find((b) => b.id === badge.id);
      if (existing && existing.unlockedAt) {
        return existing;
      }

      let shouldUnlock = false;

      switch (badge.id) {
        case 'BADGE_FIRST_STEPS':
          shouldUnlock = input.totalCompletedChallenges >= 5;
          break;
        case 'BADGE_ACTIVE_WEEK':
          shouldUnlock = input.consecutiveActiveDays >= 7;
          break;
        case 'BADGE_MIND_IN_MOTION':
          shouldUnlock = input.mindCount >= 30;
          break;
        case 'BADGE_PRESENT_FRIEND':
          shouldUnlock = input.connectionCount >= 10;
          break;
        case 'BADGE_WALKER':
          shouldUnlock = input.movementCount >= 20;
          break;
      }

      if (shouldUnlock && !existingUnlockedIds.has(badge.id)) {
        const unlockedBadge: IBadgeDefinition = { ...badge, unlockedAt: now };
        newlyUnlocked.push(unlockedBadge);
        return unlockedBadge;
      }

      return existing || badge;
    });

    return { updatedBadges, newlyUnlocked };
  }
}
