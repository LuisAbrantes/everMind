import { useState, useCallback, useMemo } from 'react';
import { IStorageGateway } from '../../modules/storage/IStorageGateway';
import { MMKVStorageGateway } from '../../modules/storage/MMKVStorageGateway';
import { IFeedbackService } from '../../modules/feedback/IFeedbackService';
import { MockFeedbackService } from '../../modules/feedback/MockFeedbackService';
import { MemoryGameEngine, IMemoryRoundState } from '../../modules/brain/MemoryGameEngine';
import { SequenceGameEngine, ISequenceRoundState } from '../../modules/brain/SequenceGameEngine';
import { WordsGameEngine, IWordsRoundState } from '../../modules/brain/WordsGameEngine';
import { AttentionGameEngine, IAttentionRoundState } from '../../modules/brain/AttentionGameEngine';
import { MusicGameEngine, IMusicRoundState } from '../../modules/brain/MusicGameEngine';
import { IUserProgressStorageState, BrainStage } from '../../modules/domain/types';
import { BrainEvolutionEngine } from '../../modules/gamification/BrainEvolutionEngine';

export type BrainGameType = 'MENU' | 'MEMORY' | 'SEQUENCE' | 'WORDS' | 'ATTENTION' | 'MUSIC';

export interface UseBrainGymDependencies {
  storageGateway?: IStorageGateway;
  feedbackService?: IFeedbackService;
}

const STORAGE_KEY_USER_PROGRESS = 'evermind_user_progress_v1';
const STORAGE_KEY_MIND_ACTIVITIES = 'evermind_mind_activities_count';

