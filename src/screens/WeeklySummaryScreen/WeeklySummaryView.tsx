import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useWeeklySummary } from './useWeeklySummary';
import { Card, Button, AccessibleText, Badge } from '../../ui/components';

export interface WeeklySummaryViewProps {
  hookData: ReturnType<typeof useWeeklySummary>;
  onNavigateHome?: () => void;
}

export const WeeklySummaryView: React.FC<WeeklySummaryViewProps> = ({
  hookData,
  onNavigateHome,
}) => {
  const {
    report,
    isSyncing,
    syncStatus,
    handleSyncCloud,
    handleShareAchievements,
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
              Minha Semana
            </AccessibleText>
            <AccessibleText variant="caption" className="text-[#A1A1AA]">
              Retrospectiva Positiva dos 4 Pilares
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

        {/* Affirmative Message Banner */}
        <Card className="mb-6 bg-[#121215] border-2 border-[#27272A] p-5">
          <View className="flex-row items-center mb-3">
            <Text className="text-3xl mr-2">🌟</Text>
            <AccessibleText variant="title-md">Vitórias da Sua Semana</AccessibleText>
          </View>

          <AccessibleText variant="body-lead" className="text-[#FAFAFA] font-medium leading-relaxed mb-3">
            {report.affirmativeMessage}
          </AccessibleText>

          <View className="self-start bg-[#1D1D21] px-3.5 py-1.5 rounded-full border border-[#3F3F46]">
            <Text className="text-xs font-mono font-bold text-[#FAFAFA]">
              {report.totalActivitiesCompleted} ATIVIDADES CONQUISTADAS
            </Text>
          </View>
        </Card>

        {/* 4 Pillars Breakdown */}
        <AccessibleText variant="caption" className="font-mono font-bold text-xs uppercase text-[#A1A1AA] mb-3">
          📊 SEUS 4 PILARES DA LONGEVIDADE:
        </AccessibleText>

        <View className="space-y-3 mb-6">
          {/* Mente */}
          <Card className="mb-3 bg-[#121215] border-2 border-[#27272A] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🧠</Text>
              <View>
                <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                  {report.mindPillarTotal} Atividades Mentais
                </AccessibleText>
                <AccessibleText variant="caption" className="text-xs text-[#A1A1AA]">
                  Jogos de memória, sequência e raciocínio
                </AccessibleText>
              </View>
            </View>
            <Badge variant="outline">MENTE</Badge>
          </Card>

          {/* Movimento */}
          <Card className="mb-3 bg-[#121215] border-2 border-[#27272A] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🚶</Text>
              <View>
                <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                  {report.movementPillarTotal} Caminhadas & Movimento
                </AccessibleText>
                <AccessibleText variant="caption" className="text-xs text-[#A1A1AA]">
                  Sessões de passos e oxigenação
                </AccessibleText>
              </View>
            </View>
            <Badge variant="outline">CORPO</Badge>
          </Card>

          {/* Autocuidado */}
          <Card className="mb-3 bg-[#121215] border-2 border-[#27272A] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🌿</Text>
              <View>
                <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                  {report.selfCarePillarTotal} Momentos de Autocuidado
                </AccessibleText>
                <AccessibleText variant="caption" className="text-xs text-[#A1A1AA]">
                  Água, frutas nutritivas e sono restaurador
                </AccessibleText>
              </View>
            </View>
            <Badge variant="outline">SAÚDE</Badge>
          </Card>

          {/* Conexão */}
          <Card className="mb-3 bg-[#121215] border-2 border-[#27272A] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">❤️</Text>
              <View>
                <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                  {report.connectionPillarTotal} Contatos de Afeto
                </AccessibleText>
                <AccessibleText variant="caption" className="text-xs text-[#A1A1AA]">
                  Ligações e conversas calorosas
                </AccessibleText>
              </View>
            </View>
            <Badge variant="outline">AFETO</Badge>
          </Card>
        </View>

        {/* Badges / Conquistas Gallery */}
        <AccessibleText variant="caption" className="font-mono font-bold text-xs uppercase text-[#A1A1AA] mb-3">
          🏆 QUADRO DE CONQUISTAS (BADGES):
        </AccessibleText>

        <View className="space-y-3 mb-6">
          {report.badges.map((badge) => {
            const isUnlocked = badge.unlockedAt !== null;
            return (
              <Card
                key={badge.id}
                className={`mb-3 p-4 flex-row items-center justify-between ${
                  isUnlocked
                    ? 'bg-[#121215] border-2 border-[#3F3F46]'
                    : 'bg-[#0E0E11] border border-[#1D1D21] opacity-50'
                }`}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <Text className="text-3xl mr-3">{badge.icon}</Text>
                  <View className="flex-1">
                    <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                      {badge.name}
                    </AccessibleText>
                    <AccessibleText variant="caption" className="text-xs text-[#A1A1AA]">
                      {badge.description}
                    </AccessibleText>
                  </View>
                </View>
                <Badge variant={isUnlocked ? 'success' : 'outline'}>
                  {isUnlocked ? 'CONQUISTADA' : 'EM PROGRESSO'}
                </Badge>
              </Card>
            );
          })}
        </View>

        {/* Actions (Share & Supabase Sync) */}
        <View className="space-y-3 mb-6">
          <Button
            variant="default"
            size="lg"
            className="mb-3"
            accessibilityLabel="Compartilhar minhas conquistas da semana com a família"
            onPress={handleShareAchievements}
          >
            📤 COMPARTILHAR CONQUISTAS
          </Button>

          <Button
            variant="outline"
            size="lg"
            accessibilityLabel="Sincronizar progresso na nuvem Supabase"
            isLoading={isSyncing}
            onPress={handleSyncCloud}
          >
            ☁️ SINCRONIZAR NA NUVEM
          </Button>

          {syncStatus && (
            <AccessibleText variant="caption" className="text-center text-xs text-[#A1A1AA] mt-1">
              {syncStatus}
            </AccessibleText>
          )}
        </View>

        <View className="items-center py-2">
          <AccessibleText variant="caption" className="text-center italic">
            "Cada novo dia é uma oportunidade de celebrar a vida e cuidar de quem você é."
          </AccessibleText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
