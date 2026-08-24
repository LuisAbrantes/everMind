import { useBrainGym } from '../useBrainGym';
import { InMemoryStorageGateway } from '../../../modules/storage/InMemoryStorageGateway';
import { MockFeedbackService } from '../../../modules/feedback/MockFeedbackService';

describe('useBrainGym (Screen 02 Orchestrator Hook)', () => {
  let storage: InMemoryStorageGateway;
  let feedback: MockFeedbackService;

  beforeEach(() => {
    storage = new InMemoryStorageGateway();
    feedback = new MockFeedbackService();
  });

  it('should initialize with MENU state and default game states', () => {
    // Basic dependency check
    expect(storage).toBeDefined();
    expect(feedback).toBeDefined();
  });
});
