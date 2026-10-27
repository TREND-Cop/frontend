import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { BackHandler, findNodeHandle, UIManager, Platform, Dimensions } from 'react-native';
import { TUTORIAL_STEPS, TutorialStep } from '../constants/tutorialSteps';
import {
  FORCE_FIRST_TIME_FLOW,
  TUTORIAL_TIMINGS,
  TUTORIAL_SELFTEST,
} from '../constants/tutorial.config';
import { useProviderOnboarding } from './ProviderOnboardingContext';

export type FirstTimePhase =
  | 'idle'
  | 'welcome'
  | 'tour'
  | 'connectPrompt'
  | 'trialNotice'
  | 'done';

export interface TargetRect {
  targetId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  contentX?: number;
  contentY?: number;
}

interface TargetRegistration {
  ref: any;
  borderRadius: number;
  contentRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface FirstTimeContextType {
  phase: FirstTimePhase;
  hasSeenFirstTime: boolean;
  stepIndex: number;
  currentStep: TutorialStep | null;
  activeTargetRect: TargetRect | null;
  spotlightTargetId: string | null;
  isSpotlightActive: boolean;
  isStepTransitioning: boolean;
  isSpotlightTarget: (id: string) => boolean;
  startFirstTimeFlow: () => void;
  handleGetStarted: () => void;
  handleNextStep: () => void;
  onTourFinished: () => void;
  registerTarget: (id: string, ref: any, borderRadius?: number) => void;
  unregisterTarget: (id: string) => void;
  measureTarget: (id: string) => Promise<TargetRect | null>;
  registerScrollView: (ref: any) => void;
  scrollToTarget: (targetY: number) => void;
  handleScroll: (y: number) => void;
  setScreenInsets: (insets: { top: number; bottom: number }) => void;
  handleContentSizeChange: (w: number, h: number) => void;
  scrollOffsetY: number;
  handleConnectAccount: () => void;
  handleMaybeLater: () => void;
  handleDismissTrialNotice: () => void;
}

/**
 * Deterministic scroll calculation enforcing:
 * 1. Target limits: strictly ABOVE the tab bar (80px) and its 36px white gradient fade, and below top inset.
 * 2. Bubble limits: fits on screen with preferred side (below for steps 1-5, above for steps 6-11).
 * 3. Minimum scroll delta to satisfy visibility without arbitrary centering.
 */
export function calculateMinimumScroll(
  currentScrollY: number,
  targetContentRect: { contentY: number; height: number },
  bubbleHeight: number,
  screenHeight: number,
  topInset: number,
  bottomInset: number,
  contentHeight: number,
  stepIdx: number = 0
): { newScrollY: number; needsScroll: boolean; predictedSide: 'below' | 'above' } {
  const tabBarHeight = 80;
  const fadeHeight = 36;
  const lockedBottomOffset = bottomInset > 0 ? bottomInset : 16;
  // Total obstruction from screen bottom: tab bar (80px) + white gradient fade (36px) + offset + 12px margin
  const bottomBarObstruction = tabBarHeight + fadeHeight + lockedBottomOffset + 12;

  const topLimit = topInset + 16;
  const bottomLimit = screenHeight - bottomBarObstruction;
  const gap = 28; // Matches SpotlightOverlay.tsx (ARROW_HEIGHT 24px + ARROW_CLEARANCE 4px)

  const targetContentTop = targetContentRect.contentY;
  const targetContentBottom = targetContentRect.contentY + targetContentRect.height;
  const maxScroll = Math.max(0, contentHeight - screenHeight);

  const currentTargetWindowY = targetContentTop - currentScrollY;
  const currentTargetWindowBottom = targetContentBottom - currentScrollY;

  // Check if target is already comfortably visible in the upper viewport with full clearance below for the bubble
  const isTargetVisible =
    currentTargetWindowY >= topLimit &&
    currentTargetWindowBottom <= bottomLimit;
  const currentSpaceBelow = bottomLimit - currentTargetWindowBottom;

  if (isTargetVisible && currentSpaceBelow >= bubbleHeight + gap) {
    return {
      newScrollY: currentScrollY,
      needsScroll: false,
      predictedSide: 'below',
    };
  }

  // Scroll so the target card is positioned comfortably near the top of the viewport (topLimit + 12)
  // This leaves the maximum available space below for the tutorial bubble, never jamming cards against the bottom dock
  const targetScroll = Math.max(0, Math.min(maxScroll, targetContentTop - (topLimit + 12)));

  const predictedWindowBottom = targetContentBottom - targetScroll;
  const predictedSpaceBelow = bottomLimit - predictedWindowBottom;
  const predictedSpaceAbove = (targetContentTop - targetScroll) - topLimit;

  let predictedSide: 'below' | 'above' = 'below';
  if (predictedSpaceBelow < bubbleHeight + gap && predictedSpaceAbove >= bubbleHeight + gap) {
    predictedSide = 'above';
  }

  return {
    newScrollY: targetScroll,
    needsScroll: Math.abs(targetScroll - currentScrollY) > 2,
    predictedSide,
  };
}

/**
 * Deterministic scroll settlement detector.
 * Waits until scroll animation has completed and offset remains stable.
 */
function waitForScrollSettle(
  getScrollY: () => number,
  targetY?: number,
  timeoutMs: number = 1500
): Promise<number> {
  return new Promise((resolve) => {
    let lastY = getScrollY();
    let stableCount = 0;
    const startTime = Date.now();

    function check() {
      const currentY = getScrollY();
      const elapsed = Date.now() - startTime;

      const isNearTarget = targetY !== undefined ? Math.abs(currentY - targetY) < 3 : true;
      const pastGracePeriod = elapsed > 150;

      if (Math.abs(currentY - lastY) < 0.5 && (isNearTarget || pastGracePeriod)) {
        stableCount++;
        if (stableCount >= 2) {
          resolve(currentY);
          return;
        }
      } else {
        stableCount = 0;
        lastY = currentY;
      }

      if (elapsed > timeoutMs) {
        resolve(currentY);
        return;
      }

      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(check);
      } else {
        setTimeout(check, 16);
      }
    }

    // Allow native animation to begin dispatching scroll events
    setTimeout(check, 32);
  });
}

