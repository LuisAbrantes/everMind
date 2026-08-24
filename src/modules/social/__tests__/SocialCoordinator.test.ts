import { SocialCoordinator } from '../SocialCoordinator';
import { InMemoryStorageGateway } from '../../storage/InMemoryStorageGateway';

describe('SocialCoordinator (Mission 04 - Social Connection Pillar)', () => {
  let storage: InMemoryStorageGateway;
  const todayStr = '2026-08-19';

  beforeEach(() => {
    storage = new InMemoryStorageGateway();
  });

  it('should initialize and register social connection call', () => {
    let state = SocialCoordinator.loadState(storage, todayStr);
    expect(state.isConnectionCompletedToday).toBe(false);
    expect(state.totalSocialConnections).toBe(0);

    state = SocialCoordinator.completeSocialConnection(storage, state, todayStr);
    expect(state.isConnectionCompletedToday).toBe(true);
    expect(state.totalSocialConnections).toBe(1);
    expect(state.lastConnectionDate).toBe(todayStr);
  });

  it('should schedule reminder without penalty', () => {
    let state = SocialCoordinator.loadState(storage, todayStr);
    state = SocialCoordinator.scheduleReminder(storage, state, '15:00');
    expect(state.reminderScheduledTime).toBe('15:00');
    expect(state.isConnectionCompletedToday).toBe(false);
  });
});
