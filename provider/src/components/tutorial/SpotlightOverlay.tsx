import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
  Easing,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Rect,
  Circle,
} from 'react-native-svg';
import { useFirstTime, TargetRect } from '../../context/FirstTimeContext';
import { useBusinessStore } from '../../store/businessStore';
import { TutorialIconType } from '../../constants/tutorialSteps';
import { typography } from '../../constants/theme';

// Layout & Figma geometry constants
const BUBBLE_WIDTH = 358;
const BUBBLE_RADIUS = 16;
const ARROW_WIDTH = 38;
const ARROW_HEIGHT = 24;
const ARROW_CLEARANCE = 4; // 4px clean breathing clearance between arrow tip and card
const GAP = ARROW_HEIGHT + ARROW_CLEARANCE; // 28px total gap so arrow tip never collides with target card

// Realistic default measured heights by step to eliminate any initial measurement frame jumps
const DEFAULT_BUBBLE_HEIGHTS: Record<number, number> = {
  1: 250,
  2: 185,
  3: 185,
  4: 210,
  5: 210,
  6: 268,
  7: 268,
  8: 235,
  9: 210,
  10: 210,
  11: 210,
};

// ── 1:1 Vector & Dynamic Icons for the Tutorial Bubble ─────────────────────────

function TriangleIcon({ size = 12, color = '#22C55E' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={Math.round(size * 0.9)} viewBox="93.01 5.45 9.98 9.05" fill="none">
      <Path
        d="M94.7967 8.61237C95.9194 6.81161 96.4807 5.91123 97.2163 5.64C97.7225 5.45333 98.2775 5.45333 98.7837 5.64C99.5193 5.91123 100.081 6.81161 101.203 8.61237C102.467 10.6392 103.099 11.6527 102.987 12.4889C102.911 13.0625 102.626 13.5865 102.188 13.9581C101.55 14.5 100.366 14.5 98 14.5C95.6336 14.5 94.4504 14.5 93.8119 13.9581C93.374 13.5865 93.0889 13.0625 93.0125 12.4889C92.9013 11.6527 93.5331 10.6392 94.7967 8.61237Z"
        fill={color}
      />
    </Svg>
  );
}

