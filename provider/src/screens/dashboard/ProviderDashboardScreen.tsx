import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { BusinessStatusSwitch } from '../../components/BusinessStatusSwitch';
import { CategoryFourDotLoader } from '../../components/CategoryFourDotLoader';
import { ProviderDashboardSkeleton } from '../../components/ProviderDashboardSkeleton';
import { useAppointments, useOngoingAppointments } from '../../store/appointmentStore';
import { useBusinessStore } from '../../store/businessStore';
import { useStaffStore } from '../../store/staffStore';
import { useFirstTime } from '../../context/FirstTimeContext';
import { WelcomeCard } from '../../components/tutorial/WelcomeCard';
import { SpotlightOverlay } from '../../components/tutorial/SpotlightOverlay';
import { TutorialTarget } from '../../components/tutorial/TutorialTarget';
import { ConnectAccountModal } from '../../components/tutorial/ConnectAccountModal';
import { TrialNoticeModal } from '../../components/tutorial/TrialNoticeModal';
import { PayoutTermsNotice } from '../../components/payout/PayoutTermsNotice';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { DashboardCard } from '../../components/DashboardCard';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { TUTORIAL_TIMINGS, FORCE_FIRST_TIME_FLOW } from '../../constants/tutorial.config';
import { triggerLightHaptic } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function Location01Icon({ size = 16, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 1.333c-2.761 0-5 2.239-5 5 0 3.889 5 8.334 5 8.334s5-4.445 5-8.334c0-2.761-2.239-5-5-5z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="6.333" r="1.8" stroke={color} strokeWidth="1.2" />
    </Svg>
  );
}

function CalendarDaysIcon({ size = 20, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x="2.5" y="3.33" width="15" height="14.17" rx="2.5" stroke={color} strokeWidth="1.5" />
      <Path d="M2.5 8.33h15" stroke={color} strokeWidth="1.5" />
      <Path d="M6.67 1.67v3.33M13.33 1.67v3.33" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="6" cy="11.5" r="0.75" fill={color} />
      <Circle cx="10" cy="11.5" r="0.75" fill={color} />
      <Circle cx="14" cy="11.5" r="0.75" fill={color} />
      <Circle cx="6" cy="14.5" r="0.75" fill={color} />
      <Circle cx="10" cy="14.5" r="0.75" fill={color} />
    </Svg>
  );
}

