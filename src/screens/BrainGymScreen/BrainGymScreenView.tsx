import React from 'react';
import { View, ScrollView, SafeAreaView, Pressable, Text } from 'react-native';
import { BrainGameType, useBrainGym } from './useBrainGym';
import { Card, Button, AccessibleText, Badge } from '../../ui/components';
import { MemoryGameView } from './components/MemoryGameView';
import { SequenceGameView } from './components/SequenceGameView';
import { WordsGameView } from './components/WordsGameView';
import { AttentionGameView } from './components/AttentionGameView';
import { MusicGameView } from './components/MusicGameView';

export interface BrainGymScreenViewProps {
  hookData: ReturnType<typeof useBrainGym>;
  onNavigateHome?: () => void;
}

const GAME_MENU_ITEMS: {
  id: BrainGameType;
  title: string;
  subtitle: string;
  emoji: string;
  tag: string;
}[] = [
  {
    id: 'MEMORY',
    title: '1. Memória Visual',
    subtitle: 'Guarde 5 figuras acolhedoras e reencontre-as na grade.',
    emoji: '🖼️',
    tag: 'MEMÓRIA',
  },
  {
    id: 'SEQUENCE',
    title: '2. Sequência Lógica',
    subtitle: 'Descubra qual número completa a progressão matemática.',
    emoji: '🔢',
    tag: 'RACIOCÍNIO',
  },
  {
    id: 'WORDS',
    title: '3. Formação de Palavras',
    subtitle: 'Descubra palavras ricas do vocabulário com a letra sorteada.',
    emoji: '🔤',
    tag: 'LINGUAGEM',
  },
  {
    id: 'ATTENTION',
    title: '4. Atenção & Diferenças',
    subtitle: 'Encontre o item divergente no conjunto visual.',
    emoji: '👁️',
    tag: 'ATENÇÃO',
  },
  {
    id: 'MUSIC',
    title: '5. Memória Musical',
    subtitle: 'Ouça trechos de canções clássicas inesquecíveis da MPB.',
    emoji: '🎵',
    tag: 'AUDITIVO',
  },
];

export const BrainGymScreenView: React.FC<BrainGymScreenViewProps> = ({
  hookData,
  onNavigateHome,
}) => {
  const {
    activeGame,
    setActiveGame,
    completedGamesCount,
    memoryState,
    sequenceState,
    wordsState,
    attentionState,
    musicState,
    handleMemoryStartSelection,
    handleMemoryToggleItem,
    handleMemoryNextRound,
    handleSequenceSubmit,
    handleSequenceNextPuzzle,
    handleWordsSelect,
    handleWordsNextChallenge,
    handleAttentionSelect,
    handleAttentionNextPuzzle,
    handleMusicTogglePlay,
    handleMusicSelectOption,
    handleMusicNextTrack,
  } = hookData;

  return (
    <SafeAreaView className="flex-1 bg-[#09090B]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar Navigation & Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <AccessibleText variant="title-lg" className="text-[#FAFAFA] font-extrabold">
              Ginástica Cerebral
            </AccessibleText>
            <AccessibleText variant="caption" className="text-[#A1A1AA]">
              Pilar Mente & Estimulação Cognitiva
            </AccessibleText>
          </View>

          {activeGame !== 'MENU' ? (
            <Button
              variant="outline"
              size="sm"
              accessibilityLabel="Voltar ao menu de jogos"
              onPress={() => setActiveGame('MENU')}
            >
              ← MENU
            </Button>
          ) : onNavigateHome ? (
            <Button
              variant="outline"
              size="sm"
              accessibilityLabel="Voltar à tela inicial"
              onPress={onNavigateHome}
            >
              🏠 INÍCIO
            </Button>
          ) : null}
        </View>

        {/* Global Mind Stats Banner */}
        <Card className="mb-6 bg-[#121215] border border-[#27272A] p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">🧠</Text>
              <View>
                <AccessibleText variant="caption" className="font-mono font-bold uppercase text-[#A1A1AA]">
                  ATIVIDADES CONCLUÍDAS
                </AccessibleText>
                <AccessibleText variant="body" className="font-bold text-[#FAFAFA]">
                  {completedGamesCount} sessões de ginástica mental
                </AccessibleText>
              </View>
            </View>
            <Badge variant="secondary">+10 PONTOS / JOGO</Badge>
          </View>
        </Card>

        {/* Dynamic Game Rendering */}
        {activeGame === 'MENU' && (
          <View>
            <AccessibleText variant="body-lead" className="font-bold text-[#FAFAFA] mb-4">
              Escolha uma modalidade para exercitar com calma:
            </AccessibleText>

            {GAME_MENU_ITEMS.map((item) => (
              <Card
                key={item.id}
                className="mb-4 bg-[#121215] border-2 border-[#27272A] p-5"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-3">{item.emoji}</Text>
                    <View>
                      <AccessibleText variant="caption" className="font-mono font-bold uppercase text-[#A1A1AA]">
                        {item.tag}
                      </AccessibleText>
                      <AccessibleText variant="title-md" className="text-xl font-bold text-[#FAFAFA]">
                        {item.title}
                      </AccessibleText>
                    </View>
                  </View>
                </View>

                <AccessibleText variant="body" className="text-sm text-[#A1A1AA] mb-4">
                  {item.subtitle}
                </AccessibleText>

                <Button
                  variant="default"
                  size="lg"
                  accessibilityLabel={`Iniciar jogo ${item.title}`}
                  onPress={() => setActiveGame(item.id)}
                >
                  JOGAR AGORA
                </Button>
              </Card>
            ))}
          </View>
        )}

        {activeGame === 'MEMORY' && (
          <MemoryGameView
            roundState={memoryState}
            onStartSelection={handleMemoryStartSelection}
            onToggleItem={handleMemoryToggleItem}
            onNextRound={handleMemoryNextRound}
          />
        )}

        {activeGame === 'SEQUENCE' && (
          <SequenceGameView
            roundState={sequenceState}
            onSubmitAnswer={handleSequenceSubmit}
            onNextPuzzle={handleSequenceNextPuzzle}
          />
        )}

        {activeGame === 'WORDS' && (
          <WordsGameView
            roundState={wordsState}
            onSelectWord={handleWordsSelect}
            onNextChallenge={handleWordsNextChallenge}
          />
        )}

        {activeGame === 'ATTENTION' && (
          <AttentionGameView
            roundState={attentionState}
            onSelectItem={handleAttentionSelect}
            onNextPuzzle={handleAttentionNextPuzzle}
          />
        )}

        {activeGame === 'MUSIC' && (
          <MusicGameView
            roundState={musicState}
            onTogglePlayback={handleMusicTogglePlay}
            onSelectOption={handleMusicSelectOption}
            onNextTrack={handleMusicNextTrack}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
