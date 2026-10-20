import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07M20.5 12H3.67"
        stroke="#000814"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const BusinessServicesWizardPlaceholder: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    triggerLightHaptic();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={handleBack}
          accessibilityLabel="Go back"
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Services</Text>
        <View style={styles.placeholderRight} />
      </View>

      {/* Placeholder Body */}
      <View style={styles.content}>
        <Text style={styles.title}>Business Services — next prompt</Text>
        <Text style={styles.subtitle}>
          This is a placeholder for the Business Services upload wizard.
        </Text>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default BusinessServicesWizardPlaceholder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    color: '#000814',
  },
  placeholderRight: {
    width: 48,
    height: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 26,
    color: '#000814',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
});
