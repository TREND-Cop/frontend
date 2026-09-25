import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Svg, { Path, Rect } from 'react-native-svg';
import { theme } from '../../constants/theme';
import {
  RateFeedbackBottomSheet,
  shouldShowRandomRatePrompt,
} from '../../components/RateFeedbackBottomSheet';
import { tabSkeletonStore } from '../../utils/tabSkeletonStore';
const CategoryGridIcon = ({ color, size = 24, strokeWidth = 1.8, fill = 'none', ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" color={color} fill={fill} {...props}>
    <Rect x="3.5" y="3.5" width="6.5" height="6.5" rx="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <Rect x="14" y="3.5" width="6.5" height="6.5" rx="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <Rect x="3.5" y="14" width="6.5" height="6.5" rx="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <Rect x="14" y="14" width="6.5" height="6.5" rx="2" stroke="currentColor" strokeWidth={strokeWidth} />
  </Svg>
);

const Home03Icon = ({ color, size = 24, strokeWidth = 1.5, fill = 'none', ...props }: any) => {
  const isFilled = fill !== 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" color={color} {...props}>
      <Path 
        d="M3 11.9896V14.5C3 17.7998 3 19.4497 4.02513 20.4749C5.05025 21.5 6.70017 21.5 10 21.5H14C17.2998 21.5 18.9497 21.5 19.9749 20.4749C21 19.4497 21 17.7998 21 14.5V11.9896C21 10.3083 21 9.46773 20.6441 8.74005C20.2882 8.01237 19.6247 7.49628 18.2976 6.46411L16.2976 4.90855C14.2331 3.30285 13.2009 2.5 12 2.5C10.7991 2.5 9.76689 3.30285 7.70242 4.90855L5.70241 6.46411C4.37533 7.49628 3.71179 8.01237 3.3559 8.74005C3 9.46773 3 10.3083 3 11.9896Z" 
        fill={fill} 
        stroke="currentColor" 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M15 21.5V16.5C15 15.0858 15 14.3787 14.5607 13.9393C14.1213 13.5 13.4142 13.5 12 13.5C10.5858 13.5 9.87868 13.5 9.43934 13.9393C9 14.3787 9 15.0858 9 16.5V21.5" 
        fill={isFilled ? '#FFFFFF' : 'none'}
        stroke={isFilled ? '#FFFFFF' : 'currentColor'} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  );
};

