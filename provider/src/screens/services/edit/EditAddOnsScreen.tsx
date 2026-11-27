import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../../utils/safeNavigation';
import * as ImagePicker from 'expo-image-picker';

import {
  useServiceDraft,
  AddOnItem,
  createEmptyAddOn,
} from '../../../context/ServiceDraftContext';
import { isSliceDirty } from '../../../utils/isDirty';
import { triggerLightHaptic } from '../../../utils/haptics';
import { EditHeader } from '../../../components/wizard/EditHeader';
import { EditFooter } from '../../../components/wizard/EditFooter';
import { AddOnBlockList } from '../../../components/wizard/AddOnBlockList';
import { ServiceDurationSheet } from '../../../components/wizard/ServiceDurationSheet';
import { ProviderPhotoUploadSheet } from '../../../components/ProviderPhotoUploadSheet';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

/**
 * 1:1 Figma Edit Add-ons Screen (Frame E4)
 *
 * Implements:
 * - Working copy of the add-on block list from draft
 * - Header intro: "Add-ons" + subtitle
 * - First block prefilled, with red ✕ on filled photo slot
 * - "Add more add-ons" heading with "Add-ons +" row button
 * - Extra add-on blocks stacked below
 * - Sticky Save changes footer:
 *   - Unchanged -> grey disabled
 *   - Dirty -> dark navy
 *   - Validated upon save attempt
 * - Back button -> discards working copy, returns to Review
 */
