import React, { createContext, useContext, useState, useMemo } from 'react';
import { Review } from '../constants/reviews.config';
import {
  DEV_SAMPLE_STAFF_REVIEWS,
  MOCK_SAMPLE_STAFF_REVIEWS,
} from '../constants/staffReviews.config';

export interface StaffReviewsContextType {
  reviews: Review[];
  // Staff reviews are read-only; no postReply, no reportReview
}

const StaffReviewsContext = createContext<StaffReviewsContextType | undefined>(undefined);

export const StaffReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Seeds sample reviews from MOCK_SAMPLE_STAFF_REVIEWS
  const [reviews] = useState<Review[]>(() => {
    return MOCK_SAMPLE_STAFF_REVIEWS && MOCK_SAMPLE_STAFF_REVIEWS.length > 0
      ? MOCK_SAMPLE_STAFF_REVIEWS
      : [];
  });

  const value = useMemo(
    () => ({
      reviews,
    }),
    [reviews]
  );

  return (
    <StaffReviewsContext.Provider value={value}>
      {children}
    </StaffReviewsContext.Provider>
  );
};

export function useStaffReviews(): StaffReviewsContextType {
  const context = useContext(StaffReviewsContext);
  if (!context) {
    // Provide safe empty fallback if used outside provider
    return { reviews: [] };
  }
  return context;
}
