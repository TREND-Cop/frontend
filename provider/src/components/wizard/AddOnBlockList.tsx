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
import { AddOnItem } from '../../context/ServiceDraftContext';
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

export interface AddOnBlockListProps {
  addOns: AddOnItem[];
  mode: 'create' | 'edit';
  onUpdateAddOn: (id: string, updates: Partial<AddOnItem>) => void;
  onAddBlock: () => void;
  onUploadPress: (addOnId: string) => void;
  onRemoveImage: (addOnId: string) => void;
  onDurationPress: (addOnId: string) => void;
  errors?: Record<string, boolean>;
  testID?: string;
}

/**
 * 1:1 Figma Reusable Add-On Block List
 *
 * Implements:
 * - Block 1: Add image slot, Name, Description (50-char countdown), Price & Duration
 * - "Add more add-ons" heading with "Add-ons +" row button
 * - Extra add-on blocks stacked below
 * - Red ✕ badge on filled photo slot (tappable to remove image)
 */
export const AddOnBlockList: React.FC<AddOnBlockListProps> = ({
  addOns,
  mode,
  onUpdateAddOn,
  onAddBlock,
  onUploadPress,
  onRemoveImage,
  onDurationPress,
  errors = {},
  testID,
}) => {
  const firstBlock = addOns[0];
  const extraBlocks = addOns.slice(1);

  const handlePriceChange = (id: string, text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    const num = numericOnly ? parseInt(numericOnly, 10) : null;
    onUpdateAddOn(id, {
      price: num,
      priceRaw: numericOnly,
    });
  };

  const renderSingleBlock = (block: AddOnItem, isFirst: boolean) => {
    const remainingChars = Math.max(0, 50 - block.description.length);

    return (
      <View key={block.id} style={styles.blockContainer}>
        {/* 1. Add Image Slot */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabelMed}>Add image</Text>

          {block.imageUri ? (
            <View style={styles.filledImageBox}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.imageTouchable}
                onPress={() => onUploadPress(block.id)}
                accessibilityLabel="Replace photo"
              >
                {/* Ambient blurred backdrop preserving full aspect ratio */}
                <Image
                  source={{ uri: block.imageUri }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                  blurRadius={25}
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'rgba(0, 8, 20, 0.25)' },
                  ]}
                />
                <Image
                  source={{ uri: block.imageUri }}
                  style={styles.filledImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Red ✕ Badge */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.removeBadgeButton}
                onPress={() => {
                  triggerLightHaptic();
                  onRemoveImage(block.id);
                }}
                accessibilityLabel="Remove photo"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <CircleXBadgeIcon size={24} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.emptyImageBox,
                errors[`addon_image_${block.id}`] && styles.inputErrorBorder,
              ]}
              onPress={() => {
                triggerLightHaptic();
                onUploadPress(block.id);
              }}
              accessibilityLabel="Add add-on photo"
            >
              <CameraIcon size={24} color="#141B34" />
            </TouchableOpacity>
          )}
        </View>

        {/* 2. Add-ons Name */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabelMed}>Add-ons Name</Text>
          <TextInput
            style={[
              styles.inputField,
              errors[`addon_name_${block.id}`] && styles.inputErrorBorder,
            ]}
            placeholder="John Doe"
            placeholderTextColor="rgba(192, 192, 204, 0.96)"
            value={block.name}
            onChangeText={(text) => onUpdateAddOn(block.id, { name: text })}
            accessibilityLabel="Add-on name"
          />
        </View>

        {/* 3. Description with 50-Char Counter */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabelRegular}>Description</Text>
          <View style={styles.descriptionBoxContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="After Shave hot towel"
              placeholderTextColor="rgba(192, 192, 204, 0.96)"
              value={block.description}
              onChangeText={(text) => {
                if (text.length <= 50) {
                  onUpdateAddOn(block.id, { description: text });
                }
              }}
              maxLength={50}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Add-on description"
            />
            <Text style={styles.charCountdownText}>{remainingChars}</Text>
          </View>
        </View>

        {/* 4. Price and Duration */}
        <View style={styles.fieldSection}>
          <Text style={styles.sectionHeaderH2}>Price and duration</Text>
          <View style={styles.twoColumnRow}>
            {/* Left: Price */}
            <View style={styles.columnItem}>
              <Text style={styles.subFieldLabel}>Price</Text>
              <View
                style={[
                  styles.priceInputField,
                  errors[`addon_price_${block.id}`] && styles.inputErrorBorder,
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
                  value={block.priceRaw ? formatWithCommas(block.priceRaw) : ''}
                  onChangeText={(t) => handlePriceChange(block.id, t)}
                  keyboardType="numeric"
                  multiline={false}
                  numberOfLines={1}
                  scrollEnabled={true}
                  accessibilityLabel="Add-on price in Naira"
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
                  !block.duration && styles.dropdownFieldInactive,
                  errors[`addon_duration_${block.id}`] && styles.inputErrorBorder,
                ]}
                onPress={() => {
                  triggerLightHaptic();
                  onDurationPress(block.id);
                }}
                accessibilityLabel="Select add-on duration"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.dropdownText,
                    block.duration ? styles.filledText : styles.placeholderText,
                  ]}
                >
                  {block.duration || '30 hr'}
                </Text>
                <ArrowDown01Icon
                  size={24}
                  color={block.duration ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Block 1 */}
      {firstBlock && renderSingleBlock(firstBlock, true)}

      {/* Extra Blocks */}
      {extraBlocks.map((block) => renderSingleBlock(block, false))}

      {/* "Add more add-ons" Section Row (Always below all blocks) */}
      <View style={styles.addMoreSection}>
        <Text style={styles.sectionHeaderH2}>Add more add-ons</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addMoreButton}
          onPress={() => {
            triggerLightHaptic();
            onAddBlock();
          }}
          accessibilityLabel="Add another add-on block"
          accessibilityRole="button"
        >
          <Text style={styles.addMoreButtonText}>Add-ons</Text>
          <View style={styles.addIconCircle}>
            <PlusIcon size={24} color="#141B34" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  blockContainer: {
    width: '100%',
    marginBottom: 40,
  },
  fieldSection: {
    width: '100%',
    marginBottom: 24,
  },
  fieldLabelMed: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    marginBottom: 16,
  },
  fieldLabelRegular: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    marginBottom: 16,
  },
  sectionHeaderH2: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 16,
  },
  filledImageBox: {
    width: '100%',
    height: 221,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000814',
  },
  imageTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  filledImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  removeBadgeButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyImageBox: {
    width: '100%',
    height: 221,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  inputField: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  descriptionBoxContainer: {
    height: 147,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    padding: 16,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  descriptionInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingTop: 0,
    paddingBottom: 24,
  },
  charCountdownText: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  columnItem: {
    flex: 1,
    minWidth: 0,
  },
  subFieldLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 8,
  },
  priceInputField: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    minWidth: 0,
  },
  currencyPrefixContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 6,
    flexShrink: 0,
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
    flexShrink: 0,
  },
  nairaSymbol: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    marginRight: 2,
    flexShrink: 0,
  },
  priceTextInput: {
    flex: 1,
    minWidth: 0,
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
  dropdownFieldInactive: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderColor: 'rgba(247, 247, 247, 0.96)',
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
  addMoreSection: {
    width: '100%',
    marginBottom: 40,
  },
  addMoreButton: {
    width: '100%',
    height: 56,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  addMoreButtonText: {
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
  inputErrorBorder: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
    borderWidth: 1.5,
  },
});

export default AddOnBlockList;
