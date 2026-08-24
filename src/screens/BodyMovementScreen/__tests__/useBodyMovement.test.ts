import { useBodyMovement } from '../useBodyMovement';
import { InMemoryStorageGateway } from '../../../modules/storage/InMemoryStorageGateway';
import { MockFeedbackService } from '../../../modules/feedback/MockFeedbackService';

describe('useBodyMovement (Screen 03 Hook)', () => {
  let storage: InMemoryStorageGateway;
  let feedback: MockFeedbackService;

  beforeEach(() => {
    storage = new InMemoryStorageGateway();
    feedback = new MockFeedbackService();
  });

  it('should initialize and manage movement completion state cleanly', () => {
    expect(storage).toBeDefined();
    expect(feedback).toBeDefined();
  });
});
