import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { useStaffAppointments } from '../../context/StaffAppointmentsContext';
import { AppointmentClientCard } from '../../components/staff/AppointmentClientCard';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';
import { formatNaira } from '../../utils/staffAppointmentFormatters';
import { STAFF_ROUTES } from '../../constants/staffRoutes';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlaySquareIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke="#141B34"
        strokeWidth="1.5"
      />
      <Path
        d="M10 8.5l6 3.5-6 3.5V8.5z"
        fill="#141B34"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkCircleGreenIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        fill="rgba(12, 121, 12, 0.96)"
        stroke="rgba(12, 121, 12, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M8 12l3 3 5-5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CancelCircleRedIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        fill="rgba(204, 41, 41, 0.9)"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth="1.5"
      />
      <Path
        d="M15 9l-6 6M9 9l6 6"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SmallClockIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke="rgba(96, 96, 102, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M12 6v6l4 2"
        stroke="rgba(96, 96, 102, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="rgba(248, 155, 24, 0.96)"
      />
    </Svg>
  );
}

function CalendarIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="4"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
      />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ClockIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M12 6v6l4 2"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HomeIcon({ size = 22 }: { size?: number }) {
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

function DarkCheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        fill="rgba(0, 8, 20, 0.96)"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M8 12l3 3 5-5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Screen Component ─────────────────────────────────────────────────────────

export function StaffHistoryDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; kind?: 'completed' | 'cancelled' }>();
  const { getAppointmentById } = useStaffAppointments();

  const appointment = params.id ? getAppointmentById(params.id) : undefined;
  const isCompleted = params.kind === 'completed' || appointment?.status === 'completed';

  // Fallback if appointment not found
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
          <Text style={styles.headerTitle}>Appointment Details</Text>
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

  const pkg = appointment.package;
  const durationText = appointment.actualDurationText || '00:00:00';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── 1. Page Header (Category title + Back + Inert Play Icon) ── */}
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

          <TouchableOpacity
            style={styles.playButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              router.push({
                pathname: STAFF_ROUTES.TUTORIAL_VIDEO as any,
                params: {
                  step: isCompleted ? '4' : '3',
                  title: isCompleted ? 'Completed Appointments' : 'Cancelled Appointments',
                },
              });
            }}
            accessibilityLabel="Tutorial Video"
          >
            <PlaySquareIcon size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. Top Status Banner ── */}
        {isCompleted ? (
          /* Completed Banner: Light green with timer over green Completed */
          <View style={styles.completedBanner}>
            <View style={styles.bannerIconCircle}>
              <CheckmarkCircleGreenIcon size={24} />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.completedTimerText}>{durationText}</Text>
              <Text style={styles.completedStatusText}>Completed</Text>
            </View>
          </View>
        ) : (
          /* Cancelled Banner: Light red with red circle and "Client cancelled the appointment" */
          <View style={styles.cancelledBanner}>
            <View style={styles.bannerIconCircle}>
              <CancelCircleRedIcon size={24} />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.cancelledTitleText}>Cancelled Appointment</Text>
              <Text style={styles.cancelledSubtitleText}>
                Client cancelled the appointment
              </Text>
            </View>
          </View>
        )}

        {/* ── 3. Client Card (Returning Client Variant with Purple Gradient) ── */}
        <AppointmentClientCard client={appointment.client} variant="returning" />

        {/* ── 4. Service Section (Service item + Specialist) ── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Service</Text>

          <View style={styles.greyCard}>
            {/* Service item row */}
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

            {/* Divider */}
            <View style={styles.cardInternalDivider} />

            {/* Specialist sub-section */}
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

        {/* ── 5. Appointment Information Section ── */}
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
            <Text style={styles.noteCounterText}>{`${appointment.note?.length || 0}/120`}</Text>
          </View>
        </View>

        {/* ── 7. Package Section (Shown ONLY for Completed appointments) ── */}
        {isCompleted && pkg && (
          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Package</Text>

            <View style={styles.packageCard}>
              {/* Package images 2-column grid */}
              <View style={styles.packageImagesGrid}>
                <View style={styles.packageImageRow}>
                  {pkg.images[0] && (
                    <Image
                      source={pkg.images[0]}
                      style={styles.packageGridImage}
                      resizeMode="cover"
                    />
                  )}
                  {pkg.images[1] && (
                    <Image
                      source={pkg.images[1]}
                      style={styles.packageGridImage}
                      resizeMode="cover"
                    />
                  )}
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

              {/* Package price */}
              <Text style={styles.packagePriceText}>{formatNaira(pkg.price)}</Text>

              {/* Included items */}
              <View style={styles.packageItemsList}>
                {pkg.includedItems.map((item, index) => (
                  <View key={`pkg-item-${index}`} style={styles.packageItemRow}>
                    <DarkCheckCircleIcon size={20} />
                    <Text style={styles.packageItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Android 3-button system dock protection */}
      <NativeDockSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    flex: 1,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ── Completed Banner ──
  completedBanner: {
    width: '100%',
    minHeight: 86,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  completedTimerText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  completedStatusText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },

  // ── Cancelled Banner ──
  cancelledBanner: {
    width: '100%',
    minHeight: 82,
    backgroundColor: 'rgba(248, 239, 239, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cancelledTitleText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  cancelledSubtitleText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  bannerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
    gap: 4,
  },

  // ── Section Wrappers ──
  sectionWrapper: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    fontWeight: '500',
  },
  greyCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },

  // ── Service Item ──
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
    borderRadius: 16,
  },
  serviceInfoCol: {
    flex: 1,
    gap: 8,
  },
  serviceNameText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  servicePriceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
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
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  cardInternalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Specialist ──
  specialistSection: {
    gap: 8,
  },
  specialistHeaderLabel: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  specialistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  specialistAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 24,
  },
  specialistInfoCol: {
    flex: 1,
    gap: 4,
  },
  specialistNameText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  specialistRoleText: {
    fontFamily: FONT_REGULAR,
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

  // ── Appointment Information ──
  infoRowBlock: {
    gap: 8,
  },
  infoLabelText: {
    fontFamily: FONT_REGULAR,
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
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValueText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Note ──
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
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  noteCounterText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    alignSelf: 'flex-end',
  },

  // ── Package ──
  packageCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  packageImagesGrid: {
    gap: 16,
  },
  packageImageRow: {
    flexDirection: 'row',
    gap: 16,
  },
  packageGridImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
  },
  packagePriceText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  packageItemsList: {
    gap: 12,
  },
  packageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packageItemText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Fallback ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 18,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  backHomeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  backHomeButtonText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
