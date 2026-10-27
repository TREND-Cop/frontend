import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useStatsPeriod } from '../../../context/StatsContext';
import { PeriodSelector } from '../../../components/stats/PeriodSelector';
import { TrendBadge } from '../../../components/stats/TrendBadge';
import { ComparedRow } from '../../../components/stats/ComparedRow';
import { InteractiveAreaChart } from '../../../components/stats/InteractiveAreaChart';
import { RadialChart } from '../../../components/stats/RadialChart';
import { StatsEmptyState } from '../../../components/stats/StatsEmptyState';
import { useAppointmentStats } from '../../../api/statsApi';
import { formatCount } from '../../../utils/statsFormatters';
import {
  getTrendTone,
  getPreviousValueTone,
  TREND_COLORS,
} from '../../../utils/trendUtils';

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
 * 20x20 Arrow Vector for Comparison Rows & Busiest Times (matching Figma trending-up / trending-down)
 */
function TrendArrowIcon({
  direction,
  color,
}: {
  direction: 'up' | 'down';
  color: string;
}) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      {direction === 'up' ? (
        <Path
          d="M4 14L14 4M14 4H7M14 4V11"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <Path
          d="M4 6L14 16M14 16H7M14 16V9"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

export const AppointmentsTab: React.FC = () => {
  // Periods for 3 separate sections per Figma A1, A2, A4
  const { period: countPeriod } = useStatsPeriod('appointments.count');
  const { period: statusPeriod } = useStatsPeriod('appointments.status');
  const { period: busiestPeriod } = useStatsPeriod('appointments.busiest');

  // Appointment stats data hook
  const appointmentStats = useAppointmentStats(countPeriod);

  // Selected key state for A1 interactive chart
  const [selectedDayKey, setSelectedDayKey] = useState<string>('');

  // Default selection matching day or Wed 03 / last point
  useEffect(() => {
    if (appointmentStats && appointmentStats.series.length > 0) {
      if (countPeriod.kind === 'day') {
        const day = countPeriod.date.getDate();
        const month = countPeriod.date.getMonth() + 1;
        const year = countPeriod.date.getFullYear();
        const expectedKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const match = appointmentStats.series.find((p) => p.key === expectedKey);
        setSelectedDayKey(
          match ? match.key : appointmentStats.series[2]?.key || appointmentStats.series[0].key
        );
      } else {
        setSelectedDayKey(
          appointmentStats.series[2]?.key || appointmentStats.series[0].key
        );
      }
    }
  }, [appointmentStats, countPeriod]);

  return (
    <View style={styles.tabContainer}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 1: Appointments Over Time (Figma A1) ─────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Section Heading & Period Selector */}
        <View style={styles.sectionHeaderStack}>
          <Text style={styles.sectionTitle}>Appointments</Text>
          <View style={styles.periodSelectorWrapper}>
            <PeriodSelector sectionId="appointments.count" />
          </View>
        </View>

        {appointmentStats ? (
          <>
            {/* Headline Row: "350 Appointments" + ↗ 5.2% TrendBadge */}
            <View style={styles.headlineRow}>
              <View style={styles.countWithUnit}>
                <Text style={styles.countNumber}>{appointmentStats.total}</Text>
                <Text style={styles.countUnit}>Appointments</Text>
              </View>
              <TrendBadge
                direction={appointmentStats.trend.direction}
                percent={appointmentStats.trend.percent}
                polarity="higherIsBetter"
              />
            </View>

            {/* Comparison Row: "Compared to last month 255 Appointments" */}
            <View style={styles.comparedRowWrapper}>
              <ComparedRow
                label="Compared to last month"
                value={`${appointmentStats.comparedAppointments} Appointments`}
                valueTone="positive"
              />
            </View>

            {/* Interactive Green Area Chart (Follows positive trend; tooltip shows count) */}
            <View style={styles.chartWrapper}>
              <InteractiveAreaChart
                data={appointmentStats.series}
                tone="positive"
                selectedKey={selectedDayKey}
                onSelectedKeyChange={setSelectedDayKey}
                formatValue={(val) => formatCount(val)}
                accessibilityLabel="Appointments over time chart"
              />
            </View>
          </>
        ) : (
          <StatsEmptyState message="No appointment statistics recorded for this period" />
        )}
      </View>

      {/* ── Divider (Line 3: 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.divider} />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 2: Appointment Status & Comparison Rows (Figma A2, A3) ─ */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Section Heading */}
        <Text style={styles.sectionTitle}>Appointment status</Text>

        {/* Count Headline and Period Selector */}
        <View style={styles.statusHeaderRow}>
          <View style={styles.countWithUnit}>
            <Text style={styles.countNumber}>
              {appointmentStats ? appointmentStats.status.total : 0}
            </Text>
            <Text style={styles.countUnit}>Appointments</Text>
          </View>
          <PeriodSelector sectionId="appointments.status" />
        </View>

        {appointmentStats ? (
          <>
            {/* Pie Chart (RadialChart with innerRadiusRatio = 0 and labelMode = 'radial') */}
            <View style={styles.pieChartWrapper}>
              <RadialChart
                slices={appointmentStats.status.slices.map((slice) => ({
                  key: slice.key,
                  value: parseInt(slice.percent.replace('%', ''), 10) || 1,
                  color: slice.color,
                  labelPrimary: slice.percent,
                  labelSecondary: slice.label,
                  textColor:
                    slice.key === 'upfront'
                      ? 'rgba(96, 96, 102, 0.96)'
                      : '#FFFFFF',
                }))}
                innerRadiusRatio={0}
                labelMode="radial"
                startAngleOffset={-140}
                size={280}
                accessibilityLabel={`Appointment status breakdown: Completed ${appointmentStats.status.slices.find((s) => s.key === 'completed')?.percent || ''}, Reschedule ${appointmentStats.status.slices.find((s) => s.key === 'reschedule')?.percent || ''}, Upfront ${appointmentStats.status.slices.find((s) => s.key === 'upfront')?.percent || ''}, Canceled ${appointmentStats.status.slices.find((s) => s.key === 'canceled')?.percent || ''}`}
              />
            </View>

            {/* Comparison Rows (Figma A3) */}
            <View style={styles.comparisonRowsContainer}>
              {appointmentStats.status.rows.map((row) => {
                // Tone rules per "Chart Metrics" note:
                // Completed uses normal polarity ('higherIsBetter' -> up is green, down is red)
                // Canceled and Reschedule use 'lowerIsBetter' (up is red, down is green)
                const polarity =
                  row.key === 'completed' ? 'higherIsBetter' : 'lowerIsBetter';
                const rowTone = getTrendTone(row.direction, polarity);
                const prevTone = getPreviousValueTone(rowTone);
                const rowColor = TREND_COLORS[rowTone];

                return (
                  <View
                    key={row.key}
                    style={styles.comparisonRow}
                    accessible
                    accessibilityRole="text"
                    accessibilityLabel={`${row.label}, ${row.percent}, ${row.direction}, last month ${row.lastMonthPercent}`}
                  >
                    {/* Top sub-row: Service label and Large Percent + Trend Arrow */}
                    <View style={styles.comparisonRowTop}>
                      <Text style={styles.comparisonRowLabel} numberOfLines={1}>
                        {row.label}
                      </Text>
                      <View style={styles.comparisonRowValueGroup}>
                        <TrendArrowIcon
                          direction={row.direction}
                          color={rowColor}
                        />
                        <Text
                          style={[
                            styles.comparisonRowPercent,
                            { color: rowColor },
                          ]}
                        >
                          {row.percent}
                        </Text>
                      </View>
                    </View>

                    {/* Bottom sub-row: "Last month {n}%" */}
                    <Text style={styles.comparisonRowLastMonth}>
                      Last month{' '}
                      <Text
                        style={[
                          styles.comparisonRowLastMonthValue,
                          { color: TREND_COLORS[prevTone] },
                        ]}
                      >
                        {row.lastMonthPercent}
                      </Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <StatsEmptyState message="No appointment status data recorded for this period" />
        )}
      </View>

      {/* ── Divider (Line 3: 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.divider} />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 3: Busiest Times (Figma A4) ──────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Section Heading & Period Selector */}
        <View style={styles.sectionHeaderStack}>
          <Text style={styles.sectionTitle}>Busiest Times</Text>
          <View style={styles.periodSelectorWrapper}>
            <PeriodSelector sectionId="appointments.busiest" />
          </View>
        </View>

        {appointmentStats ? (
          <View style={styles.busiestContainer}>
            {/* Day Label ("Monday" in grey) */}
            <Text style={styles.busiestDayLabel}>
              {appointmentStats.busiest.dayLabel}
            </Text>

            {/* Two Metric Columns */}
            <View style={styles.busiestColumnsRow}>
              {/* Column 1: Appointments */}
              <View style={styles.busiestCol}>
                <Text style={styles.busiestColTitle}>Appointments</Text>
                <View style={styles.busiestColValueGroup}>
                  <TrendArrowIcon
                    direction={appointmentStats.busiest.appointmentsDirection}
                    color={
                      TREND_COLORS[
                        getTrendTone(
                          appointmentStats.busiest.appointmentsDirection,
                          'higherIsBetter'
                        )
                      ]
                    }
                  />
                  <Text style={styles.busiestColNumber}>
                    {appointmentStats.busiest.appointments}
                  </Text>
                </View>
              </View>

              {/* Column 2: Total Work Hours */}
              <View style={styles.busiestCol}>
                <Text style={styles.busiestColTitle}>Total Work Hours</Text>
                <View style={styles.busiestColValueGroup}>
                  <TrendArrowIcon
                    direction={appointmentStats.busiest.workHoursDirection}
                    color={
                      TREND_COLORS[
                        getTrendTone(
                          appointmentStats.busiest.workHoursDirection,
                          'higherIsBetter'
                        )
                      ]
                    }
                  />
                  <View style={styles.workHoursValueRow}>
                    <Text style={styles.busiestColNumber}>
                      {appointmentStats.busiest.workHours}
                    </Text>
                    <Text style={styles.busiestColUnit}>hrs</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <StatsEmptyState message="No busiest times recorded for this period" />
        )}
      </View>
    </View>
  );
};

export default AppointmentsTab;

const styles = StyleSheet.create({
  tabContainer: {
    width: '100%',
    paddingBottom: 24,
  },
  sectionBlock: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionHeaderStack: {
    gap: 16,
    marginBottom: 24,
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
  periodSelectorWrapper: {
    alignSelf: 'flex-start',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  countWithUnit: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  countNumber: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  countUnit: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  comparedRowWrapper: {
    marginBottom: 20,
  },
  chartWrapper: {
    width: '100%',
    marginTop: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 12,
  },
  pieChartWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  comparisonRowsContainer: {
    width: '100%',
    gap: 32,
    marginTop: 24,
    paddingBottom: 8,
  },
  comparisonRow: {
    width: '100%',
    gap: 8,
  },
  comparisonRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonRowLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
    flex: 1,
    marginRight: 8,
  },
  comparisonRowValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonRowPercent: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  comparisonRowLastMonth: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  comparisonRowLastMonthValue: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  busiestContainer: {
    width: '100%',
    gap: 24,
    marginTop: 8,
  },
  busiestDayLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  busiestColumnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 60,
  },
  busiestCol: {
    gap: 10,
    minWidth: 100,
  },
  busiestColTitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  busiestColValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workHoursValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  busiestColNumber: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(12, 121, 12, 0.96)',
    includeFontPadding: false,
  },
  busiestColUnit: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
    includeFontPadding: false,
  },
});