export function useBrainGym(deps?: UseBrainGymDependencies) {
  const storage = useMemo(() => deps?.storageGateway || new MMKVStorageGateway(), [deps?.storageGateway]);
  const feedback = useMemo(() => deps?.feedbackService || new MockFeedbackService(), [deps?.feedbackService]);

  const [activeGame, setActiveGame] = useState<BrainGameType>('MENU');
  const [completedGamesCount, setCompletedGamesCount] = useState<number>(() => {
    return storage.get<number>(STORAGE_KEY_MIND_ACTIVITIES) || 0;
  });

  // Game specific states
  const [memoryState, setMemoryState] = useState<IMemoryRoundState>(() => MemoryGameEngine.createRound(1));
  const [sequenceState, setSequenceState] = useState<ISequenceRoundState>(() => SequenceGameEngine.createRound(0));
  const [wordsState, setWordsState] = useState<IWordsRoundState>(() => WordsGameEngine.createRound(0));
  const [attentionState, setAttentionState] = useState<IAttentionRoundState>(() => AttentionGameEngine.createRound(0));
  const [musicState, setMusicState] = useState<IMusicRoundState>(() => MusicGameEngine.createRound(0));

  // Helper to record a completed mind activity and give brain nutrients
  const recordActivityCompletion = useCallback(
    (gameId: string) => {
      const nextCount = completedGamesCount + 1;
      setCompletedGamesCount(nextCount);
      storage.set(STORAGE_KEY_MIND_ACTIVITIES, nextCount);

      // Also update global user progress
      const userProgress = storage.get<IUserProgressStorageState>(STORAGE_KEY_USER_PROGRESS);
      if (userProgress) {
        const nextTotal = userProgress.totalCompletedChallenges + 1;
        const brainConfig = BrainEvolutionEngine.evaluateStage(
          nextTotal,
          userProgress.highestBrainStageAchieved
        );

        const nextHighest: BrainStage =
          BrainEvolutionEngine.STAGE_ORDER.indexOf(brainConfig.stage) >
          BrainEvolutionEngine.STAGE_ORDER.indexOf(userProgress.highestBrainStageAchieved)
            ? brainConfig.stage
            : userProgress.highestBrainStageAchieved;

        const updatedProgress: IUserProgressStorageState = {
          ...userProgress,
          totalCompletedChallenges: nextTotal,
          highestBrainStageAchieved: nextHighest,
          growthPoints: userProgress.growthPoints + 10,
        };
        storage.set(STORAGE_KEY_USER_PROGRESS, updatedProgress);
      }

      feedback.triggerSuccessFeedback();
    },
    [completedGamesCount, storage, feedback]
  );

  // Memory Game Handlers
  const handleMemoryStartSelection = useCallback(() => {
    setMemoryState((prev) => MemoryGameEngine.startSelectionPhase(prev));
    feedback.triggerSelectFeedback();
  }, [feedback]);

  const handleMemoryToggleItem = useCallback(
    (itemId: string) => {
      setMemoryState((prev) => {
        const { nextState, isCorrectPick } = MemoryGameEngine.toggleItemSelection(prev, itemId);
        if (isCorrectPick) {
          feedback.triggerSelectFeedback();
        }
        if (nextState.isRoundComplete && !prev.isRoundComplete) {
          recordActivityCompletion('memory');
        }
        return nextState;
      });
    },
    [feedback, recordActivityCompletion]
  );

  const handleMemoryNextRound = useCallback(() => {
    setMemoryState(MemoryGameEngine.createRound(Date.now()));
  }, []);

  // Sequence Game Handlers
  const handleSequenceSubmit = useCallback(
    (answer: number) => {
      setSequenceState((prev) => {
        const { nextState, isCorrect } = SequenceGameEngine.submitAnswer(prev, answer);
        if (isCorrect && !prev.isSolved) {
          recordActivityCompletion('sequence');
        } else if (!isCorrect) {
          feedback.triggerGentleNoticeFeedback();
        }
        return nextState;
      });
    },
    [feedback, recordActivityCompletion]
  );

  const handleSequenceNextPuzzle = useCallback(() => {
    setSequenceState((prev) => {
      const nextIndex = Math.floor(Math.random() * 5);
      return SequenceGameEngine.createRound(nextIndex);
    });
  }, []);

  // Words Game Handlers
  const handleWordsSelect = useCallback(
    (word: string) => {
      setWordsState((prev) => {
        const { nextState, isAccepted } = WordsGameEngine.selectWord(prev, word);
        if (isAccepted) {
          feedback.triggerSelectFeedback();
        }
        if (nextState.isComplete && !prev.isComplete) {
          recordActivityCompletion('words');
        }
        return nextState;
      });
    },
    [feedback, recordActivityCompletion]
  );

  const handleWordsNextChallenge = useCallback(() => {
    setWordsState((prev) => {
      const nextIndex = Math.floor(Math.random() * 3);
      return WordsGameEngine.createRound(nextIndex);
    });
  }, []);

  // Attention Game Handlers
  const handleAttentionSelect = useCallback(
    (itemId: string) => {
      setAttentionState((prev) => {
        const { nextState, isCorrect } = AttentionGameEngine.selectItem(prev, itemId);
        if (isCorrect && !prev.isSolved) {
          recordActivityCompletion('attention');
        } else if (!isCorrect) {
          feedback.triggerGentleNoticeFeedback();
        }
        return nextState;
      });
    },
    [feedback, recordActivityCompletion]
  );

  const handleAttentionNextPuzzle = useCallback(() => {
    setAttentionState((prev) => {
      const nextIndex = Math.floor(Math.random() * 3);
      return AttentionGameEngine.createRound(nextIndex);
    });
  }, []);

  // Music Game Handlers
  const handleMusicTogglePlay = useCallback(() => {
    setMusicState((prev) => MusicGameEngine.togglePlayback(prev));
    feedback.triggerSelectFeedback();
  }, [feedback]);

  const handleMusicSelectOption = useCallback(
    (option: string) => {
      setMusicState((prev) => {
        const { nextState, isCorrect } = MusicGameEngine.selectOption(prev, option);
        if (isCorrect && !prev.isSolved) {
          recordActivityCompletion('music');
        } else if (!isCorrect) {
          feedback.triggerGentleNoticeFeedback();
        }
        return nextState;
      });
    },
    [feedback, recordActivityCompletion]
  );

  const handleMusicNextTrack = useCallback(() => {
    setMusicState((prev) => {
      const nextIndex = Math.floor(Math.random() * 3);
      return MusicGameEngine.createRound(nextIndex);
    });
  }, []);

  return {
    activeGame,
    setActiveGame,
    completedGamesCount,
    // Game States
    memoryState,
    sequenceState,
    wordsState,
    attentionState,
    musicState,
    // Handlers
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
  };
}
