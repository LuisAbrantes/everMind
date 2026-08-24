import { MemoryGameEngine } from '../MemoryGameEngine';
import { SequenceGameEngine } from '../SequenceGameEngine';
import { WordsGameEngine } from '../WordsGameEngine';
import { AttentionGameEngine } from '../AttentionGameEngine';
import { MusicGameEngine } from '../MusicGameEngine';

describe('Brain Gym Engines (Mission 02 - Deep Modules & TDD)', () => {
  describe('MemoryGameEngine', () => {
    it('should create a round with 5 target items and 8 grid items in memorization phase', () => {
      const round = MemoryGameEngine.createRound(123);
      expect(round.targetItems).toHaveLength(5);
      expect(round.displayGrid).toHaveLength(8);
      expect(round.isMemorizationPhase).toBe(true);
      expect(round.isRoundComplete).toBe(false);
    });

    it('should transition to selection phase cleanly', () => {
      const round = MemoryGameEngine.createRound(123);
      const readyRound = MemoryGameEngine.startSelectionPhase(round);
      expect(readyRound.isMemorizationPhase).toBe(false);
      expect(readyRound.selectedItemIds).toEqual([]);
    });

    it('should evaluate correct and incorrect picks and complete when all 5 are selected', () => {
      const round = MemoryGameEngine.createRound(123);
      let activeRound = MemoryGameEngine.startSelectionPhase(round);

      // Pick first target
      const target1 = activeRound.targetItems[0];
      const res1 = MemoryGameEngine.toggleItemSelection(activeRound, target1.id);
      expect(res1.isCorrectPick).toBe(true);
      expect(res1.nextState.correctCount).toBe(1);
      activeRound = res1.nextState;

      // Pick distractor
      const distractor = activeRound.displayGrid.find(
        (item) => !activeRound.targetItems.some((t) => t.id === item.id)
      )!;
      const resDistractor = MemoryGameEngine.toggleItemSelection(activeRound, distractor.id);
      expect(resDistractor.isCorrectPick).toBe(false);
      expect(resDistractor.nextState.correctCount).toBe(1);
      activeRound = resDistractor.nextState;

      // Pick remaining targets
      for (let i = 1; i < 5; i++) {
        const target = activeRound.targetItems[i];
        const res = MemoryGameEngine.toggleItemSelection(activeRound, target.id);
        activeRound = res.nextState;
      }

      expect(activeRound.isRoundComplete).toBe(true);
      expect(activeRound.correctCount).toBe(5);
    });
  });

  describe('SequenceGameEngine', () => {
    it('should initialize with puzzle and handle correct and incorrect submissions', () => {
      const round = SequenceGameEngine.createRound(0); // [2, 4, 6, '?'] -> answer is 8
      expect(round.puzzle.sequence).toEqual([2, 4, 6, '?']);
      expect(round.isSolved).toBe(false);

      // Submit incorrect option
      const wrongRes = SequenceGameEngine.submitAnswer(round, 7);
      expect(wrongRes.isCorrect).toBe(false);
      expect(wrongRes.nextState.disabledOptions).toContain(7);
      expect(wrongRes.nextState.showHint).toBe(true);
      expect(wrongRes.nextState.isSolved).toBe(false);

      // Submit correct option
      const correctRes = SequenceGameEngine.submitAnswer(wrongRes.nextState, 8);
      expect(correctRes.isCorrect).toBe(true);
      expect(correctRes.nextState.isSolved).toBe(true);
      expect(correctRes.nextState.selectedAnswer).toBe(8);
    });
  });

  describe('WordsGameEngine', () => {
    it('should validate candidate words against thematic dictionary', () => {
      const round = WordsGameEngine.createRound(0); // Theme with letter M (Maçã, Melancia, etc.)
      expect(round.challenge.letter).toBe('M');
      expect(round.isComplete).toBe(false);

      // Pick first valid word
      const res1 = WordsGameEngine.selectWord(round, 'Maçã');
      expect(res1.isAccepted).toBe(true);
      expect(res1.nextState.foundWords).toContain('Maçã');

      // Pick invalid word
      const resInvalid = WordsGameEngine.selectWord(res1.nextState, 'Cadeira');
      expect(resInvalid.isAccepted).toBe(false);

      // Pick remaining valid words to complete
      const res2 = WordsGameEngine.selectWord(res1.nextState, 'Melancia');
      const res3 = WordsGameEngine.selectWord(res2.nextState, 'Mamão');
      expect(res3.nextState.isComplete).toBe(true);
    });
  });

  describe('AttentionGameEngine', () => {
    it('should identify divergent item and disable distractors gently', () => {
      const round = AttentionGameEngine.createRound(0); // 3 clocks at 3h, 1 clock at 6h
      const divergentItem = round.puzzle.items.find((i) => i.isDivergent)!;
      const normalItem = round.puzzle.items.find((i) => !i.isDivergent)!;

      // Select normal item
      const wrongRes = AttentionGameEngine.selectItem(round, normalItem.id);
      expect(wrongRes.isCorrect).toBe(false);
      expect(wrongRes.nextState.disabledItemIds).toContain(normalItem.id);
      expect(wrongRes.nextState.isSolved).toBe(false);

      // Select divergent item
      const correctRes = AttentionGameEngine.selectItem(wrongRes.nextState, divergentItem.id);
      expect(correctRes.isCorrect).toBe(true);
      expect(correctRes.nextState.isSolved).toBe(true);
    });
  });

  describe('MusicGameEngine', () => {
    it('should handle audio playback toggle and correct title recognition', () => {
      const round = MusicGameEngine.createRound(0); // Carinhoso
      expect(round.track.correctTitle).toBe('Carinhoso');

      // Toggle playback
      const playingState = MusicGameEngine.togglePlayback(round);
      expect(playingState.isPlaying).toBe(true);

      // Wrong title
      const wrongRes = MusicGameEngine.selectOption(playingState, 'Asa Branca');
      expect(wrongRes.isCorrect).toBe(false);
      expect(wrongRes.nextState.disabledOptions).toContain('Asa Branca');

      // Correct title
      const correctRes = MusicGameEngine.selectOption(wrongRes.nextState, 'Carinhoso');
      expect(correctRes.isCorrect).toBe(true);
      expect(correctRes.nextState.isSolved).toBe(true);
      expect(correctRes.nextState.isPlaying).toBe(false);
    });
  });
});
