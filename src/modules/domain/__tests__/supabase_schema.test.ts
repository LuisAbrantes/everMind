import {
  Database,
  ChallengePillarType,
  BrainStageType,
  BadgeKeyType,
  ProfileRow,
  DailyTriadRow,
  ChallengeCompletionRow,
  VirtualBrainStateRow,
  UserAchievementRow,
} from '../../../types/database.types';
import { supabase } from '../../../lib/supabase';

describe('Supabase Database Schema & Types Contract', () => {
  it('should validate ChallengePillarType matches the 4 canonical pillars', () => {
    const pillars: ChallengePillarType[] = ['mind', 'movement', 'selfcare', 'connection'];
    expect(pillars).toHaveLength(4);
    expect(pillars).toContain('mind');
    expect(pillars).toContain('movement');
    expect(pillars).toContain('selfcare');
    expect(pillars).toContain('connection');
  });

  it('should validate BrainStageType matches the 4 non-regressive stages', () => {
    const stages: BrainStageType[] = ['baby', 'kid', 'teen', 'mega_brain'];
    expect(stages).toHaveLength(4);
    expect(stages).toContain('baby');
    expect(stages).toContain('kid');
    expect(stages).toContain('teen');
    expect(stages).toContain('mega_brain');
  });

  it('should validate BadgeKeyType matches the canonical badges catalog', () => {
    const badges: BadgeKeyType[] = [
      'first_steps',
      'active_week',
      'moving_mind',
      'present_friend',
      'walker',
    ];
    expect(badges).toHaveLength(5);
    expect(badges).toContain('first_steps');
    expect(badges).toContain('active_week');
    expect(badges).toContain('moving_mind');
    expect(badges).toContain('present_friend');
    expect(badges).toContain('walker');
  });

  it('should instantiate row structures conforming to the Postgres database tables', () => {
    const mockProfile: ProfileRow = {
      id: '11111111-1111-1111-1111-111111111111',
      display_name: 'Dona Maria',
      avatar_url: 'https://example.com/avatar.png',
      created_at: '2026-08-19T12:00:00Z',
      updated_at: '2026-08-19T12:00:00Z',
    };

    const mockTriad: DailyTriadRow = {
      id: '22222222-2222-2222-2222-222222222222',
      user_id: mockProfile.id,
      date: '2026-08-19',
      challenge_ids: ['mind_memory_01', 'movement_walk_10m', 'selfcare_hydration'],
      created_at: '2026-08-19T12:00:00Z',
    };

    const mockCompletion: ChallengeCompletionRow = {
      id: '33333333-3333-3333-3333-333333333333',
      user_id: mockProfile.id,
      challenge_type: 'mind',
      challenge_id: 'mind_memory_01',
      completed_at: '2026-08-19T12:30:00Z',
      date: '2026-08-19',
    };

    const mockBrainState: VirtualBrainStateRow = {
      id: '44444444-4444-4444-4444-444444444444',
      user_id: mockProfile.id,
      current_stage: 'baby',
      total_points: 10,
      updated_at: '2026-08-19T12:30:00Z',
    };

    const mockAchievement: UserAchievementRow = {
      id: '55555555-5555-5555-5555-555555555555',
      user_id: mockProfile.id,
      badge_key: 'first_steps',
      unlocked_at: '2026-08-19T12:30:00Z',
    };

    expect(mockProfile.display_name).toBe('Dona Maria');
    expect(mockTriad.challenge_ids).toHaveLength(3);
    expect(mockCompletion.challenge_type).toBe('mind');
    expect(mockBrainState.current_stage).toBe('baby');
    expect(mockAchievement.badge_key).toBe('first_steps');
  });

  it('should verify supabase client is initialized with proper typings', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });
});
