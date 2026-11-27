import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  PanResponder,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { getAllStaff, StaffMember } from '../store/staffStore';

// ── Master Typography Standards ───────────────────────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function Cancel01Icon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkBadge02Icon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.2l2.36 1.71 2.87-.36 1.34 2.58 2.8 1.13-.37 2.88 1.72 2.36-1.72 2.36.37 2.88-2.8 1.13-1.34 2.58-2.87-.36L12 21.8l-2.36-1.71-2.87.36-1.34-2.58-2.8-1.13.37-2.88-1.72-2.36 1.72-2.36-.37-2.88 2.8-1.13 1.34-2.58 2.87.36L12 2.2z"
        fill="rgba(26, 130, 255, 0.9)"
      />
      <Path
        d="M8.5 12l2.5 2.5 5-5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 23 Price Steps Matching Figma Minimum ₦27,550 to Maximum ₦935,550+ ─────────
export const PRICE_STEPS = [
  27550, 35000, 48000, 65000, 85000, 110000, 140000, 180000, 230000, 290000,
  360000, 440000, 520000, 600000, 680000, 760000, 840000, 935550, 1050000, 1200000,
  1400000, 1700000, 2000000,
];

// Histogram bar heights matching Figma specs (Rectangle 253 to 275)
const HISTOGRAM_BARS = [
  5, 5, 5, 10, 5, 15, 24, 10, 20, 32, 20, 32, 53, 45, 32, 40, 58, 45, 24, 10, 5, 5, 10,
];

export interface ProviderFilterState {
  minPrice: number;
  maxPrice: number;
  customAmount: string;
  selectedServices: string[];
  selectedStaff: string[];
  customerType: string | null;
  paymentMethod: string | null;
  appointmentType: string | null;
  bookedPackage: string | null;
  recentFilters?: string[];
}

interface ProviderAppointmentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ProviderFilterState) => void;
  onClear: () => void;
  items?: any[];
  currentFilters?: ProviderFilterState;
}

const DEFAULT_FILTERS: ProviderFilterState = {
  minPrice: 27550,
  maxPrice: 935550,
  customAmount: '',
  selectedServices: [],
  selectedStaff: [],
  customerType: null,
  paymentMethod: null,
  appointmentType: null,
  bookedPackage: null,
  recentFilters: [],
};

/**
 * Canonical filter matcher shared across all Provider appointment screens.
 * Evaluates an appointment item against any combination of active filters.
 */
