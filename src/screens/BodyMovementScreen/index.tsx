import React from 'react';
import { useBodyMovement, UseBodyMovementDependencies } from './useBodyMovement';
import { BodyMovementView } from './BodyMovementView';

export interface BodyMovementScreenProps {
  dependencies?: UseBodyMovementDependencies;
  onNavigateHome?: () => void;
}

export const BodyMovementScreen: React.FC<BodyMovementScreenProps> = ({
  dependencies,
  onNavigateHome,
}) => {
  const hookData = useBodyMovement(dependencies);

  return (
    <BodyMovementView
      hookData={hookData}
      onNavigateHome={onNavigateHome}
    />
  );
};

export default BodyMovementScreen;
export * from './BodyMovementView';
export * from './useBodyMovement';
