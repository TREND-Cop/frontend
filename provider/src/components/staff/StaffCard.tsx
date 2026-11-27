import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { StaffMember } from '../../context/StaffContext';
import { useSingleFlight } from '../../utils/safeNavigation';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

export interface StaffCardProps {
  staff?: StaffMember;
  onPress?: () => void;
  skeleton?: boolean;
  pulseOpacity?: Animated.AnimatedInterpolation<number> | Animated.Value;
}

function StaffAvatarSilhouette({ size = 32 }: { size?: number }) {
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
 * 1:1 Figma Staff Card (Frame M3)
 *
 * Renders an individual staff member card in the list:
 * - 64x64 rounded-square avatar
 * - Staff Full Name (16px Medium, #000000, truncates with ellipsis)
 * - Staff Role(s) (14px Regular, joined with " & " on one line)
 * - Staff Experience ("{n} years Experience", 14px Regular)
 *
 * Supports `skeleton={true}` for layout-identical shimmer placeholder.
 */
export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  onPress,
  skeleton = false,
  pulseOpacity,
}) => {
  const safePress = useSingleFlight(onPress);
  if (skeleton) {
    const AnimatedView = pulseOpacity ? Animated.View : View;
    const animStyle = pulseOpacity ? { opacity: pulseOpacity } : undefined;

    return (
      <View
        style={styles.cardContainer}
        accessible
        accessibilityLabel="Loading staff member"
      >
        {/* Avatar skeleton */}
        <AnimatedView style={[styles.avatarSkeleton, animStyle]} />

        {/* Text lines skeleton */}
        <View style={styles.detailsColumn}>
          <AnimatedView style={[styles.skeletonLineName, animStyle]} />
          <AnimatedView style={[styles.skeletonLineRole, animStyle]} />
          <AnimatedView style={[styles.skeletonLineExperience, animStyle]} />
        </View>
      </View>
    );
  }

  if (!staff) return null;

  // Format roles: multiple roles joined by " & " per design spec ("Nail Artist & Barber")
  const rolesList = staff.roles && staff.roles.length > 0
    ? staff.roles
    : (staff.role ? [staff.role] : []);
  const formattedRole = rolesList.join(' & ');

  // Format experience years: singular vs plural
  const years = staff.experienceYears ?? staff.yearsExperience ?? 0;
  const experienceText = `${years} ${years === 1 ? 'year' : 'years'} Experience`;

  const photoUri = staff.photoUri ?? staff.avatarUri;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={safePress}
      style={styles.cardContainer}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${staff.name}, ${formattedRole}, ${experienceText}`}
      accessibilityHint="Double tap to open staff detail"
    >
      {/* 64x64 Avatar */}
      <View style={styles.avatarWrapper}>
        {photoUri ? (
          <Image
            source={typeof photoUri === 'string' ? { uri: photoUri } : photoUri}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.fallbackAvatar}>
            <StaffAvatarSilhouette size={32} />
          </View>
        )}
      </View>

      {/* Staff Details Column */}
      <View style={styles.detailsColumn}>
        <Text style={styles.staffName} numberOfLines={1} ellipsizeMode="tail">
          {staff.name}
        </Text>
        <Text style={styles.staffRole} numberOfLines={1} ellipsizeMode="tail">
          {formattedRole}
        </Text>
        <Text style={styles.staffExperience} numberOfLines={1} ellipsizeMode="tail">
          {experienceText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default StaffCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 16,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E4E7EC',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  fallbackAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EAECF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  staffName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
  },
  staffRole: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  staffExperience: {
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
    width: '60%',
    maxWidth: 160,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#E4E7EC',
    marginBottom: 4,
  },
  skeletonLineRole: {
    width: '35%',
    maxWidth: 90,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
    marginBottom: 4,
  },
  skeletonLineExperience: {
    width: '45%',
    maxWidth: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
  },
});
