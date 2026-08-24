import React from 'react';
import { useHomeScreen, UseHomeScreenDependencies } from './useHomeScreen';
import { HomeScreenView } from './HomeScreenView';
import { IDailyChallengeSummary } from '../../modules/domain/types';

export interface HomeScreenProps {
  dependencies?: UseHomeScreenDependencies;
  onNavigateToChallenge?: (route: string) => void;
  onNavigateToSurprise?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  dependencies,
  onNavigateToChallenge,
  onNavigateToSurprise,
}) => {
  const { state, toggleChallengeCompletion } = useHomeScreen(dependencies);

  const handlePressChallenge = (challenge: IDailyChallengeSummary) => {
    toggleChallengeCompletion(challenge.id);
    if (onNavigateToChallenge) {
      onNavigateToChallenge(challenge.route);
    }
  };

  const handlePressSurprise = () => {
    if (onNavigateToSurprise) {
      onNavigateToSurprise();
    }
  };

  return (
    <HomeScreenView
      state={state}
      onPressChallenge={handlePressChallenge}
      onPressSurprise={handlePressSurprise}
    />
  );
};

export default HomeScreen;
export * from './HomeScreenView';
export * from './useHomeScreen';