function TutorialBubbleIcon({
  icon,
  performanceStake = '12%',
}: {
  icon: TutorialIconType;
  performanceStake?: string;
}) {
  if (!icon) return null;

  switch (icon) {
    case 'calendar-days':
      return (
        <Image
          source={require('../../../assets/images/dashboard/appointments_calendar.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'loader':
      return (
        <Image
          source={require('../../../assets/images/dashboard/in_progress_spinner.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'user-multiple':
      return (
        <Image
          source={require('../../../assets/images/dashboard/my_staffs_group.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'dashboard-circle':
      return (
        <Image
          source={require('../../../assets/images/dashboard/categories_grid.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'plus-sign-circle':
      return (
        <Image
          source={require('../../../assets/images/dashboard/manage_service_add.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'album-02':
      return (
        <Image
          source={require('../../../assets/images/dashboard/post_photos_camera.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'users-round':
      return (
        <Image
          source={require('../../../assets/images/dashboard/staff_management_users.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'chat-01':
      return (
        <Image
          source={require('../../../assets/images/dashboard/reviews_chat_bubbles.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'task-edit-02':
      return (
        <Image
          source={require('../../../assets/images/dashboard/business_folder.png')}
          style={styles.bubbleIconImage}
          resizeMode="contain"
        />
      );
    case 'chart-analysis':
      return (
        <View style={styles.bubblePerformanceStake}>
          <TriangleIcon size={12} color="#22C55E" />
          <Text style={styles.bubblePerformancePercentText}>{performanceStake}</Text>
        </View>
      );
    default:
      return null;
  }
}

export const SpotlightOverlay: React.FC = () => {
  const {
    phase,
    currentStep,
    activeTargetRect,
    handleNextStep,
    scrollOffsetY,
    isStepTransitioning,
  } = useFirstTime();
  const { business } = useBusinessStore();

  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive bubble width (max 358px per Figma, clamped on smaller viewports)
  const bubbleWidth = Math.min(windowWidth - 24, BUBBLE_WIDTH);

  // Animation values for smooth transitions
  const bubbleTopAnim = useRef(new Animated.Value(0)).current;
  const bubbleOpacityAnim = useRef(new Animated.Value(0)).current;
  const cutoutAnimProgress = useRef(new Animated.Value(0)).current;

  // Track previous step side and coordinates for gliding vs cross-fading
  const prevSideRef = useRef<'below' | 'above' | null>(null);
  const prevTargetRef = useRef<TargetRect | null>(null);
  const lastLoggedStepRef = useRef<number | null>(null);

  // Exact measured bubble heights by step number (rendered invisible first to eliminate jumps)
  const [measuredHeights, setMeasuredHeights] = useState<Record<number, number>>({});
  // Cutout spotlight target coordinates (interpolated during glides)
  const [cutoutRect, setCutoutRect] = useState<TargetRect | null>(null);

  const stepNumber = currentStep?.stepNumber ?? 1;
  const isHeightMeasured = Boolean(measuredHeights[stepNumber]);
  const bubbleMeasuredHeight =
    measuredHeights[stepNumber] || DEFAULT_BUBBLE_HEIGHTS[stepNumber] || 225;

  // Floating bottom tab bar (80px) + white gradient fade (36px) + offset + 12px margin
  const lockedBottomOffset = insets.bottom > 0 ? insets.bottom : 16;
  const BOTTOM_OBSTRUCTION_HEIGHT = 80 + 36 + lockedBottomOffset + 12;

  // Calculate placement boundaries (strictly above bottom tab bar and its fade)
  const topLimit = insets.top + 16;
  const bottomLimit = windowHeight - BOTTOM_OBSTRUCTION_HEIGHT;

  // Current target rect
  const target = activeTargetRect;

  // Placement rule calculation:
  // Universal standard: bubble sits comfortably BELOW target
  // Only fall back to 'above' if spaceBelow is constrained and spaceAbove has sufficient room
  let side: 'below' | 'above' = 'below';
  let spaceBelow = 0;
  let spaceAbove = 0;
  let bubbleTop = 0;
  let bubbleLeft = 0;
  let arrowLeft = 0;

  if (target) {
    spaceBelow = bottomLimit - (target.y + target.height);
    spaceAbove = target.y - topLimit;

    if (spaceBelow < bubbleMeasuredHeight + GAP && spaceAbove >= bubbleMeasuredHeight + GAP) {
      side = 'above';
    } else {
      side = 'below';
    }

    const computedTop =
      side === 'below'
        ? target.y + target.height + GAP
        : target.y - GAP - bubbleMeasuredHeight;

    // Clamp bubble so it never leaves safe screen bounds or collides with target
    if (side === 'below') {
      bubbleTop = Math.max(
        target.y + target.height + GAP,
        Math.min(computedTop, windowHeight - insets.bottom - 12 - bubbleMeasuredHeight)
      );
    } else {
      // Must strictly never penetrate target top boundary (arrow tip remains ARROW_CLEARANCE clear)
      bubbleTop = Math.min(
        target.y - GAP - bubbleMeasuredHeight,
        Math.max(topLimit, computedTop)
      );
    }

    bubbleLeft = Math.max(12, (windowWidth - bubbleWidth) / 2);
    const targetCenterX = target.x + target.width / 2;
    // Arrow tip points at target horizontal center, clamped inside bubble's rounded corners
    const idealArrowLeft = targetCenterX - bubbleLeft - ARROW_WIDTH / 2;
    const minArrowLeft = BUBBLE_RADIUS; // 16px
    const maxArrowLeft = bubbleWidth - ARROW_WIDTH - BUBBLE_RADIUS;
    arrowLeft = Math.max(minArrowLeft, Math.min(maxArrowLeft, idealArrowLeft));
  }

  // ── Cutout Spotlight Animation (Glides smoothly between target rects) ─────────
  useEffect(() => {
    if (!target) return;

    if (!prevTargetRef.current) {
      // First step: instant setup without delay
      setCutoutRect(target);
      prevTargetRef.current = target;
      return;
    }

    const from = prevTargetRef.current;
    const to = target;
    prevTargetRef.current = target;

    cutoutAnimProgress.setValue(0);
    const interp = (a: number, b: number, t: number) => a + (b - a) * t;

    const listenerId = cutoutAnimProgress.addListener(({ value }) => {
      setCutoutRect({
        targetId: to.targetId,
        x: interp(from.x, to.x, value),
        y: interp(from.y, to.y, value),
        width: interp(from.width, to.width, value),
        height: interp(from.height, to.height, value),
        borderRadius: interp(from.borderRadius, to.borderRadius, value),
      });
    });

    Animated.timing(cutoutAnimProgress, {
      toValue: 1,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setCutoutRect(to);
      cutoutAnimProgress.removeListener(listenerId);
    });

    return () => {
      cutoutAnimProgress.removeListener(listenerId);
    };
  }, [target, cutoutAnimProgress]);

  // ── Bubble Animation (Glide if same side, Cross-fade if different side) ──────
  useEffect(() => {
    if (!target || !isHeightMeasured) return;

    const prevSide = prevSideRef.current;

    if (prevSide === null) {
      // Very first step: position directly, then fade in smoothly (no jump)
      bubbleTopAnim.setValue(bubbleTop);
      Animated.timing(bubbleOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      prevSideRef.current = side;
    } else if (prevSide === side) {
      // Same side: glide bubble to new position over 250ms
      Animated.parallel([
        Animated.timing(bubbleTopAnim, {
          toValue: bubbleTop,
          duration: 250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(bubbleOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
      prevSideRef.current = side;
    } else {
      // Different side: cross-fade (~200ms) instead of sliding across target card
      Animated.sequence([
        Animated.timing(bubbleOpacityAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: false,
        }),
        Animated.timing(bubbleTopAnim, {
          toValue: bubbleTop,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(bubbleOpacityAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }),
      ]).start();
      prevSideRef.current = side;
    }
  }, [target, bubbleTop, side, isHeightMeasured, bubbleTopAnim, bubbleOpacityAnim]);

  // ── Dev-Only Trace Logging (One line per step) ──────────────────────────────
  useEffect(() => {
    if (
      __DEV__ &&
      phase === 'tour' &&
      currentStep &&
      target &&
      isHeightMeasured &&
      lastLoggedStepRef.current !== currentStep.stepNumber
    ) {
      lastLoggedStepRef.current = currentStep.stepNumber;
      console.log(
        `[Tutorial Trace] Step ${currentStep.stepNumber} (${currentStep.targetId}): ` +
        `target={x:${Math.round(target.x)}, y:${Math.round(target.y)}, w:${Math.round(target.width)}, h:${Math.round(target.height)}} ` +
        `spaceBelow=${Math.round(spaceBelow)} spaceAbove=${Math.round(spaceAbove)} side=${side} scrollY=${Math.round(scrollOffsetY || 0)}`
      );
    }
  }, [
    phase,
    currentStep,
    target,
    isHeightMeasured,
    spaceBelow,
    spaceAbove,
    side,
    scrollOffsetY,
  ]);

  if (
    phase !== 'tour' ||
    !currentStep ||
    !target ||
    (target.targetId && target.targetId !== currentStep.targetId)
  ) {
    return null;
  }

  // Construct hardware-accelerated evenodd cutout path for full-screen dim
  const activeSpotlight = cutoutRect || target;
  const r = Math.min(
    activeSpotlight.borderRadius,
    activeSpotlight.width / 2,
    activeSpotlight.height / 2
  );
  const tx = activeSpotlight.x;
  const ty = activeSpotlight.y;
  const tw = activeSpotlight.width;
  const th = activeSpotlight.height;
  const cutoutPath = isStepTransitioning
    ? `M 0 0 H ${windowWidth} V ${windowHeight} H 0 Z`
    : `M 0 0 H ${windowWidth} V ${windowHeight} H 0 Z M ${tx + r} ${ty} h ${tw - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${th - 2 * r} a ${r} ${r} 0 0 1 -${r} ${r} h -${tw - 2 * r} a ${r} ${r} 0 0 1 -${r} -${r} v -${th - 2 * r} a ${r} ${r} 0 0 1 ${r} -${r} Z`;

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {/* ── Dimmed Screen Backdrop with Cutout & Touch Shield (Covers entire screen + tab bar, zIndex: 9995) ── */}
      {/* Absorbs all touches/clicks across the entire screen outside the bubble so nothing underneath is clickable */}
      <Pressable
        style={styles.backdropPressable}
        onPress={(e) => {
          e?.stopPropagation?.();
        }}
      >
        <Svg
          width={windowWidth}
          height={windowHeight}
          pointerEvents="none"
        >
          <Path
            d={cutoutPath}
            fill="rgba(0, 0, 0, 0.5)"
            fillRule="evenodd"
          />
        </Svg>
      </Pressable>


      {/* ── Translucent Dark Tutorial Bubble ── */}
      <Animated.View
        style={[
          styles.bubbleContainer,
          {
            width: bubbleWidth,
            left: bubbleLeft,
            top: bubbleTopAnim,
            opacity: isHeightMeasured && !isStepTransitioning ? bubbleOpacityAnim : 0,
          },
        ]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 60 && Math.abs(h - (measuredHeights[stepNumber] || 0)) > 2) {
            setMeasuredHeights((prev) => ({
              ...prev,
              [stepNumber]: h,
            }));
          }
        }}
      >
        {/* Pointing Arrow Notch matching 1:1 Figma curve */}
        {side === 'below' ? (
          /* Arrow pointing upward to target above */
          <View style={[styles.arrowUpWrapper, { left: arrowLeft }]}>
            <Svg width={38} height={24} viewBox="497.5 213.9 38 23.7" fill="none">
              <Path
                d="M497.5 237.577C498 237.577 497.568 239.52 498.2 238.247L507.333 219.839C510.274 213.914 518.726 213.914 521.666 219.839L528.262 233.133C529.612 235.855 532.389 237.577 535.428 237.577H497.5Z"
                fill="#606066"
              />
            </Svg>
          </View>
        ) : (
          /* Arrow pointing downward to target below (Exact mirrored SVG curve, no CSS rotation) */
          <View style={[styles.arrowDownWrapper, { left: arrowLeft }]}>
            <Svg width={38} height={24} viewBox="497.5 213.9 38 23.7" fill="none">
              <Path
                d="M497.5 213.9C498 213.9 497.568 211.957 498.2 213.23L507.333 231.638C510.274 237.563 518.726 237.563 521.666 231.638L528.262 218.344C529.612 215.622 532.389 213.9 535.428 213.9H497.5Z"
                fill="#606066"
              />
            </Svg>
          </View>
        )}

        {/* ── Header: Icon + Title ── */}
        <View style={styles.headerRow}>
          {currentStep.icon && (
            <View style={styles.iconContainer}>
              <TutorialBubbleIcon
                icon={currentStep.icon}
                performanceStake={business.performanceStake}
              />
            </View>
          )}
          <Text style={styles.titleText}>{currentStep.title}</Text>
        </View>

        {/* ── Body Text ── */}
        <Text style={styles.bodyText}>{currentStep.body}</Text>

        {/* ── Action Button ("Next" or "Finally") ── */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.actionButton}
            onPress={handleNextStep}
          >
            <Text style={styles.actionButtonText}>
              {currentStep.buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9995,
    elevation: 25,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
  },
  bubbleContainer: {
    position: 'absolute',
    backgroundColor: '#606066',
    borderRadius: BUBBLE_RADIUS,
    padding: 20,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 10,
  },
  arrowUpWrapper: {
    position: 'absolute',
    top: -23,
    width: ARROW_WIDTH,
    height: ARROW_HEIGHT,
  },
  arrowDownWrapper: {
    position: 'absolute',
    bottom: -23,
    width: ARROW_WIDTH,
    height: ARROW_HEIGHT,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconContainer: {
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleIconImage: {
    width: 24,
    height: 24,
  },
  bubblePerformanceStake: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
  },
  bubblePerformancePercentText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
    color: '#22C55E',
    includeFontPadding: false,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  bodyText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 20,
    includeFontPadding: false,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  actionButton: {
    width: 106,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.button,
    color: '#000814',
    includeFontPadding: false,
  },
});

export default SpotlightOverlay;
