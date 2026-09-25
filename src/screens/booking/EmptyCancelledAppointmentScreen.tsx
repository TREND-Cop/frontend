import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import { typography } from '../../constants/theme';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

// ── Figma Stacked Calendar with X Illustration ──
const EmptyCancelledIllustration = ({ size = 160 }: { size?: number }) => (
  <View style={styles.illustrationContainer}>
    {/* Soft Glow/Circle Backdrop */}
    <View style={styles.circleBackdrop} />

    {/* Stacked Underneath Card 1 (Rotated) */}
    <View style={[styles.stackedCard, styles.stackedCardLeft]} />

    {/* Stacked Underneath Card 2 (Rotated) */}
    <View style={[styles.stackedCard, styles.stackedCardRight]} />

    {/* Main Foreground Calendar Card */}
    <View style={styles.mainCard}>
      <Svg width={54} height={54} viewBox="0 0 48 48" fill="none">
        {/* Calendar Outer */}
        <Rect
          x="6"
          y="10"
          width="36"
          height="32"
          rx="8"
          fill="#FFFFFF"
          stroke="#8A92A6"
          strokeWidth="2.5"
        />
        {/* Top Header Line */}
        <Path d="M6 19H42" stroke="#8A92A6" strokeWidth="2.5" />
        {/* Binder Pins */}
        <Path d="M14 6V12" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M34 6V12" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round" />
        {/* X Symbol in the center */}
        <Path
          d="M18 26L30 36M30 26L18 36"
          stroke="#8A92A6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  </View>
);

// ── Exact Figma Vector Icons ──
const ArrowLeftIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 12H19.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 18C10 18 4.5 13.58 4.5 12C4.5 10.42 10 6 10 6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface EmptyCancelledAppointmentProps {
  title?: string;
  onGoBack?: () => void;
  onCheckAppointment?: () => void;
}

export const EmptyCancelledAppointmentScreen: React.FC<EmptyCancelledAppointmentProps> = ({
  title = 'Cancelled Appointments',
  onGoBack,
  onCheckAppointment,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.replace('/home/bookings' as any);
    }
  };

  const handleActionPress = () => {
    if (onCheckAppointment) {
      onCheckAppointment();
    } else {
      router.replace('/home/bookings' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        {/* ── Centered Illustration ── */}
        <EmptyCancelledIllustration size={160} />

        {/* ── Text Content ── */}
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>No Cancelled Appointment yet</Text>
          <Text style={styles.subtitleText}>
            When a service provider cancels your appointment, you will find it here.
          </Text>
        </View>

        {/* ── Primary Action Button ── */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.85}
          onPress={handleActionPress}
        >
          <Text style={styles.actionButtonText}>Check Appointment</Text>
        </TouchableOpacity>
      </View>
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // ── Header Row ──
  headerRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
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
  },
  headerPlaceholder: {
    width: 48,
    height: 48,
    opacity: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },

  // ── Illustration Styles ──
  illustrationContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBackdrop: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 246, 248, 0.95)',
  },
  stackedCard: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: 'rgba(235, 238, 242, 0.8)',
  },
  stackedCardLeft: {
    transform: [{ rotate: '-12deg' }],
    left: 28,
    top: 36,
  },
  stackedCardRight: {
    transform: [{ rotate: '10deg' }],
    right: 28,
    top: 38,
  },
  mainCard: {
    width: 96,
    height: 96,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Text Container ──
  textContainer: {
    alignItems: 'center',
    gap: 12,
    maxWidth: 320,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // ── Primary Action Button ──
  actionButton: {
    width: 220,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  actionButtonText: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
});

export default EmptyCancelledAppointmentScreen;
