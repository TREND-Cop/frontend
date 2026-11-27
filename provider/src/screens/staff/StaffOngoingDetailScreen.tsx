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
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useStaffAppointments } from '../../context/StaffAppointmentsContext';
import { formatNaira } from '../../utils/staffAppointmentFormatters';
import { triggerLightHaptic } from '../../utils/haptics';
import { STAFF_ROUTES } from '../../constants/staffRoutes';

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

function GenderSymbolIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="7.5" cy="12.5" r="4.5" stroke="#141B34" strokeWidth="1.25" />
      <Path d="M11 9l5-5M16 4h-4M16 4v4" stroke="#141B34" strokeWidth="1.25" strokeLinecap="round" />
    </Svg>
  );
}

function VerifiedCheckBadgeIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2l2.39 1.63 2.87-.47 1.25 2.61 2.69 1.07-.36 2.87 1.76 2.3-1.76 2.3.36 2.87-2.69 1.07-1.25 2.61-2.87-.47L10 18l-2.39 1.63-2.87-.47-1.25-2.61-2.69-1.07.36-2.87L-.6 10l1.76-2.3-.36-2.87 2.69-1.07 1.25-2.61 2.87.47L10 2z"
        fill="#1A82FF"
      />
      <Path
        d="M7 10l2 2 4-4"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M16.5 17.5c0-2.5-3-4-6.5-4s-6.5 1.5-6.5 4"
        stroke="#141B34"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <Circle cx="10" cy="6.5" r="3.5" stroke="#141B34" strokeWidth="1.25" />
    </Svg>
  );
}

function CalendarIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="17" rx="3" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" />
      <Path d="M3 9h18M8 2v3M16 2v3" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="8" cy="13" r="1" fill="rgba(0, 8, 20, 0.96)" />
      <Circle cx="12" cy="13" r="1" fill="rgba(0, 8, 20, 0.96)" />
      <Circle cx="16" cy="13" r="1" fill="rgba(0, 8, 20, 0.96)" />
    </Svg>
  );
}

function ClockIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" />
      <Path d="M12 6.5V12h4.5" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function HomeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
      />
      <Path d="M9 21V12h6v9" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" />
    </Svg>
  );
}

function DarkCheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9" fill="rgba(0, 8, 20, 0.96)" />
      <Path
        d="M6.5 10l2.5 2.5 4.5-4.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Format seconds into h:mm:ss
function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * 1:1 Figma Ongoing Appointment Detail Screen
 * Frame: Client name - Ayobami Isaac (390x2264)
 */
