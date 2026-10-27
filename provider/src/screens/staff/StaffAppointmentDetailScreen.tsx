import React from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useStaffAppointments } from '../../context/StaffAppointmentsContext';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { formatNaira } from '../../utils/staffAppointmentFormatters';
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

function WarningTriangleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2.5l7.5 13.5H2.5L10 2.5z"
        stroke="rgba(248, 155, 24, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 7.5v4" stroke="rgba(248, 155, 24, 0.96)" strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="10" cy="14" r="0.75" fill="rgba(248, 155, 24, 0.96)" />
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
        d="M10 2.5l2.25 1.5 2.7-.2.95 2.55 2.45 1.15-.4 2.7 1.45 2.3-1.45 2.3.4 2.7-2.45 1.15-.95 2.55-2.7-.2L10 22.5l-2.25-1.5-2.7.2-.95-2.55-2.45-1.15.4-2.7L.6 12.5l1.45-2.3-.4-2.7 2.45-1.15.95-2.55 2.7.2L10 2.5z"
        fill="rgba(26, 130, 255, 0.9)"
        scale="0.8"
      />
      <Path
        d="M7.5 10l2 2 3.5-4"
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
      <Circle cx="10" cy="6" r="3.5" stroke="#141B34" strokeWidth="1.25" />
      <Path
        d="M4 16c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="#141B34"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CalendarIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="17" rx="3" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" />
      <Path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ClockIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" />
      <Path d="M12 6.5v5.5h4.5" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function HomeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9 22V12h6v10" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Main Appointment Detail Screen ──────────────────────────────────────────

export function StaffAppointmentDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getAppointmentById } = useStaffAppointments();

  const appointment = id ? getAppointmentById(id) : undefined;

  // Fallback if accessed without valid ID or empty store
  if (!appointment) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Detail</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Appointment Not Found</Text>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isWaiting = appointment.status === 'waiting';
  const isInProgress = appointment.status === 'in-progress';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── 1. Page Header (Category title e.g. "Haircut" / "Hair cut") ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContentRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              router.back();
            }}
            accessibilityLabel="Back"
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {appointment.service.category}
          </Text>

          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. Top Banner (Waiting amber banner OR In-progress green banner with Open button) ── */}
        {isWaiting && (
          <View style={styles.waitingBanner}>
            <View style={styles.bannerIconCircle}>
              <WarningTriangleIcon size={20} />
            </View>
            <Text style={styles.waitingBannerText}>
              Waiting for client to arrive at the location and start the appointment.
            </Text>
          </View>
        )}

        {isInProgress && (
          <View style={styles.inProgressBanner}>
            <View style={styles.bannerIconCircle}>
              <ProgressDashedSpinnerIcon size={16} />
            </View>
            <Text style={styles.inProgressBannerText}>Appointment in progress</Text>
            <TouchableOpacity
              style={styles.openPillButton}
              activeOpacity={0.85}
              onPress={() => {
                triggerLightHaptic();
                router.push({
                  pathname: STAFF_ROUTES.ONGOING_DETAIL as any,
                  params: { id: appointment.id },
                });
              }}
            >
              <Text style={styles.openPillText}>Open</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 3. Client Card (Gradient: 358x224px) ── */}
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

        {/* ── 4. Service Section (Card with Service info + Specialist row) ── */}
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

        {/* ── 5. Appointment Information Section (Date, Time, Type) ── */}
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

        {/* ── 6. Note Section ── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Note</Text>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{appointment.note || 'No special note provided.'}</Text>
            {/* Real note length counter over 120 */}
            <Text style={styles.noteCounterText}>{`${appointment.note?.length || 0}/120`}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default StaffAppointmentDetailScreen;

// ── 1:1 Figma Converted Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (64px) ──
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingBottom: 8,
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
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 48,
  },

  // ── Scroll Content ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },

  // ── Top Banners ──
  waitingBanner: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    minHeight: 56,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waitingBannerText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
    includeFontPadding: false,
  },
  inProgressBanner: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    height: 52,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inProgressBannerText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
    includeFontPadding: false,
  },
  bannerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openPillButton: {
    width: 69,
    height: 36,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openPillText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  // ── Client Card (Gradient: 358x224px) ──
  clientCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#CBE6A4',
    padding: 16,
    gap: 20,
  },
  clientHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    width: 64,
    height: 64,
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
    includeFontPadding: false,
  },
  clientBadgePill: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 95, 10, 0.1)',
  },
  clientBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(10, 95, 10, 0.9)',
    includeFontPadding: false,
  },
  clientStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
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
    marginBottom: 4,
  },
  statLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  statValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  verticalDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Sections & Grey Cards ──
  sectionWrapper: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  greyCard: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  serviceImageBox: {
    width: 88,
    height: 88,
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
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  serviceInfoCol: {
    flex: 1,
    gap: 6,
  },
  serviceNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  servicePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    includeFontPadding: false,
  },
  cardInternalDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Specialist ──
  specialistSection: {
    gap: 8,
  },
  specialistHeaderLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  specialistRoleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  specialistRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // ── Appointment Information Rows ──
  infoRowBlock: {
    gap: 8,
  },
  infoLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
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
    includeFontPadding: false,
  },

  // ── Note Section ──
  noteCard: {
    width: '100%',
    minHeight: 108,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  noteText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  noteCounterText: {
    alignSelf: 'flex-end',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
    marginTop: 12,
  },

  // ── Fallback ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
  },
  backHomeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#000814',
  },
  backHomeButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
