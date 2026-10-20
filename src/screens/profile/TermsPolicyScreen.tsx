import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

export const TermsPolicyScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'TREND Terms of Service & Privacy Policy: https://trend-app.com/terms',
      });
    } catch (error) {
      // Ignored
    }
  };

  const checkScrollToEnd = (offsetY: number, layoutHeight: number, contentHeight: number) => {
    if (contentHeight <= layoutHeight + 10) {
      setHasScrolledToEnd(true);
      return;
    }
    if (layoutHeight + offsetY >= contentHeight - 24) {
      setHasScrolledToEnd(true);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    layoutHeightRef.current = layoutMeasurement.height;
    contentHeightRef.current = contentSize.height;
    checkScrollToEnd(contentOffset.y, layoutMeasurement.height, contentSize.height);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Terms & Policy</Text>

        <TouchableOpacity
          style={styles.headerShareButton}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Share2 size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Content Body (Figma: paddingHorizontal 16px, gap 32px) ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
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
        {/* Section 1: Acceptance of use */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Acceptance of use</Text>
          <Text style={styles.bodyText}>
            By creating an account, accessing, or using the TREND mobile application,
            website, and related services (the “Platform”), you agree to be bound
            by these Terms of Service (“Terms”). If you do not agree, do not use the
            Platform.{'\n'}
            These Terms form a legally binding agreement between you and TREND.
          </Text>
        </View>

        {/* Section 2: Description of the Platform */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Description of the Platform</Text>
          <Text style={styles.bodyText}>
            The Platform is an online marketplace that connects customers
            (“Customers”) with independent beauty and wellness service providers,
            salons, and professionals (“Providers”).
          </Text>
        </View>

        {/* Section 3: Eligibility and Accounts */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Eligibility and Accounts</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                You must be at least 18 years old (or the age of majority in your
                jurisdiction) to use the Platform.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                You must provide accurate, complete, and current information.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activity under your account.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Actions ("I accept" gated until scrolled to end) ── */}
      <View
        style={[
          styles.footerContainer,
          {
            paddingBottom:
              Platform.OS === 'android'
                ? Math.max(insets.bottom, 56) + 12
                : Math.max(insets.bottom, 20) + 12,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!hasScrolledToEnd}
          style={[
            styles.acceptButton,
            !hasScrolledToEnd && styles.acceptButtonDisabled,
          ]}
          onPress={handleGoBack}
        >
          <Text
            style={[
              styles.acceptButtonText,
              !hasScrolledToEnd && styles.acceptButtonTextDisabled,
            ]}
          >
            I accept
          </Text>
        </TouchableOpacity>
      </View>
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerShareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll Content (Figma: padding 16px, gap 32px) ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 32,
  },

  // ── Section Block (Figma: gap 16px) ──
  sectionBlock: {
    gap: 16,
  },
  sectionHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
  },
  bodyText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'justify',
  },

  // ── Bullet List ──
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  bulletText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'justify',
  },

  // ── Footer & Accept Action ──
  footerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    alignItems: 'center',
  },
  acceptButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    backgroundColor: '#000814',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.25)',
  },
  acceptButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  acceptButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
