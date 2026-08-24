import React from 'react';
import { useDiscovery, UseDiscoveryDependencies } from './useDiscovery';
import { DiscoveryView } from './DiscoveryView';

export interface DiscoveryScreenProps {
  dependencies?: UseDiscoveryDependencies;
  onNavigateHome?: () => void;
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  dependencies,
  onNavigateHome,
}) => {
  const hookData = useDiscovery(dependencies);

  return (
    <DiscoveryView
      hookData={hookData}
      onNavigateHome={onNavigateHome}
    />
  );
};

export default DiscoveryScreen;
export * from './DiscoveryView';
export * from './useDiscovery';
