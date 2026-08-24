import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useSelfCare } from './useSelfCare';
import { Card, Button, AccessibleText, Badge } from '../../ui/components';

export interface SelfCareViewProps {
  hookData: ReturnType<typeof useSelfCare>;
  onNavigateHome?: () => void;
}

export const SelfCareView: React.FC<SelfCareViewProps> = ({
  hookData,
  onNavigateHome,
}) => {
  const {
    waterGlassesCount,
    isWaterGoalMet,
    fruitVeggieConfirmed,
    sleepRoutineConfirmed,
    totalSelfCareActions,
    handleAddWater,
    handleConfirmFruitVeggie,
    handleConfirmSleepRoutine,
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
              Cuide de Você
            </AccessibleText>
            <AccessibleText variant="caption" className="text-[#A1A1AA]">
              Pilar Autocuidado & Bem-Estar Diário
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

        {/* Global Self Care Count Card */}
        <Card className="mb-6 bg-[#121215] border border-[#27272A] p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">🌿</Text>
              <View>
                <AccessibleText variant="caption" className="font-mono font-bold uppercase text-[#A1A1AA]">
                  HÁBITOS CULTIVADOS
                </AccessibleText>
                <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                  {totalSelfCareActions} momentos de autocuidado
                </AccessibleText>
              </View>
            </View>
            <Badge variant="secondary">+10 PONTOS / HÁBITO</Badge>
          </View>
        </Card>

        {/* 1. Water Habit Card */}
        <Card className="mb-5 bg-[#121215] border-2 border-[#27272A] p-5">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">💧</Text>
              <AccessibleText variant="title-md">1. Hora da Água</AccessibleText>
            </View>
            <Badge variant={isWaterGoalMet ? 'success' : 'outline'}>
              {waterGlassesCount} {waterGlassesCount === 1 ? 'COPO' : 'COPOS'}
            </Badge>
          </View>

          <AccessibleText variant="body" className="text-[#A1A1AA] mb-4">
            A hidratação regular mantém suas células, articulações e cérebro ativos e saudáveis.
          </AccessibleText>

          {/* Visual glass icons */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {Array.from({ length: Math.max(4, waterGlassesCount) }).map((_, i) => {
              const isFilled = i < waterGlassesCount;
              return (
                <View
                  key={i}
                  className={`w-12 h-12 rounded-2xl border-2 items-center justify-center ${
                    isFilled ? 'bg-[#27272A] border-[#FAFAFA]' : 'bg-[#1D1D21] border-[#3F3F46]'
                  }`}
                >
                  <Text className="text-xl">{isFilled ? '🥤' : '🥛'}</Text>
                </View>
              );
            })}
          </View>

          <Button
            variant="default"
            size="lg"
            accessibilityLabel="Adicionar copo de água consumido hoje"
            onPress={handleAddWater}
          >
            + ADICIONAR COPO DE ÁGUA
          </Button>
        </Card>

        {/* 2. Fruit/Vegetal Habit Card */}
        <Card className="mb-5 bg-[#121215] border-2 border-[#27272A] p-5">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">🍎</Text>
              <AccessibleText variant="title-md">2. Prato Colorido</AccessibleText>
            </View>
            {fruitVeggieConfirmed && <Badge variant="success">✓ INCLUÍDO</Badge>}
          </View>

          <AccessibleText variant="body" className="text-[#A1A1AA] mb-4">
            Você incluiu ao menos uma porção de fruta fresca ou salada/vegetal nas suas refeições hoje?
          </AccessibleText>

          <Button
            variant={fruitVeggieConfirmed ? 'secondary' : 'default'}
            size="lg"
            accessibilityLabel="Confirmar que comeu fruta ou vegetal hoje"
            disabled={fruitVeggieConfirmed}
            onPress={handleConfirmFruitVeggie}
          >
            {fruitVeggieConfirmed ? '✓ SIM, COMI FRUTA / VEGETAL' : '✅ SIM, COMI HOJE!'}
          </Button>
        </Card>

        {/* 3. Sleep Hygiene Habit Card */}
        <Card className="mb-6 bg-[#121215] border-2 border-[#27272A] p-5">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">🌙</Text>
              <AccessibleText variant="title-md">3. Sono Restaurador</AccessibleText>
            </View>
            {sleepRoutineConfirmed && <Badge variant="success">✓ RITUAL CONFIRMADO</Badge>}
          </View>

          <AccessibleText variant="body" className="text-[#A1A1AA] mb-3">
            Um sono regular restaura memórias. Dica carinhosa: evite telas de celular 30 minutos antes de deitar.
          </AccessibleText>

          <Button
            variant={sleepRoutineConfirmed ? 'secondary' : 'default'}
            size="lg"
            accessibilityLabel="Confirmar preparo para o sono tranquilo"
            disabled={sleepRoutineConfirmed}
            onPress={handleConfirmSleepRoutine}
          >
            {sleepRoutineConfirmed ? '✓ VOU DORMIR NO HORÁRIO' : '✅ VOU ME PREPARAR PARA DORMIR'}
          </Button>
        </Card>

        <View className="items-center py-2">
          <AccessibleText variant="caption" className="text-center italic">
            "Cuidar de você com pequenos gestos diários é a maior prova de amor."
          </AccessibleText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
