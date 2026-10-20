import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { StaffMember } from '../../hooks/useStaff';
import { getServicePricing, formatDurationCompact } from '../../utils/servicePricing';
import { triggerLightHaptic } from '../../utils/haptics';
import {
  Time04Icon,
  BriefcaseIcon,
  BrainExperienceIcon,
  PlusSignCircleIcon,
  CircleXDeleteIcon,
} from './ReviewIcons';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

export interface ReviewServiceCardProps {
  /** Section title: 'Service' in Review, 'Added Service' in Details */
  title?: string;
  name: string;
  images?: string[];
  imageUri?: string | null;
  price: number | null;
  duration: string;
  discount?: number | null;
  staffMembers: StaffMember[];
  providerIsOwner?: boolean;
  /** When true: no Edit pill, no staff ✕ button, no "Add staff" button, no discount ribbon */
  readOnly?: boolean;
  /** Explicit override for discount ribbon; defaults to !readOnly */
  showDiscountRibbon?: boolean;
  onEditService?: () => void;
  onAddStaff?: () => void;
  onRemoveStaffId?: (id: string) => void;
  testID?: string;
}

/**
 * 1:1 Figma Service summary card used in Review step (Step 4) and Service Details screen (D1).
 * In readOnly mode:
 * - Omit Edit pill and "Add staff" action
 * - Omit staff ✕ removal buttons
 * - Omit discount ribbon (per D1 spec)
 * - If no staff, omit the Staff section entirely
 */
