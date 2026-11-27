import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../../utils/safeNavigation';

import { useServiceDraft } from '../../../context/ServiceDraftContext';
import { useStaff } from '../../../hooks/useStaff';
import { isSliceDirty } from '../../../utils/isDirty';
import { triggerLightHaptic } from '../../../utils/haptics';
import { EditHeader } from '../../../components/wizard/EditHeader';
import { EditFooter } from '../../../components/wizard/EditFooter';
import { StaffSelectorList } from '../../../components/wizard/StaffSelectorList';

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
  const safeRouter = useSafeRouter();

  const { draft, commitStaffSelection } = useServiceDraft();
  const { staffList } = useStaff();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Valid staff IDs in the store
  const validStaffIdSet = useMemo(() => new Set(staffList.map((s) => s.id)), [staffList]);

  // Working copy: selected staff IDs initialized from draft on mount, ignoring any removed staff
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(() =>
    draft.staffIds.filter((id) => staffList.some((s) => s.id === id))
  );

  // Baseline draft IDs filtered against the store
  const validDraftStaffIds = useMemo(
    () => draft.staffIds.filter((id) => validStaffIdSet.has(id)),
    [draft.staffIds, validStaffIdSet]
  );

  // Dirty check: differs from committed valid draft staff IDs
  const isDirty = useMemo(
    () => isSliceDirty(selectedStaffIds, validDraftStaffIds),
    [selectedStaffIds, validDraftStaffIds]
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
    safeRouter.back();
  };

  const handleAddStaffEmptyState = () => {
    triggerLightHaptic();
    safeRouter.replace('/staffs' as any);
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
          onBack={() => safeRouter.back()}
          onHelp={() => safeRouter.push('/guide/general' as any)}
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
