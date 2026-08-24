export interface IMusicTrack {
  id: string;
  title: string;
  composer: string;
  genre: string;
  soundSnippetDescription: string;
  options: string[];
  correctTitle: string;
  culturalNote: string;
}

export const PRESET_MUSIC_TRACKS: IMusicTrack[] = [
  {
    id: 'music_carinhoso',
    title: 'Carinhoso',
    composer: 'Pixinguinha e João de Barro',
    genre: 'Choro / MPB Clássica',
    soundSnippetDescription: '🎵 "Meu coração, não sei por que, bate feliz quando te vê..."',
    options: ['Carinhoso', 'Asa Branca', 'Aquarela do Brasil'],
    correctTitle: 'Carinhoso',
    culturalNote: 'Composta em 1917 por Pixinguinha, é um dos maiores hinos da música afetiva brasileira.',
  },
  {
    id: 'music_asa_branca',
    title: 'Asa Branca',
    composer: 'Luiz Gonzaga e Humberto Teixeira',
    genre: 'Baião',
    soundSnippetDescription: '🎵 "Quando olhei a terra ardendo, qual fogueira de São João..."',
    options: ['Luar do Sertão', 'Asa Branca', 'O Xote das Meninas'],
    correctTitle: 'Asa Branca',
    culturalNote: 'O clássico hino do Rei do Baião, Luiz Gonzaga, celebrando a esperança da chuva.',
  },
  {
    id: 'music_aquarela_brasil',
    title: 'Aquarela do Brasil',
    composer: 'Ary Barroso',
    genre: 'Samba Exaltação',
    soundSnippetDescription: '🎵 "Brasil, meu Brasil brasileiro, meu mulato inzoneiro..."',
    options: ['Garota de Ipanema', 'Aquarela do Brasil', 'Tico-Tico no Fubá'],
    correctTitle: 'Aquarela do Brasil',
    culturalNote: 'Composta em 1939 por Ary Barroso, levou a beleza da melodia brasileira ao mundo.',
  },
];

export interface IMusicRoundState {
  track: IMusicTrack;
  selectedOption: string | null;
  isPlaying: boolean;
  isSolved: boolean;
  disabledOptions: string[];
}

export class MusicGameEngine {
  public static createRound(trackIndex: number = 0): IMusicRoundState {
    const safeIndex = Math.abs(trackIndex) % PRESET_MUSIC_TRACKS.length;
    const track = PRESET_MUSIC_TRACKS[safeIndex];

    return {
      track,
      selectedOption: null,
      isPlaying: false,
      isSolved: false,
      disabledOptions: [],
    };
  }

  public static togglePlayback(state: IMusicRoundState): IMusicRoundState {
    return {
      ...state,
      isPlaying: !state.isPlaying,
    };
  }

  public static selectOption(
    state: IMusicRoundState,
    option: string
  ): { nextState: IMusicRoundState; isCorrect: boolean } {
    if (state.isSolved) {
      return { nextState: state, isCorrect: true };
    }

    if (option === state.track.correctTitle) {
      return {
        nextState: {
          ...state,
          selectedOption: option,
          isSolved: true,
          isPlaying: false,
        },
        isCorrect: true,
      };
    }

    const nextDisabled = [...new Set([...state.disabledOptions, option])];
    return {
      nextState: {
        ...state,
        selectedOption: option,
        disabledOptions: nextDisabled,
      },
      isCorrect: false,
    };
  }
}
