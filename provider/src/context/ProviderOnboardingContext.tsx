import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trendApi, getAuthToken } from '../api/trendApi';

export const HAS_SEEN_TUTORIAL_KEY = '@trend_provider_has_seen_tutorial';

export interface OwnerProfileData {
  fullName: string;
  photoUri: string | null;
  phone?: string;
  countryCode?: string;
}

export interface BusinessLocationData {
  country: string;
  countryCode: string;
  state: string;
  address: string;
  gender: string;
}

export interface TimeSegmentValue {
  hour: number | null;
  minute: number | null;
  period: 'am' | 'pm' | null;
}

export interface SalonDetailsData {
  photos: string[];
  operatingDays: string;
  operatingHours: string;
  openingTime?: TimeSegmentValue | null;
  closingTime?: TimeSegmentValue | null;
  amenities: string;
}

export interface SavedPayoutMethod {
  bankName: string;
  bankId: string;
  accountNumber: string;
  accountName: string;
  bankLogo?: any;
  verified: boolean;
}

export interface ProviderOnboardingState {
  ownerProfile: OwnerProfileData;
  businessName: string;
  location: BusinessLocationData;
  salonDetails: SalonDetailsData;
  // First-time onboarding / tutorial flag (persisted in AsyncStorage)
  hasSeenFirstTime: boolean;
  setHasSeenFirstTime: (val: boolean) => void;
  // Ephemeral flag indicating the user just finished sign-up
  justSignedUp: boolean;
  setJustSignedUp: (val: boolean) => void;
  // Trial start timestamp (set when onboarding succeeds, TODO: Backend ownership)
  trialStartedAt: number | null;
  setTrialStartedAt: (val: number | null) => void;
  // Payout method (in-memory, only bank, account number & account name)
  payoutMethod: SavedPayoutMethod | null;
  setPayoutMethod: (method: SavedPayoutMethod | null) => void;
  // Tracks whether the user explicitly deleted their saved payout wallet and has not added a replacement yet
  isPayoutDeleted: boolean;
  setIsPayoutDeleted: (val: boolean) => void;
  // Flag to trigger 4-dot dimmed overlay upon return to dashboard from Payouts success
  showDashboardOverlayAfterPayout: boolean;
  setShowDashboardOverlayAfterPayout: (val: boolean) => void;
  // Flag to trigger 4-dot dimmed overlay upon return to dashboard from Report review success (Figma Note)
  showDashboardOverlayAfterReport: boolean;
  setShowDashboardOverlayAfterReport: (val: boolean) => void;
  // Timestamp when business name was last changed (6-month lock rule, TODO: Backend ownership)
  nameChangedAt: string | null;
  setNameChangedAt: (val: string | null) => void;
  setOwnerProfile: (data: Partial<OwnerProfileData>) => void;
  setBusinessName: (name: string) => void;
  setLocation: (data: Partial<BusinessLocationData>) => void;
  setSalonDetails: (data: Partial<SalonDetailsData>) => void;
}

const defaultState: ProviderOnboardingState = {
  ownerProfile: {
    fullName: '',
    photoUri: null,
    phone: '',
    countryCode: '+234',
  },
  businessName: '',
  location: {
    country: 'Nigeria',
    countryCode: '+234',
    state: '',
    address: '',
    gender: '',
  },
  salonDetails: {
    photos: [],
    operatingDays: '',
    operatingHours: '',
    openingTime: null,
    closingTime: null,
    amenities: '',
  },
  hasSeenFirstTime: true, // Safe default: do not show tutorial on regular direct loads/refreshes
  setHasSeenFirstTime: () => {},
  justSignedUp: false,
  setJustSignedUp: () => {},
  trialStartedAt: null,
  setTrialStartedAt: () => {},
  payoutMethod: null,
  setPayoutMethod: () => {},
  isPayoutDeleted: false,
  setIsPayoutDeleted: () => {},
  showDashboardOverlayAfterPayout: false,
  setShowDashboardOverlayAfterPayout: () => {},
  showDashboardOverlayAfterReport: false,
  setShowDashboardOverlayAfterReport: () => {},
  nameChangedAt: null,
  setNameChangedAt: () => {},
  setOwnerProfile: () => {},
  setBusinessName: () => {},
  setLocation: () => {},
  setSalonDetails: () => {},
};

const ProviderOnboardingContext = createContext<ProviderOnboardingState>(defaultState);

