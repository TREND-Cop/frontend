import React from 'react';
import {
  TutorialVideoModal,
  TutorialVideoModalProps,
  TutorialStepLike,
} from '../../tutorial/TutorialVideoModal';
import {
  StaffTutorialStep,
  STAFF_TUTORIAL_VIDEOS,
} from '../../../constants/staffTutorialSteps';

export interface StaffTutorialVideoModalProps
  extends Omit<TutorialVideoModalProps, 'step' | 'videoSources'> {
  step: StaffTutorialStep | null;
  videoSources?: Record<number, any>;
}

export const StaffTutorialVideoModal: React.FC<StaffTutorialVideoModalProps> = ({
  step,
  videoSources,
  totalSteps = 9,
  ...rest
}) => {
  return (
    <TutorialVideoModal
      {...rest}
      step={step as TutorialStepLike | null}
      totalSteps={totalSteps}
      videoSources={videoSources ?? STAFF_TUTORIAL_VIDEOS}
    />
  );
};

export default StaffTutorialVideoModal;
