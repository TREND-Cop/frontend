import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { ServicePackageItem } from '../../context/ServiceDraftContext';
import { DashedPhotoSlot } from './DashedPhotoSlot';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Icons ─────────────────────────────────────────────────────────────────────

function CameraIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 8a2 2 0 012-2h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="17.5" cy="9.5" r="0.75" fill={color} />
    </Svg>
  );
}

function CircleXBadgeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10"
        fill="rgba(204, 41, 41, 0.9)"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth={1.5}
      />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function InfoCircleIcon({ size = 20, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
      <Path
        d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 11 12.5 11.75 12.5 13.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx="12.5" cy="16.5" r="0.75" fill={color} />
    </Svg>
  );
}

function ArrowDown01Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Comma Formatter ───────────────────────────────────────────────────────────
function formatWithCommas(value: string): string {
  if (!value) return '';
  const clean = value.replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) {
    return `${integerPart}.${parts[1]}`;
  }
  return integerPart;
}

export interface PackageBlockListProps {
  packages: ServicePackageItem[];
  mode: 'create' | 'edit';
  showSectionHeader?: boolean;
  showSubtitle?: boolean;
  showRemoveBadge?: boolean;
  onAddPackage: () => void;
  onUpdatePackage: (pkgId: string, updates: Partial<ServicePackageItem>) => void;
  onSlotPress: (pkgId: string, slotIdx: number) => void;
  onRemoveImage?: (pkgId: string, slotIdx: number) => void;
  onOpenGuide?: (topic: string) => void;
  onDurationPress: (pkgId: string) => void;
  onFocusContents?: (pkgId: string) => void;
  onFocusPrice?: (pkgId: string) => void;
  errors?: Record<string, boolean>;
  testID?: string;
}

/**
 * 1:1 Figma Reusable Package Block List
 *
 * Used across:
 * 1. Step 1 Add Service (mode="create", showSectionHeader=true, showSubtitle=true, showRemoveBadge=false)
 * 2. Edit Service (mode="edit", showSectionHeader=true, showSubtitle=false, showRemoveBadge=true)
 * 3. Edit Package (mode="edit", showSectionHeader=false, showSubtitle=false, showRemoveBadge=true)
 */