export const ProviderOnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ownerProfile, setOwnerProfileState] = useState<OwnerProfileData>(defaultState.ownerProfile);
  const [businessName, setBusinessName] = useState<string>('');
  const [location, setLocationState] = useState<BusinessLocationData>(defaultState.location);
  const [salonDetails, setSalonDetailsState] = useState<SalonDetailsData>(defaultState.salonDetails);
  const [hasSeenFirstTime, setHasSeenFirstTimeState] = useState<boolean>(true);
  const [justSignedUp, setJustSignedUp] = useState<boolean>(false);
  const [trialStartedAt, setTrialStartedAt] = useState<number | null>(null);
  const [payoutMethod, setPayoutMethodState] = useState<SavedPayoutMethod | null>(null);
  const [isPayoutDeleted, setIsPayoutDeleted] = useState<boolean>(false);

  const setPayoutMethod = useCallback((method: SavedPayoutMethod | null) => {
    setPayoutMethodState(method);
    if (method !== null) {
      setIsPayoutDeleted(false);
    }
  }, []);
  const [showDashboardOverlayAfterPayout, setShowDashboardOverlayAfterPayout] = useState<boolean>(false);
  const [showDashboardOverlayAfterReport, setShowDashboardOverlayAfterReport] = useState<boolean>(false);
  const [nameChangedAt, setNameChangedAt] = useState<string | null>(null);

  // Load persisted tutorial state from AsyncStorage on app startup
  useEffect(() => {
    AsyncStorage.getItem(HAS_SEEN_TUTORIAL_KEY)
      .then((stored) => {
        if (stored !== null) {
          setHasSeenFirstTimeState(stored === 'true');
        } else {
          // If never set and not fresh from signup, default to true
          setHasSeenFirstTimeState(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to load tutorial status from AsyncStorage:', err);
      });

    // Hydrate business profile & payout wallet from live backend if authenticated
    let active = true;
    getAuthToken('business')
      .then(async (token) => {
        if (!token || !active) return;
        const [bizRes, payoutRes] = await Promise.all([
          trendApi.business.getMe('business'),
          trendApi.business.getPayout(),
        ]);
        if (active && bizRes.ok && bizRes.data) {
          const biz = bizRes.data.business || bizRes.data;
          if (biz.name) setBusinessName(biz.name);
          if (biz.address || biz.city) {
            setLocationState((prev) => ({
              ...prev,
              address: biz.address || prev.address,
              state: biz.city || prev.state,
            }));
          }
        }
        if (active && payoutRes.ok && payoutRes.data) {
          const p = payoutRes.data.payout || payoutRes.data;
          if (p.account_number && p.bank_name) {
            setPayoutMethodState({
              bankName: p.bank_name,
              bankId: String(p.bank_name).toLowerCase().replace(/\s+/g, '-'),
              accountNumber: p.account_number,
              accountName: p.account_name || '',
              verified: true,
            });
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const setHasSeenFirstTime = useCallback((val: boolean) => {
    setHasSeenFirstTimeState(val);
    AsyncStorage.setItem(HAS_SEEN_TUTORIAL_KEY, val ? 'true' : 'false').catch((err) => {
      console.warn('Failed to save tutorial status to AsyncStorage:', err);
    });
  }, []);

  const setOwnerProfile = (data: Partial<OwnerProfileData>) => {
    setOwnerProfileState((prev) => ({ ...prev, ...data }));
  };

  const setLocation = (data: Partial<BusinessLocationData>) => {
    setLocationState((prev) => ({ ...prev, ...data }));
  };

  const setSalonDetails = (data: Partial<SalonDetailsData>) => {
    setSalonDetailsState((prev) => ({ ...prev, ...data }));
  };

  return (
    <ProviderOnboardingContext.Provider
      value={{
        ownerProfile,
        businessName,
        location,
        salonDetails,
        hasSeenFirstTime,
        setHasSeenFirstTime,
        justSignedUp,
        setJustSignedUp,
        trialStartedAt,
        setTrialStartedAt,
        payoutMethod,
        setPayoutMethod,
        isPayoutDeleted,
        setIsPayoutDeleted,
        showDashboardOverlayAfterPayout,
        setShowDashboardOverlayAfterPayout,
        showDashboardOverlayAfterReport,
        setShowDashboardOverlayAfterReport,
        nameChangedAt,
        setNameChangedAt,
        setOwnerProfile,
        setBusinessName,
        setLocation,
        setSalonDetails,
      }}
    >
      {children}
    </ProviderOnboardingContext.Provider>
  );
};

export const useProviderOnboarding = () => useContext(ProviderOnboardingContext);

export default ProviderOnboardingContext;

