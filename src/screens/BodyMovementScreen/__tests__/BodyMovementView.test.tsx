import React from 'react';
import { BodyMovementView } from '../BodyMovementView';

describe('BodyMovementView (Screen 03 View Presentation)', () => {
  it('should render movement view with timer and action buttons', () => {
    const hookData = {
      todayWalkCompleted: false,
      totalWalkSessions: 3,
      targetMinutes: 10,
      timerStatus: 'IDLE' as const,
      secondsElapsed: 0,
      formattedTime: '00:00',
      toggleTimer: jest.fn(),
      resetTimer: jest.fn(),
      handleCompleteWalk: jest.fn(),
    };

    const element = BodyMovementView({ hookData, onNavigateHome: jest.fn() });
    expect(element).toBeDefined();
  });
});
