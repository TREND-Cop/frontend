import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { CategorySkeleton } from '../../components/ui/CategorySkeleton';
import { useTabSkeleton } from '../../utils/tabSkeletonStore';
import { colors, typography } from '../../constants/theme';
import Svg, { Path, Circle } from 'react-native-svg';
import { MOCK_SERVICES_MEN, MOCK_SERVICES_WOMEN, getServiceNameById } from './mockServices';
import { previewStore } from '../../utils/previewStore';

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ICONS
// ─────────────────────────────────────────────────────────────────────────────

const MaleIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="14" cy="10" r="5" stroke={color} strokeWidth="1.5" />
    <Path d="M10.46 13.54 L4.5 19.5 M4.5 19.5 L4.5 14.5 M4.5 19.5 L9.5 19.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FemaleIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="10" r="5" stroke={color} strokeWidth="1.5" />
    <Path d="M12 15 L12 21.5 M9 18.5 L15 18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const SIDEBAR_CATEGORIES = [
  { id: '1', name: 'Barbing Salon', image: require('../../../assets/images/barbing.png') },
  { id: '2', name: 'Skin & Facial', image: require('../../../assets/images/facial.png') },
  { id: '3', name: 'Nails service', image: require('../../../assets/images/nails.png') },
  { id: '4', name: 'Body & Spa\nTreatment', image: require('../../../assets/images/body_spa.png') },
  { id: '5', name: 'Make-Up &\nEnhancement', image: require('../../../assets/images/makeup.png') },
  { id: '6', name: 'Hair Removal', image: require('../../../assets/images/hair_removal.png') },
  { id: '7', name: 'Med Spa &\nAesthetic', image: require('../../../assets/images/spa.png') }, 
  { id: '8', name: 'Surgical &\nCosmetic\nSurgery', image: require('../../../assets/images/surgical.png') },
  { id: '9', name: 'Wellness &\nLifestyle', image: require('../../../assets/images/wellness.png') },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const CategoryScreen = ({ categoryId }: { categoryId?: string }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBottomPadding = 64 + Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0) + 32;
  const isLoading = useTabSkeleton('category', 1100);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || SIDEBAR_CATEGORIES[0].id);
  const [activeTab, setActiveTab] = useState<'Services' | 'Men' | 'Women'>('Men');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  const activeDataSet = activeTab === 'Women' ? MOCK_SERVICES_WOMEN : MOCK_SERVICES_MEN;

  const displayedServices = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return activeDataSet[selectedCategory] || [];
    }

    // When searching, search across all categories in the active tab
    const allServices = Object.entries(activeDataSet).flatMap(([catId, services]) =>
      services.map((s) => ({ ...s, catId }))
    );

    return allServices.filter((s) =>
      s.name.replace(/\n/g, ' ').toLowerCase().includes(trimmed)
    );
  }, [searchQuery, activeDataSet, selectedCategory]);

  if (isLoading) {
    return <CategorySkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={[styles.header, !categoryId && styles.headerCentered]}>
        {Boolean(categoryId) ? (
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/home' as any))} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.barberPrimary} />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.headerTitle}>Category</Text>
        {Boolean(categoryId) ? <View style={{ width: 40 }} /> : null}
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={colors.barberPrimarySupport} />
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as any]}
            placeholder="Search here.."
            placeholderTextColor={colors.barberPrimarySupport}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <X size={16} color={colors.barberPrimarySupport} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsContainer}>
        {/* Services Tab (over sidebar width: 110px) */}
        <View style={styles.servicesTabWrapper}>
          <Text style={[styles.tabText, styles.tabTextActive, { color: 'rgba(96, 96, 102, 0.96)', fontWeight: '400' }]}>
            Services
          </Text>
        </View>

        {/* Men / Women Tabs (over grid area) */}
        <View style={styles.menWomenWrapper}>
          <TouchableOpacity 
            style={[styles.genderTabItem, { width: 80 }]}
            onPress={() => setActiveTab('Men')}
          >
            <MaleIcon color={activeTab === 'Men' ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)'} />
            <Text style={[
              styles.tabText, 
              activeTab === 'Men' ? styles.tabTextActive : null
            ]}>
              Men
            </Text>
            {activeTab === 'Men' && <View style={[styles.tabActiveIndicator, { width: 80 }]} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.genderTabItem, { width: 91 }]}
            onPress={() => setActiveTab('Women')}
          >
            <FemaleIcon color={activeTab === 'Women' ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)'} />
            <Text style={[
              styles.tabText, 
              activeTab === 'Women' ? styles.tabTextActive : null
            ]}>
              Women
            </Text>
            {activeTab === 'Women' && <View style={[styles.tabActiveIndicator, { width: 91 }]} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Content Area ── */}
      <View style={styles.contentArea}>
        
        {/* ── Left Sidebar ── */}
        <View style={styles.sidebar}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.sidebarScrollContent, { paddingBottom: tabBottomPadding }]}
          >
            {SIDEBAR_CATEGORIES.map((cat) => {
              const isActive = !searchQuery && selectedCategory === cat.id;
              // Dynamically change category 1 name based on activeTab
              const catName = cat.id === '1' && activeTab === 'Women' ? 'Hair Dresser' : cat.name;

              return (
                <View key={cat.id} style={styles.sidebarItemWrapper}>
                  {/* Active Indicator on far left */}
                  {isActive && <View style={styles.sidebarActiveIndicator} />}
                  <TouchableOpacity 
                    style={styles.sidebarCategoryButton}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory(cat.id);
                    }}
                    activeOpacity={0.7}
                  >
                    {/* Image frame place holder */}
                    <View style={[styles.sidebarIconFrame, isActive && styles.sidebarIconFrameActive]}>
                      <Image source={cat.image} style={{ width: 40, height: 40, borderRadius: 4 }} />
                    </View>
                    
                    <Text
                      style={[
                        styles.sidebarCategoryText,
                        isActive && styles.sidebarCategoryTextActive,
                      ]}
                    >
                      {catName}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Right Content Grid ── */}
        <View style={styles.mainGridArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.mainGridScrollContent, { paddingBottom: tabBottomPadding }]}
          >
            {searchQuery.trim().length > 0 && (
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsCount}>
                  {displayedServices.length} {displayedServices.length === 1 ? 'service' : 'services'} found
                </Text>
              </View>
            )}

            {displayedServices.length > 0 ? (
              <View style={styles.gridContainer}>
                {displayedServices.map((service) => (
                  <TouchableOpacity 
                    key={service.id} 
                    style={styles.serviceButton}
                    onPress={() => {
                      const targetCatId = (service as any).catId || selectedCategory;
                      const categoryTitle =
                        targetCatId === '1' && activeTab === 'Women'
                          ? 'Hair Dresser Salons'
                          : getServiceNameById(targetCatId);
                      const cleanServiceName = service.name.replace(/\n/g, ' ');

                      router.push({
                        pathname: `/salon-listing/${service.id}`,
                        params: {
                          id: service.id,
                          serviceId: service.id,
                          serviceName: cleanServiceName,
                          name: cleanServiceName,
                          categoryId: targetCatId,
                          categoryName: categoryTitle,
                          gender: activeTab,
                        },
                      } as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceImageFrame}>
                      <Image source={service.image} style={styles.serviceImage} />
                    </View>
                    <Text style={styles.serviceText}>{service.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Search size={28} color="rgba(192, 192, 204, 0.96)" />
                </View>
                <Text style={styles.emptyTitle}>No services found</Text>
                <Text style={styles.emptySubtitle}>
                  No results matching "{searchQuery}".
                </Text>
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  activeOpacity={0.8}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerCentered: {
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.pageHeader,
    color: colors.barberPrimary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: colors.barberPrimary,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 56, // Fixed height per specs
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 245, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  servicesTabWrapper: {
    width: 110, // Matches sidebar width
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: 'rgba(235, 235, 245, 0.96)',
  },
  menWomenWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  genderTabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    height: 40,
    position: 'relative',
  },
  tabText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    textTransform: 'capitalize',
    textAlign: 'center', // Fix for text-align
    color: 'rgba(96, 96, 102, 0.96)',
  },
  tabTextActive: {
    color: '#000000', // Active text color
  },
  tabActiveIndicator: {
    position: 'absolute',
    bottom: -8,
    height: 4,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // Off-white background for the whole area
  },
  
  // ── Sidebar Styles ──
  sidebar: {
    width: 110, // Exact width from Figma
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 24,
  },
  sidebarScrollContent: {
    paddingVertical: 16,
    paddingBottom: 90,
    alignItems: 'center', // Centers the 84px buttons in the 110px sidebar
  },
  sidebarItemWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
    height: 88,
  },
  sidebarActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 4,
    height: 80,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sidebarCategoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 84,
    minHeight: 72,
    gap: 8,
  },
  sidebarIconFrame: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1, // Prepare border for active state
    borderColor: 'transparent',
  },
  sidebarIconFrameActive: {
    borderColor: colors.barberPrimary,
  },
  sidebarCategoryText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 12, // Specified as 12px
    lineHeight: 16, // Specified as 16px
    textAlign: 'center',
    color: 'rgba(96, 96, 102, 0.96)',
  },
  sidebarCategoryTextActive: {
    color: '#000000', // Active text is exactly #000000
    fontWeight: '600',
  },

  // ── Main Grid Area Styles ──
  mainGridArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mainGridScrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingBottom: 90,
  },
  gridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    boxShadow: '0px 32px 40px rgba(133, 139, 148, 0.01), -20px -16px 30px rgba(133, 139, 148, 0.06), 8px 16px 24px rgba(133, 139, 148, 0.08), 4px 10px 24px rgba(133, 139, 148, 0.04)',
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  serviceButton: {
    width: '48%',
    minHeight: 112,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 8,
  },
  serviceImageFrame: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    borderRadius: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  clearButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsHeader: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  searchResultsCount: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 13,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 17,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  emptySubtitle: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 8,
  },
  clearSearchBtn: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearSearchBtnText: {
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  serviceText: {
    ...typography.tag,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
});
