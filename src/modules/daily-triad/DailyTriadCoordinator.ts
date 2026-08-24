import { IDailyChallengeSummary, PillarType } from '../domain/types';

export const MASTER_CHALLENGE_CATALOG: Omit<IDailyChallengeSummary, 'isCompleted' | 'completedAt'>[] = [
  // Pilar Mente
  {
    id: 'mind_sequence_easy',
    pillar: 'MIND',
    title: 'Sequência Numérica',
    subtitle: 'Descubra o próximo número da sequência lógica e exercite seu raciocínio.',
    route: '/brain-gym/sequence',
    growthPoints: 10,
  },
  {
    id: 'mind_memory_pairs',
    pillar: 'MIND',
    title: 'Memória Visual',
    subtitle: 'Encontre os 5 pares de figuras acolhedoras no seu tempo.',
    route: '/brain-gym/memory',
    growthPoints: 10,
  },
  {
    id: 'mind_word_puzzle',
    pillar: 'MIND',
    title: 'Formação de Palavras',
    subtitle: 'Descubra 3 palavras carinhosas com as letras propostas.',
    route: '/brain-gym/words',
    growthPoints: 10,
  },

  // Pilar Movimento
  {
    id: 'movement_walk_10min',
    pillar: 'MOVEMENT',
    title: 'Caminhada Suave de 10 min',
    subtitle: 'Dê passos confortáveis no quintal, na sala ou na calçada ao ar livre.',
    route: '/movement/walk',
    growthPoints: 10,
  },
  {
    id: 'movement_stretch_morning',
    pillar: 'MOVEMENT',
    title: 'Alongamento Matinal',
    subtitle: 'Cinco minutos de respiração e relaxamento para os ombros e coluna.',
    route: '/movement/stretch',
    growthPoints: 10,
  },

  // Pilar Autocuidado
  {
    id: 'selfcare_water_glass',
    pillar: 'SELFCARE',
    title: 'Hora da Água',
    subtitle: 'Aprecie um copo cheio de água fresca para hidratar seu corpo.',
    route: '/selfcare/water',
    growthPoints: 10,
  },
  {
    id: 'selfcare_fruit_snack',
    pillar: 'SELFCARE',
    title: 'Fruta ou Vegetal no Prato',
    subtitle: 'Saboreie uma porção de fruta fresca ou vegetal no lanche ou refeição.',
    route: '/selfcare/fruit',
    growthPoints: 10,
  },
  {
    id: 'selfcare_relax_sleep',
    pillar: 'SELFCARE',
    title: 'Preparação para o Sono',
    subtitle: 'Desligue telas 30 minutos antes de dormir e desfrute de um chá morno.',
    route: '/selfcare/sleep',
    growthPoints: 10,
  },

  // Pilar Conexão
  {
    id: 'connection_call_loved_one',
    pillar: 'CONNECTION',
    title: 'Telefonema Acolhedor',
    subtitle: 'Ligue para um amigo ou familiar querido e pergunte: "Como foi o seu dia?"',
    route: '/connection/call',
    growthPoints: 10,
  },
  {
    id: 'connection_kind_message',
    pillar: 'CONNECTION',
    title: 'Mensagem de Carinho',
    subtitle: 'Envie um áudio ou mensagem afetuosa de bom dia para alguém especial.',
    route: '/connection/message',
    growthPoints: 10,
  },
];

export class DailyTriadCoordinator {
  /**
   * Deterministically generates 3 distinct daily challenges balancing the 4 pillars.
   */
  public static generateTriadForDate(
    dateString: string,
    completedIds: string[] = []
  ): [IDailyChallengeSummary, IDailyChallengeSummary, IDailyChallengeSummary] {
    // Deterministic hash based on date string (e.g. "2026-08-19")
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
      seed = (seed << 5) - seed + dateString.charCodeAt(i);
      seed |= 0;
    }
    const absSeed = Math.abs(seed);

    // Pick 3 distinct pillars deterministically
    const allPillars: PillarType[] = ['MIND', 'MOVEMENT', 'SELFCARE', 'CONNECTION'];
    const chosenPillars: PillarType[] = [];

    const p1Index = absSeed % allPillars.length;
    chosenPillars.push(allPillars[p1Index]);

    const remainingPillars = allPillars.filter((p) => p !== chosenPillars[0]);
    const p2Index = Math.floor(absSeed / 4) % remainingPillars.length;
    chosenPillars.push(remainingPillars[p2Index]);

    const remainingPillars2 = remainingPillars.filter((p) => p !== chosenPillars[1]);
    const p3Index = Math.floor(absSeed / 16) % remainingPillars2.length;
    chosenPillars.push(remainingPillars2[p3Index]);

    const triad: IDailyChallengeSummary[] = [];

    for (let i = 0; i < 3; i++) {
      const pillar = chosenPillars[i];
      const matching = MASTER_CHALLENGE_CATALOG.filter((c) => c.pillar === pillar);
      const challengeTemplate = matching[absSeed % matching.length];
      const isCompleted = completedIds.includes(challengeTemplate.id);

      triad.push({
        ...challengeTemplate,
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
      });
    }

    return [triad[0], triad[1], triad[2]];
  }
}
