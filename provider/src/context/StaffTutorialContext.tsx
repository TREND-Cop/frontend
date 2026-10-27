import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { BackHandler, findNodeHandle, UIManager, Platform, Dimensions } from 'react-native';
import { STAFF_TUTORIAL_STEPS, StaffTutorialStep } from '../constants/staffTutorialSteps';
import { calculateMinimumScroll, TargetRect } from './FirstTimeContext';

export type StaffTutorialPhase = 'idle' | 'welcome' | 'tour' | 'video' | 'completion' | 'done';

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

interface StaffTutorialContextType {
  phase: StaffTutorialPhase;
  stepIndex: number;
  currentStep: StaffTutorialStep | null;
  activeTargetRect: TargetRect | null;
  spotlightTargetId: string | null;
  isSpotlightActive: boolean;
  isStepTransitioning: boolean;
  hasCompletedTour: boolean;
  startStaffWelcome: () => void;
  handleGetStarted: () => void;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  openVideo: () => void;
  closeVideo: () => void;
  finishTour: () => void;
  handleCloseCompletion: () => void;
  registerTarget: (id: string, ref: any, borderRadius?: number) => void;
  unregisterTarget: (id: string) => void;
  measureTarget: (id: string) => Promise<TargetRect | null>;
  registerScrollView: (ref: any) => void;
  handleScroll: (y: number) => void;
  setScreenInsets: (insets: { top: number; bottom: number }) => void;
  handleContentSizeChange: (w: number, h: number) => void;
  scrollOffsetY: number;
}

const StaffTutorialContext = createContext<StaffTutorialContextType | undefined>(undefined);

