import { useState, useEffect, useCallback, useMemo } from 'react';
import { IStorageGateway } from '../../modules/storage/IStorageGateway';
import { MMKVStorageGateway } from '../../modules/storage/MMKVStorageGateway';
import { IFeedbackService } from '../../modules/feedback/IFeedbackService';
import { MockFeedbackService } from '../../modules/feedback/MockFeedbackService';
import { HabitsCoordinator, IHabitsStorageState } from '../../modules/habits/HabitsCoordinator';

export interface UseBodyMovementDependencies {
  storageGateway?: IStorageGateway;
  feedbackService?: IFeedbackService;
  todayDateStr?: string;
}

export function useBodyMovement(deps?: UseBodyMovementDependencies) {
  const storage = useMemo(() => deps?.storageGateway || new MMKVStorageGateway(), [deps?.storageGateway]);
  const feedback = useMemo(() => deps?.feedbackService || new MockFeedbackService(), [deps?.feedbackService]);
  const todayStr = useMemo(() => deps?.todayDateStr || new Date().toISOString().slice(0, 10), [deps?.todayDateStr]);

  const [habitsState, setHabitsState] = useState<IHabitsStorageState>(() => {
    return HabitsCoordinator.loadState(storage, todayStr);
  });

  const [timerStatus, setTimerStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerStatus === 'RUNNING') {
      interval = setInterval(() => {
        setSecondsElapsed((sec) => sec + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus]);

  const toggleTimer = useCallback(() => {
    if (timerStatus === 'RUNNING') {
      setTimerStatus('PAUSED');
      feedback.triggerSelectFeedback();
    } else {
      setTimerStatus('RUNNING');
      feedback.triggerSelectFeedback();
    }
  }, [timerStatus, feedback]);

  const resetTimer = useCallback(() => {
    setTimerStatus('IDLE');
    setSecondsElapsed(0);
    feedback.triggerSelectFeedback();
  }, [feedback]);

  const handleCompleteWalk = useCallback(() => {
    const nextState = HabitsCoordinator.completeMovementSession(storage, habitsState, todayStr);
    setHabitsState(nextState);
    feedback.triggerSuccessFeedback();
  }, [storage, habitsState, todayStr, feedback]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [secondsElapsed]);

  return {
    todayWalkCompleted: habitsState.movement.todayWalkCompleted,
    totalWalkSessions: habitsState.movement.totalWalkSessions,
    targetMinutes: habitsState.movement.targetMinutes,
    timerStatus,
    secondsElapsed,
    formattedTime,
    toggleTimer,
    resetTimer,
    handleCompleteWalk,
  };
}
