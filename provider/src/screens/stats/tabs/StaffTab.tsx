import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { useStatsPeriod } from '../../../context/StatsContext';
import { useStaffStore, StaffMember } from '../../../context/StaffContext';
import { PeriodSelector } from '../../../components/stats/PeriodSelector';
import { StatsEmptyState } from '../../../components/stats/StatsEmptyState';
import { useStaffStats } from '../../../api/statsApi';
import { formatNaira, formatCount } from '../../../utils/statsFormatters';

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
 * 20x20 Star Vector Icon (fill: rgba(248, 155, 24, 0.96))
 */
function StarIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2l2.4 4.86 5.36.78-3.88 3.78.92 5.34L10 16.24l-4.8 2.52.92-5.34-3.88-3.78 5.36-.78L10 2z"
        fill="rgba(248, 155, 24, 0.96)"
      />
    </Svg>
  );
}

/**
 * 40x40 Round Avatar with neutral SVG user placeholder or member photo
 */
function StaffAvatar({
  member,
}: {
  member?: StaffMember;
}) {
  const photo = member?.photoUri || member?.avatarUri;

  if (photo) {
    const source = typeof photo === 'string' ? { uri: photo } : photo;
    return (
      <View style={styles.avatarCircle}>
        <Image source={source} style={styles.avatarImage} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={styles.avatarCircle}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
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
  );
}

/**
 * Helper to format joined roles: "Hair Dresser & Barber"
 */
function formatMemberRoles(member?: StaffMember): string {
  if (!member) return 'Staff';
  if (member.roles && member.roles.length > 0) {
    return member.roles.join(' & ');
  }
  return member.role || 'Staff';
}

export const StaffTab: React.FC = () => {
  // Periods for 4 separate sections per Figma T1, T2, T3, T4
  const { period: countPeriod } = useStatsPeriod('staff.count');
  const { period: topPeriod } = useStatsPeriod('staff.top');
  const { period: revenuePeriod } = useStatsPeriod('staff.revenue');
  const { period: clientsPeriod } = useStatsPeriod('staff.clients');

  // Staff store access
  const { staff } = useStaffStore();

  // Create fast lookup map by staff id
  const staffMap = useMemo(() => {
    const map = new Map<string, StaffMember>();
    staff.forEach((s: StaffMember) => map.set(s.id, s));
    return map;
  }, [staff]);

  // Hook for staff stats
  const staffStats = useStaffStats(countPeriod);

  // Resolved staff cards for Section 1 (skipping removed staff)
  const resolvedStaffCards = useMemo(() => {
    if (!staffStats || !staffStats.staff) return [];
    return staffStats.staff
      .map((row) => ({
        ...row,
        member: staffMap.get(row.staffId),
      }))
      .filter((row): row is typeof row & { member: StaffMember } => Boolean(row.member));
  }, [staffStats, staffMap]);

  // Resolved Top 5 Performing rows (capped at 5, skipping removed staff)
  const resolvedTopPerforming = useMemo(() => {
    if (!staffStats || !staffStats.topPerforming) return [];
    return staffStats.topPerforming
      .map((row) => ({
        ...row,
        member: staffMap.get(row.staffId),
      }))
      .filter((row): row is typeof row & { member: StaffMember } => Boolean(row.member))
      .slice(0, 5);
  }, [staffStats, staffMap]);

  // Resolved Top Revenue rows (capped at 5, skipping removed staff)
  const resolvedTopRevenue = useMemo(() => {
    if (!staffStats || !staffStats.topRevenue) return [];
    return staffStats.topRevenue
      .map((row) => ({
        ...row,
        member: staffMap.get(row.staffId),
      }))
      .filter((row): row is typeof row & { member: StaffMember } => Boolean(row.member))
      .slice(0, 5);
  }, [staffStats, staffMap]);

  // Resolved Top Clients rows (capped at 5, skipping removed staff)
  const resolvedTopClients = useMemo(() => {
    if (!staffStats || !staffStats.topClients) return [];
    return staffStats.topClients
      .map((row) => ({
        ...row,
        member: staffMap.get(row.staffId),
      }))
      .filter((row): row is typeof row & { member: StaffMember } => Boolean(row.member))
      .slice(0, 5);
  }, [staffStats, staffMap]);

  return (
    <View style={styles.tabContainer}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 1: Staff Count & Staff Cards (Figma T1) ───────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        {/* Count Block (T1) */}
        <View style={styles.sectionHeaderStack}>
          <Text style={styles.countTitle}>
            {staffStats ? `${staffStats.totalStaff} Staff` : 'Staff'}
          </Text>
          <View style={styles.periodSelectorWrapper}>
            <PeriodSelector sectionId="staff.count" />
          </View>
          <Text style={styles.subtextLine}>
            {staffStats && staffStats.newStaffCount > 0
              ? `${staffStats.newStaffCount} new staff recorded` /* TODO (Copy): confirm copy when new staff recorded */
              : 'No new recorded staff'}
          </Text>
        </View>

        {/* Section Heading: "Staff" (corrected copy from "Staffs") */}
        <Text style={styles.sectionHeading}>Staff</Text>

        {staffStats && resolvedStaffCards.length > 0 ? (
          <View style={styles.cardsListContainer}>
            {resolvedStaffCards.map((row) => {
              const rolesString = formatMemberRoles(row.member);
              return (
                <View
                  key={row.staffId}
                  style={styles.staffCard}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`${row.member.name}, ${rolesString}, revenue ${formatNaira(row.revenue)}, clients ${formatCount(row.clients)}, ranking ${row.rating.toFixed(1)}`}
                >
                  {/* Left: Avatar */}
                  <StaffAvatar member={row.member} />

                  {/* Right: Info and 3 Columns */}
                  <View style={styles.cardContent}>
                    {/* Member Name and Role */}
                    <View style={styles.memberMeta}>
                      <Text
                        style={styles.memberName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {row.member.name}
                      </Text>
                      <Text
                        style={styles.memberRole}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {rolesString}
                      </Text>
                    </View>

                    {/* 3 Metric Columns: Revenue, Clients, Ranking */}
                    <View style={styles.cardMetricsRow}>
                      {/* Column 1: Revenue */}
                      <View style={styles.metricColumn}>
                        <Text style={styles.metricLabel}>Revenue</Text>
                        <Text
                          style={styles.metricValue}
                          numberOfLines={1}
                        >
                          {formatNaira(row.revenue)}
                        </Text>
                      </View>

                      {/* Column 2: Clients */}
                      <View style={[styles.metricColumn, styles.metricCenter]}>
                        <Text style={styles.metricLabel}>Clients</Text>
                        <Text
                          style={styles.metricValue}
                          numberOfLines={1}
                        >
                          {formatCount(row.clients)}
                        </Text>
                      </View>

                      {/* Column 3: Ranking */}
                      <View style={[styles.metricColumn, styles.metricCenter]}>
                        <Text style={styles.metricLabel}>Ranking</Text>
                        <View style={styles.rankingValueRow}>
                          <StarIcon size={20} />
                          <Text style={styles.metricValue}>
                            {row.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <StatsEmptyState message="No staff members found for this period" />
        )}
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 2: Top 5 Performing Staff (Figma T2) ─────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderStack}>
          <Text style={styles.sectionHeading}>Top 5 Performing Staff</Text>
          <View style={styles.periodSelectorWrapper}>
            <PeriodSelector sectionId="staff.top" />
          </View>
        </View>

        {staffStats && resolvedTopPerforming.length > 0 ? (
          <View style={styles.topRowsContainer}>
            {resolvedTopPerforming.map((row) => (
              <View
                key={`performing-${row.staffId}`}
                style={styles.topRow}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${row.member.name}, ${formatMemberRoles(row.member)}, rating ${row.rating.toFixed(1)}`}
              >
                <View style={styles.topRowLeft}>
                  <StaffAvatar member={row.member} />
                  <View style={styles.topRowText}>
                    <Text
                      style={styles.topRowName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {row.member.name}
                    </Text>
                    <Text
                      style={styles.topRowRole}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {formatMemberRoles(row.member)}
                    </Text>
                  </View>
                </View>

                {/* Right: Star and Rating */}
                <View style={styles.rankingValueRow}>
                  <StarIcon size={20} />
                  <Text style={styles.topRowMetricValue}>
                    {row.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <StatsEmptyState message="No performing staff data recorded for this period" />
        )}
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 3: Top Revenue Generated Staff (Figma T3) ─────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderStack}>
          <Text style={styles.sectionHeading}>Top revenue generated staff</Text>
          <View style={styles.periodSelectorWrapper}>
            <PeriodSelector sectionId="staff.revenue" />
          </View>
        </View>

        {staffStats && resolvedTopRevenue.length > 0 ? (
          <View style={styles.topRowsContainer}>
            {resolvedTopRevenue.map((row) => (
              <View
                key={`revenue-${row.staffId}`}
                style={styles.topRow}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${row.member.name}, ${formatMemberRoles(row.member)}, revenue ${formatNaira(row.revenue)}`}
              >
                <View style={styles.topRowLeft}>
                  <StaffAvatar member={row.member} />
                  <View style={styles.topRowText}>
                    <Text
                      style={styles.topRowName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {row.member.name}
                    </Text>
                    <Text
                      style={styles.topRowRole}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {formatMemberRoles(row.member)}
                    </Text>
                  </View>
                </View>

                {/* Right: Revenue Label & Amount */}
                <View style={styles.topMetricColumn}>
                  <Text style={styles.metricLabel}>Revenue</Text>
                  <Text
                    style={styles.topRowMetricValue}
                    numberOfLines={1}
                  >
                    {formatNaira(row.revenue)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <StatsEmptyState message="No revenue generated staff data for this period" />
        )}
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 4: Top Most Client Served Staff (Figma T4) ───────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderStack}>
          <Text style={styles.sectionHeading}>Top most client served staff</Text>
          <View style={styles.periodSelectorWrapper}>
            <PeriodSelector sectionId="staff.clients" />
          </View>
        </View>

        {staffStats && resolvedTopClients.length > 0 ? (
          <View style={styles.topRowsContainer}>
            {resolvedTopClients.map((row) => (
              <View
                key={`clients-${row.staffId}`}
                style={styles.topRow}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${row.member.name}, ${formatMemberRoles(row.member)}, clients served ${formatCount(row.clients)}`}
              >
                <View style={styles.topRowLeft}>
                  <StaffAvatar member={row.member} />
                  <View style={styles.topRowText}>
                    <Text
                      style={styles.topRowName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {row.member.name}
                    </Text>
                    <Text
                      style={styles.topRowRole}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {formatMemberRoles(row.member)}
                    </Text>
                  </View>
                </View>

                {/* Right: Clients Label & Count */}
                <View style={styles.topMetricColumn}>
                  <Text style={styles.metricLabel}>Clients</Text>
                  <Text
                    style={styles.topRowMetricValue}
                    numberOfLines={1}
                  >
                    {formatCount(row.clients)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <StatsEmptyState message="No client served staff data for this period" />
        )}
      </View>
    </View>
  );
};

export default StaffTab;

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
    marginBottom: 20,
  },
  countTitle: {
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
  subtextLine: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  sectionHeading: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 16,
    includeFontPadding: false,
  },
  cardsListContainer: {
    width: '100%',
    gap: 16,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 16,
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#ECECF0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  cardContent: {
    flex: 1,
    gap: 20,
  },
  memberMeta: {
    gap: 5,
  },
  memberName: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  memberRole: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  cardMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricColumn: {
    gap: 8,
    alignItems: 'flex-start',
  },
  metricCenter: {
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  metricValue: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  rankingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 12,
  },
  topRowsContainer: {
    width: '100%',
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 84,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    width: '100%',
  },
  topRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    marginRight: 12,
  },
  topRowText: {
    flex: 1,
    gap: 5,
  },
  topRowName: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  topRowRole: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  topMetricColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  topRowMetricValue: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
});
