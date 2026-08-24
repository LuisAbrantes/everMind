import React from 'react';
import { View, StatusBar } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <View className="flex-1 bg-[#09090B]">
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <RootNavigator />
    </View>
  );
}
