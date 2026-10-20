import React from 'react';
import { View, Text, StyleSheet, Image, Platform, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Store02Icon } from './StaffIcons';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

export interface AdminRowProps {
  fullName?: string;
  photoUri?: string | null;
  skeleton?: boolean;
  pulseOpacity?: Animated.AnimatedInterpolation<number> | Animated.Value;
}

function NeutralAvatarIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" fill="#98A2B3" />
      <Path
        d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"
        fill="#98A2B3"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Admin Section (Frame 1000006420 / 1000006419)
 *
 * Displays the business owner's profile info:
 * - Title "Admin"
 * - 64x64 rounded-square photo (radius 16px)
 * - Owner Name (from onboarding state, unhardcoded)
 * - "Business Owner" label with store-02 icon
 *
 * Supports `skeleton={true}` for zero-pixel-shift shimmer state.
 */
export const AdminRow: React.FC<AdminRowProps> = ({
  fullName,
  photoUri,
  skeleton = false,
  pulseOpacity,
}) => {
  if (skeleton) {
    const AnimatedView = pulseOpacity ? Animated.View : View;
    const animStyle = pulseOpacity ? { opacity: pulseOpacity } : undefined;

    return (
      <View style={styles.container} accessible accessibilityLabel="Loading admin profile">
        <Text style={styles.sectionTitle}>Admin</Text>
        <View style={styles.ownerRow}>
          {/* Avatar skeleton */}
          <AnimatedView style={[styles.avatarSkeleton, animStyle]} />
          {/* Text lines skeleton */}
          <View style={styles.detailsColumn}>
            <AnimatedView style={[styles.skeletonLineName, animStyle]} />
            <AnimatedView style={[styles.skeletonLineSubtitle, animStyle]} />
          </View>
        </View>
      </View>
    );
  }

  const displayName = fullName && fullName.trim().length > 0 ? fullName.trim() : '';

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Admin, ${displayName || 'Business Owner'}, Business Owner`}
    >
      <Text style={styles.sectionTitle}>Admin</Text>
      <View style={styles.ownerRow}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.avatarImage}
              resizeMode="cover"
              accessibilityLabel={`${displayName} profile photo`}
            />
          ) : (
            <View style={styles.neutralAvatarWrapper}>
              <NeutralAvatarIcon size={36} />
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsColumn}>
          <Text style={styles.ownerName} numberOfLines={1} ellipsizeMode="tail">
            {displayName}
          </Text>
          <View style={styles.badgeRow}>
            <Store02Icon size={20} color="rgba(192, 192, 204, 0.96)" />
            <Text style={styles.ownerRoleLabel}>Business Owner</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AdminRow;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 64,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  neutralAvatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F2F4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  ownerName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerRoleLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  avatarSkeleton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E4E7EC',
  },
  skeletonLineName: {
    width: '55%',
    maxWidth: 160,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E4E7EC',
  },
  skeletonLineSubtitle: {
    width: '40%',
    maxWidth: 120,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#E4E7EC',
  },
});
