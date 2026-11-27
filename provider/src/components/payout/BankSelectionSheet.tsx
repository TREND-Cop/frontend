import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  Modal,
  Keyboard,
  Dimensions,
  Pressable,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BankOption, DEFAULT_BANKS } from '../../constants/payout.constants';
import { NativeDockSpacer } from '../NativeDockSpacer';
import { useSingleFlight } from '../../utils/safeNavigation';

export interface BankSelectionSheetProps {
  visible: boolean;
  selectedBankId?: string;
  onSelectBank: (bank: BankOption) => void;
  onClose: () => void;
  banks?: BankOption[];
}

/**
 * 1:1 Figma Bank Selection Bottom Sheet
 * Frame: state of resident (width: 390px, height: 467px, top radius 24px)
 * Features:
 * - Dynamic keyboard avoidance: visualViewport on web, Keyboard listeners on native
 * - Spacious list rows (minHeight: 58px, paddingVertical: 14px) eliminating cramped/jampacked display
 * - Search bar with clear button
 */
export const BankSelectionSheet: React.FC<BankSelectionSheetProps> = ({
  visible,
  selectedBankId,
  onSelectBank,
  onClose,
  banks = DEFAULT_BANKS,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks;
    const q = searchQuery.toLowerCase().trim();
    return banks.filter((b) => b.name.toLowerCase().includes(q));
  }, [banks, searchQuery]);

  const handleDismiss = useSingleFlight(() => {
    setSearchQuery('');
    onClose();
  });

  const handleBankPress = useSingleFlight((bank: BankOption) => {
    if (!visible) return;
    onSelectBank(bank);
    setSearchQuery('');
    onClose();
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View
        style={[
          styles.backdropOverlay,
          activeKeyboardHeight > 0 ? { paddingBottom: activeKeyboardHeight } : null,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleDismiss}
        />

        <View
          style={[
            styles.sheetContainer,
            activeKeyboardHeight > 0
              ? {
                  height: Math.min(
                    480,
                    Dimensions.get('window').height - activeKeyboardHeight - (insets.top || 24)
                  ),
                  maxHeight: Dimensions.get('window').height - activeKeyboardHeight - (insets.top || 24),
                }
              : null,
            {
              paddingBottom:
                activeKeyboardHeight > 0
                  ? 8
                  : insets.bottom + 16,
            },
          ]}
        >
          {/* ── Drag Handle (56px x 5px, radius: 8px) ── */}
          <View style={styles.dragHandleWrapper}>
            <View style={styles.dragHandle} />
          </View>

          {/* ── Search Bar (358px x 48px, radius: 24px) ── */}
          <View style={styles.searchBar}>
            {/* Search Icon */}
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="11"
                cy="11"
                r="7"
                stroke="#000000"
                strokeWidth="1.5"
              />
              <Path
                d="M20 20L16 16"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>

            <TextInput
              style={styles.searchInput}
              placeholder="Search bank here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              autoCapitalize="none"
              returnKeyType="search"
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M3 3L13 13M13 3L3 13"
                    stroke="rgba(96, 96, 102, 0.96)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Bank Items List (Spacious with 14px vertical padding per row) ── */}
          <ScrollView
            style={styles.bankListScroll}
            contentContainerStyle={styles.bankListContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {filteredBanks.map((bank, index) => {
              const isSelected = selectedBankId === bank.id;
              return (
                <React.Fragment key={bank.id}>
                  <TouchableOpacity
                    style={styles.bankItemRow}
                    activeOpacity={0.7}
                    onPress={() => handleBankPress(bank)}
                  >
                    <View style={styles.bankItemLeft}>
                      <Image
                        source={bank.logo}
                        style={styles.bankLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.bankNameText}>{bank.name}</Text>
                    </View>

                    {/* Radio Checkmark Circle (24px x 24px) */}
                    <View style={styles.radioCircle}>
                      {isSelected ? (
                        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                          <Circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="#0C790C"
                          />
                          <Path
                            d="M8 12L11 15L16 9"
                            stroke="#FFFFFF"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      ) : (
                        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                          <Circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#C0C0CC"
                            strokeWidth="1.5"
                          />
                        </Svg>
                      )}
                    </View>
                  </TouchableOpacity>

                  {index < filteredBanks.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              );
            })}

            {filteredBanks.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No bank found matching "{searchQuery}"</Text>
              </View>
            )}
          </ScrollView>

          {/* Android System Dock Barrier (Only when keyboard is hidden) */}
          {activeKeyboardHeight > 0 ? null : (
            <NativeDockSpacer backgroundColor="#FFFFFF" />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default BankSelectionSheet;

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 390,
    maxHeight: 520,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  dragHandleWrapper: {
    width: '100%',
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dragHandle: {
    width: 56,
    height: 5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 8,
  },
  searchBar: {
    width: 358,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C0C0CC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    paddingVertical: 0,
  },
  bankListScroll: {
    width: '100%',
    paddingHorizontal: 16,
  },
  bankListContent: {
    paddingBottom: 28,
  },
  bankItemRow: {
    width: '100%',
    minHeight: 58,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  bankLogo: {
    width: 41,
    height: 32,
  },
  bankNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#141A33',
    includeFontPadding: false,
    flex: 1,
  },
  radioCircle: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
