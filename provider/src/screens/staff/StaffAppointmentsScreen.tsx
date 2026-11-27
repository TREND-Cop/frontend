import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle } from 'react-native-svg';

import { useStaffAppointments } from '../../context/StaffAppointmentsContext';
import { StaffAppointment } from '../../types/staffAppointments';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import {
  getAppointmentBannerState,
  formatNaira,
} from '../../utils/staffAppointmentFormatters';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function ArrowLeftIcon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SmallClockIcon({ size = 18, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.2" stroke={color} strokeWidth="1.2" />
      <Path d="M9 4.8V9h3.6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

function StarIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2.5l1.97 4.14 4.53.66-3.28 3.2.77 4.5L9 12.87 5.01 15l.77-4.5-3.28-3.2 4.53-.66L9 2.5z"
        fill="rgba(248, 155, 24, 0.96)"
      />
    </Svg>
  );
}

// ── Main Appointments List Screen ───────────────────────────────────────────

export function StaffAppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const safeRouter = useSafeRouter();
  const { appointments, isRefreshing, refreshAppointments } = useStaffAppointments();

  // Shared 1-second ticker that ONLY runs while this screen is focused
  const [now, setNow] = useState<number>(Date.now());
  const [isFocused, setIsFocused] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isFocused]);

  // Show only pending/waiting appointments for this screen
  const visibleAppointments = appointments.filter((a) => a.status === 'waiting');

  const countText = `${visibleAppointments.length} Appointment${visibleAppointments.length === 1 ? '' : 's'}`;

  const handleCardPress = (appointment: StaffAppointment) => {
    triggerLightHaptic();
    safeRouter.push({
      pathname: STAFF_ROUTES.APPOINTMENT_DETAIL as any,
      params: { id: appointment.id },
    });
  };

  const handleRefreshPress = () => {
    triggerLightHaptic();
    refreshAppointments();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── 1. Page Header (64px, back arrow, centered title) ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContentRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              safeRouter.back();
            }}
            accessibilityLabel="Back"
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Appointments</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Subtitle count line */}
        <View style={styles.countLineWrapper}>
          <Text style={styles.countLineText}>{countText}</Text>
        </View>
      </View>

      {/* ── 2. Content (Empty State OR Appointment Cards) ── */}
      {visibleAppointments.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../../assets/images/appointments/appointment_empty_calendar.png')}
            style={styles.emptyIllustration}
            resizeMode="contain"
          />

          <Text style={styles.emptyTitle}>No appointment found</Text>
          <Text style={styles.emptySubtitle}>Your calendar is empty at the moment</Text>

          {!isRefreshing ? (
            <TouchableOpacity
              style={styles.refreshButton}
              activeOpacity={0.85}
              onPress={handleRefreshPress}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        /* Appointment Cards List */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {visibleAppointments.map((item) => {
            const banner = getAppointmentBannerState(
              item.startTime,
              item.isLaterDate,
              item.date,
              now
            );

            const isWaitingToStart = banner.type === 'waiting_to_start';

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.cardWrapper}
                activeOpacity={0.88}
                onPress={() => handleCardPress(item)}
              >
                {/* ── Top White Card (358x112px) ── */}
                <View style={styles.cardBody}>
                  {/* Image with white frame & shadow */}
                  <View style={styles.imageBox}>
                    <Image
                      source={item.service.image || require('../../../assets/images/profile/cont1.jpg')}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Information Column */}
                  <View style={styles.infoCol}>
                    <Text style={styles.serviceCategoryText} numberOfLines={1}>
                      {item.service.category}
                    </Text>

                    {/* Duration & Star Rating */}
                    <View style={styles.metaRow}>
                      <View style={styles.durationRow}>
                        <SmallClockIcon size={16} />
                        <Text style={styles.metaLabelText}>{item.service.duration}</Text>
                      </View>

                      {/* Dot separator */}
                      <View style={styles.dotSeparator} />

                      <View style={styles.ratingRow}>
                        <StarIcon size={16} />
                        <Text style={styles.metaLabelText}>{item.service.rating}</Text>
                      </View>
                    </View>

                    {/* Price */}
                    <Text style={styles.priceText}>{formatNaira(item.service.price)}</Text>
                  </View>
                </View>

                {/* ── Attached Bottom Banner Strip (358x48px) ── */}
                <View
                  style={[
                    styles.bannerStrip,
                    isWaitingToStart ? styles.bannerStripGreen : styles.bannerStripGrey,
                  ]}
                >
                  <Text
                    style={[
                      styles.bannerLabelText,
                      isWaitingToStart ? styles.bannerTextGreen : styles.bannerTextGrey,
                    ]}
                  >
                    {banner.label}
                  </Text>

                  {banner.timerString ? (
                    <Text
                      style={[
                        styles.bannerTimerText,
                        isWaitingToStart ? styles.bannerTextGreen : styles.bannerTextGrey,
                      ]}
                    >
                      {banner.timerString}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <NativeDockSpacer />

      {/* ── 3. Dimmed Refresh Loading Overlay (Centered 4-dot loader) ── */}
      <LoadingOverlay
        visible={isRefreshing}
        centered={true}
        dotSize={10}
        dotGap={12}
        overlayOpacity={0.1}
        dotColor="rgba(0, 8, 20, 0.96)"
      />
    </View>
  );
}

export default StaffAppointmentsScreen;

// ── 1:1 Figma Converted Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Page Header (64px height) ──
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingBottom: 12,
  },
  headerContentRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  countLineWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  countLineText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Scroll Content & Card ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    position: 'relative',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardBody: {
    width: '100%',
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 2,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  infoCol: {
    flex: 1,
    gap: 6,
  },
  serviceCategoryText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotSeparator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  metaLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Attached Bottom Banner Strip ──
  bannerStrip: {
    width: '100%',
    height: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: -16,
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  bannerStripGrey: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  bannerStripGreen: {
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
  },
  bannerLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  bannerTimerText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  bannerTextGrey: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
  bannerTextGreen: {
    color: 'rgba(12, 121, 12, 0.96)',
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -40,
  },
  emptyIllustration: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
    marginBottom: 32,
  },
  refreshButton: {
    width: 296,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  refreshButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
