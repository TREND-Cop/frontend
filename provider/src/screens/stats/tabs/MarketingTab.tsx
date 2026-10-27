import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { useStatsPeriod } from '../../../context/StatsContext';
import { PeriodSelector } from '../../../components/stats/PeriodSelector';
import { StatsEmptyState } from '../../../components/stats/StatsEmptyState';
import { useMarketingStats, MarketingSource } from '../../../api/statsApi';

const FONT_HEADER = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 24x24 Vector heart-handshake Icon (Referral Link)
 */
function HeartHandshakeIcon({
  size = 24,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A4.5 4.5 0 0017.5 4c-1.74 0-3.41.81-4.5 2.09C11.91 4.81 10.24 4 8.5 4A4.5 4.5 0 004 8.5c0 2.29 1.51 4.04 3 5.5l5 5 5-5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 5v3.5M10.25 7h3.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M7 14l2.5 2.5M17 14l-2.5 2.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 24x24 Vector megaphone-02 Icon (InApp Paid Marketing Ads)
 */
function MegaphoneIcon({
  size = 24,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11l15-7v14L3 11z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 8.5a4 4 0 010 5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M7 13.5v5a2 2 0 002 2h1"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 24x24 Vector sale-tag-02 Icon (Discounts)
 */
function SaleTagIcon({
  size = 24,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="7" cy="7" r="1.5" fill={color} />
    </Svg>
  );
}

/**
 * Default fallback icon for unknown iconKey
 */
function DefaultDotIcon({
  size = 24,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" fill={color} />
    </Svg>
  );
}

/**
 * Animated Progress Bar component
 */
function SourceProgressBar({
  percent,
  accessibilityLabel,
}: {
  percent: number;
  accessibilityLabel: string;
}) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (reduced) {
          animWidth.setValue(clampedPercent);
        } else {
          Animated.timing(animWidth, {
            toValue: clampedPercent,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }).start();
        }
      })
      .catch(() => {
        animWidth.setValue(clampedPercent);
      });
  }, [clampedPercent, animWidth]);

  const widthInterpolation = animWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={styles.track}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedPercent }}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[styles.progressBarFill, { width: widthInterpolation }]}
      />
    </View>
  );
}

/**
 * Helper to render icon by iconKey
 */
function renderSourceIcon(iconKey: string) {
  switch (iconKey) {
    case 'referral':
      return <HeartHandshakeIcon size={24} />;
    case 'in_app_ads':
      return <MegaphoneIcon size={24} />;
    case 'discounts':
      return <SaleTagIcon size={24} />;
    default:
      return <DefaultDotIcon size={24} />;
  }
}

export const MarketingTab: React.FC = () => {
  // Period for Marketing & Growth
  const { period } = useStatsPeriod('marketing.sources');

  // Marketing stats hook
  const marketingStats = useMarketingStats(period);

  return (
    <View style={styles.tabContainer}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── Client Sources (Figma M1) ────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Header Stack */}
        <View style={styles.sectionHeaderStack}>
          <View style={styles.titleWithSubtitle}>
            <Text style={styles.sectionTitle}>Client Sources</Text>
            <Text style={styles.sectionSubtitle}>
              Where your clients are coming from
            </Text>
          </View>
          <View style={styles.periodSelectorWrapper}>
            <PeriodSelector sectionId="marketing.sources" />
          </View>
        </View>

        {marketingStats && marketingStats.sources.length > 0 ? (
          <View style={styles.sourcesListContainer}>
            {marketingStats.sources.map((source: MarketingSource) => {
              const viewerString = `${source.newViewers} Recorded new ${source.newViewers === 1 ? 'viewer' : 'viewers'}`;
              const a11yLabel = `${source.label}, ${source.percent} percent, ${viewerString}`;

              return (
                <View
                  key={source.id}
                  style={styles.sourceRow}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={a11yLabel}
                >
                  {/* Left: Round Icon Circle (40x40) */}
                  <View style={styles.iconCircle}>
                    {renderSourceIcon(source.iconKey)}
                  </View>

                  {/* Right: Metrics Stack */}
                  <View style={styles.sourceDetails}>
                    {/* Label */}
                    <Text
                      style={styles.sourceLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {source.label}
                    </Text>

                    {/* Percent + Recorded Viewers Row */}
                    <View style={styles.valueRow}>
                      <Text style={styles.sourcePercent}>
                        {source.percent}%
                      </Text>
                      <Text
                        style={styles.sourceViewers}
                        numberOfLines={1}
                      >
                        {viewerString}
                      </Text>
                    </View>

                    {/* Progress Bar Track and Animated Fill */}
                    <SourceProgressBar
                      percent={source.percent}
                      accessibilityLabel={a11yLabel}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <StatsEmptyState message="No client sources recorded for this period" />
        )}
      </View>
    </View>
  );
};

export default MarketingTab;

const styles = StyleSheet.create({
  tabContainer: {
    width: '100%',
    paddingBottom: 24,
  },
  sectionBlock: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionHeaderStack: {
    gap: 16,
    marginBottom: 28,
  },
  titleWithSubtitle: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  sectionSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  periodSelectorWrapper: {
    alignSelf: 'flex-start',
  },
  sourcesListContainer: {
    width: '100%',
    gap: 28,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceDetails: {
    flex: 1,
    gap: 10,
  },
  sourceLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  sourcePercent: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  sourceViewers: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
    paddingBottom: 2,
    flexShrink: 1,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(248, 155, 24, 0.96)',
  },
});
