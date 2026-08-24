import { IStorageGateway } from '../storage/IStorageGateway';
import { IUserProgressStorageState, BrainStage } from '../domain/types';
import { BrainEvolutionEngine } from '../gamification/BrainEvolutionEngine';

export interface ISocialStorageState {
  todayDate: string;
  isConnectionCompletedToday: boolean;
  totalSocialConnections: number;
  lastConnectionDate: string | null;
  reminderScheduledTime: string | null;
}

export const STORAGE_KEY_SOCIAL = 'evermind_social_state_v1';
export const STORAGE_KEY_USER_PROGRESS = 'evermind_user_progress_v1';

export class SocialCoordinator {
  public static getInitialState(todayDateStr: string = new Date().toISOString().slice(0, 10)): ISocialStorageState {
    return {
      todayDate: todayDateStr,
      isConnectionCompletedToday: false,
      totalSocialConnections: 0,
      lastConnectionDate: null,
      reminderScheduledTime: null,
    };
  }

  public static loadState(storage: IStorageGateway, todayDateStr: string): ISocialStorageState {
    const saved = storage.get<ISocialStorageState>(STORAGE_KEY_SOCIAL);
    if (!saved) {
      const initial = this.getInitialState(todayDateStr);
      storage.set(STORAGE_KEY_SOCIAL, initial);
      return initial;
    }

    if (saved.todayDate !== todayDateStr) {
      const refreshed: ISocialStorageState = {
        todayDate: todayDateStr,
        isConnectionCompletedToday: saved.lastConnectionDate === todayDateStr,
        totalSocialConnections: saved.totalSocialConnections,
        lastConnectionDate: saved.lastConnectionDate,
        reminderScheduledTime: null,
      };
      storage.set(STORAGE_KEY_SOCIAL, refreshed);
      return refreshed;
    }

    return saved;
  }

  public static completeSocialConnection(
    storage: IStorageGateway,
    currentState: ISocialStorageState,
    todayDateStr: string
  ): ISocialStorageState {
    const nextTotal = currentState.totalSocialConnections + 1;
    const nextState: ISocialStorageState = {
      ...currentState,
      isConnectionCompletedToday: true,
      totalSocialConnections: nextTotal,
      lastConnectionDate: todayDateStr,
      reminderScheduledTime: null,
    };

    storage.set(STORAGE_KEY_SOCIAL, nextState);
    this.rewardGrowthPoints(storage, 10);
    return nextState;
  }

  public static scheduleReminder(
    storage: IStorageGateway,
    currentState: ISocialStorageState,
    reminderTime: string
  ): ISocialStorageState {
    const nextState: ISocialStorageState = {
      ...currentState,
      reminderScheduledTime: reminderTime,
    };
    storage.set(STORAGE_KEY_SOCIAL, nextState);
    return nextState;
  }

  private static rewardGrowthPoints(storage: IStorageGateway, points: number): void {
    const userProgress = storage.get<IUserProgressStorageState>(STORAGE_KEY_USER_PROGRESS);
    if (userProgress) {
      const nextTotal = userProgress.totalCompletedChallenges + 1;
      const brainConfig = BrainEvolutionEngine.evaluateStage(
        nextTotal,
        userProgress.highestBrainStageAchieved
      );

      const nextHighest: BrainStage =
        BrainEvolutionEngine.STAGE_ORDER.indexOf(brainConfig.stage) >
        BrainEvolutionEngine.STAGE_ORDER.indexOf(userProgress.highestBrainStageAchieved)
          ? brainConfig.stage
          : userProgress.highestBrainStageAchieved;

      const updatedProgress: IUserProgressStorageState = {
        ...userProgress,
        totalCompletedChallenges: nextTotal,
        highestBrainStageAchieved: nextHighest,
        growthPoints: userProgress.growthPoints + points,
      };
      storage.set(STORAGE_KEY_USER_PROGRESS, updatedProgress);
    }
  }
}
