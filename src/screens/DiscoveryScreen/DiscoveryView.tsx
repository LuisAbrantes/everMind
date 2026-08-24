import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useDiscovery } from './useDiscovery';
import { Card, Button, AccessibleText, Badge } from '../../ui/components';

export interface DiscoveryViewProps {
  hookData: ReturnType<typeof useDiscovery>;
  onNavigateHome?: () => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  hookData,
  onNavigateHome,
}) => {
  const {
    selectedCategory,
    currentDiscovery,
    isCompletedCurrent,
    completedCount,
    categories,
    handleRollSurprise,
    handleSelectCategory,
    handleCompleteDiscovery,
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
              Descubra Algo Novo
            </AccessibleText>
            <AccessibleText variant="caption" className="text-[#A1A1AA]">
              Curiosidade, Hobbies & Neuroplasticidade
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

        {/* Global stats */}
        <Card className="mb-6 bg-[#121215] border border-[#27272A] p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">🎲</Text>
              <View>
                <AccessibleText variant="caption" className="font-mono font-bold uppercase text-[#A1A1AA]">
                  DESCOBERTAS REALIZADAS
                </AccessibleText>
                <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                  {completedCount} novos horizontes explorados
                </AccessibleText>
              </View>
            </View>
            <Badge variant="secondary">+10 PONTOS / DESCOBERTA</Badge>
          </View>
        </Card>

        {/* Surprise Main Button */}
        <View className="mb-6">
          <Button
            variant="default"
            size="lg"
            className="border-2 border-[#FAFAFA]"
            accessibilityLabel="Sortear um passatempo ou curiosidade agora"
            onPress={() => handleRollSurprise()}
          >
            🎲 SURPREENDER-ME AGORA!
          </Button>
        </View>

        {/* Categories Carousel / Badges */}
        <View className="mb-6">
          <AccessibleText variant="caption" className="font-mono font-bold text-xs uppercase text-[#A1A1AA] mb-3">
            📚 OU ESCOLHA UMA CATEGORIA:
          </AccessibleText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filtrar todas as categorias"
              onPress={() => handleSelectCategory('ALL')}
              className={`mr-2 px-4 py-2 rounded-full border ${
                selectedCategory === 'ALL'
                  ? 'bg-[#FAFAFA] border-[#FAFAFA]'
                  : 'bg-[#1D1D21] border-[#27272A]'
              }`}
            >
              <Text
                className={`font-sans font-bold text-sm ${
                  selectedCategory === 'ALL' ? 'text-[#09090B]' : 'text-[#FAFAFA]'
                }`}
              >
                ✨ Todas
              </Text>
            </Pressable>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.category;
              return (
                <Pressable
                  key={cat.category}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ${cat.label}`}
                  onPress={() => handleSelectCategory(cat.category)}
                  className={`mr-2 px-4 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-[#FAFAFA] border-[#FAFAFA]'
                      : 'bg-[#1D1D21] border-[#27272A]'
                  }`}
                >
                  <Text
                    className={`font-sans font-bold text-sm ${
                      isSelected ? 'text-[#09090B]' : 'text-[#FAFAFA]'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Current Discovery Card */}
        <Card className="mb-6 bg-[#121215] border-2 border-[#27272A] p-5">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">{currentDiscovery.categoryIcon}</Text>
              <View>
                <AccessibleText variant="caption" className="font-mono font-bold uppercase text-[#A1A1AA]">
                  {currentDiscovery.categoryLabel}
                </AccessibleText>
                <AccessibleText variant="title-md" className="text-xl font-bold text-[#FAFAFA]">
                  {currentDiscovery.title}
                </AccessibleText>
              </View>
            </View>
          </View>

          <AccessibleText variant="body-lead" className="text-[#FAFAFA] mb-4">
            {currentDiscovery.description}
          </AccessibleText>

          <View className="p-4 bg-[#1D1D21] rounded-2xl border border-[#27272A] mb-5">
            <AccessibleText variant="caption" className="font-mono font-bold text-xs uppercase text-[#A1A1AA] mb-1">
              💡 DICA PRÁTICA:
            </AccessibleText>
            <AccessibleText variant="body" className="text-sm text-[#FAFAFA] leading-relaxed">
              {currentDiscovery.practicalTip}
            </AccessibleText>
          </View>

          <Button
            variant={isCompletedCurrent ? 'secondary' : 'default'}
            size="lg"
            accessibilityLabel="Marcar esta descoberta como concluída"
            disabled={isCompletedCurrent}
            onPress={handleCompleteDiscovery}
          >
            {isCompletedCurrent ? '✓ DESCOBERTA CONCLUÍDA!' : '✅ CONCLUÍ ESTA DESCOBERTA!'}
          </Button>
        </Card>

        <View className="items-center py-2">
          <AccessibleText variant="caption" className="text-center italic">
            "Aprender algo novo todos os dias mantém a juventude da mente e do coração."
          </AccessibleText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