export const ReviewServiceCard: React.FC<ReviewServiceCardProps> = ({
  title = 'Service',
  name,
  images = [],
  imageUri,
  price,
  duration,
  discount,
  staffMembers = [],
  providerIsOwner = false,
  readOnly = false,
  showDiscountRibbon,
  onEditService,
  onAddStaff,
  onRemoveStaffId,
  testID,
}) => {
  const pricing = getServicePricing(price, discount ?? null);
  const compactDuration = formatDurationCompact(duration);

  // Discount ribbon is shown only in Review (not in Details screen D1) unless explicitly enabled
  const renderRibbon = showDiscountRibbon !== undefined ? showDiscountRibbon : !readOnly;

  // Resolve photo URI (from single imageUri or first element of images array)
  const resolvedPhotoUri = imageUri || (images.length > 0 ? images[0] : null);

  const handleEdit = () => {
    triggerLightHaptic();
    onEditService?.();
  };

  const handleAddStaffPress = () => {
    triggerLightHaptic();
    onAddStaff?.();
  };

  const handleRemoveStaff = (staffId: string) => {
    triggerLightHaptic();
    onRemoveStaffId?.(staffId);
  };

  // In readOnly mode, if there are no staff, omit the Staff sub-section entirely
  const shouldRenderStaffSection = readOnly
    ? staffMembers.length > 0
    : true;

  return (
    <View style={styles.container} testID={testID}>
      {/* ── Section Header Row ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        {!readOnly && onEditService && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editPill}
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit service"
          >
            <Text style={styles.editPillText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Service Card Container ── */}
      <View style={styles.serviceCardContainer}>
        {/* Main Service Row (80x80 photo + Name + Price + Duration + Ribbon) */}
        <View
          style={styles.serviceItemRow}
          accessible={true}
          accessibilityLabel={`${name || 'Service'}, ${pricing.displayPrice}, ${compactDuration}`}
        >
          {/* Service Photo with soft shadow */}
          <View style={styles.imageHolder}>
            {resolvedPhotoUri ? (
              <Image
                source={{ uri: resolvedPhotoUri }}
                style={styles.servicePhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>Photo</Text>
              </View>
            )}
          </View>

          {/* Service Details */}
          <View style={styles.serviceInfoColumn}>
            <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">
              {name || 'Service'}
            </Text>

            {/* Price row */}
            <View style={styles.priceRow}>
              <Text style={styles.currentPriceText}>{pricing.displayPrice}</Text>
              {renderRibbon && pricing.hasDiscount && pricing.originalPrice && (
                <View style={styles.struckPriceWrapper}>
                  <Text style={styles.struckPriceText}>{pricing.originalPrice}</Text>
                  <View style={styles.strikeLine} />
                </View>
              )}
            </View>

            {/* Duration row */}
            <View style={styles.durationRow}>
              <Time04Icon size={18} />
              <Text style={styles.durationText}>{compactDuration}</Text>
            </View>
          </View>

          {/* Discount Ribbon Badge (Review only, top-right corner, rotated 37deg) */}
          {renderRibbon && pricing.hasDiscount && (
            <View style={styles.ribbonWrapper}>
              <View style={styles.ribbonBadge}>
                <Text style={styles.ribbonText}>{pricing.percentOff}% OFF</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Staff Sub-Section ── */}
        {shouldRenderStaffSection && (
          <>
            <View style={styles.staffHeaderRow}>
              <Text style={styles.staffSectionTitle}>Staff</Text>
              {!readOnly && onAddStaff && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.addStaffAction}
                  onPress={handleAddStaffPress}
                  accessibilityRole="button"
                  accessibilityLabel="Add staff"
                >
                  <PlusSignCircleIcon size={20} />
                  <Text style={styles.addStaffActionText}>Add staff</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Staff Rows */}
            <View style={styles.staffListContainer}>
              {!readOnly && providerIsOwner ? (
                // Business Owner fallback note (Review only)
                <View style={styles.ownerNoticeCard}>
                  <Text style={styles.ownerNoticeTitle}>Business Owner</Text>
                  <Text style={styles.ownerNoticeSubtitle}>
                    You have selected to provide this service directly.
                  </Text>
                </View>
              ) : staffMembers.length > 0 ? (
                staffMembers.map((staff) => (
                  <View
                    key={staff.id}
                    style={styles.staffRowCard}
                    accessible={true}
                    accessibilityLabel={`${staff.name}, ${staff.role}, ${staff.yearsExperience} years experience`}
                  >
                    {/* Avatar */}
                    <View style={styles.staffAvatarContainer}>
                      {staff.avatarUri ? (
                        <Image source={{ uri: staff.avatarUri }} style={styles.staffAvatarImage} />
                      ) : (
                        <View style={styles.staffAvatarPlaceholder}>
                          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                            <Circle cx="12" cy="8" r="4" fill="#98A2B3" />
                            <Path d="M5 19c0-3.87 3.13-7 7-7s7 3.13 7 7v1H5v-1z" fill="#98A2B3" />
                          </Svg>
                        </View>
                      )}
                    </View>

                    {/* Staff Info */}
                    <View style={styles.staffTextColumn}>
                      <Text style={styles.staffMemberName} numberOfLines={1} ellipsizeMode="tail">
                        {staff.name}
                      </Text>
                      <View style={styles.staffMetaRow}>
                        <BriefcaseIcon size={16} />
                        <Text style={styles.staffMetaText} numberOfLines={1}>
                          {staff.role}
                        </Text>
                      </View>
                      <View style={styles.staffMetaRow}>
                        <BrainExperienceIcon size={16} />
                        <Text style={styles.staffMetaText} numberOfLines={1}>
                          {staff.yearsExperience}{' '}
                          {staff.yearsExperience === 1 ? 'year' : 'years'} Experience
                        </Text>
                      </View>
                    </View>

                    {/* Red ✕ Removal Button (Review only) */}
                    {!readOnly && onRemoveStaffId && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.staffRemoveButton}
                        onPress={() => handleRemoveStaff(staff.id)}
                        accessibilityLabel={`Remove ${staff.name}`}
                        accessibilityRole="button"
                      >
                        <CircleXDeleteIcon size={24} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                !readOnly && (
                  <View style={styles.noStaffAssignedContainer}>
                    <Text style={styles.noStaffAssignedText}>
                      No staff assigned yet. Tap ⊕ Add staff to assign specialists.
                    </Text>
                  </View>
                )
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default ReviewServiceCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  editPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  editPillText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  serviceCardContainer: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
  },
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
  },
  imageHolder: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.16)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '4px 10px 24px rgba(133, 139, 148, 0.08)',
      },
    }),
  },
  servicePhoto: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E4E7EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 12,
    fontFamily: FONT_REGULAR,
    color: '#98A2B3',
  },
  serviceInfoColumn: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  serviceName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentPriceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  struckPriceWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  struckPriceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  strikeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(96, 96, 102, 0.96)',
    top: '50%',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ribbonWrapper: {
    position: 'absolute',
    top: -8,
    right: -16,
    zIndex: 10,
  },
  ribbonBadge: {
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '37deg' }],
  },
  ribbonText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  staffHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  staffSectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  addStaffAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addStaffActionText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  staffListContainer: {
    gap: 12,
  },
  staffRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    gap: 16,
  },
  staffAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F2F4F7',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 20,
  },
  staffAvatarPlaceholder: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAECF0',
  },
  staffTextColumn: {
    flex: 1,
    gap: 4,
  },
  staffMemberName: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  staffMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  staffMetaText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  staffRemoveButton: {
    padding: 6,
  },
  ownerNoticeCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 4,
  },
  ownerNoticeTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ownerNoticeSubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  noStaffAssignedContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
  },
  noStaffAssignedText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
});
