import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Platform,
  LayoutChangeEvent,
} from 'react-native';

export interface PillTabsProps {
  tabs: readonly string[] | string[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  scrollable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const FONT_BUTTON = Platform.select({
  ios: 'Inter',
  android: 'Inter_500Medium',
  default: 'Inter_500Medium',
});

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  scrollable = true,
  containerStyle,
  testID,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const containerWidthRef = useRef<number>(0);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    containerWidthRef.current = e.nativeEvent.layout.width;
  };

  const handleTabLayout = (tab: string, e: LayoutChangeEvent) => {
    tabLayouts.current[tab] = {
      x: e.nativeEvent.layout.x,
      width: e.nativeEvent.layout.width,
    };
  };

  const handlePress = useCallback(
    (tab: string) => {
      onSelectTab(tab);

      if (scrollable && scrollRef.current) {
        const layout = tabLayouts.current[tab];
        if (layout && containerWidthRef.current > 0) {
          const targetX = Math.max(
            0,
            layout.x - containerWidthRef.current / 2 + layout.width / 2
          );
          scrollRef.current.scrollTo({ x: targetX, animated: true });
        }
      }
    },
    [onSelectTab, scrollable]
  );

  const content = (
    <View
      style={[styles.tabsRow, !scrollable && styles.tabsRowDistributed]}
      accessible
      accessibilityRole="tablist"
      onLayout={handleContainerLayout}
      testID={testID}
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.75}
            onPress={() => handlePress(tab)}
            onLayout={(e) => handleTabLayout(tab, e)}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            accessible
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab}
          >
            <Text
              style={[
                styles.tabText,
                isActive ? styles.activeTabText : styles.inactiveTabText,
              ]}
              numberOfLines={1}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.outerContainer, containerStyle]}>
      {scrollable ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
};

export default PillTabs;

const styles = StyleSheet.create({
  outerContainer: {
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
  },
  tabsRowDistributed: {
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  tabButton: {
    height: 32,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#858B94',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 2.5,
      },
      default: {
        boxShadow: '0px 4px 12px rgba(133, 139, 148, 0.12)',
      },
    }),
  },
  tabText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    includeFontPadding: false,
  },
  activeTabText: {
    color: '#000000',
  },
  inactiveTabText: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
