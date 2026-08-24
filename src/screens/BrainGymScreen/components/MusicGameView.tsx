import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { IMusicRoundState } from '../../../modules/brain/MusicGameEngine';
import { Card, Button, AccessibleText, Badge } from '../../../ui/components';

export interface MusicGameViewProps {
  roundState: IMusicRoundState;
  onTogglePlayback: () => void;
  onSelectOption: (option: string) => void;
  onNextTrack: () => void;
}

export const MusicGameView: React.FC<MusicGameViewProps> = ({
  roundState,
  onTogglePlayback,
  onSelectOption,
  onNextTrack,
}) => {
  const { track, selectedOption, isPlaying, isSolved, disabledOptions } = roundState;

  return (
    <Card className="p-5 bg-[#121215] border-2 border-[#27272A]">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">🎵</Text>
          <AccessibleText variant="title-md">Memória Musical</AccessibleText>
        </View>
        <Badge variant="outline">{track.genre}</Badge>
      </View>

      <AccessibleText variant="body" className="text-[#A1A1AA] mb-4">
        Ouça o trecho melódico e recorde o nome da canção inesquecível:
      </AccessibleText>

      {/* Music Audio Simulation Box */}
      <View className="p-5 bg-[#1D1D21] border-2 border-[#27272A] rounded-2xl items-center mb-6">
        <Text className="text-4xl mb-3">{isPlaying ? '📻 🎶 🎵' : '📻'}</Text>
        <AccessibleText variant="body-lead" className="text-center font-medium italic text-[#FAFAFA] mb-4">
          {track.soundSnippetDescription}
        </AccessibleText>

        <Button
          variant={isPlaying ? 'secondary' : 'default'}
          size="default"
          accessibilityLabel={isPlaying ? 'Pausar melodia' : 'Tocar melodia'}
          onPress={onTogglePlayback}
        >
          {isPlaying ? '⏸️ PAUSAR MELODIA' : '▶️ OUVIR TRECHO'}
        </Button>
      </View>

      {/* Answer Options */}
      <AccessibleText variant="caption" className="mb-2 text-center">
        Qual é o nome desta canção?
      </AccessibleText>

      <View className="space-y-3 mb-4">
        {track.options.map((opt) => {
          const isChosen = selectedOption === opt;
          const isCorrect = isSolved && opt === track.correctTitle;
          const isDisabled = disabledOptions.includes(opt) || isSolved;

          let btnBg = 'bg-[#1D1D21] border-[#27272A]';
          if (isCorrect) btnBg = 'bg-[#27272A] border-[#FAFAFA]';
          if (disabledOptions.includes(opt)) btnBg = 'bg-[#121215] border-[#1D1D21] opacity-40';

          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityLabel={`Canção ${opt}`}
              disabled={isDisabled}
              onPress={() => onSelectOption(opt)}
              className={`w-full min-h-[58px] border-2 rounded-2xl p-4 items-center justify-center mb-2 active:opacity-80 ${btnBg}`}
            >
              <Text className="text-xl font-bold text-[#FAFAFA]">{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Solved cultural note */}
      {isSolved && (
        <View className="mt-2">
          <View className="p-4 bg-[#1D1D21] border border-[#3F3F46] rounded-2xl mb-4">
            <AccessibleText variant="title-md" className="text-center mb-1">
              🎶 Memória Musical Afetuosa!
            </AccessibleText>
            <AccessibleText variant="body" className="text-[#A1A1AA] text-center mb-2">
              Você acertou: <Text className="font-bold text-[#FAFAFA]">{track.title}</Text> ({track.composer}).
            </AccessibleText>
            <AccessibleText variant="caption" className="text-[#A1A1AA] text-center italic text-xs">
              {track.culturalNote}
            </AccessibleText>
          </View>
          <Button
            variant="default"
            size="lg"
            accessibilityLabel="Ir para próxima canção"
            onPress={onNextTrack}
          >
            PRÓXIMA CANÇÃO
          </Button>
        </View>
      )}
    </Card>
  );
};
