export interface ISequencePuzzle {
  id: string;
  sequence: (number | '?')[];
  correctAnswer: number;
  options: number[];
  ruleDescription: string;
  hint: string;
}

export const PRESET_SEQUENCES: ISequencePuzzle[] = [
  {
    id: 'seq_even_2',
    sequence: [2, 4, 6, '?'],
    correctAnswer: 8,
    options: [7, 8, 9, 10],
    ruleDescription: 'Adicionando 2 a cada passo',
    hint: 'Observe que os números aumentam de 2 em 2: 2 + 2 = 4, 4 + 2 = 6...',
  },
  {
    id: 'seq_five_5',
    sequence: [5, 10, 15, '?'],
    correctAnswer: 20,
    options: [18, 19, 20, 25],
    ruleDescription: 'Contando de 5 em 5',
    hint: 'Pense nos ponteiros do relógio ou na tabuada do 5: 5, 10, 15...',
  },
  {
    id: 'seq_three_3',
    sequence: [3, 6, 9, '?'],
    correctAnswer: 12,
    options: [10, 11, 12, 15],
    ruleDescription: 'Adicionando 3 a cada número',
    hint: 'Cada número é 3 unidades maior que o anterior: 9 + 3 = ?',
  },
  {
    id: 'seq_double_2',
    sequence: [1, 2, 4, '?'],
    correctAnswer: 8,
    options: [6, 7, 8, 10],
    ruleDescription: 'Dobrando o valor anterior',
    hint: 'Cada número é o dobro do anterior: 1 x 2 = 2, 2 x 2 = 4, 4 x 2 = ?',
  },
  {
    id: 'seq_ten_10',
    sequence: [10, 20, 30, '?'],
    correctAnswer: 40,
    options: [35, 40, 45, 50],
    ruleDescription: 'Aumentando de 10 em 10',
    hint: 'Contando as dezenas: dez, vinte, trinta...',
  },
];

export interface ISequenceRoundState {
  puzzle: ISequencePuzzle;
  selectedAnswer: number | null;
  isSolved: boolean;
  disabledOptions: number[];
  showHint: boolean;
}

export class SequenceGameEngine {
  public static createRound(puzzleIndex: number = 0): ISequenceRoundState {
    const safeIndex = Math.abs(puzzleIndex) % PRESET_SEQUENCES.length;
    const puzzle = PRESET_SEQUENCES[safeIndex];

    return {
      puzzle,
      selectedAnswer: null,
      isSolved: false,
      disabledOptions: [],
      showHint: false,
    };
  }

  public static submitAnswer(
    state: ISequenceRoundState,
    answer: number
  ): { nextState: ISequenceRoundState; isCorrect: boolean } {
    if (state.isSolved) {
      return { nextState: state, isCorrect: true };
    }

    if (answer === state.puzzle.correctAnswer) {
      return {
        nextState: {
          ...state,
          selectedAnswer: answer,
          isSolved: true,
        },
        isCorrect: true,
      };
    }

    // Gentle fallback on incorrect attempt: disable the wrong choice and show a warm hint
    const nextDisabled = [...new Set([...state.disabledOptions, answer])];
    return {
      nextState: {
        ...state,
        selectedAnswer: answer,
        disabledOptions: nextDisabled,
        showHint: true,
      },
      isCorrect: false,
    };
  }
}
