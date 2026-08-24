import React from 'react';
import { useBrainGym, UseBrainGymDependencies } from './useBrainGym';
import { BrainGymScreenView } from './BrainGymScreenView';

export interface BrainGymScreenProps {
  dependencies?: UseBrainGymDependencies;
  onNavigateHome?: () => void;
}

export const BrainGymScreen: React.FC<BrainGymScreenProps> = ({
  dependencies,
  onNavigateHome,
}) => {
  const hookData = useBrainGym(dependencies);

  return (
    <BrainGymScreenView
      hookData={hookData}
      onNavigateHome={onNavigateHome}
    />
  );
};

export default BrainGymScreen;
export * from './BrainGymScreenView';
export * from './useBrainGym';
