import { useState, useCallback, useMemo } from 'react';
import { IStorageGateway } from '../../modules/storage/IStorageGateway';
import { MMKVStorageGateway } from '../../modules/storage/MMKVStorageGateway';
import { IFeedbackService } from '../../modules/feedback/IFeedbackService';
import { MockFeedbackService } from '../../modules/feedback/MockFeedbackService';
import {
  DiscoveryEngine,
  IDiscoveryItem,
  DiscoveryCategory,
} from '../../modules/discovery/DiscoveryEngine';
import { IUserProgressStorageState, BrainStage } from '../../modules/domain/types';
import { BrainEvolutionEngine } from '../../modules/gamification/BrainEvolutionEngine';

export interface UseDiscoveryDependencies {
  storageGateway?: IStorageGateway;
  feedbackService?: IFeedbackService;
}

const STORAGE_KEY_DISCOVERIES_COMPLETED = 'evermind_completed_discoveries_count';
const STORAGE_KEY_USER_PROGRESS = 'evermind_user_progress_v1';

export function useDiscovery(deps?: UseDiscoveryDependencies) {
  const storage = useMemo(() => deps?.storageGateway || new MMKVStorageGateway(), [deps?.storageGateway]);
  const feedback = useMemo(() => deps?.feedbackService || new MockFeedbackService(), [deps?.feedbackService]);

  const [selectedCategory, setSelectedCategory] = useState<DiscoveryCategory | 'ALL'>('ALL');
  const [currentDiscovery, setCurrentDiscovery] = useState<IDiscoveryItem>(() => {
    return DiscoveryEngine.rollSurprise([], 'ALL');
  });
  const [isCompletedCurrent, setIsCompletedCurrent] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(() => {
    return storage.get<number>(STORAGE_KEY_DISCOVERIES_COMPLETED) || 0;
  });

  const categories = useMemo(() => DiscoveryEngine.getCategories(), []);

  const handleRollSurprise = useCallback(
    (category: DiscoveryCategory | 'ALL' = selectedCategory) => {
      const rolled = DiscoveryEngine.rollSurprise([currentDiscovery.id], category);
      setCurrentDiscovery(rolled);
      setIsCompletedCurrent(false);
      feedback.triggerSelectFeedback();
    },
    [currentDiscovery.id, selectedCategory, feedback]
  );

  const handleSelectCategory = useCallback(
    (category: DiscoveryCategory | 'ALL') => {
      setSelectedCategory(category);
      handleRollSurprise(category);
    },
    [handleRollSurprise]
  );

  const handleCompleteDiscovery = useCallback(() => {
    if (isCompletedCurrent) return;

    setIsCompletedCurrent(true);
    const nextCount = completedCount + 1;
    setCompletedCount(nextCount);
    storage.set(STORAGE_KEY_DISCOVERIES_COMPLETED, nextCount);

    // Give points to the Virtual Brain
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
        growthPoints: userProgress.growthPoints + 10,
      };
      storage.set(STORAGE_KEY_USER_PROGRESS, updatedProgress);
    }

    feedback.triggerSuccessFeedback();
  }, [isCompletedCurrent, completedCount, storage, feedback]);

  return {
    selectedCategory,
    currentDiscovery,
    isCompletedCurrent,
    completedCount,
    categories,
    handleRollSurprise,
    handleSelectCategory,
    handleCompleteDiscovery,
  };
}
