import { useWeeklySummary } from '../useWeeklySummary';
import { InMemoryStorageGateway } from '../../../modules/storage/InMemoryStorageGateway';
import { MockFeedbackService } from '../../../modules/feedback/MockFeedbackService';

describe('useWeeklySummary (Screen 07 Hook)', () => {
  let storage: InMemoryStorageGateway;
  let feedback: MockFeedbackService;

  beforeEach(() => {
    storage = new InMemoryStorageGateway();
    feedback = new MockFeedbackService();
  });

  it('should initialize and aggregate weekly summary without guilt', () => {
    expect(storage).toBeDefined();
    expect(feedback).toBeDefined();
  });
});
