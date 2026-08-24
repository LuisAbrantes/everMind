import React from 'react';
import { BrainGymScreenView } from '../BrainGymScreenView';
import { MemoryGameEngine } from '../../../modules/brain/MemoryGameEngine';
import { SequenceGameEngine } from '../../../modules/brain/SequenceGameEngine';
import { WordsGameEngine } from '../../../modules/brain/WordsGameEngine';
import { AttentionGameEngine } from '../../../modules/brain/AttentionGameEngine';
import { MusicGameEngine } from '../../../modules/brain/MusicGameEngine';

describe('BrainGymScreenView (Screen 02 View Presentation)', () => {
  const createMockHookData = (activeGame: any = 'MENU') => ({
    activeGame,
    setActiveGame: jest.fn(),
    completedGamesCount: 5,
    memoryState: MemoryGameEngine.createRound(1),
    sequenceState: SequenceGameEngine.createRound(0),
    wordsState: WordsGameEngine.createRound(0),
    attentionState: AttentionGameEngine.createRound(0),
    musicState: MusicGameEngine.createRound(0),
    handleMemoryStartSelection: jest.fn(),
    handleMemoryToggleItem: jest.fn(),
    handleMemoryNextRound: jest.fn(),
    handleSequenceSubmit: jest.fn(),
    handleSequenceNextPuzzle: jest.fn(),
    handleWordsSelect: jest.fn(),
    handleWordsNextChallenge: jest.fn(),
    handleAttentionSelect: jest.fn(),
    handleAttentionNextPuzzle: jest.fn(),
    handleMusicTogglePlay: jest.fn(),
    handleMusicSelectOption: jest.fn(),
    handleMusicNextTrack: jest.fn(),
  });

  it('should render game menu cleanly', () => {
    const hookData = createMockHookData('MENU');
    const element = BrainGymScreenView({ hookData });
    expect(element).toBeDefined();
  });

  it('should render individual games when active', () => {
    const memoryElement = BrainGymScreenView({ hookData: createMockHookData('MEMORY') });
    expect(memoryElement).toBeDefined();

    const seqElement = BrainGymScreenView({ hookData: createMockHookData('SEQUENCE') });
    expect(seqElement).toBeDefined();

    const wordsElement = BrainGymScreenView({ hookData: createMockHookData('WORDS') });
    expect(wordsElement).toBeDefined();

    const attentionElement = BrainGymScreenView({ hookData: createMockHookData('ATTENTION') });
    expect(attentionElement).toBeDefined();

    const musicElement = BrainGymScreenView({ hookData: createMockHookData('MUSIC') });
    expect(musicElement).toBeDefined();
  });
});
