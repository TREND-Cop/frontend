import React, { useEffect, useState } from 'react';
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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { DashboardCard } from '../../components/DashboardCard';
import { useStaffDashboardData } from '../../hooks/useStaffDashboardData';
import { useStaffDashboardSkeleton, markStaffSubScreenNavigation } from '../../hooks/useStaffDashboardSkeleton';
import { StaffHomeSkeleton } from '../../components/staff/StaffHomeSkeleton';
import { formatWorkDays, formatSecondsToBreakString } from '../../utils/staffDashboardUtils';
import { triggerLightHaptic } from '../../utils/haptics';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { WelcomeCard } from '../../components/tutorial/WelcomeCard';
import { SpotlightOverlay } from '../../components/tutorial/SpotlightOverlay';
import { StaffTutorialVideoModal } from '../../components/staff/tutorial/StaffTutorialVideoModal';
import { StaffTutorialTarget } from '../../components/staff/tutorial/StaffTutorialTarget';
import { StaffTutorialProvider, useStaffTutorial } from '../../context/StaffTutorialContext';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function LocationPinIcon({ size = 16, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
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

function SmallClockIcon({ size = 14, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="5.8" stroke={color} strokeWidth="1" />
      <Path d="M7 3.5V7H9.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}

function SmallCalendarIcon({ size = 14, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Rect x="1.75" y="2.5" width="10.5" height="9.5" rx="1.5" stroke={color} strokeWidth="1" />
      <Path d="M1.75 5.5H12.25M4.5 1.5V3M9.5 1.5V3" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <Circle cx="4.5" cy="8" r="0.6" fill={color} />
      <Circle cx="7" cy="8" r="0.6" fill={color} />
      <Circle cx="9.5" cy="8" r="0.6" fill={color} />
    </Svg>
  );
}

function OrangeClockIcon({ size = 20, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5" />
      <Path d="M10 5.5V10H13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function TriangleUpIcon() {
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
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
      <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Main Staff Home Screen Content ───────────────────────────────────────────

function StaffHomeScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages' | 'profile'>('dashboard');

  const {
    phase,
    currentStep,
    activeTargetRect,
    isStepTransitioning,
    handleGetStarted,
    handleNextStep,
    handlePrevStep,
    openVideo,
    closeVideo,
    handleCloseCompletion,
    registerScrollView,
    handleScroll,
    setScreenInsets,
    handleContentSizeChange,
    startStaffWelcome,
  } = useStaffTutorial();

  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  // Trigger first-login welcome card on arrival
  useEffect(() => {
    // TODO (Backend): first-login flag so welcome only shows on staff member's first-ever login.
    // In-memory: shows once per login session until tour is completed.
    startStaffWelcome();
  }, [startStaffWelcome]);

  useEffect(() => {
    setScreenInsets({ top: insets.top, bottom: insets.bottom });
  }, [insets.top, insets.bottom, setScreenInsets]);

  // Skeleton on return transition hook
  const { isLoading } = useStaffDashboardSkeleton(900);

  // Staff home data hook (returns stubs/undefined when dev sample is off)
  const data = useStaffDashboardData(isScreenFocused);

  // Stationary bottom bar offset
  const lockedBottomOffset =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 56) + 16
      : Math.max(insets.bottom, 20);

  if (isLoading) {
    return <StaffHomeSkeleton />;
  }

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      <ScrollView
        ref={registerScrollView}
        onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 56),
            paddingBottom: lockedBottomOffset + 80 + 36,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Header (Business Name, Location, Staff Avatar) ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.businessNameText} numberOfLines={1}>
              {data.businessName}
            </Text>

            {data.address ? (
              <View style={styles.addressRow}>
                <LocationPinIcon size={16} />
                <Text style={styles.addressText} numberOfLines={1}>
                  {data.address}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 40x40 Avatar (Figma: Ellipse 1) */}
          <View style={styles.avatarCircle}>
            {data.avatarUrl ? (
              <Image
                source={{ uri: data.avatarUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../../assets/images/profile/cont1.jpg')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* ── 2. Work Dashboard Section (2x2 Grid, 167x120px Cards) ── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Work Dashboard</Text>

          <View style={styles.cardsGrid}>
            {/* Card 1: Appointments (Pending) — Step 1 Target */}
            <StaffTutorialTarget id="staff-appointments-card" borderRadius={24}>
              <DashboardCard
                variant="grey"
                cardHeight={120}
                title="Appointments"
                count={data.pendingAppointmentsCount ?? 0}
                label="Pending"
                icon={
                  <Image
                    source={require('../../../assets/images/dashboard/appointments_calendar.png')}
                    style={styles.calendarIconImage}
                    resizeMode="contain"
                  />
                }
                badge={
                  (data.pendingAppointmentsCount ?? 0) > 0 ? (
                    <View style={styles.notificationBadge} pointerEvents="none">
                      <Text style={styles.notificationBadgeText}>
                        {data.pendingAppointmentsCount}
                      </Text>
                    </View>
                  ) : null
                }
                onPress={() => {
                  triggerLightHaptic();
                  markStaffSubScreenNavigation();
                  router.push(STAFF_ROUTES.APPOINTMENTS as any);
                }}
              />
            </StaffTutorialTarget>

            {/* Card 2: In Progress (Ongoing) — Step 2 Target */}
            <StaffTutorialTarget id="staff-in-progress-card" borderRadius={24}>
              <DashboardCard
                variant="grey"
                cardHeight={120}
                title="In Progress"
                count={data.ongoingAppointmentsCount ?? 0}
                label="Ongoing"
                icon={
                  <Image
                    source={require('../../../assets/images/dashboard/in_progress_spinner.png')}
                    style={styles.inProgressIconImage}
                    resizeMode="contain"
                  />
                }
                onPress={() => {
                  triggerLightHaptic();
                  markStaffSubScreenNavigation();
                  router.push(STAFF_ROUTES.IN_PROGRESS as any);
                }}
              />
            </StaffTutorialTarget>

            {/* Card 3: Cancelled Appointments (Cancelled) — Step 3 Target */}
            <StaffTutorialTarget id="staff-cancelled-card" borderRadius={24}>
              <DashboardCard
                variant="grey"
                cardHeight={120}
                title="Cancelled Appointments"
                count={data.cancelledAppointmentsCount ?? 0}
                label="Cancelled"
                icon={
                  <Image
                    source={require('../../../assets/images/dashboard/my_staffs_group.png')}
                    style={styles.cancelledIconImage}
                    resizeMode="contain"
                  />
                }
                onPress={() => {
                  triggerLightHaptic();
                  markStaffSubScreenNavigation();
                  router.push(STAFF_ROUTES.CANCELLED as any);
                }}
              />
            </StaffTutorialTarget>

            {/* Card 4: Completed Appointments (Completed) — Step 4 Target */}
            <StaffTutorialTarget id="staff-completed-card" borderRadius={24}>
              <DashboardCard
                variant="grey"
                cardHeight={120}
                title="Completed Appointments"
                count={data.completedAppointmentsCount ?? 0}
                label="Completed"
                icon={
                  <Image
                    source={require('../../../assets/images/dashboard/categories_grid.png')}
                    style={styles.completedIconImage}
                    resizeMode="contain"
                  />
                }
                onPress={() => {
                  triggerLightHaptic();
                  markStaffSubScreenNavigation();
                  router.push(STAFF_ROUTES.COMPLETED as any);
                }}
              />
            </StaffTutorialTarget>
          </View>
        </View>

        {/* ── 3. Personal Data Section (358x196 Card with Overlapping Chip) ── */}
        <View style={[styles.sectionContainer, { marginTop: 24 }]}>
          <View style={styles.personalDataHeaderCol}>
            <Text style={styles.sectionTitle}>Personal Data</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerLightHaptic();
                // TODO: staff Profile not designed
              }}
            >
              <Text style={styles.seeMoreCaptionText}>See more on Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Data Card Frame with Overlapping Floating Timer Chip */}
          <View style={styles.personalDataCardWrapper}>
            {/* Step 5 Target: Personal Data Card */}
            <StaffTutorialTarget id="staff-personal-data-card" borderRadius={16}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.personalDataCard}
                onPress={() => {
                  triggerLightHaptic();
                  // TODO: staff Personal Data not designed
                }}
              >
                {/* Row 1: Closing Time & Break Time */}
                <View style={styles.personalDataRow}>
                  {/* Closing Time */}
                  <View style={styles.dataCell}>
                    <View style={styles.dataLabelRow}>
                      <SmallClockIcon />
                      <Text style={styles.dataLabelText}>Closing Time</Text>
                    </View>
                    <Text style={styles.dataValueText}>
                      {data.closingTime || '—'}
                    </Text>
                  </View>

                  {/* Break Time (Fallback Step 6 Target if floating chip is hidden) */}
                  <StaffTutorialTarget id="staff-break-time-cell" borderRadius={8} style={styles.dataCell}>
                    <View style={styles.dataLabelRow}>
                      <SmallClockIcon />
                      <Text style={styles.dataLabelText}>Break Time</Text>
                    </View>
                    <Text style={styles.dataValueText}>
                      {data.breakTime || '—'}
                    </Text>
                  </StaffTutorialTarget>
                </View>

                {/* Row 2: Resumption Time & Work Days */}
                <View style={[styles.personalDataRow, { marginTop: 20 }]}>
                  {/* Resumption Time */}
                  <View style={styles.dataCell}>
                    <View style={styles.dataLabelRow}>
                      <SmallClockIcon />
                      <Text style={styles.dataLabelText}>Resumption Time</Text>
                    </View>
                    <Text style={styles.dataValueText}>
                      {data.resumptionTime || '—'}
                    </Text>
                  </View>

                  {/* Work Days */}
                  <View style={styles.dataCell}>
                    <View style={styles.dataLabelRow}>
                      <SmallCalendarIcon />
                      <Text style={styles.dataLabelText}>Work Days</Text>
                    </View>
                    <Text style={styles.dataValueText} numberOfLines={2}>
                      {formatWorkDays(data.workDays)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </StaffTutorialTarget>

            {/* Floating White Chip (Staff Timer) — Step 6 Target when break is scheduled */}
            {data.breakSecondsRemaining !== null && data.breakSecondsRemaining !== undefined && data.breakSecondsRemaining > 0 ? (
              <StaffTutorialTarget id="staff-break-timer-chip" borderRadius={16} style={styles.floatingTimerChip}>
                <View style={styles.timerClockCircle}>
                  <OrangeClockIcon size={20} />
                </View>
                <View style={styles.timerTextCol}>
                  <Text style={styles.timerCountText} numberOfLines={1}>
                    {formatSecondsToBreakString(data.breakSecondsRemaining)}
                  </Text>
                  <Text style={styles.timerSubtitleText} numberOfLines={1}>
                    Until Break Time
                  </Text>
                </View>
              </StaffTutorialTarget>
            ) : null}
          </View>
        </View>

        {/* ── 4. Personal Dashboard Section (3 Cards: 167x136) ── */}
        <View style={[styles.sectionContainer, { marginTop: 24 }]}>
          {/* Note: Figma layer typo 'Personal Dashborad' corrected to 'Personal Dashboard' */}
          <Text style={styles.sectionTitle}>Personal Dashboard</Text>

          <View style={styles.cardsGrid}>
            {/* Card 1: Post Service Photos — Step 7 Target */}
            <StaffTutorialTarget id="staff-post-photos-card" borderRadius={24}>
              <DashboardCard
                variant="grey"
                cardHeight={136}
                title="Post Service Photos"
                count={data.photosCount ?? 0}
                label="Photos"
                icon={
                  <Image
                    source={require('../../../assets/images/dashboard/post_photos_camera.png')}
                    style={styles.cameraIconImage}
                    resizeMode="contain"
                  />
                }
                onPress={() => {
                  triggerLightHaptic();
                  // TODO: staff Post Service Photos not designed
                }}
              />
            </StaffTutorialTarget>

            {/* Card 2: Personal Statistics — Step 8 Target */}
            <StaffTutorialTarget id="staff-personal-stats-card" borderRadius={24}>
              <DashboardCard
                variant="grey"
                cardHeight={136}
                title="Personal Statistics"
                customMetric={
                  data.performanceChangePercent !== undefined ? (
                    <View style={styles.statsMetricRow}>
                      <Text style={styles.statsTimeframeText}>
                        {data.performanceTimeframe || 'Today'}
                      </Text>
                      <View style={styles.statsPercentPill}>
                        <TriangleUpIcon />
                        <Text style={styles.statsPercentText}>
                          {data.performanceChangePercent}%
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.statsMissingText}>—</Text>
                  )
                }
                icon={<View style={{ width: 24, height: 24 }} />}
                onPress={() => {
                  triggerLightHaptic();
                  // TODO: staff Personal Statistics not designed
                }}
              />
            </StaffTutorialTarget>

            {/* Card 3: Clients Reviews and Comments — Step 9 Target */}
            <StaffTutorialTarget id="staff-clients-reviews-card" borderRadius={24}>
              <DashboardCard
                variant="grey"
                cardHeight={136}
                title="Clients Reviews and Comments"
                count={data.reviewsCount ?? 0}
                label="Reviews"
                icon={
                  <Image
                    source={require('../../../assets/images/dashboard/reviews_chat_bubbles.png')}
                    style={styles.reviewsIconImage}
                    resizeMode="contain"
                  />
                }
                onPress={() => {
                  triggerLightHaptic();
                  // TODO: staff Clients Reviews and Comments not designed
                }}
              />
            </StaffTutorialTarget>
          </View>
        </View>
      </ScrollView>

      {/* ── Stationary Floating Bottom Tab Bar ── */}
      <View style={styles.bottomFixedContainer} pointerEvents="box-none">
        {/* Backdrop Fade & Solid White Shield to mask scrolling cards */}
        <View
          style={[
            styles.bottomBackdropShield,
            { height: lockedBottomOffset + 80 + 36 },
          ]}
          pointerEvents="none"
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.85)', '#FFFFFF']}
            locations={[0, 0.4, 1.0]}
            style={styles.backdropGradient}
          />
          <View style={styles.backdropSolidWhite} />
        </View>

        {/* Tab Bar Frame (width: 300px, height: 80px, radius: 40px) */}
        <View style={[styles.bottomNavContainer, { bottom: lockedBottomOffset }]} pointerEvents="box-none">
          <View style={styles.bottomNavBar}>
            {/* Tab 1: Dashboard (Active) */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
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

            {/* Tab 2: Messages (Not Designed for Staff) */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
                // TODO: staff Messages / Profile not designed
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

            {/* Tab 3: Profile (Not Designed for Staff) */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
                // TODO: staff Messages / Profile not designed
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

      {/* ── Welcome Card Overlay & Confetti (Reuses owner WelcomeCard + ConfettiBurst + PartyPoppers) ── */}
      <WelcomeCard
        visible={phase === 'welcome'}
        onGetStarted={handleGetStarted}
        title="Welcome to Trend for Staff"
        subtitle="Let's get you set up on how it works"
        buttonText="Get started"
      />

      {/* ── Completion Card Overlay & Confetti (Reuses WelcomeCard with transparent backdrop & close X) ── */}
      <WelcomeCard
        visible={phase === 'completion'}
        onClose={handleCloseCompletion}
        title="Onboarding Tutorial"
        subtitle="Onboarding tutorial successfully completed"
        showCloseButton={true}
        hideActionButton={true}
        cardHeight={345}
        transparentBackdrop={true}
      />

      {/* ── 9-Step Spotlight Tour & Tooltip Bubble (Reuses owner SpotlightOverlay with staff variant props) ── */}
      <SpotlightOverlay
        variant="staff"
        staffPhase={phase}
        staffStep={currentStep}
        staffTargetRect={activeTargetRect}
        staffIsStepTransitioning={isStepTransitioning}
        totalSteps={9}
        onPrevStep={handlePrevStep}
        onOpenVideo={openVideo}
        onNextStep={handleNextStep}
      />

      {/* ── 'How it works' Video Screen Modal ── */}
      <StaffTutorialVideoModal
        visible={phase === 'video'}
        step={currentStep}
        onBack={closeVideo}
        onNext={handleNextStep}
        totalSteps={9}
      />
    </View>
  );
}

export function StaffHomeScreen() {
  return (
    <StaffTutorialProvider>
      <StaffHomeScreenContent />
    </StaffTutorialProvider>
  );
}

export default StaffHomeScreen;

// ── 1:1 Figma Converted Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // ── Header (width: 358px, height: 56px) ──
  headerRow: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 16,
  },
  businessNameText: {
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
    marginTop: 4,
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
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    overflow: 'hidden',
    backgroundColor: '#F5F5F7',
  },
  avatarImage: {
    width: 40,
    height: 40,
  },

  // ── Section Container & Titles ──
  sectionContainer: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 16,
    includeFontPadding: false,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },

  // ── Work Dashboard Card Icons & Badge ──
  calendarIconImage: {
    width: 24,
    height: 24,
  },
  inProgressIconImage: {
    width: 26,
    height: 26,
    transform: [{ rotate: '67.75deg' }],
  },
  cancelledIconImage: {
    width: 32,
    height: 32,
  },
  completedIconImage: {
    width: 26,
    height: 26,
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  notificationBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ── Personal Data Section (358x196 Card & Floating Chip) ──
  personalDataHeaderCol: {
    marginBottom: 16,
    gap: 4,
  },
  seeMoreCaptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  personalDataCardWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 358,
  },
  personalDataCard: {
    width: '100%',
    height: 196,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'center',
  },
  personalDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dataCell: {
    width: 140,
  },
  dataLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dataLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  dataValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },

  // ── Floating White Chip (Staff Timer) ──
  floatingTimerChip: {
    position: 'absolute',
    top: -18,
    right: 0,
    width: 175,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: 'rgba(133, 139, 148, 0.15)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 10,
  },
  timerClockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  timerCountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  timerSubtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Personal Dashboard Icons & Statistics ──
  cameraIconImage: {
    width: 31,
    height: 22,
  },
  reviewsIconImage: {
    width: 32,
    height: 32,
  },
  statsMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsTimeframeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  statsPercentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsPercentText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
    includeFontPadding: false,
  },
  statsMissingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Stationary Bottom Tab Bar ──
  bottomFixedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  bottomBackdropShield: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  backdropGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
  },
  backdropSolidWhite: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  bottomNavContainer: {
    position: 'absolute',
    width: 300,
    height: 80,
    alignSelf: 'center',
    zIndex: 100,
  },
  bottomNavBar: {
    width: 300,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
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
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  navTabTextActive: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
  },
  navTabTextInactive: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 65,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
});
