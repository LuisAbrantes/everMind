export interface IMemoryItem {
  id: string;
  name: string;
  emoji: string;
}

export const MEMORY_THEMATIC_POOL: IMemoryItem[] = [
  { id: 'apple', name: 'Maçã', emoji: '🍎' },
  { id: 'guitar', name: 'Violão', emoji: '🎸' },
  { id: 'flower', name: 'Flor', emoji: '🌸' },
  { id: 'sun', name: 'Sol', emoji: '☀️' },
  { id: 'book', name: 'Livro', emoji: '📖' },
  { id: 'bird', name: 'Pássaro', emoji: '🐦' },
  { id: 'cup', name: 'Xícara', emoji: '☕' },
  { id: 'clock', name: 'Relógio', emoji: '⏰' },
  { id: 'house', name: 'Casa', emoji: '🏡' },
  { id: 'tree', name: 'Árvore', emoji: '🌳' },
];

export interface IMemoryRoundState {
  targetItems: IMemoryItem[];
  displayGrid: IMemoryItem[];
  selectedItemIds: string[];
  isMemorizationPhase: boolean;
  isRoundComplete: boolean;
  correctCount: number;
}

export class MemoryGameEngine {
  public static createRound(seed: number = Date.now()): IMemoryRoundState {
    const shuffledPool = [...MEMORY_THEMATIC_POOL].sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * seed) % 17;
      const hashB = (b.id.charCodeAt(0) * seed) % 17;
      return hashA - hashB;
    });

    const targetItems = shuffledPool.slice(0, 5);
    const distractors = shuffledPool.slice(5, 8);
    const displayGrid = [...targetItems, ...distractors].sort((a, b) => a.name.localeCompare(b.name));

    return {
      targetItems,
      displayGrid,
      selectedItemIds: [],
      isMemorizationPhase: true,
      isRoundComplete: false,
      correctCount: 0,
    };
  }

  public static startSelectionPhase(state: IMemoryRoundState): IMemoryRoundState {
    return {
      ...state,
      isMemorizationPhase: false,
      selectedItemIds: [],
    };
  }

  public static toggleItemSelection(
    state: IMemoryRoundState,
    itemId: string
  ): { nextState: IMemoryRoundState; isCorrectPick: boolean; isAlreadySelected: boolean } {
    if (state.isMemorizationPhase || state.isRoundComplete) {
      return { nextState: state, isCorrectPick: false, isAlreadySelected: false };
    }

    const isAlreadySelected = state.selectedItemIds.includes(itemId);
    if (isAlreadySelected) {
      const nextSelected = state.selectedItemIds.filter((id) => id !== itemId);
      const isTarget = state.targetItems.some((item) => item.id === itemId);
      const correctCount = nextSelected.filter((id) =>
        state.targetItems.some((t) => t.id === id)
      ).length;

      return {
        nextState: {
          ...state,
          selectedItemIds: nextSelected,
          correctCount,
          isRoundComplete: false,
        },
        isCorrectPick: false,
        isAlreadySelected: true,
      };
    }

    const isTarget = state.targetItems.some((item) => item.id === itemId);
    const nextSelected = [...state.selectedItemIds, itemId];
    const correctCount = nextSelected.filter((id) =>
      state.targetItems.some((t) => t.id === id)
    ).length;

    const isRoundComplete = correctCount === state.targetItems.length;

    return {
      nextState: {
        ...state,
        selectedItemIds: nextSelected,
        correctCount,
        isRoundComplete,
      },
      isCorrectPick: isTarget,
      isAlreadySelected: false,
    };
  }
}
