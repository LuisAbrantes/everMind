export interface IAttentionItem {
  id: string;
  emoji: string;
  label: string;
  isDivergent: boolean;
}

export interface IAttentionPuzzle {
  id: string;
  instruction: string;
  items: IAttentionItem[];
  explanation: string;
}

export const PRESET_ATTENTION_PUZZLES: IAttentionPuzzle[] = [
  {
    id: 'att_clock_diff',
    instruction: 'Toque no relógio que está marcando uma hora diferente dos outros:',
    explanation: 'Excelente observação! Três relógios marcavam 3 horas e apenas um marcava 6 horas.',
    items: [
      { id: 'c1', emoji: '🕒', label: 'Relógio 3 horas', isDivergent: false },
      { id: 'c2', emoji: '🕒', label: 'Relógio 3 horas', isDivergent: false },
      { id: 'c3', emoji: '🕕', label: 'Relógio 6 horas', isDivergent: true },
      { id: 'c4', emoji: '🕒', label: 'Relógio 3 horas', isDivergent: false },
    ],
  },
  {
    id: 'att_nature_sun',
    instruction: 'Encontre o elemento que não é um girassol no jardim:',
    explanation: 'Muito bem! A flor de lótus estava escondida entre os girassóis.',
    items: [
      { id: 'f1', emoji: '🌻', label: 'Girassol', isDivergent: false },
      { id: 'f2', emoji: '🌻', label: 'Girassol', isDivergent: false },
      { id: 'f3', emoji: '🌻', label: 'Girassol', isDivergent: false },
      { id: 'f4', emoji: '🪷', label: 'Flor de Lótus', isDivergent: true },
    ],
  },
  {
    id: 'att_fruits_lemon',
    instruction: 'Qual fruta é diferente nesta colheita de maçãs?',
    explanation: 'Perfeito! O limãozinho cítrico estava no meio das maçãs vermelhas.',
    items: [
      { id: 'fr1', emoji: '🍎', label: 'Maçã Vermelha', isDivergent: false },
      { id: 'fr2', emoji: '🍋', label: 'Limão Amarelo', isDivergent: true },
      { id: 'fr3', emoji: '🍎', label: 'Maçã Vermelha', isDivergent: false },
      { id: 'fr4', emoji: '🍎', label: 'Maçã Vermelha', isDivergent: false },
    ],
  },
];

export interface IAttentionRoundState {
  puzzle: IAttentionPuzzle;
  selectedItemId: string | null;
  isSolved: boolean;
  disabledItemIds: string[];
}

export class AttentionGameEngine {
  public static createRound(puzzleIndex: number = 0): IAttentionRoundState {
    const safeIndex = Math.abs(puzzleIndex) % PRESET_ATTENTION_PUZZLES.length;
    const puzzle = PRESET_ATTENTION_PUZZLES[safeIndex];

    return {
      puzzle,
      selectedItemId: null,
      isSolved: false,
      disabledItemIds: [],
    };
  }

  public static selectItem(
    state: IAttentionRoundState,
    itemId: string
  ): { nextState: IAttentionRoundState; isCorrect: boolean } {
    if (state.isSolved) {
      return { nextState: state, isCorrect: true };
    }

    const item = state.puzzle.items.find((i) => i.id === itemId);
    if (!item) {
      return { nextState: state, isCorrect: false };
    }

    if (item.isDivergent) {
      return {
        nextState: {
          ...state,
          selectedItemId: itemId,
          isSolved: true,
        },
        isCorrect: true,
      };
    }

    // Wrong item: disable smoothly
    const nextDisabled = [...new Set([...state.disabledItemIds, itemId])];
    return {
      nextState: {
        ...state,
        selectedItemId: itemId,
        disabledItemIds: nextDisabled,
      },
      isCorrect: false,
    };
  }
}
