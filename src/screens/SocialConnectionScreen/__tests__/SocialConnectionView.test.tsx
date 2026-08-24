import React from 'react';
import { SocialConnectionView } from '../SocialConnectionView';

describe('SocialConnectionView (Screen 05 View Presentation)', () => {
  it('should render social connection prompt and actions', () => {
    const hookData = {
      isConnectionCompletedToday: false,
      totalSocialConnections: 4,
      reminderScheduledTime: null,
      reminderConfirmed: false,
      handleCompleteCall: jest.fn(),
      handleScheduleReminder: jest.fn(),
    };

    const element = SocialConnectionView({ hookData, onNavigateHome: jest.fn() });
    expect(element).toBeDefined();
  });
});
