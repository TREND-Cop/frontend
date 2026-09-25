import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Platform, useWindowDimensions } from 'react-native';
import { WideServiceCard, WideServiceCardProps } from './WideServiceCard';
import { SectionHeader, SectionHeaderProps } from './SectionHeader';
import { theme } from '../../constants/theme';

export interface PagedCardCarouselProps<T = any> extends Omit<SectionHeaderProps, 'rightElement'> {
  data: T[];
  itemGap?: number;
  renderItem?: (item: T) => React.ReactNode;
  onItemPress?: (item: T) => void;
}

export const PagedCardCarousel = <T extends { id: string }>({
  data,
  title,
  subtitle,
  icon,
  itemGap,
  renderItem,
  onItemPress,
}: PagedCardCarouselProps<T>) => {
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = windowWidth || Dimensions.get('window').width || 390;
  const pageWidth = Math.min(screenWidth - 32, 500);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Chunk data into arrays of 2 items
  const chunkedData: (typeof data)[] = [];
  for (let i = 0; i < data.length; i += 2) {
    chunkedData.push(data.slice(i, i + 2));
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollOffset / (pageWidth + 24));
    if (pageIndex !== currentIndex && pageIndex >= 0 && pageIndex < chunkedData.length) {
      setCurrentIndex(pageIndex);
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {chunkedData.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive && styles.activeDot,
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionHeader 
        title={title} 
        subtitle={subtitle} 
        icon={icon} 
        rightElement={renderDots()} 
      />
      
      <FlatList
        data={chunkedData}
        keyExtractor={(_, index) => `page-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageWidth + 24} // Item width + gap
        decelerationRate="fast"
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={Platform.OS !== 'web'}
        overScrollMode="never"
        onScroll={handleScroll}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: chunk }) => (
          <View style={[styles.pageContainer, { width: pageWidth }, itemGap !== undefined && { gap: itemGap }]}>
            {chunk.map((serviceItem) =>
              renderItem ? (
                <React.Fragment key={serviceItem.id}>
                  {renderItem(serviceItem)}
                </React.Fragment>
              ) : (
                <WideServiceCard
                  key={serviceItem.id}
                  {...(serviceItem as unknown as WideServiceCardProps)}
                  onPress={() => {
                    if (onItemPress) {
                      onItemPress(serviceItem);
                    } else if ((serviceItem as any).onPress) {
                      (serviceItem as any).onPress();
                    }
                  }}
                />
              )
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: '100%', // Match header title row height alignment
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB', // Inactive light gray
  },
  activeDot: {
    backgroundColor: theme.colors.barberPrimary, // Active dark color
  },
  listContent: {
    gap: 24, // Gap between pages (was 16, +8 = 24)
  },
  pageContainer: {
    gap: 32, // Gap between items in page (was 24, +8 = 32)
  },
});
