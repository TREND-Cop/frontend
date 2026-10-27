import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { useStatsPeriod } from '../../../context/StatsContext';
import { PeriodSelector } from '../../../components/stats/PeriodSelector';
import { TrendBadge } from '../../../components/stats/TrendBadge';
import { ComparedRow } from '../../../components/stats/ComparedRow';
import { InteractiveAreaChart } from '../../../components/stats/InteractiveAreaChart';
import { RadialChart } from '../../../components/stats/RadialChart';
import { StatsEmptyState } from '../../../components/stats/StatsEmptyState';
import { useClientStats } from '../../../api/statsApi';
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
 * 20x20 Arrow Vector for Comparison Columns (matching Figma trending-up / trending-down)
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

/**
 * Client Avatar with centered Rank Badge (Figma Frame 1000006436 + tag)
 */
function ClientAvatarWithBadge({ rank }: { rank: number }) {
  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarCircle}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="8"
            r="4"
            stroke="rgba(192, 192, 204, 0.96)"
            strokeWidth={1.5}
          />
          <Path
            d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6"
            stroke="rgba(192, 192, 204, 0.96)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* Round Rank Badge */}
      <View style={styles.rankBadge}>
        <Text style={styles.rankBadgeText}>{rank}</Text>
      </View>
    </View>
  );
}

