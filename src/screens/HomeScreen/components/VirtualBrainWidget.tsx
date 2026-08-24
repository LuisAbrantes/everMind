import React from 'react';
import { View } from 'react-native';
import { Card, Avatar, Progress, AccessibleText, Badge } from '../../../ui/components';
import { BrainStage } from '../../../modules/domain/types';

export interface VirtualBrainWidgetProps {
  stage: BrainStage;
  stageLabel: string;
  stageEmoji: string;
  currentProgress: number;
  currentTarget: number;
  percentage: number;
  totalCompleted: number;
}

export const VirtualBrainWidget: React.FC<VirtualBrainWidgetProps> = ({
  stage,
  stageLabel,
  stageEmoji,
  currentProgress,
  currentTarget,
  percentage,
  totalCompleted,
}) => {
  const isMaster = stage === 'MEGA';
  const progressText = isMaster
    ? `${totalCompleted} desafios concluídos (Nível Máximo)`
    : `${currentProgress} de ${currentTarget} desafios`;

  const accessibilityLabel = `Seu Cérebro Virtual está no estágio ${stageLabel}. Você completou ${progressText}. Progresso do nível: ${percentage} por cento.`;

  return (
    <Card className="mb-6 bg-[#121215] border-2 border-[#27272A] p-5">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Avatar
            emoji={stageEmoji}
            size="lg"
            accessibilityLabel={`Mascote do cérebro no estágio ${stageLabel}`}
          />
          <View className="ml-4">
            <AccessibleText variant="caption" className="font-mono font-bold tracking-wider uppercase text-[#A1A1AA]">
              MEU CÉREBRO VIRTUAL
            </AccessibleText>
            <AccessibleText variant="title-md" className="text-[#FAFAFA] font-extrabold">
              {stageLabel}
            </AccessibleText>
          </View>
        </View>

        <Badge variant="outline" className="px-3.5 py-1.5 border-[#3F3F46]">
          {stage}
        </Badge>
      </View>

      <View className="mt-1">
        <View className="flex-row justify-between items-center mb-2">
          <AccessibleText variant="caption" className="text-sm text-[#A1A1AA] font-medium">
            Progresso de Estágio
          </AccessibleText>
          <AccessibleText variant="mono-stat" className="text-sm text-[#FAFAFA]">
            {isMaster ? `TOTAL: ${totalCompleted}` : `${currentProgress} / ${currentTarget}`}
          </AccessibleText>
        </View>

        <Progress
          value={percentage}
          accessibilityLabel={accessibilityLabel}
          height={14}
        />
      </View>
    </Card>
  );
};
