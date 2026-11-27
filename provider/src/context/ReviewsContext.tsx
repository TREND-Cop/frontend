import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  Review,
  DEV_SAMPLE_REVIEWS,
  MOCK_SAMPLE_REVIEWS,
  POST_REPLY_MOCK_MS,
  REPORT_SUBMIT_MOCK_MS,
  ReportSubmission,
} from '../constants/reviews.config';

export interface ReviewsContextType {
  reviews: Review[];
  addReply: (reviewId: string, text: string) => void;
  postReply: (reviewId: string, text: string) => Promise<void>;
  reportReview: (submission: ReportSubmission) => Promise<void>;
  getReviewById: (id: string) => Review | undefined;
  resetReviews: () => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Seeds with MOCK_SAMPLE_REVIEWS so reviews are always populated
  const [reviews, setReviews] = useState<Review[]>(() => {
    return MOCK_SAMPLE_REVIEWS && MOCK_SAMPLE_REVIEWS.length > 0 ? MOCK_SAMPLE_REVIEWS : [];
  });
  const [reportedReviews, setReportedReviews] = useState<ReportSubmission[]>([]);

  const addReply = useCallback((reviewId: string, text: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        return {
          ...r,
          reply: {
            text: text.trim(),
            createdAt: new Date().toISOString(),
          },
        };
      })
    );
  }, []);

  /**
   * TODO (Backend): Connect to real backend API to persist reply
   */
  const postReply = useCallback(
    async (reviewId: string, text: string): Promise<void> => {
      // Mock network delay (600-1000ms per spec)
      await new Promise((resolve) => setTimeout(resolve, POST_REPLY_MOCK_MS));
      // TODO (Backend): handle failure cases
      addReply(reviewId, text);
    },
    [addReply]
  );

  /**
   * Stub for submitting an abusive comment report
   * TODO (Backend): Connect to real backend moderation API
   */
  const reportReview = useCallback(
    async (submission: ReportSubmission): Promise<void> => {
      // Mock network delay (1000-1500ms per spec)
      await new Promise((resolve) => setTimeout(resolve, REPORT_SUBMIT_MOCK_MS));
      // TODO (Backend): handle failure cases
      setReportedReviews((prev) => [...prev, submission]);
      // Per prompt instructions: The reported review's state in the list afterwards
      // is left unchanged pending backend moderation.
    },
    []
  );

  const getReviewById = useCallback(
    (id: string): Review | undefined => {
      return reviews.find((r) => r.id === id);
    },
    [reviews]
  );

  const resetReviews = useCallback(() => {
    setReviews(DEV_SAMPLE_REVIEWS ? MOCK_SAMPLE_REVIEWS : []);
    setReportedReviews([]);
  }, []);

  const value = useMemo(
    () => ({
      reviews,
      addReply,
      postReply,
      reportReview,
      getReviewById,
      resetReviews,
    }),
    [reviews, addReply, postReply, reportReview, getReviewById, resetReviews]
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
};

/**
 * Hook to access Reviews state and actions
 * TODO (Backend): Connect to real backend query
 */
export function useReviews(): ReviewsContextType {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}
