import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useServiceDraft } from '../../../context/ServiceDraftContext';
import { useStaff } from '../../../hooks/useStaff';
import { isSliceDirty } from '../../../utils/isDirty';
import { triggerLightHaptic } from '../../../utils/haptics';
import { EditHeader } from '../../../components/wizard/EditHeader';
import { EditFooter } from '../../../components/wizard/EditFooter';
import { StaffSelectorList } from '../../../components/wizard/StaffSelectorList';
import { NativeDockSpacer } from '../../../components/NativeDockSpacer';

/**
 * 1:1 Figma Edit Staff Screen (Frames E5 & E6)
 *
 * Implements:
 * - Preselects staff already present in the draft
 * - Search keeps selections while filtering
 * - Save changes stays grey (E5) until selection differs from draft (E6)
 * - Saving updates staffIds and sets providerIsOwner = false if any staff is selected
 * - If business has no staff, displays empty state without "I don't have staff" button
 * - Back button discards working copy and returns to Review
 */
export const EditStaffScreen: React.FC = () => {
  const router = useRouter();

  const { draft, commitStaffSelection } = useServiceDraft();
  const { staffList } = useStaff();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Working copy: selected staff IDs initialized from draft on mount
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(() => [
    ...draft.staffIds,
  ]);

  // Dirty check: differs from committed draft.staffIds
  const isDirty = useMemo(
    () => isSliceDirty(selectedStaffIds, draft.staffIds),
    [selectedStaffIds, draft.staffIds]
  );

  const handleToggleSelect = (staffId: string) => {
    setSelectedStaffIds((prev) => {
      const exists = prev.includes(staffId);
      if (exists) {
        return prev.filter((id) => id !== staffId);
      }
      return [...prev, staffId];
    });
  };

  const handleSave = () => {
    // Commit selection to shared draft context
    commitStaffSelection(selectedStaffIds);
    // Return to Review
    router.back();
  };

  const handleAddStaffEmptyState = () => {
    triggerLightHaptic();
    router.replace('/staffs' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header: "Edit Staff" */}
        <EditHeader
          title="Edit Staff"
          onBack={() => router.back()}
          onHelp={() => router.push('/guide/general' as any)}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Reused StaffSelectorList in Edit mode */}
          <StaffSelectorList
            staffList={staffList}
            selectedIds={selectedStaffIds}
            onToggleSelect={handleToggleSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            mode="edit"
            introText="The added staff will be seen by clients during the booking process. You can add more than one staff under a service."
            onAddStaff={handleAddStaffEmptyState}
          />

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Sticky Save changes Footer (only rendered if business has staff) */}
        {staffList.length > 0 && (
          <EditFooter
            isDirty={isDirty}
            onSave={handleSave}
            saveLabel="Save changes"
          />
        )}

        <NativeDockSpacer />
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
});

export default EditStaffScreen;