function LoaderIcon({ size = 20, color = 'rgba(12, 121, 12, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2.5v2.5M10 15v2.5M15 10h2.5M2.5 10H5M13.53 6.46l1.77-1.76M4.69 15.31l1.77-1.77M13.53 13.54l1.77 1.77M4.69 4.7l1.77 1.76"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function UserMultipleIcon({ size = 20, color = 'rgba(115, 3, 124, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="147 1028 20 20" fill="none">
      <Path
        d="M157.833 1037.17C157.833 1035.33 156.341 1033.83 154.5 1033.83C152.659 1033.83 151.167 1035.33 151.167 1037.17C151.167 1039.01 152.659 1040.5 154.5 1040.5C156.341 1040.5 157.833 1039.01 157.833 1037.17Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M156.199 1034.3C156.177 1034.15 156.167 1033.99 156.167 1033.83C156.167 1031.99 157.659 1030.5 159.5 1030.5C161.341 1030.5 162.833 1031.99 162.833 1033.83C162.833 1035.67 161.341 1037.17 159.5 1037.17C158.879 1037.17 158.299 1037 157.801 1036.7"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M159.5 1045.5C159.5 1042.74 157.261 1040.5 154.5 1040.5C151.739 1040.5 149.5 1042.74 149.5 1045.5"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M164.5 1042.17C164.5 1039.41 162.261 1037.17 159.5 1037.17"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DashboardCircleIcon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x="2.5" y="2.5" width="6.25" height="6.25" rx="1.5" stroke={color} strokeWidth="1.25" />
      <Rect x="11.25" y="2.5" width="6.25" height="6.25" rx="1.5" stroke={color} strokeWidth="1.25" />
      <Rect x="2.5" y="11.25" width="6.25" height="6.25" rx="1.5" stroke={color} strokeWidth="1.25" />
      <Rect x="11.25" y="11.25" width="6.25" height="6.25" rx="1.5" stroke={color} strokeWidth="1.25" />
    </Svg>
  );
}

function AddCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="147 856 20 20" fill="none">
      <Path
        d="M165.333 866C165.333 861.398 161.602 857.667 157 857.667C152.397 857.667 148.667 861.398 148.667 866C148.667 870.602 152.397 874.333 157 874.333C161.602 874.333 165.333 870.602 165.333 866Z"
        fill="#1A82FF"
        fillOpacity="0.9"
        stroke="#1A82FF"
        strokeOpacity="0.9"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M157 862.667V869.333M160.333 866H153.667" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Album02Icon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="338 852 20 20" fill="none">
      <Path
        d="M352.583 856.775V857.243M352.817 857.001H352.375M353 857.001C353 857.231 352.813 857.417 352.583 857.417C352.353 857.417 352.167 857.231 352.167 857.001C352.167 856.771 352.353 856.584 352.583 856.584C352.813 856.584 353 856.771 353 857.001Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M345.917 858.666C345.917 856.309 345.917 855.131 346.649 854.398C347.381 853.666 348.56 853.666 350.917 853.666C353.274 853.666 354.452 853.666 355.184 854.398C355.917 855.131 355.917 856.309 355.917 858.666V862C355.917 864.357 355.917 865.535 355.184 866.267C354.452 867 353.274 867 350.917 867C348.56 867 347.381 867 346.649 866.267C345.917 865.535 345.917 864.357 345.917 862V858.666Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M343.519 856.999C341.743 857.484 340.804 857.815 340.347 858.606C339.829 859.503 340.134 860.641 340.744 862.918L341.607 866.137C342.217 868.414 342.522 869.552 343.419 870.07C344.316 870.588 345.454 870.283 347.731 869.673C348.133 869.565 348.499 869.467 348.833 869.373"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M345.917 863.666L348.724 860.858C349.061 860.522 349.517 860.333 349.993 860.333C350.573 860.333 351.116 860.613 351.453 861.084L355.083 866.166"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TriangleIcon({ size = 10 }: { size?: number }) {
  return (
    <Svg width={10} height={9} viewBox="93.01 5.45 9.98 9.05" fill="none">
      <Path
        d="M94.7967 8.61237C95.9194 6.81161 96.4807 5.91123 97.2163 5.64C97.7225 5.45333 98.2775 5.45333 98.7837 5.64C99.5193 5.91123 100.081 6.81161 101.203 8.61237C102.467 10.6392 103.099 11.6527 102.987 12.4889C102.911 13.0625 102.626 13.5865 102.188 13.9581C101.55 14.5 100.366 14.5 98 14.5C95.6336 14.5 94.4504 14.5 93.8119 13.9581C93.374 13.5865 93.0889 13.0625 93.0125 12.4889C92.9013 11.6527 93.5331 10.6392 94.7967 8.61237Z"
        fill="#0C790C"
        fillOpacity={0.96}
      />
    </Svg>
  );
}

