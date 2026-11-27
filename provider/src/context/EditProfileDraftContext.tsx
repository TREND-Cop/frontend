import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useSafeRouter } from '../utils/safeNavigation';
import { useProviderOnboarding } from './ProviderOnboardingContext';
import { businessStore, useBusinessStore } from '../store/businessStore';
import {
  EditableBusinessProfile,
  diffBusinessProfile,
  validateBusinessProfile,
  computeNameLock,
} from '../utils/businessProfileHelpers';
import {
  DEV_NAME_LOCKED_DAYS,
  DEV_EMPTY_PROFILE,
  SAVE_PROFILE_MOCK_MS,
} from '../constants/editProfile.config';

export interface EditProfileDraftContextValue {
  savedProfile: EditableBusinessProfile;
  workingCopy: EditableBusinessProfile;
  changedFields: (keyof EditableBusinessProfile)[];
  isDirty: boolean;
  isValid: boolean;
  isNameLocked: boolean;
  nameLockDaysRemaining: number;
  isSaving: boolean;
  updateField: <K extends keyof EditableBusinessProfile>(
    field: K,
    value: EditableBusinessProfile[K]
  ) => void;
  setWorkingCopy: React.Dispatch<React.SetStateAction<EditableBusinessProfile>>;
  resetWorkingCopy: () => void;
  saveDraft: () => Promise<void>;
}

const EditProfileDraftContext = createContext<EditProfileDraftContextValue | null>(null);

export const EditProfileDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const safeRouter = useSafeRouter();
  const onboarding = useProviderOnboarding();
  const { business } = useBusinessStore();

  // Resolve the saved profile from the single source of truth (onboarding context fallback to business store)
  const savedProfile: EditableBusinessProfile = useMemo(() => {
    if (DEV_EMPTY_PROFILE) {
      return {
        businessName: '',
        operatingHours: '',
        operatingDays: '',
        address: '',
        country: '',
        countryCode: '+234',
        state: '',
        gender: '',
        nameChangedAt: null,
      };
    }

    return {
      businessName: onboarding.businessName || business.name || 'Luminous care',
      operatingHours: onboarding.salonDetails.operatingHours || business.operatingHours || '9:00am - 9:00pm',
      operatingDays: onboarding.salonDetails.operatingDays || business.operatingDays || 'Monday, Thursday, Sunday',
      address: onboarding.location.address || business.address || 'Street 11 adamu cresent, off nnpc tower, maitama abuja.',
      country: onboarding.location.country || business.country || 'Nigeria',
      countryCode: onboarding.location.countryCode || business.countryCode || '+234',
      state: onboarding.location.state || business.state || 'F.C.T Abuja',
      gender: onboarding.location.gender || business.gender || 'Unisex',
      nameChangedAt: onboarding.nameChangedAt ?? business.nameChangedAt ?? null,
    };
  }, [
    onboarding.businessName,
    onboarding.salonDetails.operatingHours,
    onboarding.salonDetails.operatingDays,
    onboarding.location.address,
    onboarding.location.country,
    onboarding.location.countryCode,
    onboarding.location.state,
    onboarding.location.gender,
    onboarding.nameChangedAt,
    business.name,
    business.operatingHours,
    business.operatingDays,
    business.address,
    business.country,
    business.countryCode,
    business.state,
    business.gender,
    business.nameChangedAt,
  ]);

  // Working copy initialized from saved profile
  const [workingCopy, setWorkingCopy] = useState<EditableBusinessProfile>(savedProfile);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Re-sync working copy if saved profile changes while untouched
  const resetWorkingCopy = useCallback(() => {
    setWorkingCopy(savedProfile);
  }, [savedProfile]);

  // Update a single field on the working copy
  const updateField = useCallback(
    <K extends keyof EditableBusinessProfile>(field: K, value: EditableBusinessProfile[K]) => {
      setWorkingCopy((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Pure diff: list of fields that differ from saved profile
  const changedFields = useMemo(() => {
    return diffBusinessProfile(savedProfile, workingCopy);
  }, [savedProfile, workingCopy]);

  // isDirty = at least one field differs. Never store anything else.
  const isDirty = changedFields.length > 0;

  // isValid = all required fields non-empty and well-formed
  const isValid = useMemo(() => {
    return validateBusinessProfile(workingCopy);
  }, [workingCopy]);

  // Compute name lock state (6-month rule / dev override)
  const { isLocked: isNameLocked, daysRemaining: nameLockDaysRemaining } = useMemo(() => {
    return computeNameLock(savedProfile.nameChangedAt, DEV_NAME_LOCKED_DAYS);
  }, [savedProfile.nameChangedAt]);

  // Save changes stub (TODO: Backend)
  const saveDraft = useCallback(async () => {
    if (!isDirty || !isValid || isSaving) return;

    setIsSaving(true);

    try {
      // Mock delay representing saveBusinessProfile(changes)
      await new Promise((resolve) => setTimeout(resolve, SAVE_PROFILE_MOCK_MS));

      const isNameChanged = changedFields.includes('businessName');
      const newNameChangedAt = isNameChanged ? new Date().toISOString() : savedProfile.nameChangedAt;

      // 1. Commit to shared onboarding context (the record)
      onboarding.setBusinessName(workingCopy.businessName);
      onboarding.setLocation({
        country: workingCopy.country,
        countryCode: workingCopy.countryCode,
        state: workingCopy.state,
        address: workingCopy.address,
        gender: workingCopy.gender,
      });
      onboarding.setSalonDetails({
        operatingDays: workingCopy.operatingDays,
        operatingHours: workingCopy.operatingHours,
      });
      if (isNameChanged) {
        onboarding.setNameChangedAt(newNameChangedAt || null);
      }

      // 2. Commit to business store (for immediate dashboard header display)
      businessStore.updateProfile({
        name: workingCopy.businessName,
        address: workingCopy.address,
        operatingDays: workingCopy.operatingDays,
        operatingHours: workingCopy.operatingHours,
        gender: workingCopy.gender,
        country: workingCopy.country,
        countryCode: workingCopy.countryCode,
        state: workingCopy.state,
        nameChangedAt: newNameChangedAt || null,
      });

      // 3. Navigate to Successful screen
      safeRouter.replace('/edit-business-profile/success' as any);
    } catch (e) {
      // TODO (Backend): handle failure
      console.warn('saveBusinessProfile failed:', e);
    } finally {
      setIsSaving(false);
    }
  }, [
    isDirty,
    isValid,
    isSaving,
    changedFields,
    savedProfile.nameChangedAt,
    workingCopy,
    onboarding,
    safeRouter,
  ]);

  return (
    <EditProfileDraftContext.Provider
      value={{
        savedProfile,
        workingCopy,
        changedFields,
        isDirty,
        isValid,
        isNameLocked,
        nameLockDaysRemaining,
        isSaving,
        updateField,
        setWorkingCopy,
        resetWorkingCopy,
        saveDraft,
      }}
    >
      {children}
    </EditProfileDraftContext.Provider>
  );
};

export function useEditProfileDraft(): EditProfileDraftContextValue {
  const ctx = useContext(EditProfileDraftContext);
  if (!ctx) {
    throw new Error('useEditProfileDraft must be used within an EditProfileDraftProvider');
  }
  return ctx;
}
