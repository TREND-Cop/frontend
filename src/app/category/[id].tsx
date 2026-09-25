import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { CategoryScreen } from '../../screens/home/CategoryScreen';

export default function CategoryDetailRoute() {
  const { id } = useLocalSearchParams();
  return <CategoryScreen categoryId={id as string} />;
}
