import React from 'react';
import { Platform, View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ProfileChevronRight } from '../../components/profile/ProfileIcons';

export const GmailSecurityScreen: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleAddGmail = () => {
    router.push({
      pathname: '/add-gmail',
      params: { mode: 'add' },
    });
  };

  const handleUpdateGmail = () => {
    router.push({
      pathname: '/change-gmail',
      params: { mode: 'update' },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Gmail Security</Text>

        {/* Right placeholder to keep title centered */}
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Body Content (Figma: top 132px, card width 358px, height 178px, borderRadius 24px) ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Frame 1000006518 (Menu Card Container) */}
        <View style={styles.menuCardContainer}>
          {/* Option 1: Add Gmail Account */}
          <TouchableOpacity
            style={styles.menuOptionRow}
            activeOpacity={0.7}
            onPress={handleAddGmail}
          >
            <Text style={styles.menuOptionText}>Add Gmail Account</Text>
            <ProfileChevronRight size={24} color="#141B34" />
          </TouchableOpacity>

          {/* Divider Line (Line 188) */}
          <View style={styles.menuDivider} />

          {/* Option 2: Update Existing Gmail Account */}
          <TouchableOpacity
            style={styles.menuOptionRow}
            activeOpacity={0.7}
            onPress={handleUpdateGmail}
          >
            <Text style={styles.menuOptionText}>Update Existing Gmail Account</Text>
            <ProfileChevronRight size={24} color="#141B34" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
  header: {
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

  // ── Scroll Content ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ── Menu Card Container (Figma: width 358px, borderRadius 24px, bg rgba(247, 247, 247, 0.96), border rgba(235, 235, 245, 0.96)) ──
  menuCardContainer: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    paddingVertical: 16,
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  menuOptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 16,
    marginVertical: 4,
  },
});
