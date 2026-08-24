import { IStorageGateway } from '../storage/IStorageGateway';
import { IUserProgressStorageState, BrainStage } from '../domain/types';
import { BrainEvolutionEngine } from '../gamification/BrainEvolutionEngine';

export interface IBodyMovementData {
  todayWalkCompleted: boolean;
  totalWalkSessions: number;
  lastWalkDate: string | null;
  targetMinutes: number;
}

export interface ISelfCareData {
  todayDate: string;
  waterGlassesCount: number;
  isWaterGoalMet: boolean;
  fruitVeggieConfirmed: boolean;
  sleepRoutineConfirmed: boolean;
  totalSelfCareActions: number;
}

export interface IHabitsStorageState {
  movement: IBodyMovementData;
  selfCare: ISelfCareData;
}

export const STORAGE_KEY_HABITS = 'evermind_habits_state_v1';
export const STORAGE_KEY_USER_PROGRESS = 'evermind_user_progress_v1';

export class HabitsCoordinator {
  public static getInitialState(todayDateStr: string = new Date().toISOString().slice(0, 10)): IHabitsStorageState {
    return {
      movement: {
        todayWalkCompleted: false,
        totalWalkSessions: 0,
        lastWalkDate: null,
        targetMinutes: 10,
      },
      selfCare: {
        todayDate: todayDateStr,
        waterGlassesCount: 0,
        isWaterGoalMet: false,
        fruitVeggieConfirmed: false,
        sleepRoutineConfirmed: false,
        totalSelfCareActions: 0,
      },
    };
  }

  public static loadState(storage: IStorageGateway, todayDateStr: string): IHabitsStorageState {
    const saved = storage.get<IHabitsStorageState>(STORAGE_KEY_HABITS);
    if (!saved) {
      const initial = this.getInitialState(todayDateStr);
      storage.set(STORAGE_KEY_HABITS, initial);
      return initial;
    }

    // Reset daily counters if date has changed
    if (saved.selfCare.todayDate !== todayDateStr) {
      const refreshed: IHabitsStorageState = {
        movement: {
          ...saved.movement,
          todayWalkCompleted: saved.movement.lastWalkDate === todayDateStr,
        },
        selfCare: {
          todayDate: todayDateStr,
          waterGlassesCount: 0,
          isWaterGoalMet: false,
          fruitVeggieConfirmed: false,
          sleepRoutineConfirmed: false,
          totalSelfCareActions: saved.selfCare.totalSelfCareActions,
        },
      };
      storage.set(STORAGE_KEY_HABITS, refreshed);
      return refreshed;
    }

    return saved;
  }

  public static completeMovementSession(
    storage: IStorageGateway,
    currentState: IHabitsStorageState,
    todayDateStr: string
  ): IHabitsStorageState {
    const nextTotal = currentState.movement.totalWalkSessions + 1;
    const nextState: IHabitsStorageState = {
      ...currentState,
      movement: {
        ...currentState.movement,
        todayWalkCompleted: true,
        totalWalkSessions: nextTotal,
        lastWalkDate: todayDateStr,
      },
    };

    storage.set(STORAGE_KEY_HABITS, nextState);
    this.rewardGrowthPoints(storage, 10);
    return nextState;
  }

  public static addWaterGlass(
    storage: IStorageGateway,
    currentState: IHabitsStorageState
  ): IHabitsStorageState {
    const nextGlasses = currentState.selfCare.waterGlassesCount + 1;
    const isGoalMet = nextGlasses >= 4;
    const nextTotal = currentState.selfCare.totalSelfCareActions + 1;

    const nextState: IHabitsStorageState = {
      ...currentState,
      selfCare: {
        ...currentState.selfCare,
        waterGlassesCount: nextGlasses,
        isWaterGoalMet: isGoalMet,
        totalSelfCareActions: nextTotal,
      },
    };

    storage.set(STORAGE_KEY_HABITS, nextState);
    this.rewardGrowthPoints(storage, 10);
    return nextState;
  }

  public static confirmFruitVeggie(
    storage: IStorageGateway,
    currentState: IHabitsStorageState
  ): IHabitsStorageState {
    if (currentState.selfCare.fruitVeggieConfirmed) return currentState;

    const nextTotal = currentState.selfCare.totalSelfCareActions + 1;
    const nextState: IHabitsStorageState = {
      ...currentState,
      selfCare: {
        ...currentState.selfCare,
        fruitVeggieConfirmed: true,
        totalSelfCareActions: nextTotal,
      },
    };

    storage.set(STORAGE_KEY_HABITS, nextState);
    this.rewardGrowthPoints(storage, 10);
    return nextState;
  }

  public static confirmSleepRoutine(
    storage: IStorageGateway,
    currentState: IHabitsStorageState
  ): IHabitsStorageState {
    if (currentState.selfCare.sleepRoutineConfirmed) return currentState;

    const nextTotal = currentState.selfCare.totalSelfCareActions + 1;
    const nextState: IHabitsStorageState = {
      ...currentState,
      selfCare: {
        ...currentState.selfCare,
        sleepRoutineConfirmed: true,
        totalSelfCareActions: nextTotal,
      },
    };

    storage.set(STORAGE_KEY_HABITS, nextState);
    this.rewardGrowthPoints(storage, 10);
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
