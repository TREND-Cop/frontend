import React from 'react';
import { Platform, View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ProfileChevronRight } from '../../components/profile/ProfileIcons';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

export const ProfileSettingsScreen = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleChangeUsername = () => {
    router.push('/change-username' as any);
  };

  const handleChangeProfilePhoto = () => {
    router.push('/change-profile-photo');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile Settings</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Options Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Option 1: Change Username */}
        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.7}
          onPress={handleChangeUsername}
        >
          <Text style={styles.optionText}>Change Username</Text>
          <ProfileChevronRight size={24} color="#141B34" />
        </TouchableOpacity>

        {/* Line 161 (Divider) */}
        <View style={styles.dividerLine} />

        {/* Option 2: Change Profile Photo */}
        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.7}
          onPress={handleChangeProfilePhoto}
        >
          <Text style={styles.optionText}>Change Profile Photo</Text>
          <ProfileChevronRight size={24} color="#141B34" />
        </TouchableOpacity>
      </ScrollView>
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: height 64px, borderBottom) ──
  headerRow: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Content ──
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // ── Option Card (Figma: height 48px / 56px, bg rgba(247, 247, 247, 0.96), radius 16px) ──
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  optionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },

  // ── Divider Line (responsive) ──
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 16,
  },
});
