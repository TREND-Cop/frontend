import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface OngoingServiceIndicatorProps {
  initialTime?: string; // e.g. "1:25:30"
  title?: string;
  subtitle?: string;
}

function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

function formatSecondsToTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

export function OngoingServiceIndicator({
  initialTime = '1:25:30',
  title = 'Ongoing Appointment',
  subtitle = 'This appointment is currently in progress',
}: OngoingServiceIndicatorProps) {
  const [seconds, setSeconds] = useState(() => parseTimeToSeconds(initialTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = formatSecondsToTime(seconds);

  return (
    <View style={styles.indicatorContainer}>
      {/* Timer Pill (74x40px) */}
      <View style={styles.timerPill}>
        <Text style={styles.timerText}>{formattedTime}</Text>
      </View>

      {/* Text Info Group (236x70px) */}
      <View style={styles.textGroup}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Frame: width: 358px; height: 86px; background: rgba(238, 248, 238, 0.8); border-radius: 24px; padding: 8px 16px;
  indicatorContainer: {
    width: '100%',
    maxWidth: 358,
    minHeight: 86,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    alignSelf: 'center',
  },
  // Frame 1000006525: width: 74px; height: 40px; background: #FFFFFF; border-radius: 24px;
  timerPill: {
    width: 74,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    flexShrink: 0,
  },
  // Text: font 16px Inter Medium, color: #0C790C, line-height: 24px
  timerText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#0C790C',
    letterSpacing: 0.15,
    textAlign: 'center',
  },
  // Frame 1000006322: width: 236px; height: 70px; gap: 6px
  textGroup: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  // Ongoing Appointment: 16px SF Pro/DM Sans 500/Regular, color: #000814, line-height: 24px
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // This appointment is currently in progress: 14px SF Pro/DM Sans Regular, color: #606066, line-height: 20px
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
