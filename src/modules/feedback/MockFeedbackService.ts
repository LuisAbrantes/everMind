import { IFeedbackService } from './IFeedbackService';

export class MockFeedbackService implements IFeedbackService {
  public successFeedbackCount = 0;
  public selectFeedbackCount = 0;
  public gentleNoticeFeedbackCount = 0;

  public triggerSuccessFeedback(): void {
    this.successFeedbackCount++;
  }

  public triggerSelectFeedback(): void {
    this.selectFeedbackCount++;
  }

  public triggerGentleNoticeFeedback(): void {
    this.gentleNoticeFeedbackCount++;
  }

  public reset(): void {
    this.successFeedbackCount = 0;
    this.selectFeedbackCount = 0;
    this.gentleNoticeFeedbackCount = 0;
  }
}
