import React from 'react';
import { Platform, View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { sectionSpacing } from '../constants/theme';

export interface DetailSectionProps {
  icon?: React.ReactNode;
  title: string;
  bullets?: string[];
  description?: string;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  bulletStyle?: StyleProp<TextStyle>;
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  icon,
  title,
  bullets,
  description,
  children,
  containerStyle,
  titleStyle,
  bulletStyle,
}) => {
  return (
    <View style={[styles.sectionRow, containerStyle]}>
      {icon && (
        <View style={styles.iconCircle}>
          {icon}
        </View>
      )}
      <View style={styles.detailsCol}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {description ? (
          <Text style={[styles.bulletText, bulletStyle]}>{description}</Text>
        ) : null}
        {bullets && bullets.length > 0 ? (
          <View style={styles.bulletsContainer}>
            {bullets.map((item, idx) => (
              <Text key={idx} style={[styles.bulletText, bulletStyle]}>
                •  {item}
              </Text>
            ))}
          </View>
        ) : null}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sectionSpacing.iconTextGap,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  detailsCol: {
    flex: 1,
    gap: sectionSpacing.titleBulletGap,
  },
  title: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bulletsContainer: {
    gap: sectionSpacing.bulletGap,
    marginTop: sectionSpacing.titleBulletGap,
  },
  bulletText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: sectionSpacing.bulletLineHeight,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
