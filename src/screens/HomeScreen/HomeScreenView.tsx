import React from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { IHomeScreenState, IDailyChallengeSummary } from '../../modules/domain/types';
import { AccessibleText, Badge } from '../../ui/components';
import { VirtualBrainWidget } from './components/VirtualBrainWidget';
import { DailyChallengeCard } from './components/DailyChallengeCard';
import { GentleStreakCard } from './components/GentleStreakCard';
import { SurpriseDiscoveryButton } from './components/SurpriseDiscoveryButton';

export interface HomeScreenViewProps {
  state: IHomeScreenState;
  onPressChallenge: (challenge: IDailyChallengeSummary) => void;
  onPressSurprise: () => void;
}

/**
 * HomeScreenView: Pure presentation dumb component (WCAG AAA & ADR-0005, ADR-0007).
 * Receives only formatted state and callbacks.
 */
export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  state,
  onPressChallenge,
  onPressSurprise,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-[#09090B]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Greeting and Subtitle */}
        <View className="mb-6">
          <AccessibleText variant="title-lg" className="text-[#FAFAFA] font-extrabold mb-1">
            {state.greeting}
          </AccessibleText>
          <AccessibleText variant="caption" className="text-lg text-[#A1A1AA]">
            {state.dateFormatted}
          </AccessibleText>
        </View>

        {/* Positive Reinforcement & Gentle Streak Card */}
        <GentleStreakCard
          streakDays={state.streakDays}
          streakMessage={state.streakMessage}
        />

        {/* Virtual Brain Progress Card */}
        <VirtualBrainWidget
          stage={state.brainStage}
          stageLabel={state.brainStageLabel}
          stageEmoji={state.brainStageEmoji}
          currentProgress={state.currentStageProgress}
          currentTarget={state.currentStageTarget}
          percentage={state.stageProgressPercentage}
          totalCompleted={state.totalCompletedChallenges}
        />

        {/* Daily Triad Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <AccessibleText variant="title-md" className="text-[#FAFAFA] font-bold">
              Tríade do Dia
            </AccessibleText>
            <AccessibleText variant="caption" className="text-sm text-[#A1A1AA] mt-0.5">
              3 metas acolhedoras para o seu dia
            </AccessibleText>
          </View>

          <Badge
            variant={state.isTriadFullyCompleted ? 'success' : 'outline'}
            className="px-3.5 py-1.5 border-[#3F3F46]"
          >
            {state.triadCompletedCount} / 3 CONCLUÍDOS
          </Badge>
        </View>

        {/* Daily Triad Challenge Cards */}
        {state.triadChallenges.map((challenge, index) => (
          <DailyChallengeCard
            key={challenge.id}
            index={index}
            challenge={challenge}
            onPress={onPressChallenge}
          />
        ))}

        {/* Surprise Discovery Action */}
        <SurpriseDiscoveryButton onPress={onPressSurprise} />

        {/* Gentle encouragement footer */}
        {state.isTriadFullyCompleted ? (
          <View className="mt-4 p-4 rounded-2xl bg-[#121215] border border-[#27272A] items-center">
            <AccessibleText variant="body-lead" className="text-[#FAFAFA] text-center font-semibold">
              🎉 Incrível! Você completou sua Tríade do Dia!
            </AccessibleText>
            <AccessibleText variant="caption" className="text-[#A1A1AA] text-center mt-1">
              Seu cérebro e seu corpo agradecem pelo carinho de hoje.
            </AccessibleText>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};
