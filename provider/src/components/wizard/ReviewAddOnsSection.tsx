import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';

import { formatDurationCompact, formatNaira } from '../../utils/servicePricing';
import { triggerLightHaptic } from '../../utils/haptics';
import { Time04Icon } from './ReviewIcons';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

export interface AddOnItemViewModel {
  id: string;
  imageUri?: string | null;
  name: string;
  price: number | null;
  duration: string;
}

export interface ReviewAddOnsSectionProps {
  title?: string;
  addOns: AddOnItemViewModel[];
  readOnly?: boolean;
  onEdit?: () => void;
  testID?: string;
}

/**
 * 1:1 Figma Add-ons summary section used in Review step (Step 4) and Service Details screen (D1).
 * In readOnly mode:
 * - Omit Edit pill
 * - Only rendered when addOns.length > 0
 */
export const ReviewAddOnsSection: React.FC<ReviewAddOnsSectionProps> = ({
  title = 'Add-ons',
  addOns,
  readOnly = false,
  onEdit,
  testID,
}) => {
  if (!addOns || addOns.length === 0) {
    return null;
  }

  const handleEdit = () => {
    triggerLightHaptic();
    onEdit?.();
  };

  return (
    <View style={styles.sectionWrapper} testID={testID}>
      {/* ── Section Header Row ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        {!readOnly && onEdit && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editPill}
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit add-ons"
          >
            <Text style={styles.editPillText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Add-ons Card List ── */}
      <View style={styles.addOnsListWrapper}>
        {addOns.map((addon) => {
          const displayPrice = formatNaira(addon.price || 0);
          const compactDuration = formatDurationCompact(addon.duration);

          return (
            <View
              key={addon.id}
              style={styles.addOnItemCard}
              accessible={true}
              accessibilityLabel={`${addon.name || 'Add-on'}, ${displayPrice}, ${compactDuration}`}
            >
              {/* Photo */}
              <View style={styles.addOnPhotoContainer}>
                {addon.imageUri ? (
                  <Image source={{ uri: addon.imageUri }} style={styles.addOnPhotoImage} />
                ) : (
                  <View style={styles.addOnPhotoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>Photo</Text>
                  </View>
                )}
              </View>

              {/* Details */}
              <View style={styles.addOnDetailsColumn}>
                <Text style={styles.addOnName} numberOfLines={1} ellipsizeMode="tail">
                  {addon.name || 'Add-on'}
                </Text>
                <Text style={styles.addOnPriceText}>{displayPrice}</Text>
                <View style={styles.durationRow}>
                  <Time04Icon size={16} />
                  <Text style={styles.durationText}>{compactDuration}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ReviewAddOnsSection;

const styles = StyleSheet.create({
  sectionWrapper: {
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
  addOnsListWrapper: {
    gap: 12,
  },
  addOnItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  addOnPhotoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E4E7EC',
  },
  addOnPhotoImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  addOnPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EAECF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 12,
    fontFamily: FONT_REGULAR,
    color: '#98A2B3',
  },
  addOnDetailsColumn: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  addOnName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  addOnPriceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
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
});
