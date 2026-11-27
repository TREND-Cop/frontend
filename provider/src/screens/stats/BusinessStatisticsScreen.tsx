import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import {
  StatsProvider,
  useStatsContext,
  StatsPeriod,
} from '../../context/StatsContext';
import { PillTabs } from '../../components/stats/PillTabs';
import { PeriodSelector } from '../../components/stats/PeriodSelector';
import { TrendBadge } from '../../components/stats/TrendBadge';
import { ComparedRow } from '../../components/stats/ComparedRow';
import { InfoModal } from '../../components/stats/InfoModal';
import { StatsEmptyState } from '../../components/stats/StatsEmptyState';
import { DateFilterSheet, FilterValue } from '../../components/DateFilterSheet';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { formatPeriodLabel } from '../../utils/statsFormatters';
import { RevenueTab } from './tabs/RevenueTab';
import { ClientsTab } from './tabs/ClientsTab';
import { AppointmentsTab } from './tabs/AppointmentsTab';
import { StaffTab } from './tabs/StaffTab';
import { MarketingTab } from './tabs/MarketingTab';
import { markStaffSubScreenNavigation } from '../../hooks/useStaffDashboardSkeleton';
import { STAFF_STATS_TABS, StaffStatsTabName } from '../../constants/staffStats.config';

/**
 * Dev-only constant controlling whether the developer test playground
 * is displayed inside each placeholder tab.
 * Set to true to test all shared pieces, modals, and badge combinations.
 */
export const DEV_STATS_PLAYGROUND = false;

export const STATS_TABS = [
  'Revenue',
  'Clients',
  'Appointments',
  'Staff',
  'Marketing & Growth',
] as const;

export type StatsTabName = (typeof STATS_TABS)[number] | StaffStatsTabName;

const FONT_HEADER = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 1:1 Vector arrow-left-02 Back Icon (24x24)
 */
function ArrowLeftIcon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const TAB_NEXT_PROMPTS: Record<StatsTabName, string> = {
  Revenue: 'Revenue & interactive chart — Prompt 2',
  Clients: 'Clients statistics & breakdown — Prompt 3',
  Appointments: 'Appointments & busiest times — Prompt 4',
  Staff: 'Staff performance & rankings — Prompt 5',
  'Marketing & Growth': 'Marketing channels & client sources — Prompt 5',
};

/**
 * Inner component driven by StatsContext
 */
export interface BusinessStatisticsScreenProps {
  isStaff?: boolean;
}

/**
 * Inner component driven by StatsContext
 */