export const ClientsTab: React.FC = () => {
  // Periods for 3 separate sections per Figma C1, C2, C3
  const { period: countPeriod } = useStatsPeriod('clients.count');
  const { period: mixPeriod } = useStatsPeriod('clients.mix');
  const { period: topPeriod } = useStatsPeriod('clients.top');

  // Client stats data hook
  const clientStats = useClientStats(countPeriod);

  // Selected key state for C1 interactive chart
  const [selectedDayKey, setSelectedDayKey] = useState<string>('');

  // Default selection matching day or last point
  useEffect(() => {
    if (clientStats && clientStats.series.length > 0) {
      if (countPeriod.kind === 'day') {
        const day = countPeriod.date.getDate();
        const month = countPeriod.date.getMonth() + 1;
        const year = countPeriod.date.getFullYear();
        const expectedKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const match = clientStats.series.find((p) => p.key === expectedKey);
        setSelectedDayKey(
          match ? match.key : clientStats.series[clientStats.series.length - 1].key
        );
      } else {
        setSelectedDayKey(
          clientStats.series[clientStats.series.length - 1].key
        );
      }
    }
  }, [clientStats, countPeriod]);

  // Derived trend tones for C2 comparison columns
  const newTrendTone = clientStats
    ? getTrendTone(clientStats.mix.newTrend.direction, 'higherIsBetter')
    : 'positive';
  const returningTrendTone = clientStats
    ? getTrendTone(clientStats.mix.returningTrend.direction, 'higherIsBetter')
    : 'negative';

  const newPrevTone = getPreviousValueTone(newTrendTone);
  const returningPrevTone = getPreviousValueTone(returningTrendTone);

  return (
    <View style={styles.tabContainer}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 1: Clients Over Time (Figma C1) ──────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Top Count Label (Corrected copy slip: "103 Clients" instead of "103 Appointments") */}
        <View style={styles.sectionHeader}>
          <Text style={styles.topCountLabel}>
            {clientStats ? `${clientStats.comparedClients + 4} Clients` : 'Clients'}
          </Text>
          <PeriodSelector sectionId="clients.count" />
        </View>

        {clientStats ? (
          <>
            {/* Headline Row: "600 Clients" + ↗ 5.2% TrendBadge */}
            <View style={styles.headlineRow}>
              <View style={styles.countWithUnit}>
                <Text style={styles.countNumber}>{clientStats.total}</Text>
                <Text style={styles.countUnit}>Clients</Text>
              </View>
              <TrendBadge
                direction={clientStats.trend.direction}
                percent={clientStats.trend.percent}
                polarity="higherIsBetter"
              />
            </View>

            {/* Comparison Row: "Compared to last month 99 clients" */}
            <View style={styles.comparedRowWrapper}>
              <ComparedRow
                label="Compared to last month"
                value={`${clientStats.comparedClients} clients`}
                valueTone="positive"
              />
            </View>

            {/* Interactive Green Area Chart (Tooltip shows formatCount, not ₦) */}
            <View style={styles.chartWrapper}>
              <InteractiveAreaChart
                data={clientStats.series}
                tone="positive"
                selectedKey={selectedDayKey}
                onSelectedKeyChange={setSelectedDayKey}
                formatValue={(val) => formatCount(val)}
                accessibilityLabel="Clients over time chart"
              />
            </View>
          </>
        ) : (
          <StatsEmptyState message="No client statistics recorded for this period" />
        )}
      </View>

      {/* ── Divider (Line 3: 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.divider} />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 2: New vs Returning Donut (Figma C2) ─────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Section Title (Corrected copy slip: "90 Clients" instead of "90 Appointments") */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {clientStats ? `${clientStats.mix.total} Clients` : 'New vs Returning'}
          </Text>
          <PeriodSelector sectionId="clients.mix" />
        </View>

        {clientStats ? (
          <>
            {/* Reusable Donut RadialChart */}
            <RadialChart
              slices={[
                {
                  key: 'new',
                  value: clientStats.mix.newPercent,
                  color: 'rgba(12, 121, 12, 0.96)',
                  labelPrimary: `${clientStats.mix.newPercent}%`,
                  labelSecondary: 'New client',
                  textColor: '#FFFFFF',
                },
                {
                  key: 'returning',
                  value: clientStats.mix.returningPercent,
                  color: '#D9B8FF',
                  labelPrimary: `${clientStats.mix.returningPercent}%`,
                  labelSecondary: 'Returning client',
                  textColor: '#000000',
                },
              ]}
              innerRadiusRatio={0.55}
              labelMode="horizontal"
              accessibilityLabel={`Client breakdown: ${clientStats.mix.newPercent} percent new clients, ${clientStats.mix.returningPercent} percent returning clients`}
            />

            {/* Comparison Columns (Frame 1000006473) */}
            <View style={styles.comparisonColumnsContainer}>
              {/* Column 1: New clients */}
              <View style={styles.comparisonCol}>
                <Text style={styles.colHeaderLabel}>New clients</Text>
                <View style={styles.colTrendRow}>
                  <TrendArrowIcon
                    direction={clientStats.mix.newTrend.direction}
                    color={TREND_COLORS[newTrendTone]}
                  />
                  <Text
                    style={[
                      styles.colPercentText,
                      { color: TREND_COLORS[newTrendTone] },
                    ]}
                  >
                    {clientStats.mix.newTrend.percent}
                  </Text>
                </View>
                <Text style={styles.colLastMonthLabel}>
                  Last month{' '}
                  <Text
                    style={[
                      styles.colLastMonthValue,
                      { color: TREND_COLORS[newPrevTone] },
                    ]}
                  >
                    {clientStats.mix.lastMonthNewPercent}%
                  </Text>
                </Text>
              </View>

              {/* Thin Vertical Divider (Line 2 in Figma) */}
              <View style={styles.verticalDivider} />

              {/* Column 2: Returning clients */}
              <View style={styles.comparisonCol}>
                <Text style={styles.colHeaderLabel}>Returning clients</Text>
                <View style={styles.colTrendRow}>
                  <TrendArrowIcon
                    direction={clientStats.mix.returningTrend.direction}
                    color={TREND_COLORS[returningTrendTone]}
                  />
                  <Text
                    style={[
                      styles.colPercentText,
                      { color: TREND_COLORS[returningTrendTone] },
                    ]}
                  >
                    {clientStats.mix.returningTrend.percent}
                  </Text>
                </View>
                <Text style={styles.colLastMonthLabel}>
                  Last month{' '}
                  <Text
                    style={[
                      styles.colLastMonthValue,
                      { color: TREND_COLORS[returningPrevTone] },
                    ]}
                  >
                    {clientStats.mix.lastMonthReturningPercent}%
                  </Text>
                </Text>
              </View>
            </View>
          </>
        ) : (
          <StatsEmptyState message="No client breakdown available for this period" />
        )}
      </View>

      {/* ── Divider (Line 4: 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.divider} />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 3: Top Clients (Figma C3) ────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Title & Date Selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {clientStats && clientStats.topClients.length > 0
              ? `${clientStats.topClients.length} Top clients`
              : 'Top clients'}
          </Text>
          <PeriodSelector sectionId="clients.top" />
        </View>

        {clientStats && clientStats.topClients.length > 0 ? (
          <View style={styles.topClientsList}>
            {clientStats.topClients.map((client, index) => {
              const rank = index + 1;
              const appointmentsText = `${client.appointments} ${
                client.appointments === 1 ? 'Appointment' : 'Appointments'
              }`;

              return (
                <View
                  key={client.id || String(rank)}
                  style={styles.clientCard}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`Rank ${rank}, ${client.name}, ${appointmentsText}`}
                >
                  {/* Round Avatar with Rank Badge */}
                  <ClientAvatarWithBadge rank={rank} />

                  {/* Client Metadata */}
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {client.name}
                    </Text>
                    <Text style={styles.clientAppointments} numberOfLines={1}>
                      {appointmentsText}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <StatsEmptyState message="No top clients recorded for this period" />
        )}
      </View>
    </View>
  );
};

export default ClientsTab;

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
  topCountLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
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
  countWithUnit: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  countNumber: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  countUnit: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingBottom: 2,
    includeFontPadding: false,
  },
  comparedRowWrapper: {
    marginTop: -4,
  },
  chartWrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 24,
  },
  comparisonColumnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 12,
  },
  comparisonCol: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  verticalDivider: {
    width: 1,
    height: 55,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 16,
  },
  colHeaderLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  colTrendRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  colPercentText: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  colLastMonthLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  colLastMonthValue: {
    fontWeight: '500',
  },
  topClientsList: {
    gap: 16,
    marginTop: 8,
  },
  clientCard: {
    width: '100%',
    minHeight: 92,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
    width: 50,
    height: 54,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EBEBF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadge: {
    position: 'absolute',
    bottom: 0,
    minWidth: 22,
    height: 20,
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  rankBadgeText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  clientInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  clientName: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },
  clientAppointments: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
});
