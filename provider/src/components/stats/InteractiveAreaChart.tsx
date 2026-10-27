import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  PanResponder,
  TouchableOpacity,
  GestureResponderEvent,
  LayoutChangeEvent,
  AccessibilityInfo,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Line,
  Circle,
} from 'react-native-svg';

import {
  Point,
  computeChartCoordinates,
  getMonotoneCubicLinePath,
  getMonotoneCubicAreaPath,
} from '../../utils/chartMath';
import { StatsEmptyState } from './StatsEmptyState';

export interface ChartDataPoint {
  key: string;
  label: string;
  value: number;
}

export interface InteractiveAreaChartProps {
  data: ChartDataPoint[];
  tone: 'positive' | 'negative';
  selectedKey?: string;
  onSelectedKeyChange?: (key: string) => void;
  formatValue: (value: number) => string;
  accessibilityLabel?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

const PLOT_HEIGHT = 184;
const BASELINE_Y = 176;
const PADDING_TOP = 20;
const PADDING_HORIZONTAL = 24;
const DEFAULT_POINT_SPACING = 58;
const INDICATOR_TOUCH_RADIUS = 28;

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

export const InteractiveAreaChart: React.FC<InteractiveAreaChartProps> = ({
  data,
  tone,
  selectedKey: controlledSelectedKey,
  onSelectedKeyChange,
  formatValue,
  accessibilityLabel,
  height = 220,
  style,
}) => {
  const [viewportWidth, setViewportWidth] = useState(358);
  const [internalSelectedKey, setInternalSelectedKey] = useState<string>(
    controlledSelectedKey || (data.length > 0 ? data[0].key : '')
  );
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const selectedXRef = useRef<number>(0);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Sync reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setReduceMotion(enabled))
      .catch(() => {});
  }, []);

  // Determine active key
  const activeKey = controlledSelectedKey !== undefined ? controlledSelectedKey : internalSelectedKey;

  // Selected index fallback: match activeKey or default to last point
  const selectedIndex = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const foundIdx = data.findIndex((d) => d.key === activeKey);
    return foundIdx >= 0 ? foundIdx : data.length - 1;
  }, [data, activeKey]);

  // Point spacing & canvas width
  const pointSpacing = useMemo(() => {
    if (!data || data.length <= 1) return DEFAULT_POINT_SPACING;
    const minContentWidth = viewportWidth - PADDING_HORIZONTAL * 2;
    const naturalWidth = (data.length - 1) * DEFAULT_POINT_SPACING;
    if (naturalWidth < minContentWidth) {
      return minContentWidth / (data.length - 1);
    }
    return DEFAULT_POINT_SPACING;
  }, [data, viewportWidth]);

  const canvasWidth = useMemo(() => {
    if (!data || data.length === 0) return viewportWidth;
    if (data.length === 1) return Math.max(viewportWidth, 200);
    return Math.max(
      viewportWidth,
      PADDING_HORIZONTAL * 2 + (data.length - 1) * pointSpacing
    );
  }, [data, viewportWidth, pointSpacing]);

  // Compute (x, y) coordinates for all points
  const points: Point[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    const values = data.map((d) => d.value);
    return computeChartCoordinates(
      values,
      canvasWidth,
      PLOT_HEIGHT,
      PADDING_HORIZONTAL,
      PADDING_TOP,
      BASELINE_Y
    );
  }, [data, canvasWidth]);

  // Selected coordinates
  const selectedPoint = points[selectedIndex] || { x: canvasWidth / 2, y: BASELINE_Y - 40 };
  selectedXRef.current = selectedPoint.x;

  // Compute SVG paths
  const linePath = useMemo(() => getMonotoneCubicLinePath(points), [points]);
  const areaPath = useMemo(
    () => getMonotoneCubicAreaPath(points, BASELINE_Y),
    [points]
  );

  // Notify key change
  const handleSelectKey = useCallback(
    (key: string) => {
      setInternalSelectedKey(key);
      if (onSelectedKeyChange) {
        onSelectedKeyChange(key);
      }
    },
    [onSelectedKeyChange]
  );

  // Auto-scroll selected point into viewport
  const scrollSelectedIntoView = useCallback(
    (x: number) => {
      if (!scrollRef.current) return;
      const targetX = x - viewportWidth / 2;
      scrollRef.current.scrollTo({
        x: Math.max(0, Math.min(canvasWidth - viewportWidth, targetX)),
        animated: !reduceMotion,
      });
    },
    [viewportWidth, canvasWidth, reduceMotion]
  );

  // Scroll to selected on mount or when index changes
  useEffect(() => {
    if (points[selectedIndex]) {
      scrollSelectedIntoView(points[selectedIndex].x);
    }
  }, [selectedIndex, points, scrollSelectedIntoView]);

  // Find nearest index to an x-coordinate
  const findNearestIndex = useCallback(
    (touchX: number): number => {
      if (!points || points.length === 0) return 0;
      let closestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < points.length; i++) {
        const dist = Math.abs(points[i].x - touchX);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }
      return closestIdx;
    },
    [points]
  );

  // PanResponder to arbitrate between dragging indicator vs panning chart
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt: GestureResponderEvent) => {
        const touchX = evt.nativeEvent.locationX;
        const dist = Math.abs(touchX - selectedXRef.current);
        return dist <= INDICATOR_TOUCH_RADIUS;
      },
      onMoveShouldSetPanResponder: (evt: GestureResponderEvent) => {
        const touchX = evt.nativeEvent.locationX;
        const dist = Math.abs(touchX - selectedXRef.current);
        return dist <= INDICATOR_TOUCH_RADIUS;
      },
      onPanResponderGrant: () => {
        setIsScrollEnabled(false);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const touchX = evt.nativeEvent.locationX;
        const nearest = findNearestIndex(touchX);
        const currentData = dataRef.current;
        if (currentData && currentData[nearest]) {
          handleSelectKey(currentData[nearest].key);
        }
      },
      onPanResponderRelease: (evt: GestureResponderEvent) => {
        const touchX = evt.nativeEvent.locationX;
        const nearest = findNearestIndex(touchX);
        const currentData = dataRef.current;
        if (currentData && currentData[nearest]) {
          handleSelectKey(currentData[nearest].key);
        }
        setIsScrollEnabled(true);
      },
      onPanResponderTerminate: () => {
        setIsScrollEnabled(true);
      },
    })
  ).current;

  // Handle single tap anywhere on the plot area
  const handlePlotTap = useCallback(
    (evt: GestureResponderEvent) => {
      const touchX = evt.nativeEvent.locationX;
      const nearest = findNearestIndex(touchX);
      if (data[nearest]) {
        handleSelectKey(data[nearest].key);
      }
    },
    [data, findNearestIndex, handleSelectKey]
  );

  // Empty data state
  if (!data || data.length === 0) {
    return <StatsEmptyState message="No chart data available for this period" />;
  }

  // Visual Theme Tokens
  const isNegative = tone === 'negative';

  const strokeColor = isNegative ? '#E72B2B' : 'rgba(102, 246, 58, 0.9)';
  const indicatorStroke = isNegative
    ? 'rgba(231, 43, 43, 0.9)'
    : 'rgba(96, 96, 102, 0.96)';
  const dotColor = isNegative ? 'rgba(231, 43, 43, 0.9)' : 'rgba(0, 8, 20, 0.96)';

  // Tooltip colors & alignment
  const tooltipBg = isNegative
    ? 'rgba(248, 239, 239, 0.96)'
    : 'rgba(247, 247, 247, 0.96)';
  const tooltipTextColor = isNegative
    ? 'rgba(204, 41, 41, 0.9)'
    : 'rgba(96, 96, 102, 0.96)';

  // Tooltip flip calculation (flips left if close to right content edge)
  const estimatedTooltipWidth = 92;
  const shouldFlipTooltip =
    selectedPoint.x + 14 + estimatedTooltipWidth > canvasWidth - 12;
  const tooltipLeft = shouldFlipTooltip
    ? selectedPoint.x - 14 - estimatedTooltipWidth
    : selectedPoint.x + 14;

  const tooltipTop = Math.max(
    4,
    Math.min(PLOT_HEIGHT - 32, selectedPoint.y - 14)
  );

  const selectedData = data[selectedIndex] || data[0];

  return (
    <View
      style={[styles.container, { height }, style]}
      onLayout={(e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - viewportWidth) > 2) {
          setViewportWidth(w);
        }
      }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={
        accessibilityLabel ||
        `Interactive area chart. Currently showing ${selectedData.label}, value ${formatValue(
          selectedData.value
        )}.`
      }
      accessibilityActions={[
        { name: 'increment', label: 'Next day' },
        { name: 'decrement', label: 'Previous day' },
      ]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') {
          if (selectedIndex < data.length - 1) {
            handleSelectKey(data[selectedIndex + 1].key);
          }
        } else if (event.nativeEvent.actionName === 'decrement') {
          if (selectedIndex > 0) {
            handleSelectKey(data[selectedIndex - 1].key);
          }
        }
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        scrollEnabled={isScrollEnabled}
        showsHorizontalScrollIndicator={false}
        bounces={true}
        decelerationRate="normal"
        contentContainerStyle={{ width: canvasWidth, height }}
      >
        {/* ── 1. SVG Layer (Area fill, Curve line, Vertical indicator, Dot) ── */}
        <View style={[styles.plotContainer, { width: canvasWidth }]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handlePlotTap}
            style={StyleSheet.absoluteFill}
          >
            <Svg width={canvasWidth} height={PLOT_HEIGHT}>
              <Defs>
                {/* Red tone gradient */}
                <LinearGradient
                  id="chartAreaGradient_negative"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <Stop
                    offset="0%"
                    stopColor="rgba(231, 43, 43, 0.5)"
                    stopOpacity="1"
                  />
                  <Stop
                    offset="100%"
                    stopColor="rgba(243, 90, 90, 0)"
                    stopOpacity="0"
                  />
                </LinearGradient>

                {/* Green tone gradient */}
                <LinearGradient
                  id="chartAreaGradient_positive"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <Stop
                    offset="0%"
                    stopColor="rgba(102, 246, 58, 0.6)"
                    stopOpacity="1"
                  />
                  <Stop
                    offset="100%"
                    stopColor="rgba(102, 246, 58, 0)"
                    stopOpacity="0"
                  />
                </LinearGradient>
              </Defs>

              {/* Area Under Curve (Only if 2+ points) */}
              {points.length > 1 && (
                <Path
                  d={areaPath}
                  fill={`url(#chartAreaGradient_${tone})`}
                />
              )}

              {/* Monotone Cubic Curve Stroke */}
              {points.length > 1 && (
                <Path
                  d={linePath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Vertical Dashed Indicator Line */}
              <Line
                x1={selectedPoint.x}
                y1={0}
                x2={selectedPoint.x}
                y2={BASELINE_Y}
                stroke={indicatorStroke}
                strokeWidth={1}
                strokeDasharray="4 4"
              />

              {/* Intersection Dot */}
              <Circle
                cx={selectedPoint.x}
                cy={selectedPoint.y}
                r={4}
                fill={dotColor}
              />
            </Svg>
          </TouchableOpacity>

          {/* ── 2. Interactive Drag Handle (Over Indicator Line & Dot) ── */}
          <View
            {...panResponder.panHandlers}
            style={[
              styles.dragHandleOverlay,
              {
                left: selectedPoint.x - INDICATOR_TOUCH_RADIUS,
                width: INDICATOR_TOUCH_RADIUS * 2,
              },
            ]}
          />

          {/* ── 3. Tooltip Pill (Computed coordinates, flips on boundary) ── */}
          <View
            pointerEvents="none"
            style={[
              styles.tooltipPill,
              {
                left: tooltipLeft,
                top: tooltipTop,
                backgroundColor: tooltipBg,
              },
            ]}
          >
            <Text
              style={[styles.tooltipText, { color: tooltipTextColor }]}
              numberOfLines={1}
            >
              {formatValue(selectedData.value)}
            </Text>
          </View>
        </View>

        {/* ── 4. X-Axis Day Labels Row ("Mon 01", "Tue 02"...) ── */}
        <View style={[styles.daysRow, { width: canvasWidth }]}>
          {data.map((item, idx) => {
            const pt = points[idx] || { x: PADDING_HORIZONTAL + idx * pointSpacing };
            const isSelected = idx === selectedIndex;
            const labelColor = isSelected
              ? isNegative
                ? 'rgba(204, 41, 41, 0.9)'
                : 'rgba(0, 8, 20, 0.96)'
              : 'rgba(96, 96, 102, 0.96)';

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.7}
                onPress={() => handleSelectKey(item.key)}
                style={[
                  styles.dayLabelItem,
                  {
                    left: pt.x - 28,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayLabelText,
                    {
                      color: labelColor,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default InteractiveAreaChart;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  plotContainer: {
    height: PLOT_HEIGHT,
    position: 'relative',
  },
  dragHandleOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 10,
    // Transparent touch surface
    backgroundColor: 'transparent',
  },
  tooltipPill: {
    position: 'absolute',
    height: 28,
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  tooltipText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  daysRow: {
    height: 24,
    position: 'relative',
    marginTop: 12,
  },
  dayLabelItem: {
    position: 'absolute',
    width: 56,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabelText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