const MapsSearchIcon = ({ color, size = 24, strokeWidth = 1.5, fill = 'none', ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" color={color} fill={fill} {...props}>
    <Path d="M22 12.0889V9.23578C22 7.29177 22 6.31978 21.4142 5.71584C20.8284 5.11192 19.8856 5.11192 18 5.11192H15.9214C15.004 5.11192 14.9964 5.11013 14.1715 4.69638L10.8399 3.0254C9.44884 2.32773 8.75332 1.97889 8.01238 2.00314C7.27143 2.02738 6.59877 2.42098 5.25345 3.20819L4.02558 3.92667C3.03739 4.5049 2.54329 4.79402 2.27164 5.27499C2 5.75596 2 6.34169 2 7.51313V15.7487C2 17.2879 2 18.0575 2.34226 18.4859C2.57001 18.7708 2.88916 18.9625 3.242 19.026C3.77226 19.1214 4.42148 18.7416 5.71987 17.9817C6.60156 17.4659 7.45011 16.9301 8.50487 17.0754C9.38869 17.1971 10.21 17.756 11 18.1522" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M8 2.00195V17.0359" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"></Path>
    <Path d="M15 5.00879V11.0224" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M20.1069 20.1754L21.9521 21.9984M21.1691 17.6381C21.1691 19.6048 19.5752 21.1991 17.609 21.1991C15.6428 21.1991 14.0488 19.6048 14.0488 17.6381C14.0488 15.6714 15.6428 14.0771 17.609 14.0771C19.5752 14.0771 21.1691 15.6714 21.1691 17.6381Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"></Path>
  </Svg>
);

const SearchList02Icon = ({ color, size = 24, strokeWidth = 1.5, fill = 'none', ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" color={color} fill={fill} {...props}>
    <Path d="M2.5 9.5H6.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M2.5 14.5H6.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M2.5 19.5H18.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M18.5355 13.0355L21.5 16M20 9.5C20 6.73858 17.7614 4.5 15 4.5C12.2386 4.5 10 6.73858 10 9.5C10 12.2614 12.2386 14.5 15 14.5C17.7614 14.5 20 12.2614 20 9.5Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
  </Svg>
);

const Calendar03Icon = ({ color, size = 24, strokeWidth = 1.5, fill = 'none', ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" color={color} fill={fill} {...props}>
    <Path d="M16 2V6M8 2V6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M3 10H21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M12.1258 14H12.0008M12.1258 18H12.0008M7.625 14H7.5M7.625 18H7.5M16.625 14H16.5M12.2508 14C12.2508 14.1381 12.1389 14.25 12.0008 14.25C11.8628 14.25 11.7508 14.1381 11.7508 14C11.7508 13.8619 11.8628 13.75 12.0008 13.75C12.1389 13.75 12.2508 13.8619 12.2508 14ZM12.2508 18C12.2508 18.1381 12.1389 18.25 12.0008 18.25C11.8628 18.25 11.7508 18.1381 11.7508 18C11.7508 17.8619 11.8628 17.75 12.0008 17.75C12.1389 17.75 12.2508 17.8619 12.2508 18ZM7.75 14C7.75 14.1381 7.63807 14.25 7.5 14.25C7.36193 14.25 7.25 14.1381 7.25 14C7.25 13.8619 7.36193 13.75 7.5 13.75C7.63807 13.75 7.75 13.8619 7.75 14ZM7.75 18C7.75 18.1381 7.63807 18.25 7.5 18.25C7.36193 18.25 7.25 18.1381 7.25 18C7.25 17.8619 7.36193 17.75 7.5 17.75C7.63807 17.75 7.75 17.8619 7.75 18ZM16.75 14C16.75 14.1381 16.6381 14.25 16.5 14.25C16.3619 14.25 16.25 14.1381 16.25 14C16.25 13.8619 16.3619 13.75 16.5 13.75C16.6381 13.75 16.75 13.8619 16.75 14Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
  </Svg>
);

const Chatting01Icon = ({ color, size = 24, strokeWidth = 1.5, fill = 'none', ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" color={color} fill={fill} {...props}>
    <Path d="M20 9C19.2048 5.01455 15.5128 2 11.0793 2C6.06549 2 2 5.85521 2 10.61C2 12.8946 2.93819 14.9704 4.46855 16.5108C4.80549 16.85 5.03045 17.3134 4.93966 17.7903C4.78982 18.5701 4.45026 19.2975 3.95305 19.9037C5.26123 20.1449 6.62147 19.9277 7.78801 19.3127C8.20039 19.0954 8.40657 18.9867 8.55207 18.9646C8.65392 18.9492 8.78659 18.9636 9 19.0002" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M11 16.2617C11 19.1674 13.4628 21.5234 16.5 21.5234C16.8571 21.5238 17.2132 21.4908 17.564 21.425C17.8165 21.3775 17.9428 21.3538 18.0309 21.3673C18.119 21.3807 18.244 21.4472 18.4938 21.58C19.2004 21.9558 20.0244 22.0885 20.8169 21.9411C20.5157 21.5707 20.31 21.1262 20.2192 20.6496C20.1642 20.3582 20.3005 20.075 20.5046 19.8677C21.4317 18.9263 22 17.6578 22 16.2617C22 13.356 19.5372 11 16.5 11C13.4628 11 11 13.356 11 16.2617Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"></Path>
  </Svg>
);

const AnimatedTabIcon = ({ focused, color, label, badgeCount, children }: any) => {
  const animValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: focused ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [focused]);

  const pillScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.0],
  });

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });

  return (
    <Animated.View style={[styles.tabItemContainer, { transform: [{ translateY }] }]}>
      <Animated.View
        style={[
          styles.glassIconPill,
          focused ? styles.glassIconPillActive : styles.glassIconPillInactive,
          { transform: [{ scale: pillScale }] },
        ]}
      >
        {/* Glass reflection highlight on active pill */}
        {focused && <View style={styles.glassPillHighlight} pointerEvents="none" />}
        {children}
      </Animated.View>
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      ) : null}
      <Text style={[styles.tabBarLabelText, { color: focused ? '#000814' : 'rgba(96, 96, 102, 0.96)', fontWeight: focused ? '600' : '400' }]}>{label}</Text>
      {focused && <Animated.View style={[styles.activeIndicatorLine, { opacity: animValue }]} />}
    </Animated.View>
  );
};

