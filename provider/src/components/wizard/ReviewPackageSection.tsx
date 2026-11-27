import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';

import { formatNaira } from '../../utils/servicePricing';
import { triggerLightHaptic } from '../../utils/haptics';
import { DarkCheckCircleIcon } from './ReviewIcons';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

export interface ServicePackageItemViewModel {
  id: string;
  images: string[];
  contents: string;
  price: number | null;
  duration?: string;
}

export interface ReviewPackageSectionProps {
  title?: string;
  packages: ServicePackageItemViewModel[];
  readOnly?: boolean;
  onEdit?: () => void;
  testID?: string;
}

/**
 * 1:1 Figma Service Package summary section used in Review step (Step 4) and Service Details screen (D1).
 * In readOnly mode:
 * - Omit Edit pill
 * - Only rendered when packages.length > 0
 */
export const ReviewPackageSection: React.FC<ReviewPackageSectionProps> = ({
  title = 'Service Package',
  packages,
  readOnly = false,
  onEdit,
  testID,
}) => {
  const validPackages = (packages || []).filter(
    (pkg) =>
      pkg.contents?.trim() ||
      (pkg.price !== null && pkg.price > 0) ||
      (pkg.images && pkg.images.length > 0)
  );

  if (validPackages.length === 0) {
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
            accessibilityLabel="Edit package"
          >
            <Text style={styles.editPillText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Packages Container ── */}
      <View style={styles.packagesContainer}>
        {validPackages.map((pkg) => {
          const checklistLines = pkg.contents
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

          const displayPrice = formatNaira(pkg.price || 0);

          return (
            <View
              key={pkg.id}
              style={styles.packageCard}
              accessible={true}
              accessibilityLabel={`Package, ${displayPrice}, ${checklistLines.join(', ')}`}
            >
              {/* Images Grid (2 columns, 140x140 cells) */}
              {pkg.images.length > 0 && (
                <View
                  style={[
                    styles.packageImagesGrid,
                    pkg.images.length === 1 && { width: 140 },
                  ]}
                >
                  {pkg.images.slice(0, 4).map((uri, idx) => (
                    <View key={idx} style={styles.packageImageCell}>
                      <Image
                        source={typeof uri === 'number' ? uri : { uri }}
                        style={styles.packageImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* Price */}
              <Text style={styles.packagePriceText}>{displayPrice}</Text>

              {/* Contents Checklist */}
              {checklistLines.length > 0 && (
                <View style={styles.checklistContainer}>
                  {checklistLines.map((line, idx) => (
                    <View key={idx} style={styles.checklistItemRow}>
                      <DarkCheckCircleIcon size={20} />
                      <Text style={styles.checklistItemText}>{line}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ReviewPackageSection;

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
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  packageImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: 296,
    maxWidth: '100%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  packageImageCell: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E4E7EC',
  },
  packageImage: {
    width: '100%',
    height: '100%',
  },
  packagePriceText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  checklistContainer: {
    gap: 8,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistItemText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    flex: 1,
  },
});
