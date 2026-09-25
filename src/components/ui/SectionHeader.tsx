import React, { useEffect, useRef } from 'react';
import {  View, Text, StyleSheet, TouchableOpacity, Animated , Platform } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { theme } from '../../constants/theme';

const AnimatedFlame = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if ((Platform.OS as string) === 'web') return;
    const isNotWeb = (Platform.OS as string) !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.2, duration: 150, useNativeDriver: isNotWeb }),
          Animated.timing(opacity, { toValue: 0.8, duration: 150, useNativeDriver: isNotWeb }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.9, duration: 150, useNativeDriver: isNotWeb }),
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: isNotWeb }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.1, duration: 150, useNativeDriver: isNotWeb }),
          Animated.timing(opacity, { toValue: 0.9, duration: 150, useNativeDriver: isNotWeb }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: isNotWeb }),
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: isNotWeb }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale, opacity]);

  return (
    <Animated.Text style={[styles.icon, { transform: [{ scale }], opacity }]}>
      🔥
    </Animated.Text>
  );
};

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
  icon?: 'fire' | null;
  rightElement?: React.ReactNode;
  titleColor?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  showSeeAll,
  onSeeAllPress,
  icon,
  rightElement,
  titleColor,
}: SectionHeaderProps) => {
  const isClickable = !!onSeeAllPress || showSeeAll;

  const content = (
    <>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          {icon === 'fire' && <AnimatedFlame />}
          <Text style={[styles.title, titleColor ? { color: titleColor } : undefined]}>{title}</Text>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {rightElement ? (
        rightElement
      ) : showSeeAll ? (
        <View style={styles.seeAllButton}>
          <ArrowRight size={20} color={theme.colors.barberPrimary} />
        </View>
      ) : null}
    </>
  );

  if (isClickable) {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={onSeeAllPress} 
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Center vertically so See All / dots align better
    width: '100%',
    marginBottom: 32, // was 24, +8 = 32px spacing between header and content
  },
  textContainer: {
    flex: 1,
    gap: 8, // Figma: 8px gap between title and subtitle
    paddingRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 18,
  },
  title: {
    ...theme.typography.homeHeader,
    color: theme.colors.barberPrimary,
  },
  subtitle: {
    ...theme.typography.supportText,
    color: theme.colors.barberPrimarySupport,
  },
  seeAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.layerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
