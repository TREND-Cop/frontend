import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

import { CategoryFourDotLoader } from '../../components/CategoryFourDotLoader';

// ── Exact Figma 1:1 Vector Icons ───────────────────────────────────────────
function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
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

function ArrowRight01Icon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Path
        d="M17 14C17 14 23 18.4189 23 20C23 21.5812 17 26 17 26"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Cancelled appointments icon (Figma: cancel-01 inside 40x40 circle)
function Cancel01Icon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Path
        d="M26.0059 14L14.0067 25.9992M26.0051 26L14.0059 14.0009"
        stroke="#CC2929"
        strokeOpacity={0.9}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Completed appointment icon (Figma: appointment-02 inside 40x40 circle)
function Appointment02Icon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Path
        d="M24.0059 10V14M16.0059 10V14"
        stroke="#0C790C"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.0059 12H19.0059C15.2346 12 13.349 12 12.1774 13.172C11.0059 14.343 11.0059 16.229 11.0059 20V22C11.0059 25.771 11.0059 27.657 12.1774 28.828C13.349 30 15.2346 30 19.0059 30H21.0059C24.7771 30 26.6628 30 27.8343 28.828C29.0059 27.657 29.0059 25.771 29.0059 22V20C29.0059 16.229 29.0059 14.343 27.8343 13.172C26.6628 12 24.7771 12 21.0059 12Z"
        stroke="#0C790C"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.0059 18H29.0059"
        stroke="#0C790C"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.0059 24.5C17.0059 24.5 18.5059 25 19.0059 26.5C19.0059 26.5 21.1824 22.5 24.0059 21.5"
        stroke="#0C790C"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Upcoming appointment icon (Figma: calculator-01 inside 40x40 circle)
function Calculator01Icon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Path
        d="M11.0059 18H29.0059"
        stroke="#1A82FF"
        strokeOpacity={0.9}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M23.0059 14H25.0059"
        stroke="#1A82FF"
        strokeOpacity={0.9}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M29.0059 21V19C29.0059 14.757 29.0059 12.636 27.6879 11.318C26.3699 10 24.2485 10 20.0059 10C15.7632 10 13.6419 10 12.3239 11.318C11.0059 12.636 11.0059 14.757 11.0059 19V21C11.0059 25.243 11.0059 27.364 12.3239 28.682C13.6419 30 15.7632 30 20.0059 30C24.2485 30 26.3699 30 27.6879 28.682C29.0059 27.364 29.0059 25.243 29.0059 21Z"
        stroke="#1A82FF"
        strokeOpacity={0.9}
        strokeWidth={1.5}
      />
      <Path
        d="M15.0059 22H15.5322M19.7427 22H20.2691M24.4796 22H25.0059"
        stroke="#1A82FF"
        strokeOpacity={0.9}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.0059 26H15.5322M19.7427 26H20.2691M24.4796 26H25.0059"
        stroke="#1A82FF"
        strokeOpacity={0.9}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Awaiting for client icon (Figma: hourglass inside 40x40 circle)
function HourglassIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Path
        d="M12.0059 11H28.0059"
        stroke="#F89B18"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.5059 11V13.03C13.5059 14.272 14.0827 15.444 15.067 16.201L20.0059 20L24.9447 16.201C25.9291 15.444 26.5059 14.272 26.5059 13.03V11"
        stroke="#F89B18"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.5059 29V26.97C13.5059 25.728 14.0827 24.556 15.067 23.799L20.0059 20L24.9447 23.799C25.9291 24.556 26.5059 25.728 26.5059 26.97V29"
        stroke="#F89B18"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.0059 29H28.0059"
        stroke="#F89B18"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ProviderCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleCategoryPress = (targetRoute: string) => {
    setIsActionLoading(true);
    setTimeout(() => {
      router.push(targetRoute as any);
      setTimeout(() => {
        setIsActionLoading(false);
      }, 350);
    }, 700);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed Page Header (64px, padding: 8px 16px, 1:1 Figma) ─────────── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          {/* Back button (48x48px circle) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Centered Title */}
          <Text style={styles.headerTitleText}>Category</Text>

          {/* Header share button / spacer (48x48px, opacity: 0 in Figma) */}
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* ── Scrollable Body ───────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Booking Components (width: 358px, gap: 16px) ─────────────────── */}
        <View style={styles.bookingComponents}>
          {/* ── Item 1: Cancelled Bookings ── */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.itemRow}
            onPress={() => handleCategoryPress('/cancelled-appointments')}
          >
            <View style={styles.itemLeftGroup}>
              {/* Icon Circle (40x40px, radius 20/24px, red bg: #F8EFEF 0.96) */}
              <View style={styles.cancelIconCircle}>
                <Cancel01Icon />
              </View>

              {/* Text Info */}
              <View style={styles.textGroup}>
                <Text style={styles.itemTitle}>Cancelled appointments</Text>
                <Text style={styles.itemSubtitle}>3 Cancelled appointments</Text>
              </View>
            </View>

            {/* Right Arrow */}
            <View style={styles.nextButton}>
              <ArrowRight01Icon />
            </View>
          </TouchableOpacity>

          {/* Line 168 (1px solid #EBEBF5) */}
          <View style={styles.dividerLine} />

          {/* ── Item 2: Completed Appointment ── */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.itemRow}
            onPress={() => handleCategoryPress('/completed-appointments')}
          >
            <View style={styles.itemLeftGroup}>
              {/* Icon Circle (40x40px, radius 20/24px, green bg: #EEF8EE 0.8) */}
              <View style={styles.completedIconCircle}>
                <Appointment02Icon />
              </View>

              {/* Text Info */}
              <View style={styles.textGroup}>
                <Text style={styles.itemTitle}>Completed appointment</Text>
                <Text style={styles.itemSubtitle}>1 Completed appointment</Text>
              </View>
            </View>

            {/* Right Group with Badge Indicator */}
            <View style={styles.nextButtonWithBadge}>
              <View style={styles.badgeIndicator}>
                <Text style={styles.badgeText}>1</Text>
              </View>
              <ArrowRight01Icon />
            </View>
          </TouchableOpacity>

          {/* Line 165 (1px solid #EBEBF5) */}
          <View style={styles.dividerLine} />

          {/* ── Item 3: Upcoming Appointment ── */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.itemRow}
            onPress={() => handleCategoryPress('/appointments')}
          >
            <View style={styles.itemLeftGroup}>
              {/* Icon Circle (40x40px, radius 20/24px, blue bg: #EBEBF5 0.96) */}
              <View style={styles.upcomingIconCircle}>
                <Calculator01Icon />
              </View>

              {/* Text Info */}
              <View style={styles.textGroup}>
                <Text style={styles.itemTitle}>Upcoming appointment</Text>
                <Text style={styles.itemSubtitle}>2 Upcoming appointments</Text>
              </View>
            </View>

            {/* Right Arrow */}
            <View style={styles.nextButton}>
              <ArrowRight01Icon />
            </View>
          </TouchableOpacity>

          {/* Line 170 (1px solid #EBEBF5) */}
          <View style={styles.dividerLine} />

          {/* ── Item 4: Awaiting For Client ── */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.itemRow}
            onPress={() => handleCategoryPress('/ongoing-appointments')}
          >
            <View style={styles.itemLeftGroup}>
              {/* Icon Circle (40x40px, radius 20/24px, orange bg: #F6F0E6 0.96) */}
              <View style={styles.awaitingIconCircle}>
                <HourglassIcon />
              </View>

              {/* Text Info */}
              <View style={styles.textGroup}>
                <Text style={styles.itemTitle}>Awaiting for client</Text>
                <Text style={styles.itemSubtitle}>2 waiting</Text>
              </View>
            </View>

            {/* Right Arrow */}
            <View style={styles.nextButton}>
              <ArrowRight01Icon />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── 4-Dot Full Screen Loader Overlay (Figma: #3F3F3F / dark background with 4 dots) ── */}
      <CategoryFourDotLoader visible={isActionLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Page Header (64px, padding: 8px 16px) ─────────────────────────────────
  pageHeader: {
    width: '100%',
    height: 64,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
  },
  headerContent: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
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
  },
  headerSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  // ── Scrollable Body ───────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  // ── Booking Components (width: 358px, gap: 16px) ──────────────────────────
  bookingComponents: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 16,
  },

  itemRow: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Icon circles (40x40px, radius 20/24px)
  cancelIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8EFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF8EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBEBF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  awaitingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F0E6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text Group
  textGroup: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    height: 52,
  },
  itemTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
  },
  itemSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Next Page Button / Arrow
  nextButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  nextButtonWithBadge: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
  },

  // Filter Number Indicator Badge (19x19px or 20x20px, radius 9.5px / 10px)
  badgeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },

  // Divider Line
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
});
