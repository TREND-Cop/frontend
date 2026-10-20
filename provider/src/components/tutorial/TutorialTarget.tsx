import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useFirstTime } from '../../context/FirstTimeContext';

interface TutorialTargetProps {
  id: string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const TutorialTarget: React.FC<TutorialTargetProps> = ({
  id,
  borderRadius = 24,
  style,
  children,
}) => {
  const { registerTarget, unregisterTarget } = useFirstTime();
  const targetRef = useRef<View>(null);

  useEffect(() => {
    if (targetRef.current) {
      registerTarget(id, targetRef.current, borderRadius);
    }
    return () => {
      unregisterTarget(id);
    };
  }, [id, borderRadius, registerTarget, unregisterTarget]);

  const handleLayout = () => {
    if (targetRef.current) {
      registerTarget(id, targetRef.current, borderRadius);
    }
  };

  return (
    <View ref={targetRef} onLayout={handleLayout} style={style} collapsable={false}>
      {children}
    </View>
  );
};

export default TutorialTarget;
