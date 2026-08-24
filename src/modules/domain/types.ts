/**
 * Canonical Domain Types & Value Objects for everMind
 * (CONTEXT.md, ADR-0003, ADR-0005, ADR-0007)
 */

export type PillarType = 'MIND' | 'MOVEMENT' | 'SELFCARE' | 'CONNECTION';

export type BrainStage = 'BABY' | 'KID' | 'TEEN' | 'MEGA';

export interface IBrainStageConfig {
  stage: BrainStage;
  label: string;
  emoji: string;
  minCompleted: number;
  maxCompleted: number;
}

export const BRAIN_STAGES_CONFIG: Record<BrainStage, IBrainStageConfig> = {
  BABY: { stage: 'BABY', label: 'Brain Baby', emoji: '🌱', minCompleted: 1, maxCompleted: 5 },
  KID: { stage: 'KID', label: 'Brain Kid', emoji: '✨', minCompleted: 6, maxCompleted: 20 },
  TEEN: { stage: 'TEEN', label: 'Brain Teen', emoji: '⚡', minCompleted: 21, maxCompleted: 50 },
  MEGA: { stage: 'MEGA', label: 'Mega Brain', emoji: '👑', minCompleted: 51, maxCompleted: Infinity },
};

export interface IDailyChallengeSummary {
  id: string;
  pillar: PillarType;
  title: string;
  subtitle: string;
  route: string;
  isCompleted: boolean;
  completedAt?: string;
  growthPoints: number;
}

export interface IHomeScreenState {
  greeting: string;
  dateFormatted: string;
  brainStage: BrainStage;
  brainStageLabel: string;
  brainStageEmoji: string;
  totalCompletedChallenges: number;
  currentStageProgress: number;
  currentStageTarget: number;
  stageProgressPercentage: number;
  streakDays: number;
  streakMessage: string;
  triadChallenges: [IDailyChallengeSummary, IDailyChallengeSummary, IDailyChallengeSummary];
  triadCompletedCount: number;
  isTriadFullyCompleted: boolean;
}

export interface IBadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  pillarReward: PillarType | 'GLOBAL';
  unlockedAt: string | null;
}

export interface IStreakEvaluation {
  currentStreak: number;
  totalActiveDays: number;
  encouragementMessage: string;
  isNewDay: boolean;
}

export interface IUserProgressStorageState {
  totalCompletedChallenges: number;
  highestBrainStageAchieved: BrainStage;
  currentStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  growthPoints: number;
  completedChallengeIds: string[];
  triadDate: string;
  triadChallengeIds: [string, string, string];
}
