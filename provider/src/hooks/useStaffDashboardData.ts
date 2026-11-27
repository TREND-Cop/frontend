import { useEffect, useMemo, useState } from 'react';
import { formatDisplayLocation } from '../utils/locationFormatter';
import {
  DEV_SAMPLE_STAFF_DASHBOARD,
  DEV_STAFF_BREAK_IN_SECONDS,
} from '../constants/staffDashboard.config';
import { useStaffAppointments } from '../context/StaffAppointmentsContext';
import { useStaffLoginStore } from '../context/StaffLoginContext';
import { useStaffReviews } from '../context/StaffReviewsContext';
import { useStaffStatistics } from '../context/StaffStatisticsContext';
import { useStaffWorkPhotos } from '../context/StaffWorkPhotosContext';
import { useBusinessStore } from '../store/businessStore';
import { StaffDashboardData } from '../types/staffDashboard';

/**
 * Hook to provide data for the Staff Home Screen.
 *
 * Current frontend stubs marked TODO (Backend).
 * Business name comes from in-memory StaffLoginProvider or businessStore.
 * Address is populated from businessStore so staff always see the salon address.
 */
export function useStaffDashboardData(isScreenFocused: boolean = true) {
  const { businessName } = useStaffLoginStore();
  const { business } = useBusinessStore();
  const { waitingCount, inProgressCount, completedCount, cancelledCount } = useStaffAppointments();
  const { photos } = useStaffWorkPhotos();
  const { reviews } = useStaffReviews();
  const { homeSummary } = useStaffStatistics();

  const effectiveAddress = formatDisplayLocation(
    business.address || 'Maitama, Abuja'
  );

  // Initial break time seconds calculation
  const initialBreakSeconds = useMemo<number | null>(() => {
    if (DEV_STAFF_BREAK_IN_SECONDS !== null) {
      return DEV_STAFF_BREAK_IN_SECONDS;
    }
    // Default to Figma preview (8 hrs, 30 mins, 10 secs = 30610s)
    return 8 * 3600 + 30 * 60 + 10;
  }, []);

  const [breakSeconds, setBreakSeconds] = useState<number | null>(initialBreakSeconds);

  // Sync state if dev override changes
  useEffect(() => {
    setBreakSeconds(initialBreakSeconds);
  }, [initialBreakSeconds]);

  // Live countdown ticker that pauses when screen loses focus
  useEffect(() => {
    if (!isScreenFocused || breakSeconds === null || breakSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setBreakSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return null; // Break reached or expired; hide chip
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isScreenFocused, breakSeconds]);

  const data = useMemo<StaffDashboardData>(() => {
    // 1. Dev Sample Mode (mirrors Figma frame counts derived from live store)
    if (DEV_SAMPLE_STAFF_DASHBOARD) {
      return {
        businessName: businessName?.trim() || business.name || 'Luminous Lux',
        address: effectiveAddress,
        avatarUrl: undefined, // Uses neutral placeholder image
        pendingAppointmentsCount: waitingCount,
        ongoingAppointmentsCount: inProgressCount,
        cancelledAppointmentsCount: cancelledCount,
        completedAppointmentsCount: completedCount,
        closingTime: '8:30:00pm',
        breakTime: '12:00:00pm',
        resumptionTime: '8:30:00am',
        workDays: ['Mon', 'Tue', 'Wed', 'Sun'],
        breakSecondsRemaining: breakSeconds,
        photosCount: photos.length,
        performanceChangePercent: homeSummary?.performanceChangePercent ?? 12,
        performanceTimeframe: homeSummary?.performanceTimeframe ?? 'Today',
        reviewsCount: reviews.length,
      };
    }

    // 2. Production / Backend Stub Mode (returns real stored data with fallback salon address & Figma schedule times)
    return {
      businessName: businessName?.trim() || business.name || 'Business Dashboard',
      address: effectiveAddress,
      avatarUrl: undefined,
      pendingAppointmentsCount: waitingCount > 0 ? waitingCount : undefined,
      ongoingAppointmentsCount: inProgressCount > 0 ? inProgressCount : undefined,
      cancelledAppointmentsCount: cancelledCount > 0 ? cancelledCount : undefined,
      completedAppointmentsCount: completedCount > 0 ? completedCount : undefined,
      closingTime: '8:30:00pm',
      breakTime: '12:00:00pm',
      resumptionTime: '8:30:00am',
      workDays: ['Mon', 'Tue', 'Wed', 'Sun'],
      breakSecondsRemaining: breakSeconds ?? 30610,
      photosCount: photos.length,
      performanceChangePercent: homeSummary?.performanceChangePercent ?? undefined,
      performanceTimeframe: homeSummary?.performanceTimeframe ?? undefined,
      reviewsCount: reviews.length,
    };
  }, [businessName, business.name, effectiveAddress, breakSeconds, waitingCount, inProgressCount, completedCount, cancelledCount, photos.length, reviews.length, homeSummary]);

  return data;
}

