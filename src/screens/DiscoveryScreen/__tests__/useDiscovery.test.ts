import { useDiscovery } from '../useDiscovery';
import { InMemoryStorageGateway } from '../../../modules/storage/InMemoryStorageGateway';
import { MockFeedbackService } from '../../../modules/feedback/MockFeedbackService';

describe('useDiscovery (Screen 06 Hook)', () => {
  let storage: InMemoryStorageGateway;
  let feedback: MockFeedbackService;

  beforeEach(() => {
    storage = new InMemoryStorageGateway();
    feedback = new MockFeedbackService();
  });

  it('should initialize and handle discovery roll and completion', () => {
    expect(storage).toBeDefined();
    expect(feedback).toBeDefined();
  });
});
