import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  STORAGE_KEYS,
} from '../utils/providerStorage';

export const MIN_SERVICE_IMAGES = 3;

export interface SelectedCategory {
  id: string;
  groupName: string;
  itemName: string;
}

export interface ServicePackageItem {
  id: string;
  images: string[];
  contents: string;
  price: number | null;
  priceRaw: string;
  duration: string;
}

export interface AddOnItem {
  id: string;
  imageUri: string | null;
  name: string;
  description: string;
  price: number | null;
  priceRaw: string;
  duration: string;
}

export const createEmptyAddOn = (idSuffix?: string): AddOnItem => ({
  id: `addon_${Date.now()}_${idSuffix || Math.random().toString(36).substr(2, 4)}`,
  imageUri: null,
  name: '',
  description: '',
  price: null,
  priceRaw: '',
  duration: '',
});

export interface ServiceDraft {
  images: string[];
  category: SelectedCategory | null;
  name: string;
  description: string;
  discount: number | null;
  discountRaw: string;
  gender: string;
  serviceType: string;
  price: number | null;
  priceRaw: string;
  duration: string;
  packages: ServicePackageItem[];
  staffIds: string[];
  providerIsOwner: boolean;
  addOns: AddOnItem[];
}

/**
 * DEV_SEED_DRAFT (dev-only):
 * Set to `true` to prefill draft with sample data from Figma frames E1–E6
 * and open the app on Review. Default is `false`.
 */
export const DEV_SEED_DRAFT = false;

export const SEEDED_DRAFT: ServiceDraft = {
  images: [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
    'https://images.unsplash.com/photo-1517832606589-7629c3397143?w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  ],
  category: {
    id: 'haircut',
    groupName: 'Hair cut',
    itemName: 'Hair cut',
  },
  name: 'Low fade tapper cut',
  description: 'Straight-Back Cornrow is a clean low fade with braided locs pulled into a back ponytail.',
  discount: 1750,
  discountRaw: '1750',
  gender: 'Male only',
  serviceType: 'In-Person',
  price: 13750,
  priceRaw: '13750',
  duration: '1:30 hr',
  packages: [
    {
      id: 'pkg_seed_1',
      images: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
        'https://images.unsplash.com/photo-1512290900672-1f416e910bd6?w=400',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
        'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400',
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400',
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400',
      ],
      contents: 'Back massage\nHair wash\nFacial',
      price: 13750,
      priceRaw: '13750',
      duration: '4:30 hr',
    },
  ],
  staffIds: ['staff_1', 'staff_2'],
  providerIsOwner: false,
  addOns: [
    {
      id: 'addon_seed_1',
      imageUri: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=400',
      name: 'Hot towel massage',
      description: 'After Shave hot towel',
      price: 10750,
      priceRaw: '10750',
      duration: '30 hr',
    },
  ],
};

const INITIAL_DRAFT: ServiceDraft = {
  images: [],
  category: null,
  name: '',
  description: '',
  discount: null,
  discountRaw: '',
  gender: '',
  serviceType: '',
  price: null,
  priceRaw: '',
  duration: '',
  packages: [],
  staffIds: [],
  providerIsOwner: false,
  addOns: [],
};

interface ServiceDraftContextType {
  draft: ServiceDraft;
  setDraftField: <K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) => void;
  commitWorkingCopy: (updates: Partial<ServiceDraft>) => void;
  commitStaffSelection: (ids: string[]) => void;
  addImage: (uri: string) => void;
  replaceImage: (index: number, uri: string) => void;
  removeImage: (index: number) => void;
  addPackage: () => void;
  updatePackage: (id: string, updates: Partial<ServicePackageItem>) => void;
  addPackageImage: (packageId: string, uri: string) => void;
  replacePackageImage: (packageId: string, index: number, uri: string) => void;
  removePackageImage: (packageId: string, index: number) => void;
  toggleStaffId: (id: string) => void;
  setStaffIds: (ids: string[]) => void;
  removeStaffId: (id: string) => void;
  setProviderIsOwner: (val: boolean) => void;
  setAddOns: (addOns: AddOnItem[]) => void;
  updateAddOn: (id: string, updates: Partial<AddOnItem>) => void;
  addAddOnBlock: () => void;
  removeAddOnImage: (id: string) => void;
  resetDraft: () => void;
  isStep1Valid: boolean;
  firstMissingField: string | null;
  isStep2Valid: boolean;
  isStep3Valid: boolean;
}

const ServiceDraftContext = createContext<ServiceDraftContextType | undefined>(undefined);

