import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { GreenCheckCircleIcon } from './ReviewIcons';

const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

export interface ServiceSuccessBannerProps {
  message?: string;
  testID?: string;
}

/**
 * 1:1 Figma Green Success Banner (D1: Service Details Screen)
 * - Container: minHeight 68px, radius 16px, background rgba(238, 248, 238, 0.8), padding 16px, gap 16px
 * - White badge: 36x36px, radius 24px, background #FFFFFF, centered checkmark
 * - Text: 16px regular, lineHeight 24px, letterSpacing 0.4px, color rgba(12, 121, 12, 0.96)
 * - Accessibility: accessibilityRole="alert"
 */
export const ServiceSuccessBanner: React.FC<ServiceSuccessBannerProps> = ({
  message = 'Service upload successful',
  testID,
}) => {
  return (
    <View
      style={styles.bannerContainer}
      accessibilityRole="alert"
      accessibilityLabel={message}
      testID={testID}
    >
      <View style={styles.iconCircle}>
        <GreenCheckCircleIcon size={20} />
      </View>
      <Text style={styles.bannerText} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
};

export default ServiceSuccessBanner;

const styles = StyleSheet.create({
  bannerContainer: {
    minHeight: 68,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
});
