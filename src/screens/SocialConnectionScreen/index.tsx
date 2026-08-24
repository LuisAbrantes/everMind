import React from 'react';
import { useSocialConnection, UseSocialConnectionDependencies } from './useSocialConnection';
import { SocialConnectionView } from './SocialConnectionView';

export interface SocialConnectionScreenProps {
  dependencies?: UseSocialConnectionDependencies;
  onNavigateHome?: () => void;
}

export const SocialConnectionScreen: React.FC<SocialConnectionScreenProps> = ({
  dependencies,
  onNavigateHome,
}) => {
  const hookData = useSocialConnection(dependencies);

  return (
    <SocialConnectionView
      hookData={hookData}
      onNavigateHome={onNavigateHome}
    />
  );
};

export default SocialConnectionScreen;
export * from './SocialConnectionView';
export * from './useSocialConnection';
