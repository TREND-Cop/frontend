import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import { StaffTutorialVideoModal } from '../../components/staff/tutorial/StaffTutorialVideoModal';
import { STAFF_TUTORIAL_STEPS } from '../../constants/staffTutorialSteps';

export default function StaffTutorialVideoRoute() {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ step?: string; title?: string }>();
  const stepNumber = params.step ? parseInt(params.step, 10) : 2;
  const step =
    STAFF_TUTORIAL_STEPS.find((s) => s.stepNumber === stepNumber) ??
    STAFF_TUTORIAL_STEPS[1];

  return (
    <View style={styles.container}>
      <StaffTutorialVideoModal
        visible={true}
        step={step}
        isTour={false}
        customTitle={params.title}
        onBack={() => safeRouter.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
