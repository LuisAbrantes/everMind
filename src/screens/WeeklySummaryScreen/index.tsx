import React from 'react';
import { useWeeklySummary, UseWeeklySummaryDependencies } from './useWeeklySummary';
import { WeeklySummaryView } from './WeeklySummaryView';

export interface WeeklySummaryScreenProps {
  dependencies?: UseWeeklySummaryDependencies;
  onNavigateHome?: () => void;
}

export const WeeklySummaryScreen: React.FC<WeeklySummaryScreenProps> = ({
  dependencies,
  onNavigateHome,
}) => {
  const hookData = useWeeklySummary(dependencies);

  return (
    <WeeklySummaryView
      hookData={hookData}
      onNavigateHome={onNavigateHome}
    />
  );
};

export default WeeklySummaryScreen;
export * from './WeeklySummaryView';
export * from './useWeeklySummary';