const BusinessStatisticsContent: React.FC<BusinessStatisticsScreenProps> = ({ isStaff = false }) => {
  const safeRouter = useSafeRouter();
  const [activeTab, setActiveTab] = useState<StatsTabName>('Revenue');
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

  const {
    activeSheetSectionId,
    closeDateSheet,
    getPeriod,
    setPeriod,
    resetAllPeriods,
  } = useStatsContext();

  // Reset periods when screen unmounts / user navigates away
  useEffect(() => {
    return () => {
      resetAllPeriods();
    };
  }, [resetAllPeriods]);

  // Back button handler returning to dashboard
  const handleBack = useCallback(() => {
    if (isStaff) {
      markStaffSubScreenNavigation();
    }
    if (safeRouter.canGoBack()) {
      safeRouter.back();
    } else {
      safeRouter.replace((isStaff ? '/(staff)/staff-home' : '/dashboard') as any);
    }
  }, [safeRouter, isStaff]);

  // Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [handleBack]);

  // Map FilterValue from DateFilterSheet to StatsPeriod
  const handleApplyFilter = useCallback(
    (filter: FilterValue) => {
      if (!activeSheetSectionId) return;

      if (filter.type === 'day') {
        const selectedDate = new Date(filter.year, filter.month, filter.day);
        setPeriod(activeSheetSectionId, { kind: 'day', date: selectedDate });
      } else {
        setPeriod(activeSheetSectionId, { kind: 'year', year: filter.year });
      }
      closeDateSheet();
    },
    [activeSheetSectionId, setPeriod, closeDateSheet]
  );

  // Derive currentFilter for active section to sync sheet selection
  const currentSectionPeriod = activeSheetSectionId
    ? getPeriod(activeSheetSectionId)
    : null;

  const currentSheetFilter: FilterValue | null = currentSectionPeriod
    ? currentSectionPeriod.kind === 'day'
      ? {
          type: 'day',
          year: currentSectionPeriod.date.getFullYear(),
          month: currentSectionPeriod.date.getMonth(),
          day: currentSectionPeriod.date.getDate(),
        }
      : {
          type: 'year',
          year: currentSectionPeriod.year,
        }
    : null;

  const tabsToDisplay = isStaff ? STAFF_STATS_TABS : STATS_TABS;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── 1. Page Header (Figma S1: height 64px, back button 48x48, title "Personal Statistics" for staff, "Business Statistic" for owner) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
          accessible
          accessibilityRole="button"
          accessibilityLabel={isStaff ? 'Go back to staff home' : 'Go back to dashboard'}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {isStaff ? 'Personal Statistics' : 'Business Statistic'}
        </Text>

        {/* Dummy spacer to balance back button and center title */}
        <View style={styles.headerSpacer} pointerEvents="none" />
      </View>

      {/* ── 2. Top Scrollable PillTabs (Staff: 3 tabs; Owner: 5 tabs) ── */}
      <View style={styles.tabsWrapper}>
        <PillTabs
          tabs={tabsToDisplay}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab as StatsTabName)}
          scrollable={!isStaff}
        />
      </View>

      {/* ── 3. Active Tab Body (Scrollable with safe dock padding) ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Revenue' ? (
          /* ── Revenue Tab Body (Total income + Revenue per service) ── */
          <RevenueTab
            onOpenInfoModal={() => setIsInfoModalVisible(true)}
            isStaff={isStaff}
          />
        ) : activeTab === 'Clients' ? (
          /* ── Clients Tab Body (Over time + Donut + Top clients) ── */
          <ClientsTab isStaff={isStaff} />
        ) : activeTab === 'Appointments' ? (
          /* ── Appointments Tab Body (Over time + Pie + Busiest times) ── */
          <AppointmentsTab isStaff={isStaff} />
        ) : activeTab === 'Staff' && !isStaff ? (
          /* ── Staff Tab Body (Owner only) ── */
          <StaffTab />
        ) : !isStaff ? (
          /* ── Marketing & Growth Tab Body (Owner only) ── */
          <MarketingTab />
        ) : null}
      </ScrollView>

      {/* ── 4. Shared DateFilterSheet (S3/S4) ── */}
      <DateFilterSheet
        visible={activeSheetSectionId !== null}
        onClose={closeDateSheet}
        onApplyFilter={handleApplyFilter}
        currentFilter={currentSheetFilter}
        confirmLabels={{ month: 'Select', year: 'Search date' }}
        isDateDisabled={() => false}
      />

      {/* ── 5. Total Revenue Info Modal (S5) ── */}
      <InfoModal
        visible={isInfoModalVisible}
        title={isStaff ? 'Revenue' : 'Total Revenue'}
        description={
          isStaff
            ? 'Revenue shows the overall income you have generated for the business based on completed appointments.'
            : 'Total Revenue shows the overall income your business generated from its services within a period of time, in other words how much money is coming into the business.'
        }
        onClose={() => setIsInfoModalVisible(false)}
      />

      {/* Android System Navigation Bar & Native Dock Protection */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

/**
 * Screen root exporting with StatsProvider
 */
export const BusinessStatisticsScreen: React.FC<BusinessStatisticsScreenProps> = (props) => {
  return (
    <StatsProvider>
      <BusinessStatisticsContent {...props} />
    </StatsProvider>
  );
};

export default BusinessStatisticsScreen;

const styles = StyleSheet.create({
  safeArea: {
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
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  placeholderCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  placeholderBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  placeholderBadgeText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  placeholderTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  placeholderSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    maxWidth: 280,
    includeFontPadding: false,
  },
  playgroundContainer: {
    gap: 16,
  },
  playgroundCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  playgroundTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  playgroundSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  playgroundButton: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  playgroundButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 15,
    color: '#FFFFFF',
  },
  playgroundSectionHeader: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    color: 'rgba(0, 8, 20, 0.96)',
    marginTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
