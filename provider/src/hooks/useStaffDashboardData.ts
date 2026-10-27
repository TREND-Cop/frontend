import { useState, useEffect, useMemo, useRef } from 'react';
import { useStaffLoginStore } from '../context/StaffLoginContext';
import { useStaffAppointments } from '../context/StaffAppointmentsContext';
import { StaffDashboardData } from '../types/staffDashboard';
import {
  DEV_SAMPLE_STAFF_DASHBOARD,
  DEV_STAFF_BREAK_IN_SECONDS,
} from '../constants/staffDashboard.config';

/**
 * Hook to provide data for the Staff Home Screen.
 *
 * Current frontend stubs marked TODO (Backend).
 * Business name comes from in-memory StaffLoginProvider.
 * When DEV_SAMPLE_STAFF_DASHBOARD is false, all backend fields return undefined.
 */
export function useStaffDashboardData(isScreenFocused: boolean = true) {
  const { businessName } = useStaffLoginStore();
  const { waitingCount, inProgressCount, completedCount, cancelledCount } = useStaffAppointments();

  // Initial break time seconds calculation
  const initialBreakSeconds = useMemo<number | null>(() => {
    if (DEV_STAFF_BREAK_IN_SECONDS !== null) {
      return DEV_STAFF_BREAK_IN_SECONDS;
    }
    if (DEV_SAMPLE_STAFF_DASHBOARD) {
      // 8 hrs, 30 mins, 10 secs = 30610s
      return 8 * 3600 + 30 * 60 + 10;
    }
    // TODO (Backend): Calculate remaining seconds until staff break time today
    return null;
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
    // 1. Dev Sample Mode (mirrors Figma frame counts derived from store)
    if (DEV_SAMPLE_STAFF_DASHBOARD) {
      return {
        businessName: businessName?.trim() || 'Luminous Lux',
        address: 'Street 11, off okiki road abuja.',
        avatarUrl: undefined, // Uses neutral placeholder image
        pendingAppointmentsCount: waitingCount > 0 ? waitingCount : 1,
        ongoingAppointmentsCount: inProgressCount,
        cancelledAppointmentsCount: cancelledCount,
        completedAppointmentsCount: completedCount,
        closingTime: '8:30:00pm',
        breakTime: '12:00:00pm',
        resumptionTime: '8:30:00am',
        workDays: ['Mon', 'Tue', 'Wed', 'Sun'],
        breakSecondsRemaining: breakSeconds,
        photosCount: 3,
        performanceChangePercent: 12,
        performanceTimeframe: 'Today',
        reviewsCount: 3,
      };
    }

    // 2. Production / Backend Stub Mode (returns undefined by default unless held in store)
    return {
      businessName: businessName?.trim() || 'Business Dashboard',
      // TODO (Backend): fetch staff profile address
      address: undefined,
      // TODO (Backend): fetch staff profile avatar
      avatarUrl: undefined,
      // Real staff appointment counts (all 4 now derived from StaffAppointments store)
      pendingAppointmentsCount: waitingCount > 0 ? waitingCount : undefined,
      ongoingAppointmentsCount: inProgressCount > 0 ? inProgressCount : undefined,
      cancelledAppointmentsCount: cancelledCount > 0 ? cancelledCount : undefined,
      completedAppointmentsCount: completedCount > 0 ? completedCount : undefined,
      // TODO (Backend): fetch staff work shift and schedule
      closingTime: undefined,
      breakTime: undefined,
      resumptionTime: undefined,
      workDays: undefined,
      breakSecondsRemaining: breakSeconds,
      // TODO (Backend): fetch staff photos, statistics and reviews
      photosCount: undefined,
      performanceChangePercent: undefined,
      performanceTimeframe: undefined,
      reviewsCount: undefined,
    };
  }, [businessName, breakSeconds, waitingCount, inProgressCount, completedCount, cancelledCount]);

  return data;
}

