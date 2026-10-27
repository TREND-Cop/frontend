import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useStaffOwnServices } from '../../hooks/useStaffOwnServices';
import { triggerLightHaptic } from '../../utils/haptics';
import { StaffAppointmentType } from '../../types/staffAppointments';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface StaffFilterState {
  services: string[];
  appointmentTypes: StaffAppointmentType[];
}

export interface StaffFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  appliedFilters: StaffFilterState;
  onApplyFilters: (filters: StaffFilterState) => void;
  calculateMatchCount: (filters: StaffFilterState) => number;
}

const APPOINTMENT_TYPES: StaffAppointmentType[] = ['In-Person', 'Home Service'];

export const StaffFilterSheet: React.FC<StaffFilterSheetProps> = ({
  visible,
  onClose,
  appliedFilters,
  onApplyFilters,
  calculateMatchCount,
}) => {
  const insets = useSafeAreaInsets();
  const staffServices = useStaffOwnServices();

  // Local draft state initialized from applied filters
  const [selectedServices, setSelectedServices] = useState<string[]>(appliedFilters.services);
  const [selectedTypes, setSelectedTypes] = useState<StaffAppointmentType[]>(appliedFilters.appointmentTypes);

  // Sync draft state when sheet opens
  useEffect(() => {
    if (visible) {
      setSelectedServices(appliedFilters.services);
      setSelectedTypes(appliedFilters.appointmentTypes);
    }
  }, [visible, appliedFilters]);

  // Compute live matching count based on draft filter selection
  const currentMatchCount = useMemo(() => {
    return calculateMatchCount({
      services: selectedServices,
      appointmentTypes: selectedTypes,
    });
  }, [selectedServices, selectedTypes, calculateMatchCount]);

  const toggleService = (service: string) => {
    triggerLightHaptic();
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const toggleType = (type: StaffAppointmentType) => {
    triggerLightHaptic();
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleClearAll = () => {
    triggerLightHaptic();
    setSelectedServices([]);
    setSelectedTypes([]);
  };

  const handleApply = () => {
    triggerLightHaptic();
    onApplyFilters({
      services: selectedServices,
      appointmentTypes: selectedTypes,
    });
    onClose();
  };

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

        <View
          style={[
            styles.sheetContainer,
            {
              paddingBottom:
                Platform.OS === 'android'
                  ? Math.max(insets.bottom, 48)
                  : Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* ── Header: Title "Filter" and Close "X" Button ── */}
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Filter</Text>
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.7}
              onPress={() => {
                triggerLightHaptic();
                onClose();
              }}
              accessibilityLabel="Close filter sheet"
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#141B34"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Section 1: Services (Shown only if staff has assigned services) ── */}
            {staffServices && staffServices.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>Services</Text>
                <View style={styles.chipsWrap}>
                  {staffServices.map((service) => {
                    const isSelected = selectedServices.includes(service);
                    return (
                      <TouchableOpacity
                        key={service}
                        style={[
                          styles.chipButton,
                          isSelected && styles.chipButtonSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleService(service)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {service}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Section 2: Appointment Type ── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>Appointment Type</Text>
              <View style={styles.chipsRow}>
                {APPOINTMENT_TYPES.map((type) => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChipButton,
                        isSelected && styles.chipButtonSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => toggleType(type)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* ── Bottom Buttons: "Clear all" and "Show N related" ── */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.clearAllButton}
              activeOpacity={0.75}
              onPress={handleClearAll}
            >
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.showRelatedButton}
              activeOpacity={0.85}
              onPress={handleApply}
            >
              <Text style={styles.showRelatedText}>
                {`Show ${currentMatchCount} related`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    height: 62,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
    gap: 32,
  },
  sectionBlock: {
    gap: 16,
  },
  sectionHeader: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  chipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipButtonSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  chipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  clearAllButton: {
    width: 115,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  showRelatedButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  showRelatedText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
});