export const EditAddOnsScreen: React.FC = () => {
  const safeRouter = useSafeRouter();

  const { draft, commitWorkingCopy } = useServiceDraft();

  // Committed slice of add-ons
  const committedAddOns: AddOnItem[] = useMemo(() => {
    if (draft.addOns.length > 0) {
      return draft.addOns;
    }
    return [createEmptyAddOn('initial')];
  }, [draft.addOns]);

  // Working copy state
  const [workingAddOns, setWorkingAddOns] = useState<AddOnItem[]>(() =>
    JSON.parse(JSON.stringify(committedAddOns))
  );

  // Dirty check
  const isDirty = useMemo(
    () => isSliceDirty(workingAddOns, committedAddOns),
    [workingAddOns, committedAddOns]
  );

  // Validation state
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  // Sheets state
  const [isDurationSheetVisible, setIsDurationSheetVisible] = useState(false);
  const [activeDurationAddOnId, setActiveDurationAddOnId] = useState<string | null>(null);
  const [photoTargetAddOnId, setPhotoTargetAddOnId] = useState<string | null>(null);

  // Validation logic (identical to step 3)
  const { isValid, firstError, errorMap } = useMemo(() => {
    const errors: Record<string, boolean> = {};
    let firstErr: string | null = null;

    if (workingAddOns.length === 0) {
      return { isValid: false, firstError: 'Add-on not added', errorMap: {} };
    }

    const block1 = workingAddOns[0];
    if (!block1.imageUri) {
      errors[`addon_image_${block1.id}`] = true;
      if (!firstErr) firstErr = 'Add-on image not added';
    }
    if (!block1.name.trim()) {
      errors[`addon_name_${block1.id}`] = true;
      if (!firstErr) firstErr = 'Add-on name not added';
    }
    if (block1.price === null || block1.price <= 0) {
      errors[`addon_price_${block1.id}`] = true;
      if (!firstErr) firstErr = 'Add-on price not added';
    }
    if (!block1.duration.trim()) {
      errors[`addon_duration_${block1.id}`] = true;
      if (!firstErr) firstErr = 'Add-on duration not added';
    }

    // Check started extra blocks
    const extraBlocks = workingAddOns.slice(1);
    for (const b of extraBlocks) {
      const isStarted =
        !!b.imageUri ||
        b.name.trim().length > 0 ||
        b.description.trim().length > 0 ||
        b.priceRaw.trim().length > 0 ||
        b.duration.trim().length > 0;

      if (isStarted) {
        if (!b.imageUri) {
          errors[`addon_image_${b.id}`] = true;
          if (!firstErr) firstErr = 'Add-on image not added';
        }
        if (!b.name.trim()) {
          errors[`addon_name_${b.id}`] = true;
          if (!firstErr) firstErr = 'Add-on name not added';
        }
        if (b.price === null || b.price <= 0) {
          errors[`addon_price_${b.id}`] = true;
          if (!firstErr) firstErr = 'Add-on price not added';
        }
        if (!b.duration.trim()) {
          errors[`addon_duration_${b.id}`] = true;
          if (!firstErr) firstErr = 'Add-on duration not added';
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      firstError: firstErr,
      errorMap: errors,
    };
  }, [workingAddOns]);

  // Handlers
  const handleUpdateAddOn = (id: string, updates: Partial<AddOnItem>) => {
    setWorkingAddOns((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleAddBlock = () => {
    setWorkingAddOns((prev) => [...prev, createEmptyAddOn()]);
  };

  const handleUploadPress = (addOnId: string) => {
    triggerLightHaptic();
    setPhotoTargetAddOnId(addOnId);
  };

  const handleRemoveImage = (addOnId: string) => {
    setWorkingAddOns((prev) =>
      prev.map((item) => (item.id === addOnId ? { ...item, imageUri: null } : item))
    );
  };

  const handleImageUploaded = (uri: string, targetAddOnId: string) => {
    setWorkingAddOns((prev) =>
      prev.map((item) =>
        item.id === targetAddOnId ? { ...item, imageUri: uri } : item
      )
    );
  };

  const handleOpenCamera = async () => {
    const targetId = photoTargetAddOnId;
    setPhotoTargetAddOnId(null);
    if (!targetId) return;

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'] as any,
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageUploaded(result.assets[0].uri, targetId);
      }
    } catch (e) {
      console.warn('Error taking camera photo:', e);
    }
  };

  const handleChoosePhotos = async () => {
    const targetId = photoTargetAddOnId;
    setPhotoTargetAddOnId(null);
    if (!targetId) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Photo library permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        quality: 0.85,
        allowsMultipleSelection: false,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageUploaded(result.assets[0].uri, targetId);
      }
    } catch (e) {
      console.warn('Error choosing photos:', e);
    }
  };

  const handleDurationPress = (addOnId: string) => {
    setActiveDurationAddOnId(addOnId);
    setIsDurationSheetVisible(true);
  };

  const handleSave = () => {
    if (!isValid) {
      setHasAttemptedSave(true);
      return;
    }

    // Commit changes to draft
    commitWorkingCopy({ addOns: workingAddOns });
    // Return to Review
    safeRouter.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header: "Edit Add-ons" */}
        <EditHeader
          title="Edit Add-ons"
          onBack={() => safeRouter.back()}
          onHelp={() => safeRouter.push('/guide/general' as any)}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Intro Heading & Subtitle per E4 ── */}
          <View style={styles.introSection}>
            <Text style={styles.introHeading}>Add-ons</Text>
            <Text style={styles.introSubtitle}>
              Add-ons are optional services customers can include with their selected service, e.g. anti-dandruff treatment.
            </Text>
          </View>

          {/* ── Reused AddOnBlockList in Edit mode ── */}
          <AddOnBlockList
            addOns={workingAddOns}
            mode="edit"
            onUpdateAddOn={handleUpdateAddOn}
            onAddBlock={handleAddBlock}
            onUploadPress={handleUploadPress}
            onRemoveImage={handleRemoveImage}
            onDurationPress={handleDurationPress}
            errors={hasAttemptedSave ? errorMap : {}}
          />

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Sticky Save changes Footer */}
        <EditFooter
          isDirty={isDirty}
          onSave={handleSave}
          errorText={firstError}
          showErrorToast={hasAttemptedSave && !isValid}
          saveLabel="Save changes"
        />

        {/* Modal Sheets */}
        <ServiceDurationSheet
          visible={isDurationSheetVisible}
          selectedDuration={
            workingAddOns.find((item) => item.id === activeDurationAddOnId)?.duration || ''
          }
          onSelectDuration={(display) => {
            if (activeDurationAddOnId) {
              handleUpdateAddOn(activeDurationAddOnId, { duration: display });
            }
            setIsDurationSheetVisible(false);
            setActiveDurationAddOnId(null);
          }}
          onClose={() => {
            setIsDurationSheetVisible(false);
            setActiveDurationAddOnId(null);
          }}
        />

        <ProviderPhotoUploadSheet
          visible={photoTargetAddOnId !== null}
          title="Photo Upload"
          onOpenCamera={handleOpenCamera}
          onChoosePhotos={handleChoosePhotos}
          onSelectFile={handleChoosePhotos}
          onClose={() => setPhotoTargetAddOnId(null)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  introSection: {
    marginBottom: 24,
  },
  introHeading: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 8,
  },
  introSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default EditAddOnsScreen;
