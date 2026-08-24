import { useState, useCallback, useMemo } from 'react';
import { IStorageGateway } from '../../modules/storage/IStorageGateway';
import { MMKVStorageGateway } from '../../modules/storage/MMKVStorageGateway';
import { IFeedbackService } from '../../modules/feedback/IFeedbackService';
import { MockFeedbackService } from '../../modules/feedback/MockFeedbackService';
import { HabitsCoordinator, IHabitsStorageState } from '../../modules/habits/HabitsCoordinator';

export interface UseSelfCareDependencies {
  storageGateway?: IStorageGateway;
  feedbackService?: IFeedbackService;
  todayDateStr?: string;
}

export function useSelfCare(deps?: UseSelfCareDependencies) {
  const storage = useMemo(() => deps?.storageGateway || new MMKVStorageGateway(), [deps?.storageGateway]);
  const feedback = useMemo(() => deps?.feedbackService || new MockFeedbackService(), [deps?.feedbackService]);
  const todayStr = useMemo(() => deps?.todayDateStr || new Date().toISOString().slice(0, 10), [deps?.todayDateStr]);

  const [habitsState, setHabitsState] = useState<IHabitsStorageState>(() => {
    return HabitsCoordinator.loadState(storage, todayStr);
  });

  const handleAddWater = useCallback(() => {
    const nextState = HabitsCoordinator.addWaterGlass(storage, habitsState);
    setHabitsState(nextState);
    feedback.triggerSuccessFeedback();
  }, [storage, habitsState, feedback]);

  const handleConfirmFruitVeggie = useCallback(() => {
    const nextState = HabitsCoordinator.confirmFruitVeggie(storage, habitsState);
    setHabitsState(nextState);
    feedback.triggerSuccessFeedback();
  }, [storage, habitsState, feedback]);

  const handleConfirmSleepRoutine = useCallback(() => {
    const nextState = HabitsCoordinator.confirmSleepRoutine(storage, habitsState);
    setHabitsState(nextState);
    feedback.triggerSuccessFeedback();
  }, [storage, habitsState, feedback]);

  return {
    todayDate: habitsState.selfCare.todayDate,
    waterGlassesCount: habitsState.selfCare.waterGlassesCount,
    isWaterGoalMet: habitsState.selfCare.isWaterGoalMet,
    fruitVeggieConfirmed: habitsState.selfCare.fruitVeggieConfirmed,
    sleepRoutineConfirmed: habitsState.selfCare.sleepRoutineConfirmed,
    totalSelfCareActions: habitsState.selfCare.totalSelfCareActions,
    handleAddWater,
    handleConfirmFruitVeggie,
    handleConfirmSleepRoutine,
  };
}