export const StaffTutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In-memory state only: resets on each login session
  const [phase, setPhase] = useState<StaffTutorialPhase>('idle');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [activeTargetRect, setActiveTargetRect] = useState<TargetRect | null>(null);
  const [isStepTransitioning, setIsStepTransitioning] = useState<boolean>(false);
  const [currentScrollY, setCurrentScrollY] = useState<number>(0);
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean>(false);

  const targetsRef = useRef<Map<string, TargetRegistration>>(new Map());
  const scrollViewRef = useRef<any>(null);
  const scrollOffsetYRef = useRef<number>(0);
  const insetsRef = useRef<{ top: number; bottom: number }>({
    top: Platform.OS === 'android' ? 44 : 48,
    bottom: Platform.OS === 'android' ? 24 : 34,
  });
  const contentHeightRef = useRef<number>(1400);

  const currentStep =
    (phase === 'tour' || phase === 'video') &&
    stepIndex >= 0 &&
    stepIndex < STAFF_TUTORIAL_STEPS.length
      ? STAFF_TUTORIAL_STEPS[stepIndex]
      : null;

  const spotlightTargetId = currentStep?.targetId ?? null;
  const isSpotlightActive = phase === 'tour' && activeTargetRect !== null;

  // Target registration methods
  const registerTarget = useCallback((id: string, ref: any, borderRadius: number = 24) => {
    if (ref) {
      const existing = targetsRef.current.get(id);
      targetsRef.current.set(id, {
        ref,
        borderRadius,
        contentRect: existing?.contentRect,
      });
    }
  }, []);

  const unregisterTarget = useCallback((id: string) => {
    targetsRef.current.delete(id);
  }, []);

  const registerScrollView = useCallback((ref: any) => {
    scrollViewRef.current = ref;
  }, []);

  const handleScroll = useCallback((y: number) => {
    scrollOffsetYRef.current = y;
    setCurrentScrollY(y);

    // Live update window Y of active target to track scrolling in real time
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
        let registration = targetsRef.current.get(id);

        // Fallback for Step 6 if chip is not visible
        if ((!registration || !registration.ref) && id === 'staff-break-timer-chip') {
          registration = targetsRef.current.get('staff-break-time-cell');
        }

        if (!registration || !registration.ref) {
          resolve(null);
          return;
        }

        const node = registration.ref;
        const liveScrollY = scrollOffsetYRef.current;

        // Web optimization
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
          node.measureInWindow((x: number, y: number, width: number, height: number) => {
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
          });
        } else {
          const handle = findNodeHandle(node);
          if (handle) {
            UIManager.measureInWindow(handle, (x: number, y: number, width: number, height: number) => {
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
            });
          } else {
            resolve(null);
          }
        }
      });
    },
    []
  );

  const activeStepIdRef = useRef<string | null>(null);

  const executeStepPipeline = useCallback(
    async (targetId: string, stepIdx: number) => {
      activeStepIdRef.current = targetId;

      // 1. Initial measurement of the target
      let rect = await measureTarget(targetId);
      if (!rect) {
        await new Promise((r) => setTimeout(r, 60));
        if (activeStepIdRef.current !== targetId) return;
        rect = await measureTarget(targetId);
      }
      if (!rect || activeStepIdRef.current !== targetId) return;

      const currentScrollY = scrollOffsetYRef.current;
      const { height: screenHeight } = Dimensions.get('window');
      const topInset = insetsRef.current.top;
      const bottomInset = insetsRef.current.bottom;
      const contentH = contentHeightRef.current;

      const approxBubbleHeight = 250;
      const targetContent = {
        contentY: rect.contentY ?? rect.y + currentScrollY,
        height: rect.height,
      };

      const { newScrollY, needsScroll } = calculateMinimumScroll(
        currentScrollY,
        targetContent,
        approxBubbleHeight,
        screenHeight,
        topInset,
        bottomInset,
        contentH,
        stepIdx
      );

      if (needsScroll && Math.abs(newScrollY - currentScrollY) > 8) {
        setIsStepTransitioning(true);
        scrollToTarget(newScrollY);

        await new Promise((r) => setTimeout(r, 300));
        if (activeStepIdRef.current !== targetId) return;

        let remeasured = await measureTarget(targetId);
        if (remeasured && activeStepIdRef.current === targetId) {
          setActiveTargetRect(remeasured);
        }
        setIsStepTransitioning(false);
      } else {
        setActiveTargetRect(rect);
        setIsStepTransitioning(false);
      }
    },
    [measureTarget, scrollToTarget]
  );

  // Sync step change to measurement pipeline
  useEffect(() => {
    if (phase === 'tour' && currentStep) {
      executeStepPipeline(currentStep.targetId, stepIndex);
    } else if (phase !== 'tour' && phase !== 'video') {
      setActiveTargetRect(null);
    }
  }, [phase, stepIndex, currentStep, executeStepPipeline]);

  // BackHandler interceptor per prompt instructions:
  // - on welcome card: does nothing (intercepted)
  // - on tooltip step: does nothing (intercepted)
  // - on video screen: returns to that step (closeVideo)
  useEffect(() => {
    const onBackPress = () => {
      if (phase === 'welcome') {
        return true; // do nothing
      }
      if (phase === 'tour') {
        return true; // do nothing
      }
      if (phase === 'completion') {
        return true; // do nothing
      }
      if (phase === 'video') {
        setPhase('tour');
        return true; // returns to that step
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [phase]);

  // Public control methods
  const startStaffWelcome = useCallback(() => {
    if (!hasCompletedTour && phase === 'idle') {
      setPhase('welcome');
    }
  }, [hasCompletedTour, phase]);

  const handleGetStarted = useCallback(() => {
    setPhase('tour');
    setStepIndex(0);
  }, []);

  const finishTour = useCallback(() => {
    setActiveTargetRect(null);
    setPhase('completion');
  }, []);

  const handleNextStep = useCallback(() => {
    if (stepIndex < STAFF_TUTORIAL_STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
      setPhase('tour');
    } else {
      finishTour();
    }
  }, [stepIndex, finishTour]);

  const handlePrevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      setPhase('tour');
    }
  }, [stepIndex]);

  const openVideo = useCallback(() => {
    setPhase('video');
  }, []);

  const closeVideo = useCallback(() => {
    setPhase('tour');
  }, []);

  const handleCloseCompletion = useCallback(() => {
    setPhase('done');
    setHasCompletedTour(true);
    // TODO (Backend): persist tutorial completion for this staff member
  }, []);

  return (
    <StaffTutorialContext.Provider
      value={{
        phase,
        stepIndex,
        currentStep,
        activeTargetRect,
        spotlightTargetId,
        isSpotlightActive,
        isStepTransitioning,
        hasCompletedTour,
        startStaffWelcome,
        handleGetStarted,
        handleNextStep,
        handlePrevStep,
        openVideo,
        closeVideo,
        finishTour,
        handleCloseCompletion,
        registerTarget,
        unregisterTarget,
        measureTarget,
        registerScrollView,
        handleScroll,
        setScreenInsets,
        handleContentSizeChange,
        scrollOffsetY: currentScrollY,
      }}
    >
      {children}
    </StaffTutorialContext.Provider>
  );
};

export const useStaffTutorial = () => {
  const context = useContext(StaffTutorialContext);
  if (!context) {
    throw new Error('useStaffTutorial must be used within a StaffTutorialProvider');
  }
  return context;
};
