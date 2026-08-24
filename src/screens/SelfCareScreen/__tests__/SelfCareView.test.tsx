import React from 'react';
import { SelfCareView } from '../SelfCareView';

describe('SelfCareView (Screen 04 View Presentation)', () => {
  it('should render self care habits view cleanly', () => {
    const hookData = {
      todayDate: '2026-08-24',
      waterGlassesCount: 3,
      isWaterGoalMet: false,
      fruitVeggieConfirmed: true,
      sleepRoutineConfirmed: false,
      totalSelfCareActions: 10,
      handleAddWater: jest.fn(),
      handleConfirmFruitVeggie: jest.fn(),
      handleConfirmSleepRoutine: jest.fn(),
    };

    const element = SelfCareView({ hookData, onNavigateHome: jest.fn() });
    expect(element).toBeDefined();
  });
});