export const PackageBlockList: React.FC<PackageBlockListProps> = ({
  packages,
  mode,
  showSectionHeader = mode === 'create',
  showSubtitle = mode === 'create',
  showRemoveBadge = mode === 'edit',
  onAddPackage,
  onUpdatePackage,
  onSlotPress,
  onRemoveImage,
  onOpenGuide,
  onDurationPress,
  onFocusContents,
  onFocusPrice,
  errors = {},
  testID,
}) => {
  const handlePriceChange = (pkgId: string, text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    const num = numericOnly ? parseInt(numericOnly, 10) : null;
    onUpdatePackage(pkgId, {
      price: num,
      priceRaw: numericOnly,
    });
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Optional Section Header */}
      {showSectionHeader && (
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderLabel}>Service Package</Text>
          {showSubtitle && (
            <Text style={styles.fieldSubtitle}>
              Add any special packages clients can book alongside this service
            </Text>
          )}
        </View>
      )}

      {/* Package Blocks */}
      {packages.map((pkg, pIndex) => (
        <View key={pkg.id} style={styles.packageBlock}>
          {/* 1. Package images header */}
          <Text style={styles.packageImagesLabel}>Package images</Text>

          {/* 6 Image Slots (3x2 grid) */}
          <View style={styles.imageGrid}>
            {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
              const imgUri = pkg.images[slotIdx];

              return (
                <DashedPhotoSlot
                  key={slotIdx}
                  imageUri={imgUri}
                  showRemoveBadge={showRemoveBadge}
                  onPress={() => onSlotPress(pkg.id, slotIdx)}
                  onRemove={() => {
                    if (onRemoveImage) {
                      onRemoveImage(pkg.id, slotIdx);
                    } else {
                      const nextImages = pkg.images.filter((_, idx) => idx !== slotIdx);
                      onUpdatePackage(pkg.id, { images: nextImages });
                    }
                  }}
                  accessibilityLabel={
                    imgUri
                      ? `Replace package photo ${slotIdx + 1}`
                      : `Upload package photo slot ${slotIdx + 1}`
                  }
                />
              );
            })}
          </View>

          {/* 2. Package Contents ⓘ */}
          <View style={styles.labelWithInfoRow}>
            <Text style={styles.fieldLabel}>Package Contents</Text>
            {onOpenGuide && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onOpenGuide('package-contents')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about package contents"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles.descriptionBox,
              errors[`pkg_contents_${pkg.id}`] && styles.inputErrorBorder,
            ]}
          >
            <TextInput
              style={styles.descriptionInput}
              placeholder="What service will this package feature?"
              placeholderTextColor="rgba(192, 192, 204, 0.96)"
              value={pkg.contents}
              onChangeText={(text) => onUpdatePackage(pkg.id, { contents: text })}
              onFocus={() => onFocusContents?.(pkg.id)}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Package contents"
            />
          </View>

          {/* 3. Package Price & Duration */}
          <Text style={styles.subSectionHeaderLabel}>Package Price & Duration</Text>
          <View style={styles.twoColumnRow}>
            {/* Left: Price */}
            <View style={styles.columnItem}>
              <Text style={styles.subFieldLabel}>Price</Text>
              <View
                style={[
                  styles.priceInputField,
                  errors[`pkg_price_${pkg.id}`] && styles.inputErrorBorder,
                ]}
              >
                <View style={styles.currencyPrefixContainer}>
                  <Text style={styles.currencyPrefixText}>NGN</Text>
                </View>
                <View style={styles.priceDivider} />
                <Text style={styles.nairaSymbol}>₦</Text>
                <TextInput
                  style={styles.priceTextInput}
                  placeholder="0.00"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={pkg.priceRaw ? formatWithCommas(pkg.priceRaw) : ''}
                  onChangeText={(t) => handlePriceChange(pkg.id, t)}
                  onFocus={() => onFocusPrice?.(pkg.id)}
                  keyboardType="numeric"
                  accessibilityLabel="Package price in Naira"
                />
              </View>
            </View>

            {/* Right: Duration */}
            <View style={styles.columnItem}>
              <Text style={styles.subFieldLabel}>Service Duration</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.dropdownField,
                  errors[`pkg_duration_${pkg.id}`] && styles.inputErrorBorder,
                ]}
                onPress={() => {
                  triggerLightHaptic();
                  onDurationPress(pkg.id);
                }}
                accessibilityLabel="Select package duration"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.dropdownText,
                    pkg.duration ? styles.filledText : styles.placeholderText,
                  ]}
                >
                  {pkg.duration || '1:30 hr'}
                </Text>
                <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* "Add Package" Button Card (358x56px, background #F7F7F7) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.addPackageButton}
        onPress={() => {
          triggerLightHaptic();
          onAddPackage();
        }}
        accessibilityLabel="Add Package"
        accessibilityRole="button"
      >
        <Text style={styles.addPackageText}>Add Package</Text>
        <View style={styles.addIconCircle}>
          <PlusIcon size={24} color="#141B34" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionHeaderContainer: {
    marginBottom: 20,
  },
  sectionHeaderLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
  },
  fieldSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginTop: 6,
  },
  packageBlock: {
    marginBottom: 48,
  },
  packageImagesLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 18,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  slotWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 24,
  },
  filledSlotContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreviewTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    resizeMode: 'cover',
  },
  emptyImageSlot: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  removeBadgeButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  labelWithInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  descriptionBox: {
    minHeight: 112,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    padding: 16,
  },
  descriptionInput: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    minHeight: 76,
  },
  subSectionHeaderLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    marginTop: 36,
    marginBottom: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  columnItem: {
    flex: 1,
  },
  subFieldLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 10,
  },
  priceInputField: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  currencyPrefixContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 6,
  },
  currencyPrefixText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 4,
  },
  nairaSymbol: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    marginRight: 2,
  },
  priceTextInput: {
    flex: 1,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },
  dropdownField: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
  },
  filledText: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  placeholderText: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  inputErrorBorder: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
    borderWidth: 1.5,
  },
  addPackageButton: {
    width: '100%',
    height: 56,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  addPackageText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PackageBlockList;
