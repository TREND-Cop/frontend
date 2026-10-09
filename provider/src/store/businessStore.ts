import { useState, useEffect } from 'react';

export interface BusinessProfile {
  name: string;
  address: string;
  isOpen: boolean;
  servicesCount: number;
  photosCount: number;
  reviewsCount: number;
  performanceStake: string;
  notificationBadgeCount: number;
}

const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Luminous Lux',
  address: 'Street 11, off okiki road abuja.',
  isOpen: false, // Starts as closed as per design mockup
  servicesCount: 8,
  photosCount: 24,
  reviewsCount: 14,
  performanceStake: '12%',
  notificationBadgeCount: 102,
};

let businessState: BusinessProfile = { ...DEFAULT_BUSINESS_PROFILE };
const businessListeners = new Set<() => void>();

function notifyBusiness() {
  businessListeners.forEach((listener) => listener());
}

export const businessStore = {
  getProfile: (): BusinessProfile => {
    return businessState;
  },

  setIsOpen: (isOpen: boolean) => {
    businessState = { ...businessState, isOpen };
    notifyBusiness();
  },

  toggleIsOpen: () => {
    businessState = { ...businessState, isOpen: !businessState.isOpen };
    notifyBusiness();
  },

  updateProfile: (partial: Partial<BusinessProfile>) => {
    businessState = { ...businessState, ...partial };
    notifyBusiness();
  },

  resetProfile: () => {
    businessState = { ...DEFAULT_BUSINESS_PROFILE };
    notifyBusiness();
  },
};

export function useBusinessStore() {
  const [business, setBusiness] = useState<BusinessProfile>(businessState);

  useEffect(() => {
    const handleUpdate = () => {
      setBusiness({ ...businessState });
    };
    businessListeners.add(handleUpdate);
    return () => {
      businessListeners.delete(handleUpdate);
    };
  }, []);

  return {
    business,
    setIsOpen: businessStore.setIsOpen,
    toggleIsOpen: businessStore.toggleIsOpen,
    updateProfile: businessStore.updateProfile,
    resetProfile: businessStore.resetProfile,
  };
}

export default businessStore;
