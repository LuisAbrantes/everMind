import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ISequenceRoundState } from '../../../modules/brain/SequenceGameEngine';
import { Card, Button, AccessibleText, Badge } from '../../../ui/components';

export interface SequenceGameViewProps {
  roundState: ISequenceRoundState;
  onSubmitAnswer: (answer: number) => void;
  onNextPuzzle: () => void;
}

export const SequenceGameView: React.FC<SequenceGameViewProps> = ({
  roundState,
  onSubmitAnswer,
  onNextPuzzle,
}) => {
  const { puzzle, isSolved, disabledOptions, showHint } = roundState;

  return (
    <Card className="p-5 bg-[#121215] border-2 border-[#27272A]">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">🔢</Text>
          <AccessibleText variant="title-md">Sequência Lógica</AccessibleText>
        </View>
        <Badge variant="outline">NÚMEROS</Badge>
      </View>

      <AccessibleText variant="body" className="text-[#A1A1AA] mb-4">
        Descubra qual número completa o padrão lógico com calma:
      </AccessibleText>

      {/* Sequence visual boxes */}
      <View className="flex-row justify-center items-center space-x-3 mb-6">
        {puzzle.sequence.map((item, idx) => {
          const isTargetBox = item === '?';
          const boxBg = isTargetBox
            ? isSolved
              ? 'bg-[#27272A] border-[#FAFAFA]'
              : 'bg-[#1D1D21] border-[#52525B]'
            : 'bg-[#121215] border-[#27272A]';

          return (
            <View
              key={idx}
              className={`w-16 h-16 rounded-2xl border-2 items-center justify-center mx-1.5 ${boxBg}`}
            >
              <Text className="font-mono font-extrabold text-2xl text-[#FAFAFA]">
                {isTargetBox && isSolved ? puzzle.correctAnswer : item}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Options grid */}
      <AccessibleText variant="caption" className="mb-2 text-center">
        Escolha uma alternativa:
      </AccessibleText>

      <View className="flex-row flex-wrap justify-between mb-4">
        {puzzle.options.map((opt) => {
          const isDisabled = disabledOptions.includes(opt) || isSolved;
          const isCorrectPicked = isSolved && opt === puzzle.correctAnswer;

          let btnBg = 'bg-[#1D1D21] border-[#27272A]';
          if (isCorrectPicked) btnBg = 'bg-[#27272A] border-[#FAFAFA]';
          if (disabledOptions.includes(opt)) btnBg = 'bg-[#121215] border-[#1D1D21] opacity-40';

          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityLabel={`Opção número ${opt}`}
              disabled={isDisabled}
              onPress={() => onSubmitAnswer(opt)}
              className={`w-[48%] min-h-[58px] border-2 rounded-2xl items-center justify-center mb-3 active:opacity-80 ${btnBg}`}
            >
              <Text className="font-mono font-bold text-2xl text-[#FAFAFA]">{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Gentle Hint */}
      {showHint && !isSolved && (
        <View className="p-4 bg-[#1D1D21] border border-[#3F3F46] rounded-2xl mb-4">
          <AccessibleText variant="caption" className="font-mono text-xs text-[#FAFAFA] uppercase mb-1">
            💡 DICA CARINHOSA:
          </AccessibleText>
          <AccessibleText variant="body" className="text-sm text-[#A1A1AA]">
            {puzzle.hint}
          </AccessibleText>
        </View>
      )}

      {/* Solved celebration */}
      {isSolved && (
        <View className="mt-2">
          <View className="p-4 bg-[#1D1D21] border border-[#3F3F46] rounded-2xl items-center mb-4">
            <AccessibleText variant="title-md" className="text-center mb-1">
              ✨ Raciocínio Perfeito!
            </AccessibleText>
            <AccessibleText variant="body" className="text-[#A1A1AA] text-center">
              {puzzle.ruleDescription}: a resposta certa é {puzzle.correctAnswer}.
            </AccessibleText>
          </View>
          <Button
            variant="default"
            size="lg"
            accessibilityLabel="Ir para próximo desafio numérico"
            onPress={onNextPuzzle}
          >
            PRÓXIMO DESAFIO
          </Button>
        </View>
      )}
    </Card>
  );
};
