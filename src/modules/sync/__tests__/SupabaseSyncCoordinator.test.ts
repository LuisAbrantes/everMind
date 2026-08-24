import { SupabaseSyncCoordinator } from '../SupabaseSyncCoordinator';
import { InMemoryStorageGateway } from '../../storage/InMemoryStorageGateway';

describe('SupabaseSyncCoordinator (Mission 05 - Cloud Sync Seam)', () => {
  let storage: InMemoryStorageGateway;

  beforeEach(() => {
    storage = new InMemoryStorageGateway();
  });

  it('should sync local progress safely without throwing in offline/mock mode', async () => {
    storage.set('evermind_user_progress_v1', {
      totalCompletedChallenges: 15,
      highestBrainStageAchieved: 'KID',
      currentStreak: 5,
      totalActiveDays: 14,
      lastActiveDate: '2026-08-19',
      growthPoints: 150,
      completedChallengeIds: [],
      triadDate: '2026-08-19',
      triadChallengeIds: ['c1', 'c2', 'c3'],
    });

    const result = await SupabaseSyncCoordinator.syncLocalProgressToCloud(storage, 'test_user');
    expect(result).toBeDefined();
    expect(result.timestamp).toBeTruthy();
  });
});
