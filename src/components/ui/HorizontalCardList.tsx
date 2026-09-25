import React from 'react';
import { View, FlatList, StyleSheet, Platform } from 'react-native';
import { ServiceCard, ServiceCardProps } from './ServiceCard';
import { SectionHeader, SectionHeaderProps } from './SectionHeader';

export interface HorizontalCardListProps extends SectionHeaderProps {
  data: (ServiceCardProps & { id: string })[];
  cardGap?: number;
  onItemPress?: (item: any) => void;
}

export const HorizontalCardList = ({
  data,
  title,
  subtitle,
  showSeeAll,
  onSeeAllPress,
  icon,
  cardGap = 32,
  onItemPress,
}: HorizontalCardListProps) => {
  return (
    <View style={styles.container}>
      <SectionHeader 
        title={title} 
        subtitle={subtitle} 
        showSeeAll={showSeeAll} 
        onSeeAllPress={onSeeAllPress} 
        icon={icon} 
      />
      
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { gap: cardGap }]}
        snapToInterval={192 + cardGap}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <ServiceCard
            {...item}
            onPress={() => {
              if (onItemPress) {
                onItemPress(item);
              } else if (item.onPress) {
                item.onPress();
              }
            }}
            style={styles.card}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  listContent: {
    paddingRight: 16, // Extra padding at the end of the scroll
    gap: 32,
  },
  card: {
    width: 192,
    marginBottom: 0,
  },
});
