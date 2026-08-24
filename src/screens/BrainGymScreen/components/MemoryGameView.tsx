import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { IMemoryRoundState, IMemoryItem } from '../../../modules/brain/MemoryGameEngine';
import { Card, Button, AccessibleText, Badge } from '../../../ui/components';

export interface MemoryGameViewProps {
  roundState: IMemoryRoundState;
  onStartSelection: () => void;
  onToggleItem: (itemId: string) => void;
  onNextRound: () => void;
}

export const MemoryGameView: React.FC<MemoryGameViewProps> = ({
  roundState,
  onStartSelection,
  onToggleItem,
  onNextRound,
}) => {
  return (
    <Card className="p-5 bg-[#121215] border-2 border-[#27272A]">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">🖼️</Text>
          <AccessibleText variant="title-md">Memória Visual</AccessibleText>
        </View>
        <Badge variant="outline">5 FIGURAS</Badge>
      </View>

      {roundState.isMemorizationPhase ? (
        <View>
          <AccessibleText variant="body" className="text-[#A1A1AA] mb-4">
            Olhe com calma para as 5 figuras abaixo e guarde-as na memória:
          </AccessibleText>

          <View className="flex-row flex-wrap justify-between mb-6">
            {roundState.targetItems.map((item) => (
              <View
                key={item.id}
                className="w-[48%] bg-[#1D1D21] border-2 border-[#3F3F46] rounded-2xl p-4 items-center mb-3"
              >
                <Text className="text-4xl mb-1">{item.emoji}</Text>
                <AccessibleText variant="body" className="font-semibold text-center">
                  {item.name}
                </AccessibleText>
              </View>
            ))}
          </View>

          <Button
            variant="default"
            size="lg"
            accessibilityLabel="Estou pronto, iniciar fase de escolha"
            onPress={onStartSelection}
          >
            ✓ ESTOU PRONTO!
          </Button>
        </View>
      ) : (
        <View>
          <AccessibleText variant="body" className="text-[#A1A1AA] mb-4">
            Selecione as 5 figuras que você memorizou anteriormente:
          </AccessibleText>

          <View className="flex-row items-center justify-between mb-4 px-2">
            <AccessibleText variant="caption">Figuras encontradas:</AccessibleText>
            <Badge variant={roundState.isRoundComplete ? 'success' : 'secondary'}>
              {roundState.correctCount} / 5 CORRETAS
            </Badge>
          </View>

          <View className="flex-row flex-wrap justify-between mb-4">
            {roundState.displayGrid.map((item) => {
              const isSelected = roundState.selectedItemIds.includes(item.id);
              const isTarget = roundState.targetItems.some((t) => t.id === item.id);
              const borderStyle = isSelected
                ? isTarget
                  ? 'border-[#FAFAFA] bg-[#27272A]'
                  : 'border-[#52525B] bg-[#1D1D21] opacity-70'
                : 'border-[#27272A] bg-[#121215]';

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ${item.name}`}
                  onPress={() => onToggleItem(item.id)}
                  className={`w-[48%] border-2 rounded-2xl p-4 items-center mb-3 min-h-[64px] active:opacity-80 ${borderStyle}`}
                >
                  <Text className="text-4xl mb-1">{item.emoji}</Text>
                  <AccessibleText variant="body" className="font-semibold text-center">
                    {item.name}
                  </AccessibleText>
                  {isSelected && (
                    <Text className="text-xs font-mono mt-1 text-[#FAFAFA]">
                      {isTarget ? '✓ ACERTOU' : '✕ OUTRO'}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {roundState.isRoundComplete && (
            <View className="mt-2">
              <View className="p-4 bg-[#1D1D21] border border-[#3F3F46] rounded-2xl items-center mb-4">
                <AccessibleText variant="title-md" className="text-center mb-1">
                  🌟 Excelente Memória!
                </AccessibleText>
                <AccessibleText variant="body" className="text-[#A1A1AA] text-center">
                  Você encontrou todas as 5 figuras com sucesso.
                </AccessibleText>
              </View>
              <Button
                variant="default"
                size="lg"
                accessibilityLabel="Jogar outra rodada de memória"
                onPress={onNextRound}
              >
                JOGAR OUTRA RODADA
              </Button>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};
