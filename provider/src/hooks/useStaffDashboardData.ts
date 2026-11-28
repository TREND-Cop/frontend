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
import { trendApi, getAuthToken } from '../api/trendApi';

export function useStaffDashboardData(isScreenFocused: boolean = true) {
  const { businessName, verifiedCode } = useStaffLoginStore();
  const { business } = useBusinessStore();
  const {
    waitingCount,
    inProgressCount,
    completedCount,
    cancelledCount,
    refreshAppointments,
  } = useStaffAppointments();
  const { photos } = useStaffWorkPhotos();
  const { reviews } = useStaffReviews();
  const { homeSummary } = useStaffStatistics();

  const [liveMeta, setLiveMeta] = useState<{
    businessName?: string;
    address?: string;
    avatarUrl?: string;
    reviewsCount?: number;
  }>({});

  // Hydrate real staff business profile, stats, and appointments whenever Staff Home focuses
  useEffect(() => {
    if (!isScreenFocused) return;
    let active = true;
    (async () => {
      const token = await getAuthToken('staff');
      if (!token) return;
      refreshAppointments().catch(() => {});
      try {
        const [meRes, statsRes] = await Promise.all([
          trendApi.auth.me('staff'),
          trendApi.staff.getStats(),
        ]);
        if (!active) return;
        const me = meRes.ok ? meRes.data : null;
        const stats = statsRes.ok ? statsRes.data : null;
        const rawAddr = [me?.business_address, me?.business_city].filter(Boolean).join(', ');
        setLiveMeta({
          businessName: me?.business_name || undefined,
          address: rawAddr || undefined,
          avatarUrl: me?.image || me?.business_logo || undefined,
          reviewsCount: Array.isArray(stats?.reviews) ? stats.reviews.length : undefined,
        });
      } catch {
        // Keep cached metadata if offline
      }
    })();
    return () => {
      active = false;
    };
  }, [isScreenFocused, verifiedCode, refreshAppointments]);

  const effectiveAddress = formatDisplayLocation(
    liveMeta.address || business.address || 'Maitama, Abuja'
  );

  // Initial break time seconds calculation
  const initialBreakSeconds = useMemo<number | null>(() => {
    if (DEV_STAFF_BREAK_IN_SECONDS !== null) {
      return DEV_STAFF_BREAK_IN_SECONDS;
    }
    return 8 * 3600 + 30 * 60 + 10;
  }, []);

  const [breakSeconds, setBreakSeconds] = useState<number | null>(initialBreakSeconds);

  useEffect(() => {
    setBreakSeconds(initialBreakSeconds);
  }, [initialBreakSeconds]);

  useEffect(() => {
    if (!isScreenFocused || breakSeconds === null || breakSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setBreakSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isScreenFocused, breakSeconds]);

  const resolvedBusinessName =
    liveMeta.businessName?.trim() || businessName?.trim() || business.name || 'Business Dashboard';
  const resolvedReviewsCount = liveMeta.reviewsCount ?? reviews.length;

  const data = useMemo<StaffDashboardData>(() => {
    if (DEV_SAMPLE_STAFF_DASHBOARD) {
      return {
        businessName: resolvedBusinessName,
        address: effectiveAddress,
        avatarUrl: liveMeta.avatarUrl,
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
        reviewsCount: resolvedReviewsCount,
      };
    }

    return {
      businessName: resolvedBusinessName,
      address: effectiveAddress,
      avatarUrl: liveMeta.avatarUrl,
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
      reviewsCount: resolvedReviewsCount,
    };
  }, [
    resolvedBusinessName,
    effectiveAddress,
    liveMeta.avatarUrl,
    breakSeconds,
    waitingCount,
    inProgressCount,
    completedCount,
    cancelledCount,
    photos.length,
    resolvedReviewsCount,
    homeSummary,
  ]);

  return data;
}