function Comment01Icon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="147 1204 20 20" fill="none">
      <Path
        d="M153.667 1215.25H160.333M153.667 1211.08H157"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M152.082 1219.83C150.999 1219.73 150.187 1219.4 149.643 1218.86C148.667 1217.88 148.667 1216.31 148.667 1213.17V1212.75C148.667 1209.61 148.667 1208.04 149.643 1207.06C150.619 1206.08 152.19 1206.08 155.333 1206.08H158.667C161.809 1206.08 163.381 1206.08 164.357 1207.06C165.333 1208.04 165.333 1209.61 165.333 1212.75V1213.17C165.333 1216.31 165.333 1217.88 164.357 1218.86C163.381 1219.83 161.809 1219.83 158.667 1219.83C158.199 1219.84 157.827 1219.88 157.462 1219.96C156.463 1220.19 155.539 1220.7 154.625 1221.15C153.323 1221.78 152.672 1222.1 152.263 1221.8C151.481 1221.22 152.245 1219.42 152.417 1218.58"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TaskEdit02Icon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="338 1208 20 20" fill="none">
      <Path
        d="M353.833 1218V1214.67C353.833 1212.31 353.833 1211.13 353.101 1210.4C352.369 1209.67 351.19 1209.67 348.833 1209.67H345.5C343.143 1209.67 341.964 1209.67 341.232 1210.4C340.5 1211.13 340.5 1212.31 340.5 1214.67V1221.33C340.5 1223.69 340.5 1224.87 341.232 1225.6C341.964 1226.33 343.143 1226.33 345.5 1226.33H347.167"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M350.083 1209.67H344.25C344.25 1210.85 344.25 1211.43 344.616 1211.8C344.982 1212.17 345.571 1212.17 346.75 1212.17H347.583C348.762 1212.17 349.351 1212.17 349.717 1211.8C350.083 1211.43 350.083 1210.85 350.083 1209.67Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M343.833 1220.5H347.167M343.833 1217.17H350.5"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M351.114 1226.04L349.667 1226.33L349.956 1224.89C350.015 1224.59 350.159 1224.32 350.371 1224.11L353.759 1220.72C354.056 1220.43 354.536 1220.43 354.833 1220.72L355.278 1221.17C355.574 1221.46 355.574 1221.94 355.278 1222.24L351.89 1225.63C351.678 1225.84 351.408 1225.99 351.114 1226.04Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DashboardNavIcon({ size = 24, active = true }: { size?: number; active?: boolean }) {
  const color = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(96, 96, 102, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
      <Rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
      <Rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
      <Rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

function ChattingNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const color = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(96, 96, 102, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12C2 7.029 6.029 3 11 3h2c4.971 0 9 4.029 9 9 0 4.971-4.029 9-9 9H8l-4.5 1.5L5 18C3.12 16.32 2 14.28 2 12z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 10h8M8 14h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ProfileNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const color = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(96, 96, 102, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="9" r="3" stroke={color} strokeWidth="1.5" />
      <Path d="M6.5 18c1.5-2.5 3.5-3.5 5.5-3.5s4 1 5.5 3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Screen Component ─────────────────────────────────────────────────────────

export const ProviderDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Locked Bottom Navigation Bar offset:
  // Strictly locked at its designated bottom coordinate so it never moves when scrolling.
  // On iOS: safely above the Home Indicator (Math.max(insets.bottom, 20)).
  // On Android: safely above the Android 3-button system dock / gesture pill (Math.max(insets.bottom, 56) + 16).
  const lockedBottomOffset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 56) + 16
    : Math.max(insets.bottom, 20);
  const { business, toggleIsOpen, updateProfile } = useBusinessStore();
  const { appointments } = useAppointments();
  const { ongoingAppointments } = useOngoingAppointments();
  const { staffList } = useStaffStore();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(business.name);
  const [editAddress, setEditAddress] = useState(business.address);

  const handleOpenEditModal = () => {
    setEditName(business.name);
    setEditAddress(business.address);
    setIsEditModalVisible(true);
  };

  const handleSaveBusinessDetails = () => {
    if (editName.trim()) {
      updateProfile({
        name: editName.trim(),
        address: editAddress.trim() || business.address,
      });
    }
    setIsEditModalVisible(false);
  };

  const pendingAppointmentsCount = appointments.length;
  const ongoingAppointmentsCount = ongoingAppointments.length;
  const onDutyStaffCount = staffList.filter((s) => s.statusCode !== 'closed').length;
  const totalStaffCount = staffList.length;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages' | 'profile'>('dashboard');
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [showCategoryOverlay, setShowCategoryOverlay] = useState(false);

  const {
    phase,
    currentStep,
    hasSeenFirstTime,
    startFirstTimeFlow,
    handleGetStarted,
    isSpotlightTarget,
    registerScrollView,
    handleScroll,
    setScreenInsets,
    handleContentSizeChange,
    measureTarget,
    handleConnectAccount,
    handleMaybeLater,
    handleDismissTrialNotice,
  } = useFirstTime();

  const scrollViewRef = useRef<ScrollView>(null);
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    setScreenInsets({ top: insets.top, bottom: insets.bottom });
  }, [insets.top, insets.bottom, setScreenInsets]);

  // Payouts First-Time Flow states
  const params = useLocalSearchParams<{ fromSignup?: string }>();
  const {
    payoutMethod,
    showDashboardOverlayAfterPayout,
    setShowDashboardOverlayAfterPayout,
    showDashboardOverlayAfterReport,
    setShowDashboardOverlayAfterReport,
    justSignedUp,
    setJustSignedUp,
  } = useProviderOnboarding();
  const [isPayoutTermsOpen, setIsPayoutTermsOpen] = useState(false);

  useEffect(() => {
    if (showDashboardOverlayAfterPayout) {
      const timer = setTimeout(() => {
        setShowDashboardOverlayAfterPayout(false);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [showDashboardOverlayAfterPayout, setShowDashboardOverlayAfterPayout]);

  useEffect(() => {
    if (showDashboardOverlayAfterReport) {
      const timer = setTimeout(() => {
        setShowDashboardOverlayAfterReport(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showDashboardOverlayAfterReport, setShowDashboardOverlayAfterReport]);

  const hasOverlayReturn = showDashboardOverlayAfterPayout || showDashboardOverlayAfterReport;

  // Figma Annotation: "All screens returning back to the dashboard should go through a skeleton loader beforing seeing the dashboard"
  // Note: Return from Report Review Success or Payouts Success specifically requests normal 4-dot loader instead of skeleton.
  useFocusEffect(
    useCallback(() => {
      if (hasOverlayReturn) {
        setIsDashboardLoading(false);
        return;
      }
      setIsDashboardLoading(true);
      const timer = setTimeout(() => {
        setIsDashboardLoading(false);
      }, 900);
      return () => {
        clearTimeout(timer);
        setIsDashboardLoading(true);
      };
    }, [hasOverlayReturn])
  );

  const isFromSignup = params.fromSignup === 'true' || justSignedUp;

  useEffect(() => {
    if (!isDashboardLoading && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      // Only launch the tutorial if coming directly after signup and has not seen it yet
      if (isFromSignup && (!hasSeenFirstTime || FORCE_FIRST_TIME_FLOW)) {
        setJustSignedUp(false);
        if (params.fromSignup) {
          router.setParams({ fromSignup: undefined });
        }
        startFirstTimeFlow();
      }
    }
  }, [isDashboardLoading, isFromSignup, hasSeenFirstTime, startFirstTimeFlow, setJustSignedUp, params.fromSignup, router]);

  const handleCategoriesPress = () => {
    setShowCategoryOverlay(true);
    setTimeout(() => {
      router.push('/category' as any);
      setTimeout(() => {
        setShowCategoryOverlay(false);
      }, 350);
    }, 850);
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {isDashboardLoading ? (
        <ProviderDashboardSkeleton />
      ) : (
        /* Main Scroll Content */
        <ScrollView
          ref={(node) => {
            (scrollViewRef as any).current = node;
            registerScrollView(node);
          }}
          scrollEnabled={true}
          scrollEventThrottle={16}
          onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
          onContentSizeChange={handleContentSizeChange}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 16, 56),
              paddingBottom:
                80 + 36 + lockedBottomOffset + insets.bottom + (phase === 'tour' ? 360 : 64),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
        {/* ── Business Name and Open/Closed Button (width: 358px, height: 52px) ── */}
        <View style={styles.businessHeader}>
          {/* Dashboard and Date / Address Info (Interactive - Tap to edit) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.businessInfoColumn}
            disabled={phase === 'tour'}
            onPress={handleOpenEditModal}
          >
            {/* Luminous Lux (Full dynamic name) */}
            <Text style={styles.businessName} numberOfLines={1}>
              {business.name}
            </Text>

            {/* Business Address Row */}
            <View style={styles.addressRow}>
              <Location01Icon size={16} color="rgba(96, 96, 102, 0.96)" />
              <Text style={styles.addressText} numberOfLines={1}>
                {business.address}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Closed / Open Business Switch Toggle (width: 104px, height: 40px) */}
          <TutorialTarget id="business_status_switch" borderRadius={32}>
            <BusinessStatusSwitch
              isOpen={business.isOpen}
              onToggle={toggleIsOpen}
              disabled={phase === 'tour'}
            />
          </TutorialTarget>
        </View>

        {/* ── Staff Dashboard Section (width: 358px) ── */}
        <View style={styles.sectionContainer}>
          {/* Section Heading: Appointment Dashboard */}
          <Text style={styles.sectionTitle}>Appointment Dashboard</Text>

          {/* Booking Dashboard 2x2 Grid (358px wide, 24px col gap, 40px row gap) */}
          <View style={styles.cardsGrid}>
            {/* ── Card 1: Appointments (167x120) with Notification Badge ── */}
            <DashboardCard
              targetId="appointments_card"
              cardHeight={120}
              title="Appointments"
              count={isSpotlightTarget('appointments_card') ? '0' : pendingAppointmentsCount}
              label="Pending"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/appointments_calendar.png')}
                  style={styles.calendarIconImage}
                  resizeMode="contain"
                />
              }
              badge={
                !isSpotlightTarget('appointments_card') ? (
                  <View style={styles.notificationBadge} pointerEvents="none">
                    <Text style={styles.notificationBadgeText}>
                      {business.notificationBadgeCount || pendingAppointmentsCount + ongoingAppointmentsCount}
                    </Text>
                  </View>
                ) : null
              }
              onPress={() => router.push('/appointments' as any)}
              disabled={phase === 'tour'}
            />

            {/* ── Card 2: In Progress (167x120) ── */}
            <DashboardCard
              targetId="in_progress_card"
              cardHeight={120}
              title="In Progress"
              count={isSpotlightTarget('in_progress_card') ? '0' : ongoingAppointmentsCount}
              label="Ongoing"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/in_progress_spinner.png')}
                  style={{ width: 26, height: 26, transform: [{ rotate: '67.75deg' }] }}
                  resizeMode="contain"
                />
              }
              onPress={() => router.push('/ongoing-appointments')}
              disabled={phase === 'tour'}
            />

            {/* ── Card 3: My Staffs (167x120) ── */}
            <DashboardCard
              targetId="staff_status_card"
              cardHeight={120}
              title="Staff Status"
              count={isSpotlightTarget('staff_status_card') ? '0' : onDutyStaffCount}
              label="On Duty"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/my_staffs_group.png')}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              }
              onPress={() => router.push('/staffs')}
              disabled={phase === 'tour'}
            />

            {/* ── Card 4: Categories (167x120) ── */}
            <DashboardCard
              targetId="appointment_history_card"
              cardHeight={120}
              title="Appointment History"
              label="More Options"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/categories_grid.png')}
                  style={{ width: 26, height: 26 }}
                  resizeMode="contain"
                />
              }
              onPress={handleCategoriesPress}
              disabled={phase === 'tour'}
            />
          </View>
        </View>

        {/* ── Ads Banner Frame 1000006443 (width: 358px, height: 116px, radius: 24px) ── */}
        <View style={styles.adsBanner}>
          <Text style={styles.adsText}>Ads</Text>
        </View>

        {/* ── Business Dashboard Section (width: 358px) ── */}
        <View style={styles.sectionContainer}>
          {/* Section Heading: Business Dashboard */}
          <Text style={styles.sectionTitle}>Business Dashboard</Text>

          {/* Business Dashboard 3x2 Grid (358px wide, 24px col gap, 40px row gap) */}
          <View style={styles.cardsGrid}>
            {/* ── Card 1: Manage Business Service (167x136) ── */}
            <DashboardCard
              targetId="add_service_card"
              cardHeight={136}
              title="Add Service"
              count={isSpotlightTarget('add_service_card') ? '0' : business.servicesCount}
              label="Added Services"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/manage_service_add.png')}
                  style={{ width: 35, height: 35 }}
                  resizeMode="contain"
                />
              }
              onPress={() => router.push('/services' as any)}
              disabled={phase === 'tour'}
            />

            {/* ── Card 2: Post Service Photos (167x136) ── */}
            <DashboardCard
              targetId="post_work_card"
              cardHeight={136}
              title="Post Work"
              count={isSpotlightTarget('post_work_card') ? '0' : business.photosCount}
              label="Posts"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/post_photos_camera.png')}
                  style={{ width: 31, height: 22 }}
                  resizeMode="contain"
                />
              }
              onPress={() => router.push('/post-work' as any)}
              disabled={phase === 'tour'}
            />

            {/* ── Card 3: Staff Management (167x136) ── */}
            <DashboardCard
              targetId="staff_management_card"
              cardHeight={136}
              title="Staff Management"
              count={isSpotlightTarget('staff_management_card') ? '0' : totalStaffCount}
              label="Hired Staff"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/staff_management_users.png')}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              }
              onPress={() => router.push('/staffs' as any)}
              disabled={phase === 'tour'}
            />

            {/* ── Card 4: Business Statistics (167x136) ── */}
            <DashboardCard
              targetId="business_statistics_card"
              cardHeight={136}
              title="Business Statistics"
              label="Today"
              icon={
                <View style={styles.performanceStake}>
                  <TriangleIcon size={12} />
                  <Text style={styles.performancePercentText}>{business.performanceStake}</Text>
                </View>
              }
              onPress={() => router.push('/business-statistics' as any)}
              disabled={phase === 'tour'}
            />

            {/* ── Card 5: Clients Reviews and Comments (167x136) ── */}
            <DashboardCard
              targetId="clients_review_card"
              cardHeight={136}
              title="Clients Reviews"
              count={isSpotlightTarget('clients_review_card') ? '0' : business.reviewsCount}
              label="Reviews"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/reviews_chat_bubbles.png')}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              }
              onPress={() => router.push('/clients-review' as any)}
              disabled={phase === 'tour'}
            />

            {/* ── Card 6: Business Management (167x136) ── */}
            <DashboardCard
              targetId="edit_business_profile_card"
              cardHeight={136}
              title="Edit Business Profile"
              label="Edit Information"
              icon={
                <Image
                  source={require('../../../assets/images/dashboard/business_folder.png')}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              }
              onPress={() => router.push('/edit-business-profile' as any)}
              disabled={phase === 'tour'}
            />
          </View>
        </View>
      </ScrollView>
      )}

      {/* ── Fixed Bottom Navigation Container (Locked at bottom, 100% stationary) ── */}
      <View
        pointerEvents={phase === 'tour' ? 'none' : 'box-none'}
        style={styles.bottomFixedContainer}
      >
        {/* Backdrop Fade & Solid White Shield to completely mask scrolling cards */}
        <View
          style={[
            styles.bottomBackdropShield,
            {
              height: lockedBottomOffset + 80 + 36,
            },
          ]}
          pointerEvents="none"
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={25}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.85)', '#FFFFFF']}
            locations={[0, 0.4, 1.0]}
            style={styles.backdropGradient}
          />
          <View style={styles.backdropSolidWhite} />
        </View>

        {/* ── App Navigation Bar (width: 300px, height: 80px, radius: 40px, locked) ── */}
        <View
          pointerEvents={phase === 'tour' ? 'none' : 'box-none'}
          style={[
            styles.bottomNavContainer,
            {
              bottom: lockedBottomOffset,
            },
          ]}
        >
          <View style={styles.bottomNavBar}>
            {/* Tab 1: Dashboard (Active) */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              disabled={phase === 'tour'}
              onPress={() => {
                triggerLightHaptic();
                setActiveTab('dashboard');
              }}
            >
              <View style={styles.navTabContent}>
                <DashboardNavIcon size={24} active={activeTab === 'dashboard'} />
                <Text
                  style={[
                    styles.navTabText,
                    activeTab === 'dashboard'
                      ? styles.navTabTextActive
                      : styles.navTabTextInactive,
                  ]}
                >
                  Dashboard
                </Text>
              </View>

              {/* Active Indicator Bar: Rectangle 299 (width: 65px, height: 5px, radius: 8px) */}
              {activeTab === 'dashboard' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>

            {/* Tab 2: Messages */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              disabled={phase === 'tour'}
              onPress={() => {
                triggerLightHaptic();
                router.push('/messages' as any);
              }}
            >
              <View style={styles.navTabContent}>
                <ChattingNavIcon size={24} active={activeTab === 'messages'} />
                <Text
                  style={[
                    styles.navTabText,
                    activeTab === 'messages'
                      ? styles.navTabTextActive
                      : styles.navTabTextInactive,
                  ]}
                >
                  Messages
                </Text>
              </View>

              {activeTab === 'messages' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>

            {/* Tab 3: Profile */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              disabled={phase === 'tour'}
              onPress={() => {
                triggerLightHaptic();
                router.push('/profile' as any);
              }}
            >
              <View style={styles.navTabContent}>
                <ProfileNavIcon size={24} active={activeTab === 'profile'} />
                <Text
                  style={[
                    styles.navTabText,
                    activeTab === 'profile'
                      ? styles.navTabTextActive
                      : styles.navTabTextInactive,
                  ]}
                >
                  Profile
                </Text>
              </View>

              {activeTab === 'profile' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Category 4-Dot Loader Overlay (displayed over screen, not a new page) ── */}
      <CategoryFourDotLoader visible={showCategoryOverlay} />

      {/* ── Edit Business Details Modal ── */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.editModalContainer}>
            <Text style={styles.editModalTitle}>Edit Business Details</Text>

            <View style={styles.editInputGroup}>
              <Text style={styles.editInputLabel}>Business Name</Text>
              <TextInput
                style={styles.editTextInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter business name"
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
              />
            </View>

            <View style={styles.editInputGroup}>
              <Text style={styles.editInputLabel}>Business Address</Text>
              <TextInput
                style={styles.editTextInput}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="Enter business address"
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
              />
            </View>

            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.editCancelButton}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.editCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.editSaveButton}
                onPress={handleSaveBusinessDetails}
              >
                <Text style={styles.editSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Tutorial First-Time Flow: Welcome Card (with background falling confetti) & Spotlight Overlay ── */}
      <WelcomeCard
        visible={phase === 'welcome'}
        onGetStarted={handleGetStarted}
      />
      <SpotlightOverlay />

      {/* ── First-Time Flow Closing Cards: Connect Account & Trial Notice ── */}
      <ConnectAccountModal
        visible={phase === 'connectPrompt'}
        onConnectAccount={() => {
          handleConnectAccount();
          if (payoutMethod) {
            router.push('/payout-method' as any);
          } else {
            setIsPayoutTermsOpen(true);
          }
        }}
        onMaybeLater={handleMaybeLater}
      />
      <TrialNoticeModal
        visible={phase === 'trialNotice'}
        onUnderstand={handleDismissTrialNotice}
      />

      {/* ── Payout Privacy & Terms Notice Bottom Sheet ── */}
      <PayoutTermsNotice
        visible={isPayoutTermsOpen}
        onAgree={() => {
          setIsPayoutTermsOpen(false);
          router.push('/payout-form' as any);
        }}
        onDecline={() => {
          setIsPayoutTermsOpen(false);
        }}
      />

      {/* ── 4-Dot Dimmed Loading Overlay after Returning from Payouts or Report Success ── */}
      <LoadingOverlay
        visible={showDashboardOverlayAfterPayout || showDashboardOverlayAfterReport}
        dotsCount={4}
        paddingTop={429}
        dotSize={16}
        dotGap={20}
        overlayOpacity={0.1}
      />
    </View>
  );
};

export default ProviderDashboardScreen;

const styles = StyleSheet.create({
  /* ── Screen Container ── */
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  /* ── Header: Business Name & Open/Closed Toggle ── */
  businessHeader: {
    width: 358,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 48,
  },

  businessInfoColumn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    gap: 4,
    marginRight: 12,
  },

  businessName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#000000',
    includeFontPadding: false,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  addressText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Section Container ── */
  sectionContainer: {
    width: 358,
    gap: 24,
    marginBottom: 40,
  },

  sectionTitle: {
    width: 358,
    height: 28,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },

  /* ── Cards Grid (2-column layout) ── */
  cardsGrid: {
    width: 358,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },

  cardWrapper: {
    position: 'relative',
    width: 167,
    height: 120,
  },

  cardWrapper120: {
    position: 'relative',
    width: 167,
    height: 120,
  },

  cardWrapper136: {
    position: 'relative',
    width: 167,
    height: 136,
  },

  /* ── 120px Card (Appointment Dashboard) ── */
  card120: {
    position: 'relative',
    width: 167,
    height: 120,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },

  /* ── 136px Card (Business Dashboard) ── */
  card136: {
    width: 167,
    height: 136,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },

  cardHeaderRow: {
    width: 135,
    height: 24,
    justifyContent: 'center',
  },

  cardHeaderRowMultiLine: {
    width: 135,
    height: 48,
    justifyContent: 'flex-start',
  },

  cardTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  cardTitleTextMultiLine: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  cardFooterRow: {
    width: 135,
    minHeight: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  calendarIconImage: {
    width: 24,
    height: 24,
  },
  spinnerIconImage: {
    position: 'absolute',
    width: 26,
    height: 26,
    left: 128.61,
    top: 78.4,
    transform: [{ rotate: '67.75deg' }],
    zIndex: 2,
  },

  statTagRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },

  statNumberText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  statLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  notificationBadge: {
    position: 'absolute',
    width: 26,
    height: 20,
    right: -2,
    top: -3,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  notificationBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
  },

  performanceStake: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 20,
  },

  performancePercentText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
    includeFontPadding: false,
  },

  /* ── Ads Banner Frame 1000006443 ── */
  adsBanner: {
    width: 358,
    height: 116,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  adsText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ── Bottom Backdrop Blur & Gradient Blend Overlay (Rectangle 281) ── */
  /* ── Fixed Bottom Navigation Container & Backdrop Shield ── */
  bottomFixedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    ...Platform.select({
      android: {
        elevation: 10,
      },
    }),
  },

  bottomBackdropShield: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },

  backdropGradient: {
    height: 36,
    width: '100%',
  },

  backdropSolidWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },

  /* ── App Navigation Bar (Floating Island Locked at Bottom) ── */
  bottomNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },

  bottomNavBar: {
    width: 300,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      web: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
      },
    }),
  },

  navTabItem: {
    width: 72,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  navTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  navTabText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
  },

  navTabTextActive: {
    color: 'rgba(0, 8, 20, 0.96)',
  },

  navTabTextInactive: {
    color: 'rgba(96, 96, 102, 0.96)',
  },

  activeTabIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 65,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  /* ── Edit Business Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  editModalContainer: {
    width: '100%',
    maxWidth: 358,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  editModalTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
  },
  editInputGroup: {
    gap: 6,
  },
  editInputLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  editTextInput: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 15,
    color: '#000814',
    backgroundColor: '#F8F9FA',
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  editCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  editCancelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 15,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  editSaveButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSaveText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
