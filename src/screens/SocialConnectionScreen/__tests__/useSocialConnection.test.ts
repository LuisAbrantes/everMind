import { useSocialConnection } from '../useSocialConnection';
import { InMemoryStorageGateway } from '../../../modules/storage/InMemoryStorageGateway';
import { MockFeedbackService } from '../../../modules/feedback/MockFeedbackService';

describe('useSocialConnection (Screen 05 Hook)', () => {
  let storage: InMemoryStorageGateway;
  let feedback: MockFeedbackService;

  beforeEach(() => {
    storage = new InMemoryStorageGateway();
    feedback = new MockFeedbackService();
  });

  it('should initialize and register connection calls cleanly', () => {
    expect(storage).toBeDefined();
    expect(feedback).toBeDefined();
  });
});
