import React from 'react';
import { WeeklySummaryView } from '../WeeklySummaryView';
import { WeeklySummaryCalculator } from '../../../modules/summary/WeeklySummaryCalculator';

describe('WeeklySummaryView (Screen 07 View Presentation)', () => {
  it('should render weekly summary report with badges gallery', () => {
    const report = WeeklySummaryCalculator.calculateReport({
      mindPillarTotal: 4,
      movementPillarTotal: 3,
      selfCarePillarTotal: 5,
      connectionPillarTotal: 2,
      consecutiveDays: 7,
    });

    const hookData = {
      report,
      isSyncing: false,
      syncStatus: null,
      handleSyncCloud: jest.fn(),
      handleShareAchievements: jest.fn(),
    };

    const element = WeeklySummaryView({ hookData, onNavigateHome: jest.fn() });
    expect(element).toBeDefined();
  });
});
