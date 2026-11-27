import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import { useMemo } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useStaffStore } from '../../context/StaffContext';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons from Figma Export ──────────────────────────────────────

function ArrowLeft02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Calendar03Icon({
  size = 20,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ClockIcon({
  size = 20,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} />
      <Path d="M12 7v5l3 3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function StarGoldIcon({
  size = 18,
  color = 'rgba(248, 155, 24, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2.5l2.09 4.24 4.68.68-3.39 3.3 0.8 4.66L9 13.18l-4.18 2.2.8-4.66-3.39-3.3 4.68-.68L9 2.5z"
        fill={color}
      />
    </Svg>
  );
}

function MessageMultiple02Icon({
  size = 24,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4-4h4a2 2 0 002-2V9z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 9h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v3l-3-3h-3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AddMaleIcon({
  size = 20,
  color = 'rgba(10, 95, 10, 0.8)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="9" cy="9" r="6" stroke={color} strokeWidth={1.25} />
      <Path d="M13 5l4-4M13 1h4v4" stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function VenusAndMarsIcon({
  size = 20,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="9" r="5" stroke={color} strokeWidth={1.5} />
      <Path d="M12.5 5.5L18 2M14 2h4v4M9 14v6M6 17h6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckmarkBadge02Icon({
  size = 20,
  color = '#1A82FF',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2l2.4 1.8 3-.4 1.4 2.6 2.8 1.1-.4 3 1.8 2.4-1.8 2.4.4 3-2.8 1.1-1.4 2.6-3-.4L10 18l-2.4 1.8-3-.4-1.4-2.6-2.8-1.1.4-3L-1 10.3l1.8-2.4-.4-3 2.8-1.1 1.4-2.6 3 .4L10 2z"
        fill={color}
      />
      <Path d="M7 10l2 2 4-4" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function User03Icon({
  size = 20,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SeatSelectorIcon({
  size = 18,
  color = 'rgba(12, 121, 12, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.5 8V4.5C6.5 3.12 7.62 2 9 2h2c1.38 0 2.5 1.12 2.5 2.5V8"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M4 8.5v3a1 1 0 001 1h1.5M16 8.5v3a1 1 0 01-1 1h-1.5M6 12.5h8M10 12.5V17M6.5 17h7"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProviderStaffInProgressDetailScreen() {
  const safeRouter = useSafeRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { staff: providerStaff } = useStaffStore();

  // Find staff member
  const currentStaff = useMemo(() => {
    const found = providerStaff.find((s) => s.id === id);
    if (found) return found;
    return (
      providerStaff[0] || {
        id: 'staff_default',
        name: 'Ayobami Isaac',
        role: 'Nail artist',
      }
    );
  }, [providerStaff, id]);

  const staffName = currentStaff.name || 'Ayobami Isaac';
  const staffRole = currentStaff.role || 'Nail artist';

  const defaultAvatar = require('../../../assets/images/profile/godwin_profile_avatar.png');
  const rawAvatar = currentStaff.avatarUri || currentStaff.photoUri;
  const staffAvatar = rawAvatar
    ? (typeof rawAvatar === 'string' ? { uri: rawAvatar } : rawAvatar)
    : defaultAvatar;

  const clientAvatar = require('../../../assets/images/appointments/jude_fabulous.png');
  const servicePhoto = require('../../../assets/images/appointments/hair_cut.jpg');

  const handleMessageStaff = () => {
    triggerLightHaptic();
    safeRouter.push({
      pathname: '/messages' as any,
      params: { staffId: currentStaff.id, staffName },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed Header (64px) ── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeRouter.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Staff Detail</Text>

          {/* Invisible Right Spacer */}
          <View style={styles.headerSpacer} pointerEvents="none" />
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Ongoing Service Indicator Banner (358×86px) ── */}
        <View style={styles.ongoingBanner}>
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>1:25:30</Text>
          </View>
          <View style={styles.ongoingTextBlock}>
            <Text style={styles.ongoingHeading}>Ongoing Appointment</Text>
            <Text style={styles.ongoingSubtext}>
              This appointment is currently in progress
            </Text>
          </View>
        </View>

        {/* ── 2. Client Profile Card (358×224px) ── */}
        <LinearGradient
          colors={['rgba(203, 230, 164, 0.92)', 'rgba(255, 255, 255, 0.96)']}
          start={{ x: 0.5, y: -0.5 }}
          end={{ x: 0.5, y: 0.85 }}
          style={styles.clientProfileCard}
        >
          {/* Top Row: Avatar + Name + New Client Tag */}
          <View style={styles.clientTopRow}>
            <Image source={clientAvatar} style={styles.clientAvatar} resizeMode="cover" />
            <View style={styles.clientInfoCol}>
              <Text style={styles.clientName}>Jude Fabulous</Text>
              <View style={styles.clientTagRow}>
                <AddMaleIcon size={18} color="rgba(10, 95, 10, 0.8)" />
                <Text style={styles.clientTagText}>New Client</Text>
              </View>
            </View>
          </View>

          {/* Activities Row: Gender / Appointments / Membership */}
          <View style={styles.clientActivitiesRow}>
            {/* Gender */}
            <View style={styles.activityItem}>
              <View style={styles.activityIconCircle}>
                <VenusAndMarsIcon size={18} color="#141B34" />
              </View>
              <Text style={styles.activityCaption}>Gender</Text>
              <Text style={styles.activityValue}>Male</Text>
            </View>

            <View style={styles.activityDivider} />

            {/* Total Appointments */}
            <View style={styles.activityItem}>
              <View style={styles.activityIconCircle}>
                <CheckmarkBadge02Icon size={18} color="#1A82FF" />
              </View>
              <Text style={styles.activityCaption}>Badge</Text>
              <Text style={styles.activityValue}>Non</Text>
            </View>

            <View style={styles.activityDivider} />

            {/* Membership */}
            <View style={styles.activityItem}>
              <View style={styles.activityIconCircle}>
                <User03Icon size={18} color="#141B34" />
              </View>
              <Text style={styles.activityCaption}>Membership</Text>
              <Text style={styles.activityValue}>5 Days ago</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── 3. Appointment Information ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Appointment Information</Text>
          <View style={styles.infoCardsRow}>
            <View style={styles.infoCard}>
              <Calendar03Icon size={20} color="rgba(0, 8, 20, 0.96)" />
              <Text style={styles.infoCardText}>Monday, 24 October</Text>
            </View>
            <View style={styles.infoCard}>
              <ClockIcon size={20} color="rgba(0, 8, 20, 0.96)" />
              <Text style={styles.infoCardText}>10:00 AM - 11:30 AM</Text>
            </View>
          </View>
        </View>

        {/* ── 4. Specialist Section ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Specialist</Text>
          <View style={styles.specialistCard}>
            <Image source={staffAvatar} style={styles.specialistAvatar} resizeMode="cover" />
            <View style={styles.specialistInfoCol}>
              <Text style={styles.specialistName}>{staffName}</Text>
              <Text style={styles.specialistRole}>{staffRole}</Text>
              <View style={styles.specialistRatingRow}>
                <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                <Text style={styles.specialistRatingText}>4.1</Text>
                <View style={styles.busyPill}>
                  <SeatSelectorIcon size={14} color="rgba(12, 121, 12, 0.96)" />
                  <Text style={styles.busyPillText}>Busy</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── 5. Service Package ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Package</Text>
          <View style={styles.packageCard}>
            <View style={styles.packageHeaderRow}>
              <Text style={styles.packageName}>Deluxe Hair & Scalp Treatment</Text>
              <Text style={styles.packageDuration}>1hr 30m</Text>
            </View>
            <Text style={styles.packageDescription}>
              Complete hair wash, scalp massage, deep conditioning, and signature styling.
            </Text>
            <View style={styles.packagePriceRow}>
              <Text style={styles.packagePrice}>₦35,000</Text>
            </View>
          </View>
        </View>

        {/* ── 6. Add-Ons ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Add-Ons</Text>
          <View style={styles.addOnCard}>
            <Image source={servicePhoto} style={styles.addOnPhoto} resizeMode="cover" />
            <View style={styles.addOnInfoCol}>
              <Text style={styles.addOnTitle}>Anti-Dandruff Scalp Treatment</Text>
              <Text style={styles.addOnDuration}>15 mins</Text>
              <Text style={styles.addOnPrice}>₦5,000</Text>
            </View>
          </View>
        </View>

        {/* ── 7. Client Special Request Note ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Client Note</Text>
          <View style={styles.clientNoteCard}>
            <Text style={styles.clientNoteText}>
              "leave a note for the staff"
            </Text>
            <Text style={styles.clientNoteCount}>1/120</Text>
          </View>
        </View>

        {/* ── 8. Booking Summary ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Package Base</Text>
              <Text style={styles.summaryValue}>₦35,000</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Specialist Fee</Text>
              <Text style={styles.summaryValue}>₦10,000</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Add-On Treatment</Text>
              <Text style={styles.summaryValue}>₦5,000</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>₦50,000</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Action Bar (Height 80px) ── */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={handleMessageStaff}
          activeOpacity={0.85}
        >
          <MessageMultiple02Icon size={24} color="#FFFFFF" />
          <Text style={styles.messageButtonText}>Message {staffName}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Native Dock Protection Spacer ── */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
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
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 24,
  },

  /* ── Ongoing Service Indicator Banner (358×86) ── */
  ongoingBanner: {
    width: 358,
    height: 86,
    borderRadius: 24,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  timerPill: {
    width: 74,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  ongoingTextBlock: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  ongoingHeading: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ongoingSubtext: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* ── Client Profile Card (358×224) ── */
  clientProfileCard: {
    width: 358,
    height: 224,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#CBE6A4',
    padding: 16,
    justifyContent: 'space-between',
  },
  clientTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  clientInfoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  clientName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  clientTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientTagText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(10, 95, 10, 0.8)',
  },
  clientActivitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 104,
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCaption: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  activityValue: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
  },
  activityDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  /* ── General Section Block ── */
  sectionBlock: {
    width: 358,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },

  /* ── Appointment Information ── */
  infoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  infoCardText: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  /* ── Specialist Card (358×116) ── */
  specialistCard: {
    width: 358,
    height: 116,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialistAvatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  specialistInfoCol: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    gap: 4,
  },
  specialistName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  specialistRole: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  specialistRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  specialistRatingText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  busyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    gap: 4,
  },
  busyPillText: {
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(12, 121, 12, 0.96)',
  },

  /* ── Service Package ── */
  packageCard: {
    width: 358,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    gap: 8,
  },
  packageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  packageDuration: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  packageDescription: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  packagePriceRow: {
    marginTop: 8,
  },
  packagePrice: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  /* ── Add-On ── */
  addOnCard: {
    width: 358,
    height: 104,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addOnPhoto: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  addOnInfoCol: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    gap: 4,
  },
  addOnTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  addOnDuration: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  addOnPrice: {
    fontFamily: FONT_MEDIUM,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  /* ── Client Special Request Note ── */
  clientNoteCard: {
    width: 358,
    height: 108,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    justifyContent: 'space-between',
  },
  clientNoteText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  clientNoteCount: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(0, 8, 20, 0.96)',
    alignSelf: 'flex-end',
  },

  /* ── Booking Summary ── */
  summaryCard: {
    width: 358,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  summaryValue: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  summaryDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  summaryTotalValue: {
    fontFamily: FONT_MEDIUM,
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  /* ── Fixed Bottom Footer (80px) ── */
  footerBar: {
    height: 80,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
  },
  messageButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  messageButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});

