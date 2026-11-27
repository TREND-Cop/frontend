import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import { ArrowLeft02Icon } from '../../components/staff/StaffIcons';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

/**
 * Placeholder for Staff Login Code (Not designed)
 */
export const StaffLoginCodePlaceholderScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleBack = useCallback(() => {
    triggerLightHaptic();
    safeRouter.replace('/staffs' as any);
  }, [safeRouter]);

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [handleBack]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={handleBack}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back to staff management"
        >
          <ArrowLeft02Icon size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Login Code</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Body */}
      <View style={styles.content}>
        <Text style={styles.title}>Staff login code — not designed</Text>
        <Text style={styles.subtitle}>
          This is a placeholder for the login code flow for staff member ID: {id || 'unknown'}.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Go to Staff Management</Text>
        </TouchableOpacity>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default StaffLoginCodePlaceholderScreen;

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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
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
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
