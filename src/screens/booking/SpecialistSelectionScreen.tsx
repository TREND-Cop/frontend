import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Check, Star } from 'lucide-react-native';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookingProgressStepper } from '../../components/BookingProgressStepper';
import { SafeImage } from '../../components/ui/SafeImage';
import { bookingStore, SpecialistItem } from '../../utils/bookingStore';
import { theme } from '../../constants/theme';

export const SPECIALIST_LIST: SpecialistItem[] = [
  {
    id: 's1',
    name: 'Micheal Ureal',
    role: 'Nail Art Specialist',
    rating: '5.0',
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    id: 's2',
    name: 'Eze Joseph',
    role: 'Nail Art Specialist',
    rating: '5.0',
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: 's3',
    name: 'Samson Nnkanu',
    role: 'Nail Art Specialist',
    rating: '5.0',
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
  {
    id: 's4',
    name: 'Omotola David',
    role: 'Nail Art Specialist',
    rating: '5.0',
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  },
  {
    id: 's_addon_bisola_a',
    name: 'Bisola Andrew',
    role: 'Nail & Pedicure Expert',
    rating: '5.1',
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
];

interface SpecialistSelectionScreenProps {
  onBack?: () => void;
  onApply?: (specialist: SpecialistItem, note: string) => void;
  showStepper?: boolean;
}

export const SpecialistSelectionScreen: React.FC<SpecialistSelectionScreenProps> = ({
  onBack,
  onApply,
  showStepper,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const isFromReview = params?.fromReview === 'true';
  const isAddOnSpecialist = params?.target === 'addon' || params?.isAddOn === 'true';
  const mode = (params?.mode as string) || (isFromReview ? 'add' : 'initial');
  const replacingId = params?.replacingId as string | undefined;

  // If accessed directly from change button or without step flow, determine stepper visibility
  const shouldShowStepper = showStepper ?? (isFromReview || isAddOnSpecialist ? false : true);

  // Specialists already chosen in previous step(s) (both across services and add-ons)
  const { alreadySelectedIds, alreadySelectedNames } = useMemo(() => {
    if (!isFromReview && !isAddOnSpecialist && mode !== 'change' && mode !== 'add') {
      return { alreadySelectedIds: [] as string[], alreadySelectedNames: [] as string[] };
    }

    // Service specialists
    const serviceSpecialists = bookingStore.getSelectedSpecialists();
    const serviceIds = serviceSpecialists.map((s) => s.id);
    const serviceNames = serviceSpecialists.map((s) => s.name.toLowerCase().trim());

    // Add-on specialist
    const addonSp = bookingStore.getAddOnSpecialist();
    const addonIds = addonSp ? [addonSp.id] : [];
    const addonNames = addonSp ? [addonSp.name.toLowerCase().trim()] : [];

    const allIds = Array.from(new Set([...serviceIds, ...addonIds]));
    const allNames = Array.from(new Set([...serviceNames, ...addonNames]));

    return {
      alreadySelectedIds: allIds,
      alreadySelectedNames: allNames,
    };
  }, [isFromReview, isAddOnSpecialist, mode]);

  // Specialist selection and notes always start in a clean, unselected empty state
  const [selectedSpecialistIds, setSelectedSpecialistIds] = useState<string[]>([]);
  const [noteText, setNoteText] = useState<string>('');

  // When navigating to this screen fresh or starting a new booking, ensure it starts clean in empty state
  useFocusEffect(
    useCallback(() => {
      if (!isFromReview && mode !== 'change' && mode !== 'add') {
        setSelectedSpecialistIds([]);
        setNoteText('');
      }
    }, [isFromReview, mode])
  );
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [noteSectionY, setNoteSectionY] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Dynamic Base Price & Double Staff pricing calculation
  const baseServicePrice = params.price
    ? parseInt(String(params.price).replace(/[^0-9]/g, ''), 10) || 10200
    : (bookingStore.getBasePrice() === 12000 ? 10200 : bookingStore.getBasePrice() || 10200);

  // When multiple specialists are selected, each additional staff increases price by 4,500
  const totalStaffCount = isFromReview
    ? (mode === 'change'
        ? Math.max(1, alreadySelectedIds.length)
        : alreadySelectedIds.length + selectedSpecialistIds.length)
    : selectedSpecialistIds.length;

  const extraStaffCount = Math.max(0, totalStaffCount - 1);
  const estimatedPrice = totalStaffCount > 0
    ? baseServicePrice + extraStaffCount * 4500
    : baseServicePrice;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          if (noteSectionY > 0) {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, noteSectionY - 40),
              animated: true,
            });
          } else {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        }, 120);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [noteSectionY]);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else if (isFromReview) {
      router.replace('/booking-review' as any);
    } else {
      router.replace('/appointment-time' as any);
    }
  };

  const handleToggleSpecialist = (id: string, name?: string) => {
    // If it's already selected from previous step(s), tapping is disabled
    const isAlready =
      alreadySelectedIds.includes(id) ||
      (name ? alreadySelectedNames.includes(name.toLowerCase().trim()) : false);
    if (isAlready) {
      return;
    }
    if (isAddOnSpecialist || mode === 'change') {
      setSelectedSpecialistIds((prev) => (prev.includes(id) ? [] : [id]));
      return;
    }
    setSelectedSpecialistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    const newlyChosen = SPECIALIST_LIST.filter((s) => selectedSpecialistIds.includes(s.id));
    if (newlyChosen.length === 0 && selectedSpecialistIds.length === 0) return;

    if (isAddOnSpecialist) {
      if (newlyChosen.length > 0) {
        bookingStore.setAddOnSpecialist(newlyChosen[0]);
      }
    } else if (isFromReview) {
      if (mode === 'change' && replacingId) {
        const currentList = bookingStore.getSelectedSpecialists();
        const updatedList = currentList.map((s) => (s.id === replacingId ? newlyChosen[0] : s));
        bookingStore.setSelectedSpecialists(updatedList);
      } else if (mode === 'change') {
        bookingStore.setSelectedSpecialists(newlyChosen);
      } else {
        // mode === 'add': append newly chosen specialists to existing ones
        const currentList = bookingStore.getSelectedSpecialists();
        const existingIds = new Set(currentList.map((s) => s.id));
        const combined = [...currentList];
        for (const sp of newlyChosen) {
          if (!existingIds.has(sp.id)) {
            combined.push(sp);
          }
        }
        bookingStore.setSelectedSpecialists(combined);
      }
      if (noteText) {
        bookingStore.setSpecialistNote(noteText);
      }
    } else {
      // Initial selection flow
      bookingStore.setSelectedSpecialists(newlyChosen);
      bookingStore.setSpecialistNote(noteText);
    }

    if (onApply) {
      onApply(newlyChosen[0] || SPECIALIST_LIST[0], noteText);
    } else if (isFromReview || isAddOnSpecialist) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/booking-review' as any);
      }
    } else {
      router.push('/booking-review');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Navigation Bar (Figma: height 56px, borderBottom 1px) ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Specialist</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: (isKeyboardVisible ? 360 : 100) + insets.bottom },
          ]}
        >
          {/* ─── Optional Booking Progress Stepper ─── */}
          {shouldShowStepper && <BookingProgressStepper currentStep={2} />}

          {/* ─── Section 1: Preferred Specialist (Figma H2 Med 20px) ─── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Select Preferred Specialist</Text>

            {/* Stylist List (Figma: gap 40px) */}
            <View style={styles.specialistList}>
              {SPECIALIST_LIST.map((specialist) => {
                const isAlreadySelected =
                  alreadySelectedIds.includes(specialist.id) ||
                  alreadySelectedNames.includes(specialist.name.toLowerCase().trim());
                const isSelected = !isAlreadySelected && selectedSpecialistIds.includes(specialist.id);

                return (
                  <TouchableOpacity
                    key={specialist.id}
                    style={[
                      styles.specialistCard,
                      isAlreadySelected && styles.specialistCardAlreadySelected,
                      !isAlreadySelected && isSelected && styles.specialistCardSelected,
                    ]}
                    activeOpacity={isAlreadySelected ? 1 : 0.88}
                    disabled={isAlreadySelected}
                    onPress={() => handleToggleSpecialist(specialist.id, specialist.name)}
                  >
                    {/* Avatar Frame (80x80, radius 16px) */}
                    <SafeImage
                      source={specialist.image}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />

                    {/* Info Column (Micheal Ureal, Role, Star 5.0 (22)) */}
                    <View style={styles.specialistInfo}>
                      <Text style={styles.specialistName} numberOfLines={1}>
                        {specialist.name}
                      </Text>
                      <Text style={styles.specialistRole} numberOfLines={1}>
                        {specialist.role}
                      </Text>

                      <View style={styles.ratingRow}>
                        <View style={styles.ratingSubRow}>
                          <Star
                            size={14}
                            color="rgba(248, 155, 24, 0.96)"
                            fill="rgba(248, 155, 24, 0.96)"
                          />
                          <Text style={styles.ratingText}>
                            {specialist.rating} ({specialist.reviews})
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* If already selected: NO radio button! Show "Selected" badge */}
                    {isAlreadySelected ? (
                      <View style={styles.alreadySelectedBadge}>
                        <Text style={styles.alreadySelectedBadgeText}>Selected</Text>
                      </View>
                    ) : (
                      /* Radio Selection Circle (24x24) */
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ─── Section 2: Note (Figma H2 Med 20px, height 108px) ─── */}
          <View
            style={styles.noteSection}
            onLayout={(e) => setNoteSectionY(e.nativeEvent.layout.y)}
          >
            <Text style={styles.noteTitle}>Note</Text>
            <View style={styles.noteInputContainer}>
              <TextInput
                style={[styles.noteTextInput, { outlineStyle: 'none' } as any]}
                placeholder="Tap here leave a note for the specialist"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                multiline
                maxLength={200}
                value={noteText}
                onChangeText={setNoteText}
                onFocus={() => {
                  setTimeout(() => {
                    if (noteSectionY > 0) {
                      scrollViewRef.current?.scrollTo({
                        y: Math.max(0, noteSectionY - 20),
                        animated: true,
                      });
                    } else {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }
                  }, 200);
                }}
              />
              <Text style={styles.charCounter}>
                {noteText.length}/200
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ─── 1:1 Figma Sticky Bottom Action Bar with Dynamic Estimated Price & Next Button ─── */}
        {!isKeyboardVisible && (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(16, insets.bottom) }]}>
            <View style={styles.bottomRow}>
              {/* Total / Estimated Price Column */}
              <View style={styles.priceBlock}>
                <Text style={styles.estimatedLabel} numberOfLines={1}>Estimated</Text>
                <Text style={styles.priceValue} numberOfLines={1}>₦{estimatedPrice.toLocaleString()}</Text>
              </View>

              {/* Filled Action Button (226x48px, radius 24px) */}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  selectedSpecialistIds.length === 0 && styles.nextButtonDisabled,
                ]}
                disabled={selectedSpecialistIds.length === 0}
                activeOpacity={0.85}
                onPress={handleNext}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    selectedSpecialistIds.length === 0 && styles.nextButtonTextDisabled,
                  ]}
                  numberOfLines={1}
                >
                  {isFromReview || isAddOnSpecialist ? 'Apply' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.pageHeader,
    color: '#000000',
  },
  headerPlaceholder: {
    width: 48,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },

  // ── Section 1: Preferred Specialist (Figma: H2 Med 20px) ──
  sectionBlock: {
    gap: 24,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specialistList: {
    gap: 40,
    width: '100%',
  },

  // ── Staff Selection Card (Figma: height 112px, radius 24px, bg rgba(247, 247, 247, 0.96)) ──
  specialistCard: {
    width: '100%',
    minHeight: 112,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  specialistCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  specialistCardAlreadySelected: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  alreadySelectedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 241, 245, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(215, 218, 226, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadySelectedBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E2E2E2',
  },
  specialistInfo: {
    flex: 1,
    gap: 7,
  },
  specialistName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#000000',
  },
  specialistRole: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  ratingSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Note Section (Figma: height 108px, radius 24px, bg rgba(248, 249, 250, 0.98)) ──
  noteSection: {
    gap: 16,
    marginTop: 8,
  },
  noteTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  noteInputContainer: {
    width: '100%',
    height: 108,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    position: 'relative',
  },
  noteTextInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlignVertical: 'top',
  },
  charCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── 1:1 Figma Sticky Bottom Action Bar with Dynamic Estimated Price & Next Button ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    minHeight: 52,
  },
  priceBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 2,
    flexShrink: 0,
    minWidth: 105,
  },
  estimatedLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    flexShrink: 0,
  },
  nextButton: {
    flex: 1,
    maxWidth: 226,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  nextButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});

export default SpecialistSelectionScreen;