const LiquidGlassTabBarBackground = () => {
  return (
    <View style={styles.glassBackgroundContainer}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
    </View>
  );
};

import { useMessagesContext } from '../../store/MessagesContext';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [showRateModal, setShowRateModal] = React.useState(false);
  const { totalUnreadCount } = useMessagesContext();

  // Dynamic bottom padding ensuring navigation sits above Android 3-button/gesture system nav & iOS home bar
  const bottomPadding = insets.bottom > 0
    ? insets.bottom + (Platform.OS === 'ios' ? 4 : 8)
    : (Platform.OS === 'ios' ? 32 : 12);
  const tabBarHeight = 58 + bottomPadding;

  // Check for random 8-9 hour interval rate prompt on mount
  React.useEffect(() => {
    const checkRandomPrompt = async () => {
      const shouldShow = await shouldShowRandomRatePrompt();
      if (shouldShow) {
        // Delay 5 seconds to let user settle into the app
        setTimeout(() => setShowRateModal(true), 5000);
      }
    };
    checkRandomPrompt();
  }, []);

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomPadding,
          },
        ],
        tabBarBackground: () => <LiquidGlassTabBarBackground />,
        tabBarShowLabel: false, // We will render label inside tabBarIcon for perfect layout
        tabBarActiveTintColor: '#000814',
        tabBarInactiveTintColor: 'rgba(96, 96, 102, 0.96)',
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => tabSkeletonStore.triggerTab('home'),
        }}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color} label="Home">
              <Home03Icon
                size={24}
                color={focused ? '#000814' : 'rgba(96, 96, 102, 0.96)'}
                fill={focused ? '#000814' : 'none'}
                strokeWidth={focused ? 1.6 : 1.4}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        listeners={{
          tabPress: () => tabSkeletonStore.triggerTab('category'),
        }}
        options={{
          title: 'Category',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color} label="Category">
              <SearchList02Icon
                size={24}
                color={focused ? '#000814' : 'rgba(96, 96, 102, 0.96)'}
                strokeWidth={focused ? 1.8 : 1.4}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        listeners={{
          tabPress: () => tabSkeletonStore.triggerTab('explore'),
        }}
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color} label="Explore">
              <MapsSearchIcon
                size={24}
                color={focused ? '#000814' : 'rgba(96, 96, 102, 0.96)'}
                strokeWidth={focused ? 1.8 : 1.4}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        listeners={{
          tabPress: () => tabSkeletonStore.triggerTab('bookings'),
        }}
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color} label="Bookings">
              <Calendar03Icon
                size={24}
                color={focused ? '#000814' : 'rgba(96, 96, 102, 0.96)'}
                strokeWidth={focused ? 1.8 : 1.4}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        listeners={{
          tabPress: () => tabSkeletonStore.triggerTab('messages'),
        }}
        options={{
          title: 'Message',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color} label="Message" badgeCount={totalUnreadCount}>
              <Chatting01Icon
                size={24}
                color={focused ? '#000814' : 'rgba(96, 96, 102, 0.96)'}
                strokeWidth={focused ? 1.8 : 1.4}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tabs>

    {/* ─── Rate / Feedback Bottom Sheet (random 8-9hr interval trigger) ─── */}
    <RateFeedbackBottomSheet
      visible={showRateModal}
      onClose={() => setShowRateModal(false)}
      onSubmit={(rating, feedback) => {
        console.log('Random interval rating submitted:', { rating, feedback });
      }}
    />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  glassBackgroundContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  glassTintLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
  },
  tabBarItem: {
    flex: 1,
    height: 52,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemContainer: {
    width: 68,
    height: 52,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  glassIconPill: {
    width: 44,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glassIconPillInactive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  glassIconPillActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  glassPillHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tabBarLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  activeIndicatorLine: {
    position: 'absolute',
    bottom: -1,
    alignSelf: 'center',
    width: 36,
    height: 3,
    backgroundColor: '#000000',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabBadge: {
    position: 'absolute',
    top: 2,
    right: 12,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#CC2929',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 20,
  },
  tabBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 12,
  },
});

