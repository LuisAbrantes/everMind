import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useBodyMovement } from './useBodyMovement';
import { Card, Button, AccessibleText, Badge } from '../../ui/components';

export interface BodyMovementViewProps {
  hookData: ReturnType<typeof useBodyMovement>;
  onNavigateHome?: () => void;
}

export const BodyMovementView: React.FC<BodyMovementViewProps> = ({
  hookData,
  onNavigateHome,
}) => {
  const {
    todayWalkCompleted,
    totalWalkSessions,
    targetMinutes,
    timerStatus,
    formattedTime,
    toggleTimer,
    resetTimer,
    handleCompleteWalk,
  } = hookData;

  return (
    <SafeAreaView className="flex-1 bg-[#09090B]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <AccessibleText variant="title-lg" className="text-[#FAFAFA] font-extrabold">
              Mexa o Corpo
            </AccessibleText>
            <AccessibleText variant="caption" className="text-[#A1A1AA]">
              Pilar Movimento & Vitalidade Diária
            </AccessibleText>
          </View>

          {onNavigateHome && (
            <Button
              variant="outline"
              size="sm"
              accessibilityLabel="Voltar à tela inicial"
              onPress={onNavigateHome}
            >
              🏠 INÍCIO
            </Button>
          )}
        </View>

        {/* Challenge Motivation Card */}
        <Card className="mb-6 bg-[#121215] border-2 border-[#27272A] p-5">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-2">🚶</Text>
              <AccessibleText variant="title-md">Caminhada Suave</AccessibleText>
            </View>
            <Badge variant="outline">{targetMinutes} MINUTOS</Badge>
          </View>

          <AccessibleText variant="body-lead" className="text-[#FAFAFA] mb-4">
            Uma caminhada leve faz maravilhas pelo seu corpo e oxigena sua mente.
          </AccessibleText>

          <View className="bg-[#1D1D21] p-4 rounded-2xl border border-[#27272A] mb-2">
            <AccessibleText variant="caption" className="font-mono font-bold text-xs text-[#A1A1AA] uppercase mb-2">
              📍 ONDE CAMINHAR HOJE?
            </AccessibleText>
            <AccessibleText variant="body" className="text-sm text-[#FAFAFA] mb-1">
              • Na sua rua, praça ou calçada perto de casa
            </AccessibleText>
            <AccessibleText variant="body" className="text-sm text-[#FAFAFA] mb-1">
              • No seu quintal ou jardim ao ar livre
            </AccessibleText>
            <AccessibleText variant="body" className="text-sm text-[#FAFAFA]">
              • Ou dando passos confortáveis dentro da própria sala!
            </AccessibleText>
          </View>
        </Card>

        {/* Optional Compassionate Timer Box */}
        <Card className="mb-6 bg-[#121215] border border-[#27272A] p-5 items-center">
          <AccessibleText variant="caption" className="font-mono text-xs uppercase text-[#A1A1AA] mb-1">
            ⏱️ TEMPO SUGERIDO (OPCIONAL)
          </AccessibleText>

          <Text className="font-mono font-extrabold text-5xl text-[#FAFAFA] my-3">
            {formattedTime}
          </Text>

          <View className="flex-row space-x-3 w-full justify-center">
            <Button
              variant={timerStatus === 'RUNNING' ? 'secondary' : 'default'}
              size="default"
              className="mr-2 px-6"
              accessibilityLabel={timerStatus === 'RUNNING' ? 'Pausar contagem' : 'Iniciar contagem do tempo'}
              onPress={toggleTimer}
            >
              {timerStatus === 'RUNNING' ? '⏸️ PAUSAR' : '▶️ INICIAR TEMPO'}
            </Button>

            {timerStatus !== 'IDLE' && (
              <Button
                variant="outline"
                size="default"
                accessibilityLabel="Zerar cronômetro"
                onPress={resetTimer}
              >
                🔄 ZERAR
              </Button>
            )}
          </View>
        </Card>

        {/* Main Action (Direct Completion without bureaucracy) */}
        <View className="mb-6">
          <Button
            variant={todayWalkCompleted ? 'secondary' : 'default'}
            size="lg"
            accessibilityLabel="Marcar caminhada de 10 minutos como concluída hoje"
            onPress={handleCompleteWalk}
          >
            {todayWalkCompleted ? '✓ CAMINHADA CONCLUÍDA HOJE' : '✅ MARCAR COMO CONCLUÍDO'}
          </Button>
        </View>

        {/* Affirmative Reinforcement Card */}
        {todayWalkCompleted && (
          <Card className="p-5 bg-[#121215] border border-[#3F3F46] rounded-2xl mb-4">
            <AccessibleText variant="title-md" className="text-center mb-1">
              🌿 Suas pernas e coração agradecem!
            </AccessibleText>
            <AccessibleText variant="body" className="text-[#A1A1AA] text-center">
              Você completou sua caminhada de hoje e já acumula {totalWalkSessions} sessões de movimento!
            </AccessibleText>
          </Card>
        )}

        <View className="items-center py-2">
          <AccessibleText variant="caption" className="text-center italic">
            "Caminhar no seu próprio ritmo é o melhor exercício para a longevidade."
          </AccessibleText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
