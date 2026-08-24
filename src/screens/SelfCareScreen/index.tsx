import React from 'react';
import { useSelfCare, UseSelfCareDependencies } from './useSelfCare';
import { SelfCareView } from './SelfCareView';

export interface SelfCareScreenProps {
  dependencies?: UseSelfCareDependencies;
  onNavigateHome?: () => void;
}

export const SelfCareScreen: React.FC<SelfCareScreenProps> = ({
  dependencies,
  onNavigateHome,
}) => {
  const hookData = useSelfCare(dependencies);

  return (
    <SelfCareView
      hookData={hookData}
      onNavigateHome={onNavigateHome}
    />
  );
};

export default SelfCareScreen;
export * from './SelfCareView';
export * from './useSelfCare';
