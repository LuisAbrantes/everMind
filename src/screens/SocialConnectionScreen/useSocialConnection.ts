import { useState, useCallback, useMemo } from 'react';
import { IStorageGateway } from '../../modules/storage/IStorageGateway';
import { MMKVStorageGateway } from '../../modules/storage/MMKVStorageGateway';
import { IFeedbackService } from '../../modules/feedback/IFeedbackService';
import { MockFeedbackService } from '../../modules/feedback/MockFeedbackService';
import { SocialCoordinator, ISocialStorageState } from '../../modules/social/SocialCoordinator';

export interface UseSocialConnectionDependencies {
  storageGateway?: IStorageGateway;
  feedbackService?: IFeedbackService;
  todayDateStr?: string;
}

export function useSocialConnection(deps?: UseSocialConnectionDependencies) {
  const storage = useMemo(() => deps?.storageGateway || new MMKVStorageGateway(), [deps?.storageGateway]);
  const feedback = useMemo(() => deps?.feedbackService || new MockFeedbackService(), [deps?.feedbackService]);
  const todayStr = useMemo(() => deps?.todayDateStr || new Date().toISOString().slice(0, 10), [deps?.todayDateStr]);

  const [socialState, setSocialState] = useState<ISocialStorageState>(() => {
    return SocialCoordinator.loadState(storage, todayStr);
  });

  const [reminderConfirmed, setReminderConfirmed] = useState<boolean>(false);

  const handleCompleteCall = useCallback(() => {
    const nextState = SocialCoordinator.completeSocialConnection(storage, socialState, todayStr);
    setSocialState(nextState);
    feedback.triggerSuccessFeedback();
  }, [storage, socialState, todayStr, feedback]);

  const handleScheduleReminder = useCallback(() => {
    const nextState = SocialCoordinator.scheduleReminder(storage, socialState, '16:00');
    setSocialState(nextState);
    setReminderConfirmed(true);
    feedback.triggerGentleNoticeFeedback();
  }, [storage, socialState, feedback]);

  return {
    isConnectionCompletedToday: socialState.isConnectionCompletedToday,
    totalSocialConnections: socialState.totalSocialConnections,
    reminderScheduledTime: socialState.reminderScheduledTime,
    reminderConfirmed,
    handleCompleteCall,
    handleScheduleReminder,
  };
}
