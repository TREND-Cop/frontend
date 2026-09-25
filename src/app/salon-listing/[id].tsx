import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SalonListingScreen } from '../../screens/home/SalonListingScreen';
import { getServiceNameById } from '../../screens/home/mockServices';

export default function SalonListingRoute() {
  const params = useLocalSearchParams();
  const id = (params.id as string) || '';
  const serviceId = (params.serviceId as string) || id;
  const serviceName =
    (params.serviceName as string) ||
    (params.name as string) ||
    getServiceNameById(id);
  const categoryId = (params.categoryId as string) || id;
  const gender = params.gender as string;

  return (
    <SalonListingScreen
      categoryId={categoryId}
      serviceId={serviceId}
      serviceName={serviceName}
      gender={gender}
    />
  );
}

