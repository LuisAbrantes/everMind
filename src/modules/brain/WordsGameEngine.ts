export interface IWordChallenge {
  id: string;
  letter: string;
  theme: string;
  themeDescription: string;
  targetCount: number;
  validSuggestions: string[];
}

export const PRESET_WORD_CHALLENGES: IWordChallenge[] = [
  {
    id: 'words_letter_m',
    letter: 'M',
    theme: 'Frutas e Alimentos Gostosos',
    themeDescription: 'Pense em frutas, verduras ou comidas deliciosas iniciadas com M',
    targetCount: 3,
    validSuggestions: ['Maçã', 'Melancia', 'Mamão', 'Morango', 'Manga', 'Maracujá', 'Milho', 'Manteiga'],
  },
  {
    id: 'words_letter_c',
    letter: 'C',
    theme: 'Objetos e Coisas de Casa',
    themeDescription: 'Objetos que você encontra na sua casa ou no quarto iniciados com C',
    targetCount: 3,
    validSuggestions: ['Cadeira', 'Cama', 'Copo', 'Colher', 'Chave', 'Cortina', 'Caneca', 'Caderno'],
  },
  {
    id: 'words_letter_s',
    letter: 'S',
    theme: 'Natureza e Sentimentos',
    themeDescription: 'Coisas belas da natureza ou sentimentos com a letra S',
    targetCount: 3,
    validSuggestions: ['Sol', 'Saudade', 'Sorriso', 'Semente', 'Sombra', 'Serenidade', 'Sabiá', 'Silêncio'],
  },
];

export interface IWordsRoundState {
  challenge: IWordChallenge;
  foundWords: string[];
  optionsPool: string[];
  isComplete: boolean;
}

export class WordsGameEngine {
  public static createRound(challengeIndex: number = 0): IWordsRoundState {
    const safeIndex = Math.abs(challengeIndex) % PRESET_WORD_CHALLENGES.length;
    const challenge = PRESET_WORD_CHALLENGES[safeIndex];

    return {
      challenge,
      foundWords: [],
      optionsPool: [...challenge.validSuggestions].sort(() => 0.5 - Math.random()),
      isComplete: false,
    };
  }

  public static selectWord(
    state: IWordsRoundState,
    word: string
  ): { nextState: IWordsRoundState; isAccepted: boolean } {
    if (state.isComplete) {
      return { nextState: state, isAccepted: true };
    }

    const normalizedWord = word.trim().toLowerCase();
    const isAlreadyFound = state.foundWords.some((w) => w.toLowerCase() === normalizedWord);
    if (isAlreadyFound) {
      return { nextState: state, isAccepted: false };
    }

    const isValid = state.challenge.validSuggestions.some(
      (valid) => valid.toLowerCase() === normalizedWord
    );

    if (!isValid) {
      return { nextState: state, isAccepted: false };
    }

    const nextFound = [...state.foundWords, word];
    const isComplete = nextFound.length >= state.challenge.targetCount;

    return {
      nextState: {
        ...state,
        foundWords: nextFound,
        isComplete,
      },
      isAccepted: true,
    };
  }
}
