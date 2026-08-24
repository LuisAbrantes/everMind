import React, { useState } from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { BrainGymScreen } from '../screens/BrainGymScreen';
import { BodyMovementScreen } from '../screens/BodyMovementScreen';
import { SelfCareScreen } from '../screens/SelfCareScreen';
import { SocialConnectionScreen } from '../screens/SocialConnectionScreen';
import { DiscoveryScreen } from '../screens/DiscoveryScreen';
import { WeeklySummaryScreen } from '../screens/WeeklySummaryScreen';
import { AccessibleText } from '../ui/components';

export type RootScreenName =
  | 'HOME'
  | 'BRAIN_GYM'
  | 'BODY_MOVEMENT'
  | 'SELF_CARE'
  | 'SOCIAL_CONNECTION'
  | 'DISCOVERY'
  | 'WEEKLY_SUMMARY';

export interface RootNavigatorProps {
  initialScreen?: RootScreenName;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({ initialScreen = 'HOME' }) => {
  const [currentScreen, setCurrentScreen] = useState<RootScreenName>(initialScreen);

  const navigateTo = (screen: RootScreenName) => {
    setCurrentScreen(screen);
  };

  const handleNavigateFromHomeChallenge = (route: string) => {
    if (route.includes('brain-gym')) navigateTo('BRAIN_GYM');
    else if (route.includes('movement')) navigateTo('BODY_MOVEMENT');
    else if (route.includes('selfcare')) navigateTo('SELF_CARE');
    else if (route.includes('connection')) navigateTo('SOCIAL_CONNECTION');
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return (
          <HomeScreen
            onNavigateToChallenge={handleNavigateFromHomeChallenge}
            onNavigateToSurprise={() => navigateTo('DISCOVERY')}
          />
        );
      case 'BRAIN_GYM':
        return <BrainGymScreen onNavigateHome={() => navigateTo('HOME')} />;
      case 'BODY_MOVEMENT':
        return <BodyMovementScreen onNavigateHome={() => navigateTo('HOME')} />;
      case 'SELF_CARE':
        return <SelfCareScreen onNavigateHome={() => navigateTo('HOME')} />;
      case 'SOCIAL_CONNECTION':
        return <SocialConnectionScreen onNavigateHome={() => navigateTo('HOME')} />;
      case 'DISCOVERY':
        return <DiscoveryScreen onNavigateHome={() => navigateTo('HOME')} />;
      case 'WEEKLY_SUMMARY':
        return <WeeklySummaryScreen onNavigateHome={() => navigateTo('HOME')} />;
      default:
        return <HomeScreen />;
    }
  };

  const navTabs: { id: RootScreenName; label: string; icon: string }[] = [
    { id: 'HOME', label: 'Hoje', icon: '☀️' },
    { id: 'BRAIN_GYM', label: 'Mente', icon: '🧠' },
    { id: 'BODY_MOVEMENT', label: 'Corpo', icon: '🚶' },
    { id: 'SELF_CARE', label: 'Cuidado', icon: '🌿' },
    { id: 'SOCIAL_CONNECTION', label: 'Afeto', icon: '❤️' },
    { id: 'DISCOVERY', label: 'Descobrir', icon: '🎲' },
    { id: 'WEEKLY_SUMMARY', label: 'Semana', icon: '🌟' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#09090B]">
      {/* Main Screen Container */}
      <View className="flex-1">{renderActiveScreen()}</View>

      {/* Accessible Bottom Tab Bar (WCAG AAA) */}
      <View className="bg-[#121215] border-t-2 border-[#27272A] py-2 px-2 flex-row justify-around items-center min-h-[64px]">
        {navTabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Aba ${tab.label}`}
              onPress={() => navigateTo(tab.id)}
              className={`items-center justify-center py-1 px-2 rounded-2xl min-h-[48px] ${
                isActive ? 'bg-[#27272A] border border-[#FAFAFA]' : 'bg-transparent'
              }`}
            >
              <Text className="text-xl mb-0.5">{tab.icon}</Text>
              <Text
                className={`text-[11px] font-sans font-bold ${
                  isActive ? 'text-[#FAFAFA]' : 'text-[#A1A1AA]'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default RootNavigator;
