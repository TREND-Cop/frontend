import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { useStatsPeriod } from '../../../context/StatsContext';
import { PeriodSelector } from '../../../components/stats/PeriodSelector';
import { TrendBadge } from '../../../components/stats/TrendBadge';
import { ComparedRow } from '../../../components/stats/ComparedRow';
import { PillTabs } from '../../../components/stats/PillTabs';
import { InteractiveAreaChart } from '../../../components/stats/InteractiveAreaChart';
import { StatsEmptyState } from '../../../components/stats/StatsEmptyState';
import {
  useRevenueStats,
  useRevenueServices,
  useRevenueByService,
} from '../../../api/statsApi';
import { formatNaira } from '../../../utils/statsFormatters';

interface RevenueTabProps {
  onOpenInfoModal: () => void;
}

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
 * 20x20 Info Circle Icon (Figma help-circle)
 */
function InfoCircleIcon({
  size = 20,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
      <Path
        d="M12 16v-4M12 8h.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 12x12 Plus Icon (Figma plus vector)
 */
function PlusIcon({
  size = 12,
  color = 'rgba(12, 121, 12, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const RevenueTab: React.FC<RevenueTabProps> = ({ onOpenInfoModal }) => {
  // Periods per section
  const { period: totalPeriod } = useStatsPeriod('revenue.total');
  const { period: servicePeriod } = useStatsPeriod('revenue.service');

  // Total income data hook
  const totalStats = useRevenueStats(totalPeriod);

  // Services list hook
  const services = useRevenueServices();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services.length > 0 ? services[0].id : ''
  );

  // Sync selected service if list changes
  useEffect(() => {
    if (services.length > 0 && !services.some((s) => s.id === selectedServiceId)) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  // Service revenue data hook
  const serviceStats = useRevenueByService(selectedServiceId, servicePeriod);

  // Selection states for both charts
  const [selectedTotalKey, setSelectedTotalKey] = useState<string>('');
  const [selectedServiceKey, setSelectedServiceKey] = useState<string>('');

  // Default selection for Total income: point matching period day or last point
  useEffect(() => {
    if (totalStats && totalStats.series.length > 0) {
      if (totalPeriod.kind === 'day') {
        const day = totalPeriod.date.getDate();
        const month = totalPeriod.date.getMonth() + 1;
        const year = totalPeriod.date.getFullYear();
        const expectedKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const match = totalStats.series.find((p) => p.key === expectedKey);
        setSelectedTotalKey(match ? match.key : totalStats.series[totalStats.series.length - 1].key);
      } else {
        setSelectedTotalKey(totalStats.series[totalStats.series.length - 1].key);
      }
    }
  }, [totalStats, totalPeriod]);

  // Default selection for Service: point matching period day or last point
  useEffect(() => {
    if (serviceStats && serviceStats.series.length > 0) {
      if (servicePeriod.kind === 'day') {
        const day = servicePeriod.date.getDate();
        const month = servicePeriod.date.getMonth() + 1;
        const year = servicePeriod.date.getFullYear();
        const expectedKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const match = serviceStats.series.find((p) => p.key === expectedKey);
        setSelectedServiceKey(match ? match.key : serviceStats.series[serviceStats.series.length - 1].key);
      } else {
        setSelectedServiceKey(serviceStats.series[serviceStats.series.length - 1].key);
      }
    }
  }, [serviceStats, servicePeriod]);

  const serviceNames = useMemo(() => services.map((s) => s.name), [services]);
  const activeServiceName = useMemo(() => {
    const s = services.find((item) => item.id === selectedServiceId);
    return s ? s.name : '';
  }, [services, selectedServiceId]);

  return (
    <View style={styles.tabContainer}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 1: Total income (Figma R1) ───────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Title & Date Selector Row (S2) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Total income</Text>
          <PeriodSelector sectionId="revenue.total" />
        </View>

        {totalStats ? (
          <>
            {/* Headline Row (e.g. ₦500,200 with ↘ 5.2% TrendBadge) */}
            <View style={styles.headlineRow}>
              <Text style={styles.headlineAmount}>{formatNaira(totalStats.total)}</Text>
              <TrendBadge
                direction={totalStats.trend.direction}
                percent={totalStats.trend.percent}
                polarity="higherIsBetter"
              />
            </View>

            {/* Comparison Row ("Compared to last month ₦700,600") */}
            <View style={styles.comparedRowWrapper}>
              <ComparedRow
                label="Compared to last month"
                value={formatNaira(totalStats.comparedToLastMonth)}
                valueTone="positive"
              />
            </View>

            {/* Interactive Red Area Chart */}
            <View style={styles.chartWrapper}>
              <InteractiveAreaChart
                data={totalStats.series}
                tone={totalStats.trend.direction === 'down' ? 'negative' : 'positive'}
                selectedKey={selectedTotalKey}
                onSelectedKeyChange={setSelectedTotalKey}
                formatValue={formatNaira}
                accessibilityLabel="Total income chart"
              />
            </View>

            {/* Summary Row 1: "Total Revenue ⓘ" row with amount at right in green */}
            <View style={styles.revenueInfoRow}>
              <View style={styles.revenueNoteWrapper}>
                <Text style={styles.revenueNoteLabel}>Total Revenue</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onOpenInfoModal}
                  style={styles.infoButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="About total revenue"
                >
                  <InfoCircleIcon size={20} />
                </TouchableOpacity>
              </View>

              <Text style={styles.totalRevenueAmountRight}>
                {formatNaira(totalStats.total)}
              </Text>
            </View>

            {/* Summary Row 2: "Last month ₦410,230" (red) and "+ 3% Increase" (green) */}
            <View style={styles.previousMonthRow}>
              <Text style={styles.lastMonthText}>
                Last month{' '}
                <Text style={styles.lastMonthAmountRed}>
                  {formatNaira(totalStats.summary.lastMonthTotal)}
                </Text>
              </Text>

              <View style={styles.increaseBadge}>
                <PlusIcon size={12} />
                <Text style={styles.increaseText}>
                  {totalStats.summary.changePercent} Increase
                </Text>
              </View>
            </View>
          </>
        ) : (
          <StatsEmptyState message="No revenue recorded for this period" />
        )}
      </View>

      {/* ── Section Divider (Figma Line 4: 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.divider} />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 2: Revenue per service (Figma R2) ────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Title */}
        <Text style={styles.sectionTitle}>Revenue per service</Text>

        {services.length > 0 ? (
          <>
            {/* Service Chips (Scrollable PillTabs: Hair cut, Pedicure, Manicure...) */}
            <View style={styles.chipsWrapper}>
              <PillTabs
                tabs={serviceNames}
                activeTab={activeServiceName}
                onSelectTab={(name) => {
                  const match = services.find((s) => s.name === name);
                  if (match) setSelectedServiceId(match.id);
                }}
                scrollable
              />
            </View>

            {serviceStats ? (
              <>
                {/* Appointments Count & Date Selector */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.appointmentsCountHeading}>
                    {serviceStats.appointments} Appointments
                  </Text>
                  <PeriodSelector sectionId="revenue.service" />
                </View>

                {/* Service Headline Row (e.g. ₦60,200 with ↗ 5.2% TrendBadge) */}
                <View style={styles.headlineRow}>
                  <Text style={styles.headlineAmount}>
                    {formatNaira(serviceStats.total)}
                  </Text>
                  <TrendBadge
                    direction={serviceStats.trend.direction}
                    percent={serviceStats.trend.percent}
                    polarity="higherIsBetter"
                  />
                </View>

                {/* Service Comparison Row */}
                <View style={styles.comparedRowWrapper}>
                  <ComparedRow
                    label="Compared to last month"
                    value={formatNaira(serviceStats.comparedToLastMonth)}
                    valueTone="positive"
                  />
                </View>

                {/* Interactive Green Area Chart */}
                <View style={styles.chartWrapper}>
                  <InteractiveAreaChart
                    data={serviceStats.series}
                    tone={serviceStats.trend.direction === 'down' ? 'negative' : 'positive'}
                    selectedKey={selectedServiceKey}
                    onSelectedKeyChange={setSelectedServiceKey}
                    formatValue={formatNaira}
                    accessibilityLabel={`${serviceStats.serviceName} revenue chart`}
                  />
                </View>

                {/* Per-Service Summary Card (Frame 1000006459: Hair cut, Total Revenue, Appointments) */}
                <View style={styles.serviceSummaryCard}>
                  <Text style={styles.serviceSummaryTitle}>
                    {serviceStats.serviceName}
                  </Text>

                  <View style={styles.serviceSummaryColumns}>
                    {/* Left Column: Total Revenue */}
                    <View style={styles.summaryCol}>
                      <Text style={styles.summaryColLabel}>Total Revenue</Text>
                      <Text style={styles.summaryColValue}>
                        {formatNaira(serviceStats.total)}
                      </Text>
                    </View>

                    {/* Right Column: Appointments */}
                    <View style={styles.summaryCol}>
                      <Text style={styles.summaryColLabel}>Appointments</Text>
                      <Text style={styles.summaryColValue}>
                        {serviceStats.appointments}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <StatsEmptyState message="No data for this service in the selected period" />
            )}
          </>
        ) : (
          <StatsEmptyState message="No services attached to staff in Staff Management" />
        )}
      </View>
    </View>
  );
};

export default RevenueTab;

const styles = StyleSheet.create({
  tabContainer: {
    paddingBottom: 24,
  },
  sectionBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  headlineAmount: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  comparedRowWrapper: {
    marginTop: -4,
  },
  chartWrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  revenueInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  revenueNoteWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revenueNoteLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  infoButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalRevenueAmountRight: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(12, 121, 12, 0.96)',
    includeFontPadding: false,
  },
  previousMonthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMonthText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  lastMonthAmountRed: {
    color: 'rgba(204, 41, 41, 0.9)',
    fontWeight: '500',
  },
  increaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  increaseText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 24,
  },
  chipsWrapper: {
    marginTop: 4,
  },
  appointmentsCountHeading: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  serviceSummaryCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
    marginTop: 8,
  },
  serviceSummaryTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  serviceSummaryColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  summaryCol: {
    alignItems: 'flex-start',
    gap: 4,
  },
  summaryColLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  summaryColValue: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
});
