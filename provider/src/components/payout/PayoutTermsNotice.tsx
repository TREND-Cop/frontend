import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PAYOUT_TERMS_TITLE,
  PAYOUT_TERMS_BODY,
} from '../../constants/payout.constants';
import { NativeDockSpacer } from '../NativeDockSpacer';

export interface PayoutTermsNoticeProps {
  visible: boolean;
  onAgree: () => void;
  onDecline: () => void;
}

/**
 * 1:1 Figma Payout Privacy & Terms Notice Card / Bottom Sheet
 * Frame: Pop up (width: 390px, borderTopLeftRadius: 24, borderTopRightRadius: 24, background: #ffffff)
 * 
 * TODO (Backend): Enforce expired trial gate once 1-week free trial expires (per Figma note).
 */
export const PayoutTermsNotice: React.FC<PayoutTermsNoticeProps> = ({
  visible,
  onAgree,
  onDecline,
}) => {
  const insets = useSafeAreaInsets();
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  // Reset scroll-to-end check whenever modal opens
  useEffect(() => {
    if (visible) {
      setHasScrolledToEnd(false);
    }
  }, [visible]);

  const checkScrollToEnd = (offsetY: number, layoutHeight: number, contentHeight: number) => {
    // If entire content fits in the scroll viewport without scrolling, unlock immediately
    if (contentHeight <= layoutHeight + 10) {
      setHasScrolledToEnd(true);
      return;
    }
    // Unlock when within 20px of the bottom
    if (layoutHeight + offsetY >= contentHeight - 20) {
      setHasScrolledToEnd(true);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    layoutHeightRef.current = layoutMeasurement.height;
    contentHeightRef.current = contentSize.height;
    checkScrollToEnd(contentOffset.y, layoutMeasurement.height, contentSize.height);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDecline}
    >
      <View style={styles.backdropOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onDecline}
        />

        <View style={styles.sheetContainer}>
          {/* ── Title (width: 294px, height: 28px, 20px SF Pro Medium) ── */}
          <View style={styles.headerArea}>
            <Text style={styles.titleText}>{PAYOUT_TERMS_TITLE}</Text>
          </View>

          {/* ── Scrollable Body Legal Text (Justified write-up) ── */}
          <ScrollView
            style={styles.bodyScrollView}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onLayout={(e) => {
              layoutHeightRef.current = e.nativeEvent.layout.height;
              if (contentHeightRef.current > 0) {
                checkScrollToEnd(0, layoutHeightRef.current, contentHeightRef.current);
              }
            }}
            onContentSizeChange={(_w, h) => {
              contentHeightRef.current = h;
              if (layoutHeightRef.current > 0) {
                checkScrollToEnd(0, layoutHeightRef.current, h);
              }
            }}
          >
            <Text style={styles.bodyText}>{PAYOUT_TERMS_BODY}</Text>
          </ScrollView>

          {/* ── Fixed Bottom Actions (width: 266px, gap: 24px) ── */}
          <View
            style={[
              styles.buttonContainer,
              {
                paddingBottom:
                  Platform.OS === 'android'
                    ? Math.max(insets.bottom, 56)
                    : Math.max(insets.bottom, 16),
              },
            ]}
          >
            {/* Primary: "i agree to the terms" (Locked until scrolled to the end) */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!hasScrolledToEnd}
              style={[
                styles.agreeButton,
                !hasScrolledToEnd && styles.agreeButtonDisabled,
              ]}
              onPress={onAgree}
            >
              <Text
                style={[
                  styles.agreeButtonText,
                  !hasScrolledToEnd && styles.agreeButtonTextDisabled,
                ]}
              >
                i agree to the terms
              </Text>
            </TouchableOpacity>

            {/* Secondary: "Let me think about it" */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.thinkButton}
              onPress={onDecline}
            >
              <Text style={styles.thinkButtonText}>Let me think about it</Text>
            </TouchableOpacity>
          </View>

          {/* Android System Dock Barrier */}
          <NativeDockSpacer backgroundColor="#FFFFFF" />
        </View>
      </View>
    </Modal>
  );
};

export default PayoutTermsNotice;

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 390,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  headerArea: {
    width: '100%',
    maxWidth: 358,
    paddingTop: 28,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
    includeFontPadding: false,
  },
  bodyScrollView: {
    width: '100%',
    paddingHorizontal: 16,
    flexGrow: 0,
    maxHeight: 340,
  },
  bodyContent: {
    paddingBottom: 16,
  },
  bodyText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#606066',
    includeFontPadding: false,
    textAlign: 'justify',
  },
  buttonContainer: {
    width: 266,
    alignItems: 'center',
    paddingTop: 16,
    gap: 16,
  },
  agreeButton: {
    width: 266,
    height: 48,
    backgroundColor: '#000814',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agreeButtonDisabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.25)',
  },
  agreeButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
    includeFontPadding: false,
  },
  agreeButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  thinkButton: {
    width: 210,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thinkButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#606066',
    includeFontPadding: false,
  },
});
