import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { IAttentionRoundState } from '../../../modules/brain/AttentionGameEngine';
import { Card, Button, AccessibleText, Badge } from '../../../ui/components';

export interface AttentionGameViewProps {
  roundState: IAttentionRoundState;
  onSelectItem: (itemId: string) => void;
  onNextPuzzle: () => void;
}

export const AttentionGameView: React.FC<AttentionGameViewProps> = ({
  roundState,
  onSelectItem,
  onNextPuzzle,
}) => {
  const { puzzle, isSolved, disabledItemIds, selectedItemId } = roundState;

  return (
    <Card className="p-5 bg-[#121215] border-2 border-[#27272A]">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">👁️</Text>
          <AccessibleText variant="title-md">Atenção & Diferenças</AccessibleText>
        </View>
        <Badge variant="outline">DISCRIMINAÇÃO</Badge>
      </View>

      <AccessibleText variant="body-lead" className="text-[#FAFAFA] font-medium mb-4">
        {puzzle.instruction}
      </AccessibleText>

      {/* Grid of items */}
      <View className="flex-row flex-wrap justify-between mb-4">
        {puzzle.items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const isDisabled = disabledItemIds.includes(item.id) || isSolved;

          let cardStyle = 'bg-[#1D1D21] border-[#27272A]';
          if (isSolved && item.isDivergent) {
            cardStyle = 'bg-[#27272A] border-[#FAFAFA]';
          } else if (disabledItemIds.includes(item.id)) {
            cardStyle = 'bg-[#121215] border-[#1D1D21] opacity-40';
          }

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.label}`}
              disabled={isDisabled}
              onPress={() => onSelectItem(item.id)}
              className={`w-[48%] min-h-[90px] border-2 rounded-2xl p-4 items-center justify-center mb-3 active:opacity-80 ${cardStyle}`}
            >
              <Text className="text-5xl mb-1">{item.emoji}</Text>
              <AccessibleText variant="caption" className="text-center font-medium">
                {item.label}
              </AccessibleText>
            </Pressable>
          );
        })}
      </View>

      {/* Solved state */}
      {isSolved && (
        <View className="mt-2">
          <View className="p-4 bg-[#1D1D21] border border-[#3F3F46] rounded-2xl items-center mb-4">
            <AccessibleText variant="title-md" className="text-center mb-1">
              🎯 Olhar Atento!
            </AccessibleText>
            <AccessibleText variant="body" className="text-[#A1A1AA] text-center">
              {puzzle.explanation}
            </AccessibleText>
          </View>
          <Button
            variant="default"
            size="lg"
            accessibilityLabel="Ir para próximo desafio de atenção"
            onPress={onNextPuzzle}
          >
            PRÓXIMO DESAFIO
          </Button>
        </View>
      )}
    </Card>
  );
};
