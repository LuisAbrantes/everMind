import React from 'react';
import { View, Text } from 'react-native';
import { Card, Button, Badge, AccessibleText } from '../../../ui/components';
import { IDailyChallengeSummary, PillarType } from '../../../modules/domain/types';

export interface DailyChallengeCardProps {
  challenge: IDailyChallengeSummary;
  index: number;
  onPress: (challenge: IDailyChallengeSummary) => void;
}

const PILLAR_META: Record<PillarType, { emoji: string; name: string; tag: string }> = {
  MIND: { emoji: '🧠', name: 'Mente', tag: 'COG' },
  MOVEMENT: { emoji: '🚶', name: 'Movimento', tag: 'CORPO' },
  SELFCARE: { emoji: '💧', name: 'Autocuidado', tag: 'SAÚDE' },
  CONNECTION: { emoji: '❤️', name: 'Conexão', tag: 'AFETO' },
};

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  index,
  onPress,
}) => {
  const meta = PILLAR_META[challenge.pillar] || { emoji: '🌟', name: 'Desafio', tag: 'HÁBITO' };
  const challengeNumber = index + 1;

  const statusLabel = challenge.isCompleted ? 'Concluído' : 'Pendente';
  const accessibilityLabel = `Desafio ${challengeNumber} de 3: Pilar ${meta.name}. ${challenge.title}. ${challenge.subtitle}. Status: ${statusLabel}. Toque para abrir atividade.`;

  return (
    <Card className="mb-4 bg-[#121215] border-2 border-[#27272A] p-5">
      {/* Header Info */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2.5">{meta.emoji}</Text>
          <View>
            <AccessibleText variant="caption" className="font-mono font-bold tracking-wider text-[#A1A1AA] uppercase">
              {challengeNumber}. {meta.name}
            </AccessibleText>
          </View>
        </View>

        {challenge.isCompleted ? (
          <Badge variant="success" className="bg-[#1D1D21] border-[#3F3F46]">
            ✓ CONCLUÍDO
          </Badge>
        ) : (
          <Badge variant="outline" className="border-[#27272A]">
            +10 PONTOS
          </Badge>
        )}
      </View>

      {/* Title & Subtitle */}
      <AccessibleText variant="title-md" className="text-xl font-bold text-[#FAFAFA] mb-1.5 leading-snug">
        {challenge.title}
      </AccessibleText>
      <AccessibleText variant="body" className="text-base text-[#A1A1AA] leading-relaxed mb-5">
        {challenge.subtitle}
      </AccessibleText>

      {/* Action Button (>= 54dp senior touch target) */}
      <Button
        variant={challenge.isCompleted ? 'secondary' : 'default'}
        size="lg"
        accessibilityLabel={accessibilityLabel}
        onPress={() => onPress(challenge)}
      >
        {challenge.isCompleted ? 'REVISITAR ATIVIDADE' : 'INICIAR ATIVIDADE'}
      </Button>
    </Card>
  );
};
