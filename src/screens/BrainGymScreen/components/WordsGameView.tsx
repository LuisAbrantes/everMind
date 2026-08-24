import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { IWordsRoundState } from '../../../modules/brain/WordsGameEngine';
import { Card, Button, AccessibleText, Badge } from '../../../ui/components';

export interface WordsGameViewProps {
  roundState: IWordsRoundState;
  onSelectWord: (word: string) => void;
  onNextChallenge: () => void;
}

export const WordsGameView: React.FC<WordsGameViewProps> = ({
  roundState,
  onSelectWord,
  onNextChallenge,
}) => {
  const { challenge, foundWords, optionsPool, isComplete } = roundState;

  return (
    <Card className="p-5 bg-[#121215] border-2 border-[#27272A]">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">🔤</Text>
          <AccessibleText variant="title-md">Formação de Palavras</AccessibleText>
        </View>
        <Badge variant="outline">LETRA {challenge.letter}</Badge>
      </View>

      <View className="p-4 bg-[#1D1D21] border border-[#27272A] rounded-2xl mb-4">
        <AccessibleText variant="caption" className="font-mono text-xs text-[#A1A1AA] uppercase mb-1">
          TEMA DO DESAFIO:
        </AccessibleText>
        <AccessibleText variant="body-lead" className="font-bold text-[#FAFAFA] mb-1">
          {challenge.theme}
        </AccessibleText>
        <AccessibleText variant="body" className="text-sm text-[#A1A1AA]">
          {challenge.themeDescription}
        </AccessibleText>
      </View>

      <View className="flex-row items-center justify-between mb-3 px-2">
        <AccessibleText variant="caption">Palavras encontradas:</AccessibleText>
        <Badge variant={isComplete ? 'success' : 'secondary'}>
          {foundWords.length} / {challenge.targetCount}
        </Badge>
      </View>

      {/* Selected words bar */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {foundWords.map((w, idx) => (
          <View key={idx} className="bg-[#27272A] border border-[#FAFAFA] px-4 py-2 rounded-full">
            <Text className="text-base font-bold text-[#FAFAFA]">✓ {w}</Text>
          </View>
        ))}
      </View>

      {/* Word Options Pool */}
      <AccessibleText variant="caption" className="mb-2 text-center">
        Toque nas palavras para adicionar:
      </AccessibleText>

      <View className="flex-row flex-wrap justify-between mb-4">
        {optionsPool.map((word) => {
          const isChosen = foundWords.includes(word);
          const btnBg = isChosen
            ? 'bg-[#27272A] border-[#FAFAFA] opacity-50'
            : 'bg-[#1D1D21] border-[#27272A]';

          return (
            <Pressable
              key={word}
              accessibilityRole="button"
              accessibilityLabel={`Palavra ${word}`}
              disabled={isChosen || isComplete}
              onPress={() => onSelectWord(word)}
              className={`w-[48%] min-h-[54px] border-2 rounded-2xl items-center justify-center mb-3 active:opacity-80 ${btnBg}`}
            >
              <Text className="text-lg font-semibold text-[#FAFAFA]">{word}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Complete celebration */}
      {isComplete && (
        <View className="mt-2">
          <View className="p-4 bg-[#1D1D21] border border-[#3F3F46] rounded-2xl items-center mb-4">
            <AccessibleText variant="title-md" className="text-center mb-1">
              🎉 Vocabulário Brilhante!
            </AccessibleText>
            <AccessibleText variant="body" className="text-[#A1A1AA] text-center">
              Você completou as {challenge.targetCount} palavras com a letra {challenge.letter}.
            </AccessibleText>
          </View>
          <Button
            variant="default"
            size="lg"
            accessibilityLabel="Ir para próximo tema de palavras"
            onPress={onNextChallenge}
          >
            PRÓXIMO TEMA
          </Button>
        </View>
      )}
    </Card>
  );
};
