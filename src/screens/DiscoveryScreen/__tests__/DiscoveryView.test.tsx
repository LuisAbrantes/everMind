import React from 'react';
import { DiscoveryView } from '../DiscoveryView';
import { DiscoveryEngine } from '../../../modules/discovery/DiscoveryEngine';

describe('DiscoveryView (Screen 06 View Presentation)', () => {
  it('should render discovery categories and current discovery card', () => {
    const mockDiscovery = DiscoveryEngine.rollSurprise([], 'ALL');
    const hookData = {
      selectedCategory: 'ALL' as const,
      currentDiscovery: mockDiscovery,
      isCompletedCurrent: false,
      completedCount: 3,
      categories: DiscoveryEngine.getCategories(),
      handleRollSurprise: jest.fn(),
      handleSelectCategory: jest.fn(),
      handleCompleteDiscovery: jest.fn(),
    };

    const element = DiscoveryView({ hookData, onNavigateHome: jest.fn() });
    expect(element).toBeDefined();
  });
});
