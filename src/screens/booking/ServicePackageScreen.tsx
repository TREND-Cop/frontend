import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Share,
  UIManager,
  LayoutAnimation,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ShareIcon } from '../../components/ShareIcon';
import { bookingStore } from '../../utils/bookingStore';
import { PACKAGE_CATALOG, PackageItem, getPackagesForService } from '../../constants/packageCatalog';
import { SafeImage } from '../../components/ui/SafeImage';
import { PackagePhotosCarousel } from '../../components/ui/PackagePhotosCarousel';
import { typography } from '../../constants/theme';
import { shareStore } from '../../utils/shareStore';

export const ServicePackageScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    bookingStore.getSelectedPackage()?.id || null
  );
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

  const availablePackages = React.useMemo(() => {
    return getPackagesForService(bookingStore.getServiceName());
  }, []);

  useEffect(() => {
    const unsubscribe = bookingStore.subscribe(() => {
      const pkg = bookingStore.getSelectedPackage();
      setSelectedPackageId(pkg ? pkg.id : null);
    });
    const pkg = bookingStore.getSelectedPackage();
    setSelectedPackageId(pkg ? pkg.id : null);
    return unsubscribe;
  }, []);

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/booking-review');
    }
  };

  const handleShare = () => {
    shareStore.openShare({
      title: 'Service Packages',
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: 'https://trend.app/service-package',
    });
  };

  const handleTogglePackage = (pkg: PackageItem) => {
    bookingStore.setSelectedPackage(pkg.id);
    router.replace({
      pathname: '/booking-review',
      params: { scrollTo: 'package' },
    } as any);
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPackageId(prev => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Page Header (Figma: height: 64px, padding: 8px 16px) ───────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Package</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ─── Package Cards Scroll List ─────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {availablePackages.map((pkg) => {
          const isAdded = selectedPackageId === pkg.id;
          const isExpanded = expandedPackageId === pkg.id;
          const has4Images = pkg.images.length >= 4;

          return (
            <View key={pkg.id} style={styles.packageCard}>
              {/* ─── Frame 1000006514 (Inner Auto Layout: gap: 26px) ── */}
              <View style={styles.cardInnerLayout}>
                {/* ─── Images Grid (Photos & Indicator Carousel) ── */}
                <PackagePhotosCarousel images={pkg.images} />

                {/* ─── Frame 1000006513 (Content Section: gap: 24px) ── */}
                <View style={styles.contentSection}>
                  {/* Price (Figma H1 Med: 24px, 510 weight, 32px line height) */}
                  <Text style={styles.priceText}>₦{pkg.price.toLocaleString()}</Text>

                  {/* Features Checklist (Figma: gap: 8px) */}
                  <View style={styles.featuresList}>
                    {pkg.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <View style={styles.checkCircle}>
                          <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}

                    {/* When NOT expanded: Show 4+ Services on the left, and See All on the right */}
                    {!isExpanded && pkg.moreServicesCount && (
                      <View style={styles.moreServicesRow}>
                        <Text style={styles.moreServicesLabel}>
                          {pkg.moreServicesCount}+ Services
                        </Text>
                        <TouchableOpacity
                          style={styles.seeAllButton}
                          activeOpacity={0.6}
                          onPress={() => toggleExpand(pkg.id)}
                        >
                          <Text style={styles.seeAllText}>See All</Text>
                          <ChevronDown size={18} color="rgba(26, 130, 255, 0.9)" />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Expanded Additional Services List: drops down, 4+ Services label disappears, and See Less button drops down below it */}
                    {isExpanded && (
                      <>
                        <View style={styles.expandedServicesList}>
                          {['Scalp Treatment', 'Beard Grooming', 'Facial Exfoliation'].map((extra, eIdx) => (
                            <View key={`extra-${eIdx}`} style={styles.featureItem}>
                              <View style={styles.checkCircle}>
                                <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
                              </View>
                              <Text style={styles.featureText}>{extra}</Text>
                            </View>
                          ))}
                        </View>

                        {/* When expanded: 4+ Services label disappears, and See Less button drops down below the items */}
                        <View style={styles.seeLessRow}>
                          <TouchableOpacity
                            style={styles.seeAllButton}
                            activeOpacity={0.6}
                            onPress={() => toggleExpand(pkg.id)}
                          >
                            <Text style={styles.seeAllText}>See Less</Text>
                            <ChevronUp size={18} color="rgba(26, 130, 255, 0.9)" />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* ─── Line 194 (Figma: width: 124px, centered divider) ── */}
              <View style={styles.dividerLine} />

              {/* ─── Filled Action Button (Figma: 48px height, 24px radius) ── */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isAdded && styles.actionButtonAdded,
                ]}
                activeOpacity={0.8}
                onPress={() => handleTogglePackage(pkg)}
              >
                <Text style={[styles.actionButtonText, isAdded && styles.actionButtonTextAdded]}>
                  {isAdded ? 'Added' : 'Add Package'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Page Header (Figma: height: 64px, padding: 8px 16px)
  headerRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content (Figma: gap: 40px between cards, 24px top padding)
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 40,
  },

  // Service Package Card Container (Figma: padding: 16px, gap: 24px, radius: 24px)
  packageCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },

  // Frame 1000006514: Inner Auto Layout with gap: 26px between images and content
  cardInnerLayout: {
    width: '100%',
    gap: 26,
  },

  // Photos & Carousel Indicator
  photosWrapper: {
    width: '100%',
    gap: 16,
  },
  imagesGrid: {
    width: '100%',
    gap: 24,
  },
  imageRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 24,
  },
  imageCell: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  // Carousel Indicator Dots (Figma: width 28px, height 8px, gap 12px)
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  indicatorDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  indicatorDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  // Frame 1000006513 (Content Section: gap: 24px between price and checklist)
  contentSection: {
    width: '100%',
    gap: 24,
  },
  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Features Checklist (Figma: gap: 8px between rows)
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // More Contents / See All Row (Figma: height: 40px)
  moreServicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  moreServicesLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  seeAllText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(26, 130, 255, 0.9)',
  },
  expandedServicesList: {
    gap: 8,
  },
  seeLessRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 36,
    marginTop: 4,
  },

  // Line 194 (Figma: width: 124px, centered divider)
  dividerLine: {
    width: 124,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    alignSelf: 'center',
  },

  // Filled Action Button (Figma: height: 48px, radius: 24px)
  actionButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  actionButtonAdded: {
    backgroundColor: 'rgba(240, 240, 245, 0.98)',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
  actionButtonTextAdded: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
});

export default ServicePackageScreen;
