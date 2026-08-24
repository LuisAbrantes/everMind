import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useSocialConnection } from './useSocialConnection';
import { Card, Button, AccessibleText, Badge } from '../../ui/components';

export interface SocialConnectionViewProps {
  hookData: ReturnType<typeof useSocialConnection>;
  onNavigateHome?: () => void;
}

export const SocialConnectionView: React.FC<SocialConnectionViewProps> = ({
  hookData,
  onNavigateHome,
}) => {
  const {
    isConnectionCompletedToday,
    totalSocialConnections,
    reminderConfirmed,
    handleCompleteCall,
    handleScheduleReminder,
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
              Desafio da Conexão
            </AccessibleText>
            <AccessibleText variant="caption" className="text-[#A1A1AA]">
              Pilar Conexão & Afeto Humano
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

        {/* Global Connection Stats */}
        <Card className="mb-6 bg-[#121215] border border-[#27272A] p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">❤️</Text>
              <View>
                <AccessibleText variant="caption" className="font-mono font-bold uppercase text-[#A1A1AA]">
                  LAÇOS CULTIVADOS
                </AccessibleText>
                <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                  {totalSocialConnections} momentos de carinho
                </AccessibleText>
              </View>
            </View>
            <Badge variant="secondary">+10 PONTOS / LIGAÇÃO</Badge>
          </View>
        </Card>

        {/* Warm Prompt Invitation Card */}
        <Card className="mb-6 bg-[#121215] border-2 border-[#27272A] p-5">
          <View className="flex-row items-center mb-3">
            <Text className="text-3xl mr-3">💌</Text>
            <AccessibleText variant="title-md" className="flex-1">
              "Quem você não conversa há algum tempo?"
            </AccessibleText>
          </View>

          <AccessibleText variant="body-lead" className="text-[#FAFAFA] mb-4">
            Que tal fazer uma ligação afetuosa hoje para um amigo ou familiar e perguntar:
          </AccessibleText>

          <View className="p-4 bg-[#1D1D21] rounded-2xl border border-[#3F3F46] mb-4 items-center">
            <AccessibleText variant="title-md" className="text-center italic text-[#FAFAFA]">
              🗣️ "Como foi o seu dia hoje?"
            </AccessibleText>
          </View>

          <AccessibleText variant="body" className="text-sm text-[#A1A1AA] leading-relaxed">
            Uma conversa simples de 5 minutos alegra o coração de quem fala e de quem escuta, combatendo a solidão.
          </AccessibleText>
        </Card>

        {/* Actions Suite */}
        <View className="space-y-4 mb-6">
          <Button
            variant={isConnectionCompletedToday ? 'secondary' : 'default'}
            size="lg"
            className="mb-3"
            accessibilityLabel="Confirmar que ligou ou vai ligar para um amigo ou parente agora"
            onPress={handleCompleteCall}
          >
            {isConnectionCompletedToday ? '✓ LIGAÇÃO REGISTRADA HOJE' : '📞 JÁ LIGUEI / VOU LIGAR AGORA'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            accessibilityLabel="Lembrar mais tarde de ligar"
            onPress={handleScheduleReminder}
          >
            {reminderConfirmed ? '✓ LEMBRETE ATIVADO PARA MAIS TARDE' : '⏰ LEMBRAR-ME MAIS TARDE'}
          </Button>
        </View>

        {/* Celebration / Feedback */}
        {isConnectionCompletedToday && (
          <Card className="p-5 bg-[#121215] border border-[#3F3F46] rounded-2xl mb-4">
            <AccessibleText variant="title-md" className="text-center mb-1">
              ❤️ Que gesto lindo e carinhoso!
            </AccessibleText>
            <AccessibleText variant="body" className="text-[#A1A1AA] text-center">
              Manter contato fortalece memórias afetivas e espalha bem-estar.
            </AccessibleText>
          </Card>
        )}

        <View className="items-center py-2">
          <AccessibleText variant="caption" className="text-center italic">
            "Laços de afeto e presença são o melhor remédio para o coração e para a mente."
          </AccessibleText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
