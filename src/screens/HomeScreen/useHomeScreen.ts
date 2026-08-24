import { useState, useEffect, useCallback, useMemo } from 'react';
import { IStorageGateway } from '../../modules/storage/IStorageGateway';
import { MMKVStorageGateway } from '../../modules/storage/MMKVStorageGateway';
import { IFeedbackService } from '../../modules/feedback/IFeedbackService';
import { MockFeedbackService } from '../../modules/feedback/MockFeedbackService';
import {
  IHomeScreenState,
  IDailyChallengeSummary,
  IUserProgressStorageState,
  BrainStage,
} from '../../modules/domain/types';
import { BrainEvolutionEngine } from '../../modules/gamification/BrainEvolutionEngine';
import { GentleStreakManager } from '../../modules/gamification/GentleStreakManager';
import { DailyTriadCoordinator } from '../../modules/daily-triad/DailyTriadCoordinator';

const STORAGE_KEY_USER_PROGRESS = 'evermind_user_progress_v1';

export interface UseHomeScreenDependencies {
  storageGateway?: IStorageGateway;
  feedbackService?: IFeedbackService;
  todayDate?: Date;
}

export function useHomeScreen(deps?: UseHomeScreenDependencies) {
  const storage = useMemo(() => deps?.storageGateway || new MMKVStorageGateway(), [deps?.storageGateway]);
  const feedback = useMemo(() => deps?.feedbackService || new MockFeedbackService(), [deps?.feedbackService]);
  const today = useMemo(() => deps?.todayDate || new Date(), [deps?.todayDate]);

  const dateString = useMemo(() => {
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [today]);

  const [userState, setUserState] = useState<IUserProgressStorageState>(() => {
    const saved = storage.get<IUserProgressStorageState>(STORAGE_KEY_USER_PROGRESS);
    if (saved) return saved;

    // Initial state with 14 completed challenges and initial triad for demo/first use
    const initialTriad = DailyTriadCoordinator.generateTriadForDate(dateString, []);
    return {
      totalCompletedChallenges: 14,
      highestBrainStageAchieved: 'KID',
      currentStreak: 4,
      totalActiveDays: 12,
      lastActiveDate: dateString,
      growthPoints: 140,
      completedChallengeIds: ['movement_walk_10min'],
      triadDate: dateString,
      triadChallengeIds: [initialTriad[0].id, initialTriad[1].id, initialTriad[2].id],
    };
  });

  // Evaluate Daily Streak
  const streakEvaluation = useMemo(() => {
    return GentleStreakManager.evaluateDailyStreak(
      userState.lastActiveDate,
      userState.currentStreak,
      userState.totalActiveDays,
      today
    );
  }, [userState.lastActiveDate, userState.currentStreak, userState.totalActiveDays, today]);

  // Evaluate Brain Stage
  const brainStageConfig = useMemo(() => {
    return BrainEvolutionEngine.evaluateStage(
      userState.totalCompletedChallenges,
      userState.highestBrainStageAchieved
    );
  }, [userState.totalCompletedChallenges, userState.highestBrainStageAchieved]);

  // Evaluate Level Progression Progress
  const brainProgress = useMemo(() => {
    return BrainEvolutionEngine.calculateProgress(
      userState.totalCompletedChallenges,
      brainStageConfig.stage
    );
  }, [userState.totalCompletedChallenges, brainStageConfig.stage]);

  // Synchronize Daily Triad for today
  const triadChallenges = useMemo<[IDailyChallengeSummary, IDailyChallengeSummary, IDailyChallengeSummary]>(() => {
    return DailyTriadCoordinator.generateTriadForDate(dateString, userState.completedChallengeIds);
  }, [dateString, userState.completedChallengeIds]);

  const triadCompletedCount = useMemo(() => {
    return triadChallenges.filter((c) => c.isCompleted).length;
  }, [triadChallenges]);

  const isTriadFullyCompleted = triadCompletedCount === 3;

  // Toggle Challenge Completion Action
  const toggleChallengeCompletion = useCallback(
    (challengeId: string) => {
      const isAlreadyCompleted = userState.completedChallengeIds.includes(challengeId);

      const nextCompletedIds = isAlreadyCompleted
        ? userState.completedChallengeIds.filter((id) => id !== challengeId)
        : [...userState.completedChallengeIds, challengeId];

      const nextTotalCompleted = isAlreadyCompleted
        ? Math.max(0, userState.totalCompletedChallenges - 1)
        : userState.totalCompletedChallenges + 1;

      const nextBrainConfig = BrainEvolutionEngine.evaluateStage(
        nextTotalCompleted,
        userState.highestBrainStageAchieved
      );

      const nextHighestStage: BrainStage =
        BrainEvolutionEngine.STAGE_ORDER.indexOf(nextBrainConfig.stage) >
        BrainEvolutionEngine.STAGE_ORDER.indexOf(userState.highestBrainStageAchieved)
          ? nextBrainConfig.stage
          : userState.highestBrainStageAchieved;

      const nextState: IUserProgressStorageState = {
        ...userState,
        totalCompletedChallenges: nextTotalCompleted,
        highestBrainStageAchieved: nextHighestStage,
        completedChallengeIds: nextCompletedIds,
        growthPoints: BrainEvolutionEngine.calculateGrowthPoints(nextTotalCompleted),
        lastActiveDate: dateString,
      };

      setUserState(nextState);
      storage.set(STORAGE_KEY_USER_PROGRESS, nextState);

      if (!isAlreadyCompleted) {
        feedback.triggerSuccessFeedback();
      } else {
        feedback.triggerSelectFeedback();
      }
    },
    [userState, dateString, storage, feedback]
  );

  // Dynamic Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour >= 5 && hour < 12) return '☀️ Bom dia, Maria!';
    if (hour >= 12 && hour < 18) return '🌤️ Boa tarde, Maria!';
    return '🌙 Boa noite, Maria!';
  }, [today]);

  // Formatted Date
  const dateFormatted = useMemo(() => {
    return 'Hoje é um lindo dia para cuidar de você!';
  }, []);

  const state: IHomeScreenState = {
    greeting,
    dateFormatted,
    brainStage: brainStageConfig.stage,
    brainStageLabel: brainStageConfig.label,
    brainStageEmoji: brainStageConfig.emoji,
    totalCompletedChallenges: userState.totalCompletedChallenges,
    currentStageProgress: brainProgress.current,
    currentStageTarget: brainProgress.target,
    stageProgressPercentage: brainProgress.percentage,
    streakDays: streakEvaluation.currentStreak,
    streakMessage: streakEvaluation.encouragementMessage,
    triadChallenges,
    triadCompletedCount,
    isTriadFullyCompleted,
  };

  return {
    state,
    toggleChallengeCompletion,
  };
}