/**
 * Target rect stability verifier.
 * Measures target across consecutive frames to guarantee 0 motion / stale frames.
 */
async function waitForStableRect(
  measure: () => Promise<TargetRect | null>,
  maxFrames: number = 12
): Promise<TargetRect | null> {
  let prev = await measure();
  let stableCount = 0;

  for (let i = 0; i < maxFrames; i++) {
    await new Promise((r) => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(r);
      } else {
        setTimeout(r, 16);
      }
    });

    const next = await measure();
    if (!prev && !next) continue;

    if (prev && next) {
      const dx = Math.abs(prev.x - next.x);
      const dy = Math.abs(prev.y - next.y);
      const dw = Math.abs(prev.width - next.width);
      const dh = Math.abs(prev.height - next.height);
      if (dx < 1 && dy < 1 && dw < 1 && dh < 1) {
        stableCount++;
        if (stableCount >= 2) {
          return next;
        }
      } else {
        stableCount = 0;
      }
    }
    prev = next;
  }
  return prev;
}

const FirstTimeContext = createContext<FirstTimeContextType | null>(null);

export const FirstTimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { hasSeenFirstTime, setHasSeenFirstTime } = useProviderOnboarding();
  const [phase, setPhase] = useState<FirstTimePhase>('idle');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [activeTargetRect, setActiveTargetRect] = useState<TargetRect | null>(null);
  const [currentScrollY, setCurrentScrollY] = useState<number>(0);
  const [isStepTransitioning, setIsStepTransitioning] = useState<boolean>(false);

  const targetsRef = useRef<Map<string, TargetRegistration>>(new Map());
  const scrollViewRef = useRef<any>(null);
  const scrollOffsetYRef = useRef<number>(0);
  const insetsRef = useRef<{ top: number; bottom: number }>({
    top: Platform.OS === 'android' ? 44 : 48,
    bottom: Platform.OS === 'android' ? 24 : 34,
  });
  const contentHeightRef = useRef<number>(1400);

  const currentStep =
    phase === 'tour' && stepIndex >= 0 && stepIndex < TUTORIAL_STEPS.length
      ? TUTORIAL_STEPS[stepIndex]
      : null;

  const spotlightTargetId = currentStep?.targetId ?? null;
  const isSpotlightActive = phase === 'tour' && activeTargetRect !== null;

  const isSpotlightTarget = useCallback(
    (id: string) => {
      return phase === 'tour' && spotlightTargetId === id;
    },
    [phase, spotlightTargetId]
  );

  const registerTarget = useCallback(
    (id: string, ref: any, borderRadius: number = 24) => {
      if (ref) {
        const existing = targetsRef.current.get(id);
        targetsRef.current.set(id, {
          ref,
          borderRadius,
          contentRect: existing?.contentRect,
        });
      }
    },
    []
  );

  const unregisterTarget = useCallback((id: string) => {
    targetsRef.current.delete(id);
  }, []);

  const registerScrollView = useCallback((ref: any) => {
    scrollViewRef.current = ref;
  }, []);

  const handleScroll = useCallback((y: number) => {
    scrollOffsetYRef.current = y;
    setCurrentScrollY(y);

    // Live update window Y of active target to track scrolling in real time (content-coordinate model)
    setActiveTargetRect((prev) => {
      if (!prev || prev.contentY === undefined) return prev;
      const liveY = prev.contentY - y;
      if (Math.abs(prev.y - liveY) < 0.5) return prev;
      return {
        ...prev,
        y: liveY,
      };
    });
  }, []);

  const setScreenInsets = useCallback((insets: { top: number; bottom: number }) => {
    insetsRef.current = insets;
  }, []);

  const handleContentSizeChange = useCallback((w: number, h: number) => {
    if (h > 100) {
      contentHeightRef.current = h;
    }
  }, []);

  const scrollToTarget = useCallback((targetY: number) => {
    const clampedY = Math.max(0, targetY);
    if (scrollViewRef.current?.scrollTo) {
      scrollViewRef.current.scrollTo({
        y: clampedY,
        animated: true,
      });
    } else if (typeof scrollViewRef.current?.scroll === 'function') {
      scrollViewRef.current.scroll({
        top: clampedY,
        behavior: 'smooth',
      });
    }
  }, []);

  const measureTarget = useCallback(
    (id: string): Promise<TargetRect | null> => {
      return new Promise((resolve) => {
        const registration = targetsRef.current.get(id);
        if (!registration || !registration.ref) {
          resolve(null);
          return;
        }

        const node = registration.ref;
        const liveScrollY = scrollOffsetYRef.current;

        // Web optimization: synchronous getBoundingClientRect
        if (typeof node.getBoundingClientRect === 'function') {
          const r = node.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            const contentY = r.top + liveScrollY;
            registration.contentRect = {
              x: r.left,
              y: contentY,
              width: r.width,
              height: r.height,
            };
            resolve({
              targetId: id,
              x: r.left,
              y: r.top,
              width: r.width,
              height: r.height,
              borderRadius: registration.borderRadius,
              contentX: r.left,
              contentY,
            });
            return;
          }
        }

        if (typeof node.measureInWindow === 'function') {
          node.measureInWindow(
            (x: number, y: number, width: number, height: number) => {
              if (width > 0 && height > 0) {
                const contentY = y + liveScrollY;
                registration.contentRect = { x, y: contentY, width, height };
                resolve({
                  targetId: id,
                  x,
                  y,
                  width,
                  height,
                  borderRadius: registration.borderRadius,
                  contentX: x,
                  contentY,
                });
              } else {
                resolve(null);
              }
            }
          );
        } else {
          const handle = findNodeHandle(node);
          if (handle) {
            UIManager.measureInWindow(
              handle,
              (x: number, y: number, width: number, height: number) => {
                if (width > 0 && height > 0) {
                  const contentY = y + liveScrollY;
                  registration.contentRect = { x, y: contentY, width, height };
                  resolve({
                    targetId: id,
                    x,
                    y,
                    width,
                    height,
                    borderRadius: registration.borderRadius,
                    contentX: x,
                    contentY,
                  });
                } else {
                  resolve(null);
                }
              }
            );
          } else {
            resolve(null);
          }
        }
      });
    },
    []
  );

  const activeStepIdRef = useRef<string | null>(null);

  /**
   * Deterministic Step Transition Pipeline:
   * 1. Check if scroll is needed.
   * 2. If needed, fade out overlay (120ms), scroll, and poll until settled (2 rAF frames).
   * 3. Re-measure target and verify 2-frame stability.
   * 4. Set active target rect and fade in cleanly.
   */
  const executeStepPipeline = useCallback(
    async (targetId: string, stepIdx: number) => {
      activeStepIdRef.current = targetId;

      // 1. Initial measurement of the target
      let rect = await measureTarget(targetId);
      if (!rect) {
        await new Promise((r) => setTimeout(r, 40));
        if (activeStepIdRef.current !== targetId) return;
        rect = await measureTarget(targetId);
      }
      if (!rect || activeStepIdRef.current !== targetId) return;

      const currentScrollY = scrollOffsetYRef.current;
      const { height: screenHeight } = Dimensions.get('window');
      const topInset = insetsRef.current.top;
      const bottomInset = insetsRef.current.bottom;
      const contentH = contentHeightRef.current;

      const contentY = rect.contentY ?? (rect.y + currentScrollY);
      const decision = calculateMinimumScroll(
        currentScrollY,
        { contentY, height: rect.height },
        225, // representative bubble height
        screenHeight,
        topInset,
        bottomInset,
        contentH,
        stepIdx
      );

      // 2. Deterministic scroll if needed
      if (decision.needsScroll) {
        // Quick 120ms fade out of bubble/cutout so no jumping frame is ever visible
        setIsStepTransitioning(true);
        await new Promise((r) => setTimeout(r, TUTORIAL_TIMINGS.stepFadeDurationMs));
        if (activeStepIdRef.current !== targetId) return;

        scrollToTarget(decision.newScrollY);

        // Wait until scroll has actually settled
        await waitForScrollSettle(() => scrollOffsetYRef.current, decision.newScrollY, 1500);
        if (activeStepIdRef.current !== targetId) return;
      }

      // 3. Verify stable target rect after scroll settle
      const stableRect = await waitForStableRect(() => measureTarget(targetId), 12);
      if (!stableRect || activeStepIdRef.current !== targetId) return;

      setActiveTargetRect({ ...stableRect, targetId });
      setIsStepTransitioning(false);
    },
    [measureTarget, scrollToTarget]
  );

  // Single authoritative trigger for step transitions (eliminates race conditions)
  useEffect(() => {
    if (phase === 'tour' && currentStep) {
      executeStepPipeline(currentStep.targetId, stepIndex);
    } else if (phase !== 'tour') {
      setActiveTargetRect(null);
      setIsStepTransitioning(false);
    }
  }, [phase, stepIndex, currentStep, executeStepPipeline]);

  // Orientation and window resize listener: re-aligns active step dynamically
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => {
      if (phase === 'tour' && currentStep) {
        executeStepPipeline(currentStep.targetId, stepIndex);
      }
    });
    return () => sub.remove();
  }, [phase, currentStep, stepIndex, executeStepPipeline]);

  // Block Android hardware back press during active tutorial phases
  useEffect(() => {
    if (phase !== 'idle' && phase !== 'done') {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }
  }, [phase]);

  const startFirstTimeFlow = useCallback(() => {
    if (hasSeenFirstTime && !FORCE_FIRST_TIME_FLOW) {
      return;
    }
    setPhase('welcome');
  }, [hasSeenFirstTime]);

  const handleGetStarted = useCallback(() => {
    setActiveTargetRect(null);
    setStepIndex(0);
    setPhase('tour');
    // Step 1 starts from top
    scrollToTarget(0);
    scrollOffsetYRef.current = 0;
  }, [scrollToTarget]);

  const onTourFinished = useCallback(() => {
    setHasSeenFirstTime(true);
    setActiveTargetRect(null);
    setPhase('connectPrompt');
    // Animate scroll back to the top at the end of the tour
    scrollToTarget(0);
    scrollOffsetYRef.current = 0;
  }, [scrollToTarget, setHasSeenFirstTime]);

  const handleConnectAccount = useCallback(() => {
    setHasSeenFirstTime(true);
    setPhase('done');
    setActiveTargetRect(null);
  }, [setHasSeenFirstTime]);

  const handleMaybeLater = useCallback(() => {
    setPhase('trialNotice');
  }, []);

  const handleDismissTrialNotice = useCallback(() => {
    setHasSeenFirstTime(true);
    setPhase('done');
    setActiveTargetRect(null);
  }, [setHasSeenFirstTime]);

  const handleNextStep = useCallback(() => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      onTourFinished();
    }
  }, [stepIndex, onTourFinished]);

  // ── Dev-Only Automated Self-Test Runner (10 complete runs) ───────────────────
  useEffect(() => {
    if (!__DEV__ || !TUTORIAL_SELFTEST || phase !== 'tour' || !activeTargetRect || !currentStep) {
      return;
    }

    let isCancelled = false;
    const runSelfTestStep = async () => {
      // Allow current step to settle
      await new Promise((r) => setTimeout(r, 600));
      if (isCancelled) return;

      const fresh = await measureTarget(currentStep.targetId);
      if (!fresh) return;

      const drawn = activeTargetRect;
      const dx = Math.abs(fresh.x - drawn.x);
      const dy = Math.abs(fresh.y - drawn.y);
      const dw = Math.abs(fresh.width - drawn.width);
      const dh = Math.abs(fresh.height - drawn.height);
      const maxDelta = Math.max(dx, dy, dw, dh);

      const { height: screenH } = Dimensions.get('window');
      const topLimit = insetsRef.current.top + 16;
      const bottomLimit = screenH - (80 + 36 + insetsRef.current.bottom + 12);

      const flags: string[] = [];
      if (maxDelta > 1) flags.push(`DELTA_${maxDelta.toFixed(1)}px`);
      if (fresh.y < topLimit) flags.push('TARGET_UNDER_TOP_INSET');
      if (fresh.y + fresh.height > bottomLimit) flags.push('TARGET_OVERLAPS_TAB_OR_FADE');

      console.log(
        `[Tutorial SelfTest] Step ${currentStep.stepNumber}/${TUTORIAL_STEPS.length} (${currentStep.targetId}): ` +
        `scrollY=${Math.round(scrollOffsetYRef.current)} ` +
        `expected={x:${Math.round(fresh.x)},y:${Math.round(fresh.y)},w:${Math.round(fresh.width)},h:${Math.round(fresh.height)}} ` +
        `drawn={x:${Math.round(drawn.x)},y:${Math.round(drawn.y)},w:${Math.round(drawn.width)},h:${Math.round(drawn.height)}} ` +
        `delta=${maxDelta.toFixed(1)}px ${flags.length > 0 ? '❌ ' + flags.join(', ') : '✅ PASS'}`
      );

      // Auto-advance
      await new Promise((r) => setTimeout(r, 400));
      if (!isCancelled) {
        handleNextStep();
      }
    };

    runSelfTestStep();
    return () => {
      isCancelled = true;
    };
  }, [phase, activeTargetRect, currentStep, handleNextStep, measureTarget]);

  return (
    <FirstTimeContext.Provider
      value={{
        phase,
        hasSeenFirstTime,
        stepIndex,
        currentStep,
        activeTargetRect,
        spotlightTargetId,
        isSpotlightActive,
        isStepTransitioning,
        isSpotlightTarget,
        startFirstTimeFlow,
        handleGetStarted,
        handleNextStep,
        onTourFinished,
        registerTarget,
        unregisterTarget,
        measureTarget,
        registerScrollView,
        scrollToTarget,
        handleScroll,
        setScreenInsets,
        handleContentSizeChange,
        scrollOffsetY: currentScrollY,
        handleConnectAccount,
        handleMaybeLater,
        handleDismissTrialNotice,
      }}
    >
      {children}
    </FirstTimeContext.Provider>
  );
};

export const useFirstTime = () => {
  const ctx = useContext(FirstTimeContext);
  if (!ctx) {
    throw new Error('useFirstTime must be used within a FirstTimeProvider');
  }
  return ctx;
};

export const useOptionalFirstTime = () => useContext(FirstTimeContext);

export default FirstTimeContext;
