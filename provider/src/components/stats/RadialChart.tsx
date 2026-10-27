import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  AccessibilityInfo,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StatsEmptyState } from './StatsEmptyState';

export interface RadialChartSlice {
  key: string;
  value: number;
  color: string;
  labelPrimary: string;
  labelSecondary?: string;
  textColor?: string;
}

export interface RadialChartProps {
  slices?: RadialChartSlice[];
  innerRadiusRatio?: number; // 0 = full pie, > 0 = donut (default: 0.55)
  labelMode?: 'horizontal' | 'radial';
  startAngleOffset?: number; // Starting angle offset in degrees (default: 0)
  accessibilityLabel?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  // Progress Ring props added for Prompt 5 notifications approve/decline sequences
  progress?: number; // 0 to 100
  ringThickness?: number;
  trackColor?: string;
  progressColor?: string;
  centerContent?: React.ReactNode;
}

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
 * Converts polar coordinates to Cartesian (x, y), starting with 0° at 12 o'clock.
 */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

/**
 * Generates an SVG path string for a donut segment or full pie slice from startAngle to endAngle.
 */
function describeDonutSegment(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const sweep = endAngle - startAngle;
  const safeEndAngle = sweep >= 360 ? startAngle + 359.999 : endAngle;

  const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, safeEndAngle);
  const largeArcFlag = sweep > 180 ? 1 : 0;

  if (innerRadius > 0) {
    const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
    const endInner = polarToCartesian(cx, cy, innerRadius, safeEndAngle);

    return [
      `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
      `A ${outerRadius.toFixed(2)} ${outerRadius.toFixed(2)} 0 ${largeArcFlag} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
      `L ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
      `A ${innerRadius.toFixed(2)} ${innerRadius.toFixed(2)} 0 ${largeArcFlag} 0 ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
      'Z',
    ].join(' ');
  }

  // Full pie slice (innerRadius = 0)
  return [
    `M ${cx.toFixed(2)} ${cy.toFixed(2)}`,
    `L ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${outerRadius.toFixed(2)} ${outerRadius.toFixed(2)} 0 ${largeArcFlag} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export const RadialChart: React.FC<RadialChartProps> = ({
  slices = [],
  innerRadiusRatio = 0.55,
  labelMode = 'horizontal',
  startAngleOffset = 0,
  accessibilityLabel,
  size: propSize,
  style,
  progress,
  ringThickness = 12,
  trackColor = '#D9D9D9',
  progressColor = '#41DF21',
  centerContent,
}) => {
  // ── Progress Ring Mode (Prompt 5 Notifications Approve/Decline) ──
  if (progress !== undefined) {
    const ringSize = propSize || 145;
    const ringCenter = ringSize / 2;
    const thickness = ringThickness;
    const outerR = ringSize / 2;
    const innerR = Math.max(0, outerR - thickness);
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const sweepAngle = (clampedProgress / 100) * 360;

    const trackPath = describeDonutSegment(ringCenter, ringCenter, innerR, outerR, 0, 360);
    const progressPath =
      sweepAngle > 0
        ? describeDonutSegment(ringCenter, ringCenter, innerR, outerR, 0, sweepAngle)
        : '';

    return (
      <View
        style={[
          {
            width: ringSize,
            height: ringSize,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: clampedProgress }}
      >
        <Svg width={ringSize} height={ringSize}>
          <Path d={trackPath} fill={trackColor} />
          {sweepAngle > 0 && <Path d={progressPath} fill={progressColor} />}
        </Svg>
        {centerContent && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            {centerContent}
          </View>
        )}
      </View>
    );
  }

  const [containerWidth, setContainerWidth] = useState<number>(propSize || 260);
  const [reduceMotion, setReduceMotion] = useState(false);
  const animProgress = useRef(new Animated.Value(0)).current;
  const [currentProgress, setCurrentProgress] = useState(0);

  // Check reduced motion
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setReduceMotion(enabled))
      .catch(() => {});
  }, []);

  // Animate sweep on mount (~600ms)
  useEffect(() => {
    if (reduceMotion) {
      animProgress.setValue(1);
      setCurrentProgress(1);
      return;
    }

    animProgress.setValue(0);
    const listenerId = animProgress.addListener(({ value }) => {
      setCurrentProgress(value);
    });

    Animated.timing(animProgress, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animProgress.removeListener(listenerId);
    };
  }, [animProgress, reduceMotion, slices]);

  // Derived dimensions
  const chartSize = propSize || Math.min(containerWidth, 260);
  const center = chartSize / 2;
  const outerRadius = chartSize / 2 - 2; // leave 2px padding for border
  const isPie = innerRadiusRatio <= 0;
  const innerRadius = isPie ? 0 : outerRadius * Math.max(0, Math.min(0.9, innerRadiusRatio));
  
  // For pie, place centroid at 58% of outerRadius; for donut, at midpoint between inner and outer
  const midRadius = isPie ? outerRadius * 0.58 : (innerRadius + outerRadius) / 2;

  // Handle total sum
  const totalValue = useMemo(() => {
    return slices.reduce((acc, s) => acc + (s.value > 0 ? s.value : 0), 0);
  }, [slices]);

  // Compute slice angles and centroid positions
  const computedSlices = useMemo(() => {
    if (totalValue === 0 || slices.length === 0) return [];

    let currentAngle = startAngleOffset;
    return slices.map((slice) => {
      const sliceFraction = slice.value / totalValue;
      const fullSweep = sliceFraction * 360;
      const startAngle = currentAngle;
      const endAngle = startAngle + fullSweep;
      currentAngle = endAngle;

      const midAngle = (startAngle + endAngle) / 2;
      const centroid = polarToCartesian(center, center, midRadius, midAngle);

      // Compute radial label rotation keeping text strictly readable (never upside down)
      let rotation = 0;
      if (labelMode === 'radial') {
        let rot = midAngle - 90;
        while (rot > 180) rot -= 360;
        while (rot < -180) rot += 360;
        if (rot > 90) {
          rot -= 180;
        } else if (rot < -90) {
          rot += 180;
        }
        rotation = rot;
      }

      return {
        ...slice,
        startAngle,
        endAngle,
        fullSweep,
        midAngle,
        centroid,
        rotation,
      };
    });
  }, [slices, totalValue, center, midRadius, labelMode, startAngleOffset]);

  // Fallback empty state
  if (!slices || slices.length === 0 || totalValue === 0) {
    return <StatsEmptyState message="No data available for chart" />;
  }

  // Accessibility summary
  const defaultA11yLabel = useMemo(() => {
    return slices
      .map((s) => `${s.labelSecondary || s.key} ${s.labelPrimary}`)
      .join(', ');
  }, [slices]);

  return (
    <View
      style={[styles.wrapper, style]}
      onLayout={(e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - containerWidth) > 4) {
          setContainerWidth(w);
        }
      }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || `Chart: ${defaultA11yLabel}`}
    >
      <View style={[styles.chartContainer, { width: chartSize, height: chartSize }]}>
        <Svg width={chartSize} height={chartSize}>
          {computedSlices.map((slice) => {
            // Scale end angle by animation progress
            const sweep = slice.fullSweep * currentProgress;
            const animatedEndAngle = slice.startAngle + sweep;
            const pathData = describeDonutSegment(
              center,
              center,
              innerRadius,
              outerRadius,
              slice.startAngle,
              animatedEndAngle
            );

            return (
              <Path
                key={slice.key}
                d={pathData}
                fill={slice.color}
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinejoin="round"
              />
            );
          })}
        </Svg>

        {/* ── Slice Labels at Centroids (Horizontal or Radial Mode) ── */}
        {currentProgress > 0.4 &&
          computedSlices.map((slice) => {
            const textColor =
              slice.textColor ||
              (slice.color === '#D9B8FF' || slice.color === 'rgba(235, 235, 245, 0.96)'
                ? 'rgba(0, 8, 20, 0.96)'
                : '#FFFFFF');

            // Shrink font to fit slice; if tiny (< 26° sweep), omit secondary name
            const isNarrowSlice = slice.fullSweep < 50;
            const isTinySlice = slice.fullSweep < 26;
            const showSecondary = slice.labelSecondary && !isTinySlice;

            const primaryFontSize = isTinySlice ? 13 : isNarrowSlice ? 14 : isPie ? 16 : 16;
            const secondaryFontSize = isNarrowSlice ? 11 : isPie ? 13 : 13;

            const transformStyle =
              labelMode === 'radial' && slice.rotation !== 0
                ? [{ rotate: `${slice.rotation.toFixed(1)}deg` }]
                : undefined;

            return (
              <View
                key={`label-${slice.key}`}
                pointerEvents="none"
                style={[
                  styles.labelCentroidContainer,
                  {
                    left: slice.centroid.x - 50,
                    top: slice.centroid.y - (showSecondary ? 22 : 12),
                    transform: transformStyle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.labelPrimary,
                    { color: textColor, fontSize: primaryFontSize },
                  ]}
                  numberOfLines={1}
                >
                  {slice.labelPrimary}
                </Text>
                {showSecondary ? (
                  <Text
                    style={[
                      styles.labelSecondary,
                      { color: textColor, fontSize: secondaryFontSize },
                    ]}
                    numberOfLines={1}
                  >
                    {slice.labelSecondary}
                  </Text>
                ) : null}
              </View>
            );
          })}
      </View>
    </View>
  );
};

export default RadialChart;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelCentroidContainer: {
    position: 'absolute',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelPrimary: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.5,
    textAlign: 'center',
    includeFontPadding: false,
  },
  labelSecondary: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
