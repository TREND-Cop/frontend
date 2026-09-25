import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ServiceCard, ServiceCardProps } from './ServiceCard';
import { SectionHeader, SectionHeaderProps } from './SectionHeader';

export interface GridCardListProps extends SectionHeaderProps {
  data: (ServiceCardProps & { id: string })[];
}

export const GridCardList = ({
  data,
  title,
  subtitle,
  showSeeAll,
  onSeeAllPress,
  icon,
}: GridCardListProps) => {
  return (
    <View style={styles.container}>
      <SectionHeader 
        title={title} 
        subtitle={subtitle} 
        showSeeAll={showSeeAll} 
        onSeeAllPress={onSeeAllPress} 
        icon={icon} 
      />
      
      <View style={styles.gridContainer}>
        {data.map((item) => (
          <ServiceCard
            key={item.id}
            {...item}
            style={styles.card}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: '48%', // Roughly half minus gap
    marginBottom: 16,
  },
});
