import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { AppointmentClient } from '../../types/staffAppointments';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Icons ────────────────────────────────────────────────────────────────────

function HeartHandshakeIcon({ size = 20, color = 'rgba(97, 21, 132, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 5L9.5 7.5a2.5 2.5 0 000 3.5l2.5 2.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function GenderSymbolIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 14a5 5 0 100-10 5 5 0 000 10zm0 0v7m-3-3h6"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 5l-4 4m4-4h-3.5M19 5v3.5"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function VerifiedCheckBadgeIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 2.4 3.4-.4 1.4 3.1 3.2 1.2-.4 3.4 2 2.8-2 2.8.4 3.4-3.2 1.2-1.4 3.1-3.4-.4L12 22l-2.4-2.4-3.4.4-1.4-3.1-3.2-1.2.4-3.4-2-2.8 2-2.8-.4-3.4 3.2-1.2 1.4-3.1 3.4.4L12 2z"
        fill="rgba(26, 130, 255, 0.9)"
        stroke="rgba(26, 130, 255, 0.9)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 11a4 4 0 100-8 4 4 0 000 8z"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export interface AppointmentClientCardProps {
  client: AppointmentClient;
  variant?: 'new' | 'returning';
}

export const AppointmentClientCard: React.FC<AppointmentClientCardProps> = ({
  client,
  variant,
}) => {
  const isReturning = variant ? variant === 'returning' : !client.isNew;
  const showVerifiedCheck = client.badge !== 'Non' && client.badge !== '';

  const gradientColors = isReturning
    ? (['rgba(209, 164, 230, 0.92)', 'rgba(255, 255, 255, 0.96)'] as const)
    : (['rgba(203, 230, 164, 0.92)', 'rgba(255, 255, 255, 0.96)'] as const);

  const cardBorderColor = isReturning ? '#D1A4E6' : '#CBE6A4';

  return (
    <LinearGradient
      colors={gradientColors}
      locations={[-0.5, 0.82]}
      style={[styles.clientCard, { borderColor: cardBorderColor }]}
    >
      {/* Top Row: Avatar with badge, Name, Pill */}
      <View style={styles.clientHeaderRow}>
        <View style={styles.avatarWrapper}>
          <Image
            source={client.photo || require('../../../assets/images/profile/cont1.jpg')}
            style={styles.clientAvatarImage}
            resizeMode="cover"
          />
          {showVerifiedCheck && (
            <View style={styles.avatarCheckBadge}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2l2.4 2.4 3.4-.4 1.4 3.1 3.2 1.2-.4 3.4 2 2.8-2 2.8.4 3.4-3.2 1.2-1.4 3.1-3.4-.4L12 22l-2.4-2.4-3.4.4-1.4-3.1-3.2-1.2.4-3.4-2-2.8 2-2.8-.4-3.4 3.2-1.2 1.4-3.1 3.4.4L12 2z"
                  fill="#1A82FF"
                  stroke="#1A82FF"
                  strokeWidth="1.25"
                />
                <Path
                  d="M9 12l2 2 4-4"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          )}
        </View>

        <View style={styles.clientNameCol}>
          <Text style={styles.clientNameText} numberOfLines={1}>
            {client.name}
          </Text>

          {isReturning ? (
            <View style={styles.returningBadgeRow}>
              <HeartHandshakeIcon size={18} />
              <Text style={styles.returningBadgeText}>Returning Client</Text>
            </View>
          ) : (
            <View style={styles.newBadgePill}>
              <Text style={styles.newBadgeText}>New Client</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom 3 Columns: Gender | Badge | Membership */}
      <View style={styles.clientStatsRow}>
        {/* Gender */}
        <View style={styles.statCol}>
          <View style={styles.statIconBox}>
            <GenderSymbolIcon size={20} />
          </View>
          <Text style={styles.statLabelText}>Gender</Text>
          <Text style={styles.statValueText}>{client.gender}</Text>
        </View>

        <View style={styles.verticalDivider} />

        {/* Badge */}
        <View style={styles.statCol}>
          <View style={styles.statIconBox}>
            <VerifiedCheckBadgeIcon size={20} />
          </View>
          <Text style={styles.statLabelText}>Badge</Text>
          <Text style={styles.statValueText}>{client.badge}</Text>
        </View>

        <View style={styles.verticalDivider} />

        {/* Membership */}
        <View style={styles.statCol}>
          <View style={styles.statIconBox}>
            <UserIcon size={20} />
          </View>
          <Text style={styles.statLabelText}>Membership</Text>
          <Text style={styles.statValueText}>{client.membershipAgeText}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  clientCard: {
    width: '100%',
    padding: 16,
    borderRadius: 24,
    borderWidth: 0.5,
    gap: 24,
  },
  clientHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  clientAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  avatarCheckBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  clientNameCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  clientNameText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  returningBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  returningBadgeText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(97, 21, 132, 0.96)',
    fontWeight: '500',
  },
  newBadgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(238, 248, 238, 0.9)',
  },
  newBadgeText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(10, 95, 10, 0.8)',
  },
  clientStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    borderRadius: 16,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabelText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  statValueText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  verticalDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
});
