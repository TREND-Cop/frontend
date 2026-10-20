import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useServiceDraft } from '../../context/ServiceDraftContext';
import { WizardStepper } from '../../components/wizard/WizardStepper';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

function ArrowLeft02Icon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07M20.5 12H3.67"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HelpCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#141B34" strokeWidth={1.5} />
      <Path
        d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 11 12.5 11.75 12.5 13.5"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx="12.5" cy="16.5" r="0.75" fill="#141B34" />
    </Svg>
  );
}

export const ReviewPlaceholder: React.FC = () => {
  const router = useRouter();
  const { draft } = useServiceDraft();

  const handleBack = () => {
    triggerLightHaptic();
    router.back();
  };

  const hasAddOns = draft.addOns.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={handleBack}
          accessibilityLabel="Back to step 3"
        >
          <ArrowLeft02Icon size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Services</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={() => router.push('/guide/general' as any)}
          accessibilityLabel="Guide"
        >
          <HelpCircleIcon size={24} />
        </TouchableOpacity>
      </View>

      {/* Stepper (Step 4 active) */}
      <View style={styles.stepperWrapper}>
        <WizardStepper currentStep={4} />
      </View>

      {/* Placeholder Body */}
      <View style={styles.content}>
        <Text style={styles.title}>Review — next prompt</Text>
        <Text style={styles.subtitle}>
          This is a placeholder for Step 4 (Review) of the Business Services wizard.
        </Text>
        <Text style={styles.metaNote}>
          {hasAddOns
            ? `Draft includes ${draft.addOns.length} add-on${draft.addOns.length === 1 ? '' : 's'}.`
            : 'Add-ons were skipped (no add-ons section on Review screen).'}
        </Text>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default ReviewPlaceholder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  stepperWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    color: '#000814',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  metaNote: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(0, 8, 20, 0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
});
