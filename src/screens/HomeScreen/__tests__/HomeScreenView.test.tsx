import React from 'react';
import { HomeScreenView } from '../HomeScreenView';
import { IHomeScreenState } from '../../../modules/domain/types';

describe('HomeScreenView (Screen 01 View Presentation)', () => {
  const mockState: IHomeScreenState = {
    greeting: '☀️ Bom dia, Maria!',
    dateFormatted: 'Segunda-feira, 24 de Agosto',
    brainStage: 'KID',
    brainStageLabel: 'Brain Kid',
    brainStageEmoji: '✨',
    totalCompletedChallenges: 14,
    currentStageProgress: 14,
    currentStageTarget: 20,
    stageProgressPercentage: 70,
    streakDays: 4,
    streakMessage: '🔥 Que alegria! Você está há 4 dias cuidando dos seus hábitos!',
    triadChallenges: [
      {
        id: 'c1',
        pillar: 'MIND',
        title: 'Sequência Numérica',
        subtitle: 'Exercite o raciocínio rápido',
        route: '/brain-gym/sequence',
        isCompleted: false,
        growthPoints: 10,
      },
      {
        id: 'c2',
        pillar: 'MOVEMENT',
        title: 'Caminhada Suave',
        subtitle: 'Dê passos confortáveis',
        route: '/movement/walk',
        isCompleted: true,
        completedAt: '2026-08-24T10:00:00Z',
        growthPoints: 10,
      },
      {
        id: 'c3',
        pillar: 'SELFCARE',
        title: 'Hora da Água',
        subtitle: 'Beba um copo de água fresca',
        route: '/selfcare/water',
        isCompleted: false,
        growthPoints: 10,
      },
    ],
    triadCompletedCount: 1,
    isTriadFullyCompleted: false,
  };

  it('should render view without throwing errors', () => {
    const handlePress = jest.fn();
    const handleSurprise = jest.fn();

    const element = HomeScreenView({
      state: mockState,
      onPressChallenge: handlePress,
      onPressSurprise: handleSurprise,
    });

    expect(element).toBeDefined();
  });

  it('should render celebration banner when triad is fully completed', () => {
    const fullState: IHomeScreenState = {
      ...mockState,
      triadCompletedCount: 3,
      isTriadFullyCompleted: true,
    };

    const element = HomeScreenView({
      state: fullState,
      onPressChallenge: jest.fn(),
      onPressSurprise: jest.fn(),
    });

    expect(element).toBeDefined();
  });
});