export const ServiceDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<ServiceDraft>(() =>
    DEV_SEED_DRAFT ? SEEDED_DRAFT : INITIAL_DRAFT
  );

  // Hydrate draft from storage / browser memory on mount
  useEffect(() => {
    let isMounted = true;
    loadFromStorage<ServiceDraft | null>(STORAGE_KEYS.SERVICE_DRAFT, null).then((saved) => {
      if (isMounted && saved) {
        setDraft(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-save draft changes to storage / browser memory
  useEffect(() => {
    const hasContent =
      draft.name.trim() !== '' ||
      draft.images.length > 0 ||
      draft.category !== null ||
      draft.price !== null ||
      draft.packages.length > 0 ||
      draft.addOns.length > 0;

    if (hasContent) {
      saveToStorage(STORAGE_KEYS.SERVICE_DRAFT, draft);
    }
  }, [draft]);

  const commitWorkingCopy = useCallback((updates: Partial<ServiceDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const commitStaffSelection = useCallback((ids: string[]) => {
    setDraft((prev) => ({
      ...prev,
      staffIds: ids,
      providerIsOwner: ids.length > 0 ? false : prev.providerIsOwner,
    }));
  }, []);

  const setDraftField = useCallback(<K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const addImage = useCallback((uri: string) => {
    setDraft((prev) => {
      if (prev.images.length >= 6) return prev;
      return {
        ...prev,
        images: [...prev.images, uri],
      };
    });
  }, []);

  const replaceImage = useCallback((index: number, uri: string) => {
    setDraft((prev) => {
      const nextImages = [...prev.images];
      if (index < nextImages.length) {
        nextImages[index] = uri;
      } else if (nextImages.length < 6) {
        nextImages.push(uri);
      }
      return {
        ...prev,
        images: nextImages,
      };
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const addPackage = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          images: [],
          contents: '',
          price: null,
          priceRaw: '',
          duration: '',
        },
      ],
    }));
  }, []);

  const updatePackage = useCallback((id: string, updates: Partial<ServicePackageItem>) => {
    setDraft((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => (pkg.id === id ? { ...pkg, ...updates } : pkg)),
    }));
  }, []);

  const addPackageImage = useCallback((packageId: string, uri: string) => {
    setDraft((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.id === packageId && pkg.images.length < 6) {
          return { ...pkg, images: [...pkg.images, uri] };
        }
        return pkg;
      }),
    }));
  }, []);

  const replacePackageImage = useCallback((packageId: string, index: number, uri: string) => {
    setDraft((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.id === packageId) {
          const nextImages = [...pkg.images];
          if (index < nextImages.length) {
            nextImages[index] = uri;
          } else if (nextImages.length < 6) {
            nextImages.push(uri);
          }
          return { ...pkg, images: nextImages };
        }
        return pkg;
      }),
    }));
  }, []);

  const removePackageImage = useCallback((packageId: string, index: number) => {
    setDraft((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) =>
        pkg.id === packageId
          ? { ...pkg, images: pkg.images.filter((_, i) => i !== index) }
          : pkg
      ),
    }));
  }, []);

  const toggleStaffId = useCallback((id: string) => {
    setDraft((prev) => {
      const exists = prev.staffIds.includes(id);
      const nextStaffIds = exists
        ? prev.staffIds.filter((item) => item !== id)
        : [...prev.staffIds, id];
      return {
        ...prev,
        staffIds: nextStaffIds,
        // Selecting staff sets providerIsOwner to false per Figma note
        providerIsOwner: nextStaffIds.length > 0 ? false : prev.providerIsOwner,
      };
    });
  }, []);

  const setStaffIds = useCallback((ids: string[]) => {
    setDraft((prev) => ({
      ...prev,
      staffIds: ids,
      providerIsOwner: ids.length > 0 ? false : prev.providerIsOwner,
    }));
  }, []);

  const removeStaffId = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      staffIds: prev.staffIds.filter((item) => item !== id),
    }));
  }, []);

  const setProviderIsOwner = useCallback((val: boolean) => {
    setDraft((prev) => ({
      ...prev,
      providerIsOwner: val,
      // If owner is true, clear staffIds (mutually exclusive per note)
      staffIds: val ? [] : prev.staffIds,
    }));
  }, []);

  const setAddOns = useCallback((addOns: AddOnItem[]) => {
    setDraft((prev) => ({
      ...prev,
      addOns,
    }));
  }, []);

  const updateAddOn = useCallback((id: string, updates: Partial<AddOnItem>) => {
    setDraft((prev) => {
      const exists = prev.addOns.some((item) => item.id === id);
      if (exists) {
        return {
          ...prev,
          addOns: prev.addOns.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        };
      }
      return {
        ...prev,
        addOns: [...prev.addOns, { ...createEmptyAddOn(), id, ...updates }],
      };
    });
  }, []);

  const addAddOnBlock = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      addOns: [...prev.addOns, createEmptyAddOn()],
    }));
  }, []);

  const removeAddOnImage = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      addOns: prev.addOns.map((item) => (item.id === id ? { ...item, imageUri: null } : item)),
    }));
  }, []);

  const resetDraft = useCallback(() => {
    removeFromStorage(STORAGE_KEYS.SERVICE_DRAFT);
    setDraft(DEV_SEED_DRAFT ? SEEDED_DRAFT : INITIAL_DRAFT);
  }, []);

  // ── 7 Required Field Validations in Strict Form Order ──
  const missingFieldList = useMemo(() => {
    const missing: { key: string; label: string }[] = [];

    const validImagesCount = draft.images.filter(Boolean).length;
    if (validImagesCount < MIN_SERVICE_IMAGES) {
      missing.push({
        key: 'image',
        label:
          validImagesCount === 0
            ? 'Service images not added'
            : `Upload at least ${MIN_SERVICE_IMAGES} service images (${validImagesCount}/${MIN_SERVICE_IMAGES})`,
      });
    }
    if (!draft.category || !draft.category.itemName) {
      missing.push({ key: 'category', label: 'Service category not added' });
    }
    if (!draft.name.trim()) {
      missing.push({ key: 'name', label: 'Service name not added' });
    }
    if (!draft.gender.trim()) {
      missing.push({ key: 'gender', label: 'Service gender not added' });
    }
    if (!draft.serviceType.trim()) {
      missing.push({ key: 'type', label: 'Service type not added' });
    }
    if (draft.price === null || draft.price <= 0) {
      missing.push({ key: 'price', label: 'Service price not added' });
    }
    if (!draft.duration.trim()) {
      missing.push({ key: 'duration', label: 'Service duration not added' });
    }

    return missing;
  }, [draft]);

  const isStep1Valid = missingFieldList.length === 0;
  const firstMissingField = missingFieldList.length > 0 ? missingFieldList[0].label : null;

  // Step 2 is valid if at least one staff is selected OR providerIsOwner is true
  const isStep2Valid = useMemo(() => {
    return draft.staffIds.length > 0 || draft.providerIsOwner;
  }, [draft.staffIds.length, draft.providerIsOwner]);

  // Step 3 is valid if:
  // 1. Block 1 has imageUri, name.trim(), price > 0, duration.trim() (description is optional)
  // 2. Any started extra block has imageUri, name.trim(), price > 0, duration.trim()
  const isStep3Valid = useMemo(() => {
    if (draft.addOns.length === 0) return false;
    const block1 = draft.addOns[0];
    const isBlock1Complete =
      !!block1.imageUri &&
      block1.name.trim().length > 0 &&
      block1.price !== null &&
      block1.price > 0 &&
      block1.duration.trim().length > 0;

    if (!isBlock1Complete) return false;

    // Any started extra blocks must also be complete
    const extraBlocks = draft.addOns.slice(1);
    for (const b of extraBlocks) {
      const isStarted =
        !!b.imageUri ||
        b.name.trim().length > 0 ||
        b.description.trim().length > 0 ||
        b.priceRaw.trim().length > 0 ||
        b.duration.trim().length > 0;

      if (isStarted) {
        const isComplete =
          !!b.imageUri &&
          b.name.trim().length > 0 &&
          b.price !== null &&
          b.price > 0 &&
          b.duration.trim().length > 0;
        if (!isComplete) return false;
      }
    }

    return true;
  }, [draft.addOns]);

  const value = useMemo(
    () => ({
      draft,
      setDraftField,
      commitWorkingCopy,
      commitStaffSelection,
      addImage,
      replaceImage,
      removeImage,
      addPackage,
      updatePackage,
      addPackageImage,
      replacePackageImage,
      removePackageImage,
      toggleStaffId,
      setStaffIds,
      removeStaffId,
      setProviderIsOwner,
      setAddOns,
      updateAddOn,
      addAddOnBlock,
      removeAddOnImage,
      resetDraft,
      isStep1Valid,
      firstMissingField,
      isStep2Valid,
      isStep3Valid,
    }),
    [
      draft,
      setDraftField,
      commitWorkingCopy,
      commitStaffSelection,
      addImage,
      replaceImage,
      removeImage,
      addPackage,
      updatePackage,
      addPackageImage,
      replacePackageImage,
      removePackageImage,
      toggleStaffId,
      setStaffIds,
      removeStaffId,
      setProviderIsOwner,
      setAddOns,
      updateAddOn,
      addAddOnBlock,
      removeAddOnImage,
      resetDraft,
      isStep1Valid,
      firstMissingField,
      isStep2Valid,
      isStep3Valid,
    ]
  );

  return <ServiceDraftContext.Provider value={value}>{children}</ServiceDraftContext.Provider>;
};

export const useServiceDraft = (): ServiceDraftContextType => {
  const context = useContext(ServiceDraftContext);
  if (!context) {
    throw new Error('useServiceDraft must be used within a ServiceDraftProvider');
  }
  return context;
};

export default ServiceDraftContext;