export function matchAppointment(item: any, filters?: ProviderFilterState | null): boolean {
  if (!item) return false;
  if (!filters) return true;

  // 1. Price Range
  const isMinPriceActive = (filters.minPrice ?? PRICE_STEPS[0]) > PRICE_STEPS[0];
  const hasCustom = Boolean(filters.customAmount && filters.customAmount.trim().length > 0);
  const customNum = hasCustom ? parseInt(filters.customAmount.replace(/[^0-9]/g, ''), 10) || 0 : 0;
  const isMaxPriceActive = (filters.maxPrice ?? PRICE_STEPS[17]) < PRICE_STEPS[17] || (hasCustom && customNum > 0);

  const effectiveMaxPrice = hasCustom && customNum > 0 ? customNum : (filters.maxPrice ?? PRICE_STEPS[17]);
  const effectiveMinPrice = filters.minPrice ?? PRICE_STEPS[0];

  const numPrice = item.numericPrice || parseInt((item.price || '').replace(/[^0-9]/g, ''), 10) || 0;
  if (numPrice > 0) {
    if (isMinPriceActive && numPrice < effectiveMinPrice) return false;
    if (isMaxPriceActive && numPrice > effectiveMaxPrice) return false;
  }

  // 2. Services Filter (Multi-select)
  if (filters.selectedServices && filters.selectedServices.length > 0) {
    const itemTitle = (item.title || item.serviceTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchesAny = filters.selectedServices.some((svc) => {
      const cleanSvc = svc.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (itemTitle.includes(cleanSvc) || cleanSvc.includes(itemTitle)) return true;
      if (cleanSvc.includes('haircut') && (itemTitle.includes('haircut') || itemTitle.includes('hair') || itemTitle.includes('fade') || itemTitle.includes('grooming'))) return true;
      if (cleanSvc.includes('grooming') && itemTitle.includes('grooming')) return true;
      if (cleanSvc.includes('braid') && (itemTitle.includes('braid') || itemTitle.includes('brade'))) return true;
      if (cleanSvc.includes('hairwash') && (itemTitle.includes('hairwash') || itemTitle.includes('conditioning') || itemTitle.includes('wash') || itemTitle.includes('shampoo'))) return true;
      if (cleanSvc.includes('nailart') && (itemTitle.includes('nail') || itemTitle.includes('manicure'))) return true;
      if (cleanSvc.includes('manicure') && itemTitle.includes('manicure')) return true;
      if (cleanSvc.includes('pedicure') && itemTitle.includes('pedicure')) return true;
      if (cleanSvc.includes('feetmassage') && (itemTitle.includes('massage') || itemTitle.includes('feet'))) return true;
      if (cleanSvc.includes('facial') && itemTitle.includes('facial')) return true;
      return false;
    });
    if (!matchesAny) return false;
  }

  // 3. Staff Filter (Multi-select)
  if (filters.selectedStaff && filters.selectedStaff.length > 0) {
    const staffName = (item.staff || item.specialist || '').toLowerCase().trim();
    if (!staffName) return false;
    const matchesStaff = filters.selectedStaff.some((s) => {
      const staffLower = s.toLowerCase().trim();
      if (staffLower === staffName) return true;
      if (staffLower.includes(staffName) || staffName.includes(staffLower)) return true;
      const sFirst = staffLower.split(' ')[0];
      const itemFirst = staffName.split(' ')[0];
      if (sFirst && itemFirst && (sFirst === itemFirst || sFirst.startsWith(itemFirst) || itemFirst.startsWith(sFirst))) return true;
      return false;
    });
    if (!matchesStaff) return false;
  }

  // 4. Customer Type Filter
  if (filters.customerType) {
    const cType = (item.customerType || '').toLowerCase();
    const cStatus = (item.clientStatus || '').toLowerCase();
    if (filters.customerType === 'verified') {
      const isVerified = cType === 'verified' || cStatus.includes('subscriber') || cStatus.includes('vip') || cStatus.includes('verified');
      if (!isVerified) return false;
    } else if (filters.customerType === 'non-verified') {
      const isNonVerified = cType === 'non-verified' || cStatus.includes('non') || cStatus.includes('new') || cStatus.includes('regular');
      if (!isNonVerified) return false;
    }
  }

  // 5. Payment Method Filter
  if (filters.paymentMethod) {
    const itemPay = (item.paymentMethod || '').toLowerCase();
    const targetPay = filters.paymentMethod.toLowerCase();
    if (itemPay && itemPay !== targetPay) return false;
  }

  // 6. Appointment Type Filter
  if (filters.appointmentType) {
    const appType = (item.appointmentType || item.type || '').toLowerCase();
    if (filters.appointmentType === 'in-person' && !appType.includes('in-person') && !appType.includes('in-shop')) return false;
    if (filters.appointmentType === 'home-service' && !appType.includes('home')) return false;
  }

  // 7. Booked Package Filter
  if (filters.bookedPackage) {
    const pkg = (item.bookedPackage || '').toLowerCase();
    const title = (item.title || item.serviceTitle || '').toLowerCase();
    if (filters.bookedPackage === 'basic' && pkg !== 'basic' && !title.includes('basic')) return false;
    if (filters.bookedPackage === 'premium' && pkg !== 'premium' && !title.includes('deluxe') && !title.includes('premium')) return false;
    if (filters.bookedPackage === 'exclusive' && pkg !== 'exclusive' && !title.includes('full') && !title.includes('luxury') && !title.includes('exclusive')) return false;
  }

  return true;
}

export const ProviderAppointmentFilterModal: React.FC<ProviderAppointmentFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  items,
  currentFilters,
}) => {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<ProviderFilterState>(currentFilters || DEFAULT_FILTERS);
  const [recentFilters, setRecentFilters] = useState<string[]>(
    currentFilters?.recentFilters ?? []
  );

  // ── Exact Figma Price Slider Geometry ──
  // Container: 338px centered
  // 23 bars of 8px width + 3px gap = 250px total. Centered in 338px => left offset = 44px
  // Each index i (0..22) center = 44 + i * 11 + 4 = 48 + i * 11
  // Thumb width = 40px, so thumb left = 48 + i * 11 - 20 = 28 + i * 11
  const STEP_PX = 11; // 8px bar + 3px gap
  const THUMB_OFFSET = 28; // 44 + 4 - 20

  const [minBarIndex, setMinBarIndex] = useState<number>(0);
  const [maxBarIndex, setMaxBarIndex] = useState<number>(17); // 17 corresponds to 935,550
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  const minBarIndexRef = useRef(minBarIndex);
  minBarIndexRef.current = minBarIndex;
  const maxBarIndexRef = useRef(maxBarIndex);
  maxBarIndexRef.current = maxBarIndex;

  const dragStartMinRef = useRef(0);
  const dragStartMaxRef = useRef(17);

  const minThumbLeft = THUMB_OFFSET + minBarIndex * STEP_PX;
  const maxThumbLeft = THUMB_OFFSET + maxBarIndex * STEP_PX;

  const minPrice = PRICE_STEPS[minBarIndex];
  const maxPrice = PRICE_STEPS[maxBarIndex];

  // Sync state on open
  useEffect(() => {
    if (visible) {
      if (currentFilters) {
        setFilters(currentFilters);
        setRecentFilters(currentFilters.recentFilters ?? []);
        const minIdx = PRICE_STEPS.findIndex((p) => p >= currentFilters.minPrice);
        const maxIdx = PRICE_STEPS.findIndex((p) => p >= currentFilters.maxPrice);
        if (minIdx !== -1) {
          setMinBarIndex(minIdx);
          minBarIndexRef.current = minIdx;
        }
        if (maxIdx !== -1) {
          setMaxBarIndex(maxIdx);
          maxBarIndexRef.current = maxIdx;
        }
      } else {
        setFilters(DEFAULT_FILTERS);
        setRecentFilters([]);
        setMinBarIndex(0);
        setMaxBarIndex(17);
        minBarIndexRef.current = 0;
        maxBarIndexRef.current = 17;
      }
    }
  }, [visible, currentFilters]);

  // PanResponder for Minimum Thumb
  const minPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1,
        onPanResponderGrant: () => {
          setActiveThumb('min');
          dragStartMinRef.current = minBarIndexRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const indexDelta = Math.round(gestureState.dx / STEP_PX);
          const targetIndex = dragStartMinRef.current + indexDelta;
          const clamped = Math.max(0, Math.min(maxBarIndexRef.current, targetIndex));
          if (clamped !== minBarIndexRef.current) {
            minBarIndexRef.current = clamped;
            setMinBarIndex(clamped);
            setFilters((prev) => ({ ...prev, minPrice: PRICE_STEPS[clamped] }));
          }
        },
        onPanResponderRelease: () => {
          setActiveThumb(null);
        },
        onPanResponderTerminate: () => {
          setActiveThumb(null);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    []
  );

  // PanResponder for Maximum Thumb
  const maxPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1,
        onPanResponderGrant: () => {
          setActiveThumb('max');
          dragStartMaxRef.current = maxBarIndexRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const indexDelta = Math.round(gestureState.dx / STEP_PX);
          const targetIndex = dragStartMaxRef.current + indexDelta;
          const clamped = Math.max(minBarIndexRef.current, Math.min(22, targetIndex));
          if (clamped !== maxBarIndexRef.current) {
            maxBarIndexRef.current = clamped;
            setMaxBarIndex(clamped);
            setFilters((prev) => ({ ...prev, maxPrice: PRICE_STEPS[clamped] }));
          }
        },
        onPanResponderRelease: () => {
          setActiveThumb(null);
        },
        onPanResponderTerminate: () => {
          setActiveThumb(null);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    []
  );

  // Handle bar click to adjust nearest handle
  const handleBarTap = (index: number) => {
    const distToMin = Math.abs(index - minBarIndexRef.current);
    const distToMax = Math.abs(index - maxBarIndexRef.current);

    if (distToMin <= distToMax) {
      const clamped = Math.min(index, maxBarIndexRef.current);
      minBarIndexRef.current = clamped;
      setMinBarIndex(clamped);
      setFilters((prev) => ({ ...prev, minPrice: PRICE_STEPS[clamped] }));
    } else {
      const clamped = Math.max(index, minBarIndexRef.current);
      maxBarIndexRef.current = clamped;
      setMaxBarIndex(clamped);
      setFilters((prev) => ({ ...prev, maxPrice: PRICE_STEPS[clamped] }));
    }
  };

  // Handle interaction anywhere on the chart track (338px total, bars: 44px to 294px)
  const handleTrackInteraction = (locationX: number) => {
    const relX = locationX - 44;
    const clampedIndex = Math.max(0, Math.min(22, Math.round(relX / STEP_PX)));
    handleBarTap(clampedIndex);
  };

  // Web mouse dragging support for thumbs
  const handleThumbMouseDown = (type: 'min' | 'max') => (e: any) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      e.stopPropagation?.();
      setActiveThumb(type);
      const startX = e.clientX;
      const startIdx = type === 'min' ? minBarIndexRef.current : maxBarIndexRef.current;
      const onMouseMove = (moveEvt: MouseEvent) => {
        const deltaX = moveEvt.clientX - startX;
        const indexDelta = Math.round(deltaX / STEP_PX);
        if (type === 'min') {
          const clamped = Math.max(0, Math.min(maxBarIndexRef.current, startIdx + indexDelta));
          if (clamped !== minBarIndexRef.current) {
            minBarIndexRef.current = clamped;
            setMinBarIndex(clamped);
            setFilters((p) => ({ ...p, minPrice: PRICE_STEPS[clamped] }));
          }
        } else {
          const clamped = Math.max(minBarIndexRef.current, Math.min(22, startIdx + indexDelta));
          if (clamped !== maxBarIndexRef.current) {
            maxBarIndexRef.current = clamped;
            setMaxBarIndex(clamped);
            setFilters((p) => ({ ...p, maxPrice: PRICE_STEPS[clamped] }));
          }
        }
      };
      const onMouseUp = () => {
        setActiveThumb(null);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  // Dynamic available staff list (from staffStore + items)
  const availableStaff = useMemo(() => {
    const list: string[] = ['Aisha Bello', 'Tunde Adebayo', 'Adaeze Nwosu', 'Chioma Okafor'];
    try {
      const storeStaff = getAllStaff();
      storeStaff.forEach((s: StaffMember) => {
        if (s.name && !list.includes(s.name)) list.push(s.name);
      });
    } catch (e) {}
    if (items && Array.isArray(items)) {
      items.forEach((item: any) => {
        const name = item.staff || item.specialist;
        if (name && typeof name === 'string' && !list.includes(name)) {
          list.push(name);
        }
      });
    }
    return list;
  }, [items]);

  // Dynamic available services list
  const availableServices = useMemo(() => {
    const list: string[] = ['Hair Cut', 'Nail Art', 'Hair Wash', 'Pedicure', 'Manicure', 'Feet Massage'];
    if (items && Array.isArray(items)) {
      items.forEach((item) => {
        if (item.title) {
          const t = item.title.toLowerCase();
          if ((t.includes('braid') || t.includes('brade')) && !list.includes('Men Braids')) list.push('Men Braids');
          if (t.includes('facial') && !list.includes('Male Facial')) list.push('Male Facial');
          if (t.includes('grooming') && !list.includes('Full Men Grooming')) list.push('Full Men Grooming');
        }
      });
    }
    return list;
  }, [items]);

  // Toggle helpers
  const toggleService = (service: string) => {
    setFilters((prev) => {
      const exists = prev.selectedServices.includes(service);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((s) => s !== service)
          : [...prev.selectedServices, service],
      };
    });
  };

  const toggleStaff = (staff: string) => {
    setFilters((prev) => {
      const exists = prev.selectedStaff.includes(staff);
      return {
        ...prev,
        selectedStaff: exists
          ? prev.selectedStaff.filter((s) => s !== staff)
          : [...prev.selectedStaff, staff],
      };
    });
  };

  const toggleCustomerType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      customerType: prev.customerType === type ? null : type,
    }));
  };

  const togglePaymentMethod = (method: string) => {
    setFilters((prev) => ({
      ...prev,
      paymentMethod: prev.paymentMethod === method ? null : method,
    }));
  };

  const toggleAppointmentType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      appointmentType: prev.appointmentType === type ? null : type,
    }));
  };

  const toggleBookedPackage = (pkg: string) => {
    setFilters((prev) => ({
      ...prev,
      bookedPackage: prev.bookedPackage === pkg ? null : pkg,
    }));
  };

  const removeRecentFilter = (chip: string) => {
    setRecentFilters((prev) => prev.filter((c) => c !== chip));
    if (filters.selectedServices.includes(chip)) {
      setFilters((prev) => ({
        ...prev,
        selectedServices: prev.selectedServices.filter((s) => s !== chip),
      }));
    }
    if (filters.selectedStaff.includes(chip)) {
      setFilters((prev) => ({
        ...prev,
        selectedStaff: prev.selectedStaff.filter((s) => s !== chip),
      }));
    }
    if ((chip === 'Subscriber Client' || chip === 'Verified Client') && filters.customerType === 'verified') {
      setFilters((prev) => ({ ...prev, customerType: null }));
    }
    if ((chip === 'Non Subscriber Client' || chip === 'Non verified customer') && filters.customerType === 'non-verified') {
      setFilters((prev) => ({ ...prev, customerType: null }));
    }
    if (chip === 'Cash Payment' && filters.paymentMethod === 'cash') {
      setFilters((prev) => ({ ...prev, paymentMethod: null }));
    }
    if (chip === 'Card Payment' && filters.paymentMethod === 'card') {
      setFilters((prev) => ({ ...prev, paymentMethod: null }));
    }
    if ((chip === 'Inter-Bank Transfer' || chip === 'Inter App Transfer') && filters.paymentMethod === 'transfer') {
      setFilters((prev) => ({ ...prev, paymentMethod: null }));
    }
    if ((chip === 'In-Person' || chip === 'In Person') && filters.appointmentType === 'in-person') {
      setFilters((prev) => ({ ...prev, appointmentType: null }));
    }
    if (chip === 'Home Service' && filters.appointmentType === 'home-service') {
      setFilters((prev) => ({ ...prev, appointmentType: null }));
    }
    if (chip === 'Basic Package' && filters.bookedPackage === 'basic') {
      setFilters((prev) => ({ ...prev, bookedPackage: null }));
    }
    if (chip === 'Premium Package' && filters.bookedPackage === 'premium') {
      setFilters((prev) => ({ ...prev, bookedPackage: null }));
    }
    if (chip === 'Exclusive Package' && filters.bookedPackage === 'exclusive') {
      setFilters((prev) => ({ ...prev, bookedPackage: null }));
    }
    if (chip.startsWith('₦')) {
      setMinBarIndex(0);
      setMaxBarIndex(17);
      setFilters((prev) => ({ ...prev, customAmount: '' }));
    }
  };

  const handleClearAll = () => {
    const cleared: ProviderFilterState = {
      minPrice: 27550,
      maxPrice: 935550,
      customAmount: '',
      selectedServices: [],
      selectedStaff: [],
      customerType: null,
      paymentMethod: null,
      appointmentType: null,
      bookedPackage: null,
      recentFilters,
    };
    setMinBarIndex(0);
    setMaxBarIndex(17);
    minBarIndexRef.current = 0;
    maxBarIndexRef.current = 17;
    setFilters(cleared);
    onClear();
  };

  // Dynamic matching count calculation
  const matchingCount = useMemo(() => {
    if (!items || !Array.isArray(items)) return 0;
    return items.filter((item) => matchAppointment(item, filters)).length;
  }, [filters, items]);

  const handleApply = () => {
    // Add current active selections to recent filters
    const activeNames: string[] = [];
    filters.selectedServices.forEach((s) => activeNames.push(s));
    filters.selectedStaff.forEach((s) => activeNames.push(s));
    if (filters.customerType === 'verified') activeNames.push('Subscriber Client');
    if (filters.customerType === 'non-verified') activeNames.push('Non Subscriber Client');
    if (filters.paymentMethod === 'cash') activeNames.push('Cash Payment');
    if (filters.paymentMethod === 'card') activeNames.push('Card Payment');
    if (filters.paymentMethod === 'transfer') activeNames.push('Inter-Bank Transfer');
    if (filters.appointmentType === 'in-person') activeNames.push('In-Person');
    if (filters.appointmentType === 'home-service') activeNames.push('Home Service');
    if (filters.bookedPackage === 'basic') activeNames.push('Basic Package');
    if (filters.bookedPackage === 'premium') activeNames.push('Premium Package');
    if (filters.bookedPackage === 'exclusive') activeNames.push('Exclusive Package');
    if (minBarIndex > 0 || maxBarIndex < 17 || filters.customAmount) {
      const effectiveMax = filters.customAmount
        ? (parseInt(filters.customAmount.replace(/[^0-9]/g, ''), 10) || maxPrice)
        : maxPrice;
      activeNames.push(`₦${minPrice.toLocaleString()} - ₦${effectiveMax.toLocaleString()}`);
    }

    const updatedRecents = Array.from(new Set([...activeNames, ...recentFilters])).slice(0, 8);
    setRecentFilters(updatedRecents);

    onApply({
      ...filters,
      minPrice,
      maxPrice,
      recentFilters: updatedRecents,
    });
    onClose();
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const amountInputYRef = useRef<number>(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = 575;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* ── Drawn Out Bottom Sheet ── */}
        <View style={[styles.bottomSheetContainer, { height: sheetHeight }]}>
          {/* ── Header: Filter & Close Button (height: 62px) ── */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerLeftSpacer} />
            <Text style={styles.sheetTitle}>Filter</Text>
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.7}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Cancel01Icon size={24} color="#141B34" />
            </TouchableOpacity>
          </View>

          {/* ── Filter Content Scroll Area ── */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.sheetScrollView}
            contentContainerStyle={[
              styles.sheetScrollContent,
              { paddingBottom: isKeyboardVisible ? keyboardHeight + 80 : 120 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            {/* ── Dynamic Recent Filtered Section (when active) ── */}
            {recentFilters.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.recentHeaderRow}>
                  <Text style={styles.recentHeaderTitle}>Recent filtered</Text>
                </View>

                {/* Chips Grid */}
                <View style={styles.chipsContainer}>
                  {recentFilters.map((chip, index) => {
                    const isVerified = chip.includes('Subscriber') || chip.includes('Verified');

                    return (
                      <View
                        key={`${chip}-${index}`}
                        style={styles.recentChip}
                      >
                        {isVerified && <CheckmarkBadge02Icon size={18} />}
                        <Text style={styles.chipText}>{chip}</Text>
                        <TouchableOpacity
                          onPress={() => removeRecentFilter(chip)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.chipCancelBtn}
                          activeOpacity={0.7}
                        >
                          <Cancel01Icon size={14} color="#141B34" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                {/* More Choices Divider Title */}
                <Text style={styles.moreChoicesTitle}>More Choices</Text>
              </View>
            )}

            {/* ── Section 1: Price Range ── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Price Range</Text>

              {/* Exact 1:1 Figma Price Chart Indicator (height: 110px: 58px bars/line + 20px half thumb + 4px + 24px Drag text) */}
              <View
                style={styles.priceChartWrapper}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(evt) => {
                  const locX = evt.nativeEvent.locationX;
                  if (typeof locX === 'number') handleTrackInteraction(locX);
                }}
                onResponderMove={(evt) => {
                  const locX = evt.nativeEvent.locationX;
                  if (typeof locX === 'number') handleTrackInteraction(locX);
                }}
              >
                {/* 23 Histogram Bars sitting directly on the baseline */}
                <View style={styles.histogramBarsRow}>
                  {HISTOGRAM_BARS.map((height, i) => {
                    const isBarActive = i >= minBarIndex && i <= maxBarIndex;
                    return (
                      <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() => handleBarTap(i)}
                        hitSlop={{ top: 10, bottom: 10, left: 2, right: 2 }}
                        style={styles.barTouchTarget}
                      >
                        <View
                          style={[
                            styles.singleBar,
                            {
                              height,
                              backgroundColor: isBarActive
                                ? 'rgba(204, 41, 41, 0.9)'
                                : 'rgba(192, 192, 204, 0.96)',
                            },
                          ]}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Baseline: Line 115 (338px total) */}
                <View style={styles.baselineGrey} />

                {/* Active Red Segment between min thumb center and max thumb center */}
                <View
                  style={[
                    styles.baselineActiveRed,
                    {
                      left: minThumbLeft + 20,
                      width: Math.max(0, maxThumbLeft - minThumbLeft),
                    },
                  ]}
                />

                {/* Minimum Draggable Thumb (40x40 circle centered at Y = 58px baseline) */}
                <View
                  {...minPanResponder.panHandlers}
                  {...(Platform.OS === 'web' ? { onMouseDown: handleThumbMouseDown('min') } : {})}
                  style={[
                    styles.draggableThumbContainer,
                    {
                      left: minThumbLeft,
                      zIndex: activeThumb === 'min' ? 12 : 6,
                    },
                  ]}
                >
                  <View style={styles.thumbCircle} />
                  <Text style={styles.dragLabelText}>Drag</Text>
                </View>

                {/* Maximum Draggable Thumb (40x40 circle centered at Y = 58px baseline) */}
                <View
                  {...maxPanResponder.panHandlers}
                  {...(Platform.OS === 'web' ? { onMouseDown: handleThumbMouseDown('max') } : {})}
                  style={[
                    styles.draggableThumbContainer,
                    {
                      left: maxThumbLeft,
                      zIndex: activeThumb === 'max' ? 12 : 7,
                    },
                  ]}
                >
                  <View style={styles.thumbCircle} />
                  <Text style={styles.dragLabelText}>Drag</Text>
                </View>
              </View>

              {/* Editable Price Buttons (Figma: width 358px, gap: 164px between two 132px buttons) */}
              <View style={styles.editablePriceButtonsRow}>
                {/* Minimum Button Column */}
                <View style={styles.priceButtonCol}>
                  <Text style={styles.priceButtonLabel}>Minimum</Text>
                  <TouchableOpacity
                    style={styles.pricePillButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      const nextMin = (minBarIndex + 1) % Math.min(maxBarIndex + 1, PRICE_STEPS.length);
                      setMinBarIndex(nextMin);
                      minBarIndexRef.current = nextMin;
                      setFilters((p) => ({ ...p, minPrice: PRICE_STEPS[nextMin] }));
                    }}
                  >
                    <Text style={styles.pricePillValue}>₦{minPrice.toLocaleString()}</Text>
                  </TouchableOpacity>
                </View>

                {/* Maximum Button Column */}
                <View style={styles.priceButtonCol}>
                  <Text style={styles.priceButtonLabel}>Maximum</Text>
                  <TouchableOpacity
                    style={styles.pricePillButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      const nextMax = maxBarIndex >= 22 ? Math.max(minBarIndex, 17) : maxBarIndex + 1;
                      setMaxBarIndex(nextMax);
                      maxBarIndexRef.current = nextMax;
                      setFilters((p) => ({ ...p, maxPrice: PRICE_STEPS[nextMax] }));
                    }}
                  >
                    <Text style={styles.pricePillValue}>
                      ₦{maxPrice.toLocaleString()} {maxBarIndex >= 17 ? '+' : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Amount Input (Figma: width: 358px, padding 0 16px, gap: 24px) */}
              <View
                style={styles.amountInputFrame}
                onLayout={(e) => {
                  amountInputYRef.current = e.nativeEvent.layout.y;
                }}
              >
                <TextInput
                  style={styles.amountInputField}
                  placeholder="Enter Amount eg. ₦1,000"
                  placeholderTextColor="rgba(96, 96, 102, 0.96)"
                  value={filters.customAmount}
                  onFocus={() => {
                    setTimeout(() => {
                      if (amountInputYRef.current > 0) {
                        scrollViewRef.current?.scrollTo({
                          y: Math.max(0, amountInputYRef.current - 40),
                          animated: true,
                        });
                      }
                    }, 120);
                  }}
                  onChangeText={(val) => {
                    setFilters((p) => ({ ...p, customAmount: val }));
                    const digits = val.replace(/[^0-9]/g, '');
                    if (digits) {
                      const num = parseInt(digits, 10);
                      if (!isNaN(num) && num > 0) {
                        let closest = 0;
                        let minDiff = Infinity;
                        PRICE_STEPS.forEach((p, idx) => {
                          const diff = Math.abs(p - num);
                          if (diff < minDiff) {
                            minDiff = diff;
                            closest = idx;
                          }
                        });
                        if (closest <= minBarIndex) {
                          setMinBarIndex(closest);
                          minBarIndexRef.current = closest;
                        } else {
                          setMaxBarIndex(closest);
                          maxBarIndexRef.current = closest;
                        }
                      }
                    }
                  }}
                  keyboardType="numeric"
                />
                <View style={styles.amountInputLine110} />
              </View>
            </View>

            {/* ── Section 2: Services (1:1 Figma Multi-line Wrapped Chips) ── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Services</Text>

              <View style={styles.servicesWrapContainer}>
                {availableServices.map((svc) => {
                  const selected = filters.selectedServices.includes(svc);
                  return (
                    <TouchableOpacity
                      key={svc}
                      style={[
                        styles.servicePill,
                        selected ? styles.servicePillActive : styles.servicePillInactive,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => toggleService(svc)}
                    >
                      <Text
                        style={[
                          styles.pillText16,
                          selected ? styles.pillTextActive : styles.pillTextInactive,
                        ]}
                      >
                        {svc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Section 3: Staff (Dynamic 2-column Grid) ── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Staff</Text>

              <View style={styles.staffContainer}>
                {Array.from({ length: Math.ceil(availableStaff.length / 2) }).map((_, rIdx) => {
                  const pair = availableStaff.slice(rIdx * 2, rIdx * 2 + 2);
                  return (
                    <View key={rIdx} style={[styles.buttonsRow, { justifyContent: 'space-between', marginBottom: 12 }]}>
                      {pair.map((staff) => {
                        const selected = filters.selectedStaff.includes(staff);
                        return (
                          <TouchableOpacity
                            key={staff}
                            style={[
                              styles.staffPill,
                              selected ? styles.servicePillActive : styles.servicePillInactive,
                            ]}
                            activeOpacity={0.75}
                            onPress={() => toggleStaff(staff)}
                          >
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.pillText16,
                                selected ? styles.pillTextActive : styles.pillTextInactive,
                              ]}
                            >
                              {staff}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      {pair.length === 1 && <View style={{ flex: 1 }} />}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── Section 4: Customer Type (Figma 1:1 230px Pills) ── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Customer Type</Text>

              <View style={styles.customerTypeColumn}>
                {/* Subscriber Client (230x48px with Verified Checkmark Badge) */}
                <TouchableOpacity
                  style={[
                    styles.customerTypePill,
                    filters.customerType === 'verified'
                      ? styles.servicePillActive
                      : styles.servicePillInactive,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => toggleCustomerType('verified')}
                >
                  <CheckmarkBadge02Icon size={20} />
                  <Text
                    style={[
                      styles.pillText16,
                      filters.customerType === 'verified'
                        ? styles.pillTextActive
                        : styles.pillTextInactive,
                    ]}
                  >
                    Subscriber Client
                  </Text>
                </TouchableOpacity>

                {/* Non Subscriber Client (230x48px) */}
                <TouchableOpacity
                  style={[
                    styles.customerTypePill,
                    filters.customerType === 'non-verified'
                      ? styles.servicePillActive
                      : styles.servicePillInactive,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => toggleCustomerType('non-verified')}
                >
                  <Text
                    style={[
                      styles.pillText16,
                      filters.customerType === 'non-verified'
                        ? styles.pillTextActive
                        : styles.pillTextInactive,
                    ]}
                  >
                    Non Subscriber Client
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Section 5: Payment Method (Figma 1:1 Layout) ── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Payment Method</Text>

              <View style={styles.paymentMethodContainer}>
                {/* Row 1: Cash Payment (150px) & Card Payment (167px) */}
                <View style={[styles.buttonsRow, { justifyContent: 'space-between' }]}>
                  <TouchableOpacity
                    style={[
                      styles.paymentPill,
                      { flex: 1 },
                      filters.paymentMethod === 'cash'
                        ? styles.servicePillActive
                        : styles.servicePillInactive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => togglePaymentMethod('cash')}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.pillText16,
                        filters.paymentMethod === 'cash'
                          ? styles.pillTextActive
                          : styles.pillTextInactive,
                      ]}
                    >
                      Cash Payment
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentPill,
                      { flex: 1 },
                      filters.paymentMethod === 'card'
                        ? styles.servicePillActive
                        : styles.servicePillInactive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => togglePaymentMethod('card')}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.pillText16,
                        filters.paymentMethod === 'card'
                          ? styles.pillTextActive
                          : styles.pillTextInactive,
                      ]}
                    >
                      Card Payment
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Row 2: Inter-Bank Transfer (185px) */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.paymentPill,
                      { width: 185 },
                      filters.paymentMethod === 'transfer'
                        ? styles.servicePillActive
                        : styles.servicePillInactive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => togglePaymentMethod('transfer')}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.pillText16,
                        filters.paymentMethod === 'transfer'
                          ? styles.pillTextActive
                          : styles.pillTextInactive,
                      ]}
                    >
                      Inter-Bank Transfer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ── Section 6: Appointment Type (Figma 1:1 Layout) ── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Appointment Type</Text>

              <View style={[styles.buttonsRow, { justifyContent: 'space-between' }]}>
                <TouchableOpacity
                  style={[
                    styles.appointmentTypePill,
                    filters.appointmentType === 'in-person'
                      ? styles.servicePillActive
                      : styles.servicePillInactive,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => toggleAppointmentType('in-person')}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.pillText16,
                      filters.appointmentType === 'in-person'
                        ? styles.pillTextActive
                        : styles.pillTextInactive,
                    ]}
                  >
                    In-Person
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.appointmentTypePill,
                    filters.appointmentType === 'home-service'
                      ? styles.servicePillActive
                      : styles.servicePillInactive,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => toggleAppointmentType('home-service')}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.pillText16,
                      filters.appointmentType === 'home-service'
                        ? styles.pillTextActive
                        : styles.pillTextInactive,
                    ]}
                  >
                    Home Service
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Section 7: Booked With Package (Figma 1:1 Layout) ── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Booked With Package</Text>

              <View style={styles.packageContainer}>
                {/* Row 1: Basic Package (167.5px) & Premium Package (167.5px) */}
                <View style={[styles.buttonsRow, { justifyContent: 'space-between' }]}>
                  <TouchableOpacity
                    style={[
                      styles.packagePill,
                      { width: 167.5 },
                      filters.bookedPackage === 'basic'
                        ? styles.servicePillActive
                        : styles.servicePillInactive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => toggleBookedPackage('basic')}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.pillText16,
                        filters.bookedPackage === 'basic'
                          ? styles.pillTextActive
                          : styles.pillTextInactive,
                      ]}
                    >
                      Basic Package
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.packagePill,
                      { width: 167.5 },
                      filters.bookedPackage === 'premium'
                        ? styles.servicePillActive
                        : styles.servicePillInactive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => toggleBookedPackage('premium')}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.pillText16,
                        filters.bookedPackage === 'premium'
                          ? styles.pillTextActive
                          : styles.pillTextInactive,
                      ]}
                    >
                      Premium Package
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Row 2: Exclusive Package (183px) */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.packagePill,
                      { width: 183 },
                      filters.bookedPackage === 'exclusive'
                        ? styles.servicePillActive
                        : styles.servicePillInactive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => toggleBookedPackage('exclusive')}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.pillText16,
                        filters.bookedPackage === 'exclusive'
                          ? styles.pillTextActive
                          : styles.pillTextInactive,
                      ]}
                    >
                      Exclusive Package
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* ── Sticky Bottom Action Bar (height: 80px, padding: 16px, gap: 17px) ── */}
          <View
            style={[
              styles.bottomActionBar,
              {
                paddingBottom: insets.bottom + 16,
                height: undefined,
              },
            ]}
          >
            {/* Clear all Button (115x48px) */}
            <TouchableOpacity
              style={styles.clearAllButton}
              activeOpacity={0.75}
              onPress={handleClearAll}
            >
              <Text style={styles.clearAllButtonText}>Clear all</Text>
            </TouchableOpacity>

            {/* Show 20+ related / Apply Button (flex: 1, height: 48px) */}
            <TouchableOpacity
              style={styles.showRelatedButton}
              activeOpacity={0.85}
              onPress={handleApply}
            >
              <Text style={styles.showRelatedButtonText}>
                Show {matchingCount >= 20 ? `${matchingCount}+` : matchingCount} related
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProviderAppointmentFilterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  /* ── Filter Bottom Sheet Container ── */
  bottomSheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },

  /* ── Sheet Header (height: 62px) ── */
  sheetHeader: {
    width: '100%',
    height: 62,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  headerLeftSpacer: {
    width: 40,
    height: 40,
  },

  sheetTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Sheet ScrollView ── */
  sheetScrollView: {
    flex: 1,
  },

  sheetScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 40,
  },

  /* ── Section Block ── */
  sectionBlock: {
    width: '100%',
    gap: 24,
  },

  sectionHeading: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },

  /* ── 1:1 Figma Price Chart Indicator Geometry ── */
  priceChartWrapper: {
    width: 338,
    height: 110,
    alignSelf: 'center',
    position: 'relative',
  },

  histogramBarsRow: {
    position: 'absolute',
    top: 0,
    left: 44,
    width: 250,
    height: 58,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },

  barTouchTarget: {
    width: 8,
    height: 58,
    justifyContent: 'flex-end',
  },

  singleBar: {
    width: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  baselineGrey: {
    position: 'absolute',
    top: 58,
    left: 0,
    width: 338,
    height: 1,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  baselineActiveRed: {
    position: 'absolute',
    top: 58,
    height: 1.5,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
  },

  draggableThumbContainer: {
    position: 'absolute',
    top: 38, // Centered at Y = 58px baseline (58 - 20)
    width: 40,
    alignItems: 'center',
  },

  thumbCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 4,
  },

  dragLabelText: {
    marginTop: 4,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ── Editable Price Buttons Row (Figma: width 358px, gap 164px between 132px buttons) ── */
  editablePriceButtonsRow: {
    width: 358,
    height: 76,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },

  priceButtonCol: {
    width: 132,
    height: 76,
    alignItems: 'center',
    gap: 8,
  },

  priceButtonLabel: {
    width: 132,
    height: 20,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  pricePillButton: {
    width: 132,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  pricePillValue: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  /* ── Amount Input (width: 358px, padding 0 16px, gap: 24px) ── */
  amountInputFrame: {
    width: 358,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },

  amountInputField: {
    width: 326,
    height: 24,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },

  amountInputLine110: {
    width: 326,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  /* ── Recent Filtered Section ── */
  recentSection: {
    gap: 16,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentHeaderTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    gap: 12,
  },
  chipText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  chipCancelBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreChoicesTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    marginTop: 8,
    includeFontPadding: false,
  },

  /* ── Service Buttons Multi-line Wrapped Layout ── */
  servicesWrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },

  /* ── Staff Container (gap: 24px) ── */
  staffContainer: {
    gap: 24,
    width: '100%',
  },

  staffPill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  /* ── Customer Type Column (gap: 24px) ── */
  customerTypeColumn: {
    gap: 24,
    width: '100%',
  },

  customerTypePill: {
    width: 230,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },

  /* ── Payment Method Container (gap: 24px) ── */
  paymentMethodContainer: {
    gap: 24,
    width: '100%',
  },

  paymentPill: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  /* ── Appointment Type Pill (150x48px) ── */
  appointmentTypePill: {
    width: 150,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  /* ── Package Container (gap: 24px) ── */
  packageContainer: {
    gap: 24,
    width: '100%',
  },

  packagePill: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  /* ── Pill Buttons Layout ── */
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  servicePill: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  servicePillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },

  servicePillActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 4,
  },

  pillText16: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },

  pillTextInactive: {
    color: 'rgba(0, 8, 20, 0.96)',
  },

  pillTextActive: {
    color: '#FFFFFF',
  },

  /* ── Sticky Bottom Action Bar ── */
  bottomActionBar: {
    width: '100%',
    minHeight: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 17,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },

  clearAllButton: {
    width: 115,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearAllButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  showRelatedButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 4,
  },

  showRelatedButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
