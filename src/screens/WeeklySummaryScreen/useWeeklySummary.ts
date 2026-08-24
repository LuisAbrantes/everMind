import { useState, useCallback, useMemo, useEffect } from 'react';
import { IStorageGateway } from '../../modules/storage/IStorageGateway';
import { MMKVStorageGateway } from '../../modules/storage/MMKVStorageGateway';
import { IFeedbackService } from '../../modules/feedback/IFeedbackService';
import { MockFeedbackService } from '../../modules/feedback/MockFeedbackService';
import {
  WeeklySummaryCalculator,
  IWeeklySummaryReport,
} from '../../modules/summary/WeeklySummaryCalculator';
import { SupabaseSyncCoordinator, ISyncResult } from '../../modules/sync/SupabaseSyncCoordinator';
import { IUserProgressStorageState } from '../../modules/domain/types';
import { IHabitsStorageState, STORAGE_KEY_HABITS } from '../../modules/habits/HabitsCoordinator';
import { ISocialStorageState, STORAGE_KEY_SOCIAL } from '../../modules/social/SocialCoordinator';

export interface UseWeeklySummaryDependencies {
  storageGateway?: IStorageGateway;
  feedbackService?: IFeedbackService;
}

export function useWeeklySummary(deps?: UseWeeklySummaryDependencies) {
  const storage = useMemo(() => deps?.storageGateway || new MMKVStorageGateway(), [deps?.storageGateway]);
  const feedback = useMemo(() => deps?.feedbackService || new MockFeedbackService(), [deps?.feedbackService]);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const report = useMemo<IWeeklySummaryReport>(() => {
    const userProgress = storage.get<IUserProgressStorageState>('evermind_user_progress_v1');
    const mindCount = storage.get<number>('evermind_mind_activities_count') || 4;
    const habits = storage.get<IHabitsStorageState>(STORAGE_KEY_HABITS);
    const social = storage.get<ISocialStorageState>(STORAGE_KEY_SOCIAL);

    const movementCount = habits?.movement.totalWalkSessions || 3;
    const selfCareCount = habits?.selfCare.totalSelfCareActions || 5;
    const connectionCount = social?.totalSocialConnections || 2;
    const streak = userProgress?.currentStreak || 4;

    return WeeklySummaryCalculator.calculateReport({
      mindPillarTotal: mindCount,
      movementPillarTotal: movementCount,
      selfCarePillarTotal: selfCareCount,
      connectionPillarTotal: connectionCount,
      consecutiveDays: streak,
    });
  }, [storage]);

  const handleSyncCloud = useCallback(async () => {
    setIsSyncing(true);
    feedback.triggerSelectFeedback();
    const result: ISyncResult = await SupabaseSyncCoordinator.syncLocalProgressToCloud(storage);
    setIsSyncing(false);
    if (result.success) {
      setSyncStatus('✓ Dados salvos na nuvem com segurança');
      feedback.triggerSuccessFeedback();
    } else {
      setSyncStatus('Salvo localmente no dispositivo');
    }
  }, [storage, feedback]);

  const handleShareAchievements = useCallback(() => {
    feedback.triggerSuccessFeedback();
  }, [feedback]);

  return {
    report,
    isSyncing,
    syncStatus,
    handleSyncCloud,
    handleShareAchievements,
  };
}
