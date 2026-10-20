import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

export interface SelectionOption {
  id: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  flag?: string;
}

export interface SelectionSheetProps {
  visible: boolean;
  title?: string;
  searchPlaceholder?: string;
  options: SelectionOption[];
  selectedId?: string;
  onSelect: (option: SelectionOption) => void;
  onClose: () => void;
  showConfirmButton?: boolean;
  confirmButtonLabel?: string;
  onConfirm?: (selected: SelectionOption | null, customText?: string) => void;
  customActionLabel?: string;
  onCustomActionPress?: () => void;
  enableCustomInput?: boolean;
  customInputPlaceholder?: string;
  height?: number | string;
}

// ── Search Icon (18x18, stroke 1.5px #000000) ──
function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Radio Circle Checkmark Icon (checkmark-circle-02) ──
function RadioCheckIcon({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
          fill="#0C790C"
        />
        <Path
          d="M8 12l2.83 2.83L16.5 9.17"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
        stroke="#C0C0CC"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

// ── Clear Icon (16x16, stroke 1.5px #606066) ──
function ClearIcon({ size = 16, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3 3l10 10M13 3L3 13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Reusable SelectionSheet matching 1:1 Figma bottom sheet specs:
 * - Top drag handle
 * - Optional title with separator Line 65
 * - Optional search bar
 * - Radio-style list rows (width: 358px, height: 57px, padding: 16px, borderBottom: 1px solid #ebebf5)
 * - Optional custom input / custom action row
 * - Optional Confirm footer button
 */
export const SelectionSheet: React.FC<SelectionSheetProps> = ({
  visible,
  title,
  searchPlaceholder,
  options,
  selectedId,
  onSelect,
  onClose,
  showConfirmButton = false,
  confirmButtonLabel = 'Confirm',
  onConfirm,
  customActionLabel,
  onCustomActionPress,
  enableCustomInput = false,
  customInputPlaceholder = 'Enter your custom value',
  height,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<SelectionOption | null>(
    options.find((o) => o.id === selectedId) || null
  );
  const [isTypingCustom, setIsTypingCustom] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Keyboard height listener for Native (iOS / Android) and Web (visualViewport)
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (e?.endCoordinates?.height) {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    let handleViewportResize: (() => void) | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.visualViewport) {
      handleViewportResize = () => {
        const vv = window.visualViewport;
        if (!vv) return;
        const diff = window.innerHeight - vv.height;
        if (diff > 100) {
          setKeyboardHeight(diff);
        } else {
          setKeyboardHeight(0);
        }
      };

      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      if (handleViewportResize && typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      }
    };
  }, []);

  const isMobileWeb =
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const activeKeyboardHeight =
    keyboardHeight > 0
      ? keyboardHeight
      : isSearchFocused && isMobileWeb
      ? 290
      : 0;

  // Keep internal selection in sync when prop changes
  React.useEffect(() => {
    if (selectedId) {
      const match = options.find((o) => o.id === selectedId);
      if (match) setSelectedOption(match);
    }
  }, [selectedId, options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.subLabel && o.subLabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const handleRowPress = useCallback(
    (option: SelectionOption) => {
      setSelectedOption(option);
      setIsTypingCustom(false);
      setCustomInputValue('');

      if (!showConfirmButton) {
        onSelect(option);
        setSearchQuery('');
        onClose();
      }
    },
    [showConfirmButton, onSelect, onClose]
  );

  const handleConfirmPress = useCallback(() => {
    if (isTypingCustom && customInputValue.trim()) {
      const customOpt: SelectionOption = {
        id: 'custom',
        label: customInputValue.trim(),
      };
      if (onConfirm) onConfirm(customOpt, customInputValue.trim());
      onSelect(customOpt);
    } else if (selectedOption) {
      if (onConfirm) onConfirm(selectedOption);
      onSelect(selectedOption);
    }
    setSearchQuery('');
    onClose();
  }, [isTypingCustom, customInputValue, selectedOption, onConfirm, onSelect, onClose]);

  const isConfirmEnabled =
    (isTypingCustom && customInputValue.trim().length > 0) ||
    (!isTypingCustom && selectedOption !== null);

  const handleDismiss = () => {
    setSearchQuery('');
    setIsTypingCustom(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View
        style={[
          styles.overlay,
          activeKeyboardHeight > 0 ? { paddingBottom: activeKeyboardHeight } : null,
        ]}
      >
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <View
          style={[
            styles.sheetContainer,
            height ? { height: height as any } : null,
            activeKeyboardHeight > 0
              ? {
                  maxHeight: Math.min(
                    Dimensions.get('window').height - activeKeyboardHeight - (insets.top || 24),
                    Dimensions.get('window').height * 0.85
                  ),
                }
              : null,
            {
              paddingBottom:
                activeKeyboardHeight > 0
                  ? 8
                  : Platform.OS === 'android'
                  ? Math.max(insets.bottom, 56)
                  : Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* ── Drag Handle ── */}
          <View style={styles.dragBarContainer}>
            <View style={styles.dragBar} />
          </View>

          {/* ── Optional Title Header ── */}
          {title ? (
            <View style={styles.titleHeaderContainer}>
              <Text style={styles.titleHeaderText}>{title}</Text>
              <View style={styles.headerSeparatorLine} />
            </View>
          ) : null}

          {/* ── Optional Search Bar ── */}
          {searchPlaceholder ? (
            <View style={styles.searchBarContainer}>
              <SearchIcon size={18} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <ClearIcon size={16} />
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* ── Option List ── */}
          <FlatList
            style={styles.flatList}
            data={filteredOptions}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = selectedOption?.id === item.id && !isTypingCustom;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.optionRow}
                  onPress={() => handleRowPress(item)}
                >
                  <View style={styles.optionLeftContent}>
                    {item.flag ? <Text style={styles.flagText}>{item.flag}</Text> : null}
                    {item.icon ? <View style={styles.iconContainer}>{item.icon}</View> : null}
                    <Text style={styles.optionLabelText}>{item.label}</Text>
                  </View>

                  <View style={styles.optionRightContent}>
                    {item.subLabel ? (
                      <Text style={styles.optionSubLabelText}>{item.subLabel}</Text>
                    ) : null}
                    <RadioCheckIcon isSelected={isSelected} />
                  </View>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              <View>
                {/* ── Custom action row / expandable custom text input ── */}
                {customActionLabel ? (
                  <View style={styles.customActionSection}>
                    {!isTypingCustom ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.customActionRow}
                        onPress={() => {
                          if (enableCustomInput) {
                            setIsTypingCustom(true);
                          } else if (onCustomActionPress) {
                            onCustomActionPress();
                          }
                        }}
                      >
                        <Text style={styles.customActionText}>{customActionLabel}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={styles.customTextInput}
                          placeholder={customInputPlaceholder}
                          placeholderTextColor="rgba(192, 192, 204, 0.96)"
                          value={customInputValue}
                          onChangeText={setCustomInputValue}
                          autoFocus
                        />
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            }
          />

          {/* ── Optional Footer Confirm Button (358px x 48px, radius 24px) ── */}
          {showConfirmButton ? (
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!isConfirmEnabled}
                style={[
                  styles.confirmButton,
                  isConfirmEnabled ? styles.confirmButtonActive : styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirmPress}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    isConfirmEnabled ? styles.confirmTextActive : styles.confirmTextDisabled,
                  ]}
                >
                  {confirmButtonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default SelectionSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  flatList: {
    flexShrink: 1,
  },
  dragBarContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  dragBar: {
    width: 56,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  /* Title Header */
  titleHeaderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  titleHeaderText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    textAlign: 'center',
    paddingVertical: 14,
    includeFontPadding: false,
  },
  headerSeparatorLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#EBEBF5',
  },

  /* Search Bar */
  searchBarContainer: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C0C0CC',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    paddingVertical: 0,
    includeFontPadding: false,
  },

  /* Options list */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  optionRow: {
    width: '100%',
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBF5',
  },
  optionLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  optionRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagText: {
    fontSize: 18,
    lineHeight: 24,
    width: 26,
    textAlign: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    includeFontPadding: false,
  },
  optionSubLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#6F6F6F',
    includeFontPadding: false,
  },

  /* Custom Action / Input */
  customActionSection: {
    width: '100%',
  },
  customActionRow: {
    width: '100%',
    height: 57,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBF5',
    paddingVertical: 16,
  },
  customActionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  customInputContainer: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#000814',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginVertical: 8,
  },
  customTextInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    paddingVertical: 0,
    includeFontPadding: false,
  },

  /* Footer Confirm Button */
  confirmButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonActive: {
    backgroundColor: '#000814',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  confirmButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
  },
  confirmTextActive: {
    color: '#FFFFFF',
  },
  confirmTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