export function StaffOngoingDetailScreen() {
  const insets = useSafeAreaInsets();
  const safeRouter = useSafeRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getAppointmentById } = useStaffAppointments();

  const appointment = id ? getAppointmentById(id) : undefined;

  // Screen focus state for running the 1-second timer strictly while active
  const [isFocused, setIsFocused] = useState(true);
  const [now, setNow] = useState(Date.now());

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setNow(Date.now());
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  // Single 1-second interval ticker running only while focused
  useEffect(() => {
    if (!isFocused) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocused]);

  if (!appointment) {
    return (
      <View style={[styles.screenContainer, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="dark" />
        <Text style={styles.notFoundText}>Ongoing appointment not found.</Text>
        <TouchableOpacity
          style={styles.backButtonSimple}
          onPress={() => safeRouter.back()}
        >
          <Text style={styles.backButtonSimpleText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate elapsed time from startedAt (counting upward)
  const startedAt = appointment.startedAt || appointment.startTime || (now - 5130000);
  const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const timerText = formatElapsedTime(elapsedSeconds);

  // Package data fallback matching Figma Frame: 3 images, ₦4,500, 3 items
  const pkg = appointment.package || {
    price: 4500,
    includedItems: ['Hair Washing', 'Conditioning & Wash', 'Manicure'],
    images: [
      require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
      require('../../../assets/images/profile/cont3.jpg'),
      require('../../../assets/images/profile/men_braids.jpg'),
    ],
  };

  const handleCompletedPress = () => {
    triggerLightHaptic();
    safeRouter.push({
      pathname: STAFF_ROUTES.VERIFYING_STATUS as any,
      params: { id: appointment.id },
    });
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Fixed 64px Header ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContentRow}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              safeRouter.back();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeftIcon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Centered screen title */}
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {appointment.service.serviceName || appointment.service.category || 'Ongoing Appointment'}
          </Text>

          {/* Header play icon: navigates to In Progress tutorial video */}
          <TouchableOpacity
            style={styles.headerShareButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              safeRouter.push({
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

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Live Ongoing Appointment Banner ── */}
        <View style={styles.ongoingBanner}>
          {/* White Timer Pill (green text h:mm:ss) */}
          <View style={styles.timerPillBox}>
            <Text style={styles.timerPillText}>{timerText}</Text>
          </View>

          {/* Banner Text Block */}
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitleText}>Ongoing Appointment</Text>
            <Text style={styles.bannerSubtitleText}>
              This appointment is currently in progress
            </Text>
          </View>
        </View>

        {/* ── 2. Client Card (Gradient: 358x224px) ── */}
        <LinearGradient
          colors={['rgba(203, 230, 164, 0.92)', 'rgba(255, 255, 255, 0.96)']}
          locations={[-0.5, 0.82]}
          style={styles.clientCard}
        >
          {/* Top Row: Avatar, Name, New Client Pill */}
          <View style={styles.clientHeaderRow}>
            <View style={styles.clientAvatarBox}>
              <Image
                source={appointment.client.photo || require('../../../assets/images/profile/cont1.jpg')}
                style={styles.clientAvatarImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.clientNameCol}>
              <Text style={styles.clientNameText} numberOfLines={1}>
                {appointment.client.name}
              </Text>
              <View style={styles.clientBadgePill}>
                <Text style={styles.clientBadgeText}>
                  {appointment.client.isNew ? 'New Client' : 'Returning Client'}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom 3 Columns: Gender | Badge | Membership */}
          <View style={styles.clientStatsRow}>
            {/* Gender */}
            <View style={styles.statCol}>
              <View style={styles.statIconBox}>
                <GenderSymbolIcon size={20} />
              </View>
              <Text style={styles.statLabelText}>Gender</Text>
              <Text style={styles.statValueText}>{appointment.client.gender}</Text>
            </View>

            <View style={styles.verticalDivider} />

            {/* Badge */}
            <View style={styles.statCol}>
              <View style={styles.statIconBox}>
                <VerifiedCheckBadgeIcon size={20} />
              </View>
              <Text style={styles.statLabelText}>Badge</Text>
              <Text style={styles.statValueText}>{appointment.client.badge}</Text>
            </View>

            <View style={styles.verticalDivider} />

            {/* Membership */}
            <View style={styles.statCol}>
              <View style={styles.statIconBox}>
                <UserIcon size={20} />
              </View>
              <Text style={styles.statLabelText}>Membership</Text>
              <Text style={styles.statValueText}>{appointment.client.membershipAgeText}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── 3. Service Section (Card with Service info + Specialist row) ── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Service</Text>

          <View style={styles.greyCard}>
            {/* Service Item Row */}
            <View style={styles.serviceItemRow}>
              <View style={styles.serviceImageBox}>
                <Image
                  source={appointment.service.image || require('../../../assets/images/profile/dry_wow_pedicure.jpg')}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.serviceInfoCol}>
                <Text style={styles.serviceNameText} numberOfLines={1}>
                  {appointment.service.serviceName}
                </Text>
                <Text style={styles.servicePriceText}>
                  {formatNaira(appointment.service.price)}
                </Text>

                <View style={styles.serviceMetaRow}>
                  <View style={styles.durationRow}>
                    <SmallClockIcon size={16} />
                    <Text style={styles.metaLabelText}>{appointment.service.duration}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <StarIcon size={16} />
                    <Text style={styles.metaLabelText}>{appointment.service.rating}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Subtle Divider */}
            <View style={styles.cardInternalDivider} />

            {/* Specialist Sub-section */}
            <View style={styles.specialistSection}>
              <Text style={styles.specialistHeaderLabel}>Specialist</Text>
              <View style={styles.specialistRow}>
                <Image
                  source={appointment.specialist.photo || require('../../../assets/images/profile/cont2.jpg')}
                  style={styles.specialistAvatarImage}
                  resizeMode="cover"
                />

                <View style={styles.specialistInfoCol}>
                  <Text style={styles.specialistNameText} numberOfLines={1}>
                    {appointment.specialist.name}
                  </Text>
                  <Text style={styles.specialistRoleText} numberOfLines={1}>
                    {appointment.specialist.role}
                  </Text>
                  <View style={styles.specialistRatingRow}>
                    <StarIcon size={16} />
                    <Text style={styles.metaLabelText}>{appointment.specialist.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── 4. Appointment Information Section ── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Appointment Information</Text>

          <View style={styles.greyCard}>
            {/* Date */}
            <View style={styles.infoRowBlock}>
              <Text style={styles.infoLabelText}>Appointment Date</Text>
              <View style={styles.infoValueRow}>
                <View style={styles.whiteIconCircle}>
                  <CalendarIcon size={22} />
                </View>
                <Text style={styles.infoValueText}>{appointment.date}</Text>
              </View>
            </View>

            {/* Time */}
            <View style={styles.infoRowBlock}>
              <Text style={styles.infoLabelText}>Appointment Time</Text>
              <View style={styles.infoValueRow}>
                <View style={styles.whiteIconCircle}>
                  <ClockIcon size={22} />
                </View>
                <Text style={styles.infoValueText}>{appointment.time}</Text>
              </View>
            </View>

            {/* Type */}
            <View style={styles.infoRowBlock}>
              <Text style={styles.infoLabelText}>Appointment Type</Text>
              <View style={styles.infoValueRow}>
                <View style={styles.whiteIconCircle}>
                  <HomeIcon size={22} />
                </View>
                <Text style={styles.infoValueText}>{appointment.type}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 5. Note Section ── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Note</Text>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{appointment.note || 'leave a note for the staff'}</Text>
          </View>
        </View>

        {/* ── 6. Package Section (Frame 1000006514) ── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Package</Text>

          <View style={styles.packageCard}>
            {/* 2-Column Image Grid: Row 1 has 2 images, Row 2 has 1 alone */}
            <View style={styles.packageImagesGrid}>
              <View style={styles.packageImageRow}>
                <Image
                  source={pkg.images[0] || require('../../../assets/images/profile/dry_wow_pedicure.jpg')}
                  style={styles.packageGridImage}
                  resizeMode="cover"
                />
                <Image
                  source={pkg.images[1] || require('../../../assets/images/profile/cont3.jpg')}
                  style={styles.packageGridImage}
                  resizeMode="cover"
                />
              </View>

              {pkg.images[2] && (
                <View style={styles.packageImageRow}>
                  <Image
                    source={pkg.images[2]}
                    style={styles.packageGridImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            {/* Package Price: bold 24px */}
            <Text style={styles.packagePriceText}>{formatNaira(pkg.price)}</Text>

            {/* Included Items List with dark checkmark circle icons */}
            <View style={styles.packageItemsList}>
              {pkg.includedItems.map((item, index) => (
                <View key={index} style={styles.packageItemRow}>
                  <DarkCheckCircleIcon size={20} />
                  <Text style={styles.packageItemLabel}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Pinned Bottom "Completed" Action Button ── */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.completedActionButton}
          activeOpacity={0.88}
          onPress={handleCompletedPress}
        >
          <Text style={styles.completedActionButtonText}>Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notFoundText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 16,
  },
  backButtonSimple: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 20,
  },
  backButtonSimpleText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    color: '#FFFFFF',
    fontSize: 14,
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

  // 1. Ongoing Appointment Banner
  ongoingBanner: {
    width: '100%',
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  timerPillBox: {
    minWidth: 78,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerPillText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  bannerTextCol: {
    flex: 1,
    gap: 4,
  },
  bannerTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bannerSubtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // 2. Client Card (Gradient: 358x224px)
  clientCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#CBE6A4',
    padding: 16,
    marginBottom: 32,
  },
  clientHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  clientAvatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  clientAvatarImage: {
    width: '100%',
    height: '100%',
  },
  clientNameCol: {
    flex: 1,
    gap: 6,
  },
  clientNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  clientBadgePill: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
  },
  clientBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(10, 95, 10, 0.8)',
  },

  clientStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  statValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  verticalDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // Section Wrapper & Title
  sectionWrapper: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 16,
  },

  // Grey Card: background rgba(247, 247, 247, 0.96), radius 24px, padding 16px
  greyCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
  },

  // 3. Service details
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  serviceImageBox: {
    width: 88,
    height: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  serviceInfoCol: {
    flex: 1,
    gap: 4,
  },
  serviceNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  servicePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
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
  metaLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  cardInternalDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 16,
  },

  specialistSection: {
    gap: 12,
  },
  specialistHeaderLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specialistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  specialistAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  specialistInfoCol: {
    flex: 1,
    gap: 4,
  },
  specialistNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specialistRoleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  specialistRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // 4. Appointment Info
  infoRowBlock: {
    marginBottom: 20,
    gap: 8,
  },
  infoLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  whiteIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // 5. Note Card
  noteCard: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    minHeight: 108,
    justifyContent: 'space-between',
  },
  noteText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 12,
  },
  noteCounterText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    alignSelf: 'flex-end',
  },

  // 6. Package Card
  packageCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  packageImagesGrid: {
    gap: 16,
    alignSelf: 'center',
  },
  packageImageRow: {
    flexDirection: 'row',
    gap: 16,
  },
  packageGridImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
  },
  packagePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  packageItemsList: {
    gap: 12,
  },
  packageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  packageItemLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Pinned Bottom Button Container (attending to client button in CSS)
  bottomButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  completedActionButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
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
        elevation: 3,
      },
    }),
  },
  completedActionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});

export default StaffOngoingDetailScreen;
