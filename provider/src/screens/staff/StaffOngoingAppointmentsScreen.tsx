import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useStaffAppointments } from '../../context/StaffAppointmentsContext';
import { formatNaira } from '../../utils/staffAppointmentFormatters';
import { triggerLightHaptic } from '../../utils/haptics';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { markStaffSubScreenNavigation } from '../../hooks/useStaffDashboardSkeleton';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

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

function PlaySquareIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke={color} strokeWidth="1.5" />
      <Path d="M10 8.5L16 12L10 15.5V8.5Z" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
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

function StarIcon({ size = 16, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 2.2l1.75 3.68 4.03.59-2.92 2.84.69 4.01L8 11.43l-3.55 1.89.69-4.01-2.92-2.84 4.03-.59L8 2.2z"
        fill={color}
      />
    </Svg>
  );
}

function ProgressDashedSpinnerIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="rgba(12, 121, 12, 0.96)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Ongoing Appointments Screen (Staff In-Progress List)
 * Section: In Progress Screen → Frame: Ongoing Appointments (390x844)
 */
export function StaffOngoingAppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { appointments } = useStaffAppointments();

  // Filter in-progress appointments
  const ongoingList = appointments.filter((a) => a.status === 'in-progress');
  const count = ongoingList.length;

  // Header back navigation triggers skeleton-on-return to Staff Home
  const handleGoBack = () => {
    triggerLightHaptic();
    markStaffSubScreenNavigation();
    router.replace(STAFF_ROUTES.HOME as any);
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Fixed 64px Top Header with Safe Area Inset ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContentRow}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={handleGoBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeftIcon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Centered screen title */}
          <Text style={styles.headerTitleText} numberOfLines={1}>
            Ongoing Appointments
          </Text>

          {/* Header play icon: navigates to In Progress tutorial video */}
          <TouchableOpacity
            style={styles.headerShareButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              router.push({
                pathname: STAFF_ROUTES.TUTORIAL_VIDEO as any,
                params: { step: '2', title: 'In Progress' },
              });
            }}
            accessibilityLabel="Tutorial Video"
          >
            <PlaySquareIcon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Scroll View ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Count Line: "1 Ongoing appointment" vs "N Ongoing appointments" */}
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            {count === 1 ? '1 Ongoing appointment' : `${count} Ongoing appointments`}
          </Text>
        </View>

        {/* ── List Cards ── */}
        {ongoingList.map((appointment) => {
          return (
            <TouchableOpacity
              key={appointment.id}
              style={styles.cardWrapper}
              activeOpacity={0.88}
              onPress={() => {
                triggerLightHaptic();
                router.push({
                  pathname: STAFF_ROUTES.ONGOING_DETAIL as any,
                  params: { id: appointment.id },
                });
              }}
            >
              {/* Card Body: White rounded container with border */}
              <View style={styles.cardBody}>
                {/* Image Box */}
                <View style={styles.imagePlaceholderBox}>
                  <Image
                    source={
                      appointment.service.image ||
                      require('../../../assets/images/appointments/nail_art.png')
                    }
                    style={styles.serviceImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Info Column */}
                <View style={styles.cardInfoCol}>
                  <Text style={styles.serviceTitleText} numberOfLines={1}>
                    {appointment.service.category || appointment.service.serviceName}
                  </Text>

                  <View style={styles.durationRateRow}>
                    <View style={styles.durationBlock}>
                      <SmallClockIcon size={18} />
                      <Text style={styles.metaLabel}>{appointment.service.duration}</Text>
                    </View>

                    <View style={styles.metaDot} />

                    <View style={styles.rateBlock}>
                      <StarIcon size={18} />
                      <Text style={styles.metaLabel}>{appointment.service.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.priceTagText}>
                    {formatNaira(appointment.service.price)}
                  </Text>
                </View>
              </View>

              {/* Status Banner Strip (Green Strip: Frame 1000006401) */}
              <View style={styles.statusStrip}>
                <View style={styles.statusStripContent}>
                  <ProgressDashedSpinnerIcon size={16} />
                  <Text style={styles.statusStripText}>Appointment In-Progress</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Note: Per design instructions, no empty illustration is designed for this list.
            When count === 0, only the header and "0 Ongoing appointments" render. */}
      </ScrollView>

      {/* ── Android Native 3-Button Dock Protection ── */}
      <NativeDockSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header: 64px, bottom border rgba(235, 235, 245, 0.96)
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 10,
  },
  headerContentRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  headerShareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Counter text: 16px 400 SF Pro / DM Sans
  counterRow: {
    marginBottom: 16,
  },
  counterText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Card Outer wrapper (isolation: isolate)
  cardWrapper: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 24,
  },

  // Card Body (White 112px tall box with border)
  cardBody: {
    width: '100%',
    height: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },

  imagePlaceholderBox: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },

  cardInfoCol: {
    flex: 1,
    height: 80,
    justifyContent: 'space-between',
  },
  serviceTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  durationRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  rateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  priceTagText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Green Status Strip (Frame 1000006401)
  statusStrip: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: -20,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    zIndex: 0,
  },
  statusStripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusStripText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
});

export default StaffOngoingAppointmentsScreen;
