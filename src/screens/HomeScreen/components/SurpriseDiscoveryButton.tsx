import React from 'react';
import { View } from 'react-native';
import { Button } from '../../../ui/components';

export interface SurpriseDiscoveryButtonProps {
  onPress: () => void;
}

export const SurpriseDiscoveryButton: React.FC<SurpriseDiscoveryButtonProps> = ({ onPress }) => {
  return (
    <View className="my-3">
      <Button
        variant="outline"
        size="lg"
        accessibilityLabel="Explorar uma surpresa cultural ou novo hobby relaxante. Toque para sortear."
        onPress={onPress}
      >
        🎲 SURPREENDER-ME COM UM HOBBY
      </Button>
    </View>
  );
};
