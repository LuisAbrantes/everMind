/**
 * Multi-sensory Feedback Service Interface (Seam)
 * ADR-0005: Senior Feedback (Haptics, Soft Audio, Visual Celebrations)
 */
export interface IFeedbackService {
  triggerSuccessFeedback(): void;
  triggerSelectFeedback(): void;
  triggerGentleNoticeFeedback(): void;
}
