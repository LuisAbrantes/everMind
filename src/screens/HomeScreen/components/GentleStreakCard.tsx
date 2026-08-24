import React from 'react';
import { View, Text } from 'react-native';
import { Card, AccessibleText, Badge } from '../../../ui/components';

export interface GentleStreakCardProps {
  streakDays: number;
  streakMessage: string;
}

export const GentleStreakCard: React.FC<GentleStreakCardProps> = ({
  streakDays,
  streakMessage,
}) => {
  return (
    <Card className="mb-6 bg-[#121215] border border-[#27272A] p-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-xl mr-2">🌱</Text>
          <AccessibleText variant="caption" className="font-mono font-bold tracking-wider uppercase text-[#A1A1AA]">
            RITMO & CONSTÂNCIA
          </AccessibleText>
        </View>

        <Badge variant="secondary" className="px-3 py-1">
          {streakDays} {streakDays === 1 ? 'DIA' : 'DIAS'}
        </Badge>
      </View>

      <AccessibleText variant="body" className="text-[#FAFAFA] font-medium leading-relaxed">
        {streakMessage}
      </AccessibleText>
    </Card>
  );
};
