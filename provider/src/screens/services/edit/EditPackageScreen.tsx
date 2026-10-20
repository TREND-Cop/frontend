import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import {
  useServiceDraft,
  ServicePackageItem,
} from '../../../context/ServiceDraftContext';
import { isSliceDirty } from '../../../utils/isDirty';
import { triggerLightHaptic } from '../../../utils/haptics';
import { EditHeader } from '../../../components/wizard/EditHeader';
import { EditFooter } from '../../../components/wizard/EditFooter';
import { PackageBlockList } from '../../../components/wizard/PackageBlockList';
import { ServiceDurationSheet } from '../../../components/wizard/ServiceDurationSheet';
import { ProviderPhotoUploadSheet } from '../../../components/ProviderPhotoUploadSheet';
import { NativeDockSpacer } from '../../../components/NativeDockSpacer';

/**
 * 1:1 Figma Edit Package Screen (Frames E2 & E3)
 *
 * Implements:
 * - Working copy of the whole package list from draft
 * - Package images with 6 slots:
 *   - Filled slots have red ✕ badge
 *   - Removing image leaves empty dashed slot with CameraIcon (E3) and marks dirty
 * - Package Contents ⓘ textarea
 * - Package Price & Duration
 * - "Add Package" row button below the list
 * - Sticky Save changes footer:
 *   - Unchanged (E2) -> grey disabled
 *   - Changed (E3) -> dark navy, commits to draft on press
 * - Back button -> discards working copy, returns to Review
 */
export const EditPackageScreen: React.FC = () => {
  const router = useRouter();

  const { draft, commitWorkingCopy } = useServiceDraft();

  // Committed slice of draft packages
  const committedPackages: ServicePackageItem[] = useMemo(() => {
    if (draft.packages.length > 0) {
      return draft.packages;
    }
    return [
      {
        id: `pkg_initial_${Date.now()}`,
        images: [],
        contents: '',
        price: null,
        priceRaw: '',
        duration: '',
      },
    ];
  }, [draft.packages]);

  // Working copy state
  const [workingPackages, setWorkingPackages] = useState<ServicePackageItem[]>(() =>
    JSON.parse(JSON.stringify(committedPackages))
  );

  // Dirty check
  const isDirty = useMemo(
    () => isSliceDirty(workingPackages, committedPackages),
    [workingPackages, committedPackages]
  );

  // Validation
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  // Sheets state
  const [isDurationSheetVisible, setIsDurationSheetVisible] = useState(false);
  const [activeDurationPkgId, setActiveDurationPkgId] = useState<string | null>(null);
  const [photoTarget, setPhotoTarget] = useState<{
    packageId: string;
    slotIndex: number;
  } | null>(null);

  // Check validity
  const isValid = useMemo(() => {
    for (const pkg of workingPackages) {
      if (!pkg.contents.trim() || pkg.price === null || pkg.price <= 0 || !pkg.duration.trim()) {
        return false;
      }
    }
    return true;
  }, [workingPackages]);

  const firstError = useMemo(() => {
    for (const pkg of workingPackages) {
      if (!pkg.contents.trim()) return 'Package contents not added';
      if (pkg.price === null || pkg.price <= 0) return 'Package price not added';
      if (!pkg.duration.trim()) return 'Package duration not added';
    }
    return null;
  }, [workingPackages]);

  // Handlers
  const handleAddPackage = () => {
    setWorkingPackages((prev) => [
      ...prev,
      {
        id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        images: [],
        contents: '',
        price: null,
        priceRaw: '',
        duration: '',
      },
    ]);
  };

  const handleUpdatePackage = (pkgId: string, updates: Partial<ServicePackageItem>) => {
    setWorkingPackages((prev) =>
      prev.map((pkg) => (pkg.id === pkgId ? { ...pkg, ...updates } : pkg))
    );
  };

  const handleSlotPress = (packageId: string, slotIndex: number) => {
    triggerLightHaptic();
    setPhotoTarget({ packageId, slotIndex });
  };

  const handleRemoveImage = (packageId: string, slotIndex: number) => {
    setWorkingPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === packageId) {
          const nextImages = pkg.images.filter((_, idx) => idx !== slotIndex);
          return { ...pkg, images: nextImages };
        }
        return pkg;
      })
    );
  };

  const handleImageUploaded = (uri: string, target: { packageId: string; slotIndex: number }) => {
    setWorkingPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === target.packageId) {
          const nextImages = [...pkg.images];
          if (target.slotIndex < nextImages.length) {
            nextImages[target.slotIndex] = uri;
          } else if (nextImages.length < 6) {
            nextImages.push(uri);
          }
          return { ...pkg, images: nextImages };
        }
        return pkg;
      })
    );
  };

  const handleOpenCamera = async () => {
    const target = photoTarget;
    setPhotoTarget(null);
    if (!target) return;

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'] as any,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageUploaded(result.assets[0].uri, target);
      }
    } catch (e) {
      console.warn('Error taking camera photo:', e);
    }
  };

  const handleChoosePhotos = async () => {
    const target = photoTarget;
    setPhotoTarget(null);
    if (!target) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Photo library permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageUploaded(result.assets[0].uri, target);
      }
    } catch (e) {
      console.warn('Error choosing photos:', e);
    }
  };

  const handleSave = () => {
    if (!isValid) {
      setHasAttemptedSave(true);
      return;
    }

    // Commit changes to draft
    commitWorkingCopy({ packages: workingPackages });
    // Return to Review
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header: "Edit Package" */}
        <EditHeader
          title="Edit Package"
          onBack={() => router.back()}
          onHelp={() => router.push('/guide/general' as any)}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Reused PackageBlockList in Edit mode */}
          <PackageBlockList
            packages={workingPackages}
            mode="edit"
            showSectionHeader={false}
            showSubtitle={false}
            showRemoveBadge={true}
            onAddPackage={handleAddPackage}
            onUpdatePackage={handleUpdatePackage}
            onSlotPress={handleSlotPress}
            onRemoveImage={handleRemoveImage}
            onOpenGuide={() => router.push('/guide/general' as any)}
            onDurationPress={(pkgId) => {
              setActiveDurationPkgId(pkgId);
              setIsDurationSheetVisible(true);
            }}
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

        <NativeDockSpacer />

        {/* Modal Sheets */}
        <ServiceDurationSheet
          visible={isDurationSheetVisible}
          selectedDuration={
            workingPackages.find((p) => p.id === activeDurationPkgId)?.duration || ''
          }
          onSelectDuration={(display) => {
            if (activeDurationPkgId) {
              handleUpdatePackage(activeDurationPkgId, { duration: display });
            }
            setIsDurationSheetVisible(false);
            setActiveDurationPkgId(null);
          }}
          onClose={() => {
            setIsDurationSheetVisible(false);
            setActiveDurationPkgId(null);
          }}
        />

        <ProviderPhotoUploadSheet
          visible={photoTarget !== null}
          title="Photo Upload"
          onOpenCamera={handleOpenCamera}
          onChoosePhotos={handleChoosePhotos}
          onSelectFile={handleChoosePhotos}
          onClose={() => setPhotoTarget(null)}
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
    paddingTop: 24,
    paddingBottom: 24,
  },
});

export default EditPackageScreen;
