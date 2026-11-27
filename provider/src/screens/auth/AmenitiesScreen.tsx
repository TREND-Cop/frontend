import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

// Typography matching Golden Rules & Provider Platform Typography Mandate
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icon Definitions matching Figma SVGs ──

function ArrowLeftIcon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChargingStationIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 2v3M15 2v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M6 5h12a1 1 0 011 1v6a6 6 0 01-6 6 6 6 0 01-6-6V6a1 1 0 011-1z" stroke={color} strokeWidth="1.5" />
      <Path d="M12 18v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M10.5 9h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function WifiIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2.5 8C5.5 5 18.5 5 21.5 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M6 12C8.5 9.5 15.5 9.5 18 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M9.5 16C11 14.5 13 14.5 14.5 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 20h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CctvCameraIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 19h5M4 14v5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 14l3.5-3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 6l13-3 2 7-13 3-2-7z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 4l1.5 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M10 13l-1.5 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function PoliceCapIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 17c3 2 15 2 18 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 15c-1-6 2-10 8-10s9 4 8 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 15h16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 9l1.5 2.5h-3L12 9z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </Svg>
  );
}

function TvIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 3l3 3 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="2" y="6" width="20" height="15" rx="3" stroke={color} strokeWidth="1.5" />
      <Path d="M17 11v5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function MusicPlayerIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="2" width="16" height="20" rx="3" stroke={color} strokeWidth="1.5" />
      <Rect x="7" y="4.5" width="10" height="6.5" rx="1" stroke={color} strokeWidth="1.2" />
      <Circle cx="12" cy="16" r="3.5" stroke={color} strokeWidth="1.3" />
      <Circle cx="12" cy="16" r="1.2" fill={color} />
    </Svg>
  );
}

function MagazinesIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M7 7h5M7 10h10M7 13h10M7 16h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function FanIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="1.5" />
      <Path d="M12 9.5C12 5 15 3 17 4c1 1 0 4-4 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.5 13C5 14 3 17 4 19c1 1 4 0 5.5-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13 14c2 3.5 4 5.5 6 4.5s0-4-3.5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function AirConditionIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 8h12a2.5 2.5 0 10-2.5-2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M3 12h15a2.5 2.5 0 10-2.5-2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M5 16h8a2.5 2.5 0 10-2.5-2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function WaitingBenchIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M3 14h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M5 10v9M19 10v9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M4 7h16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ParkingIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-6 9 6v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 10h3.5a2 2 0 010 4H9V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RestroomIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3h10v6H7V3z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 9v4a5 5 0 0010 0V9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 17v4h4v-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 5h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function SaunaIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="15" width="18" height="6" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M7 12c-1-2 1-3 0-5s-1-2 0-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 12c-1-2 1-3 0-5s-1-2 0-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M17 12c-1-2 1-3 0-5s-1-2 0-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function PoolIcon({ color = '#141B34', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 18c2.5-1 4.5-1 7 0s4.5 1 7 0 4.5-1 6 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M2 21c2.5-1 4.5-1 7 0s4.5 1 7 0 4.5-1 6 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M8 3v11M13 3v11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M8 6h5M8 9h5M8 12h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

interface AmenityDef {
  id: string;
  label: string;
  renderIcon: (color: string) => React.ReactNode;
}

interface AmenityCategory {
  title: string;
  items: AmenityDef[];
}

const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    title: 'Connection',
    items: [
      {
        id: 'charging_station',
        label: 'Charging station',
        renderIcon: (color) => <ChargingStationIcon color={color} size={24} />,
      },
      {
        id: 'free_wifi',
        label: 'Free Wi-Fi',
        renderIcon: (color) => <WifiIcon color={color} size={24} />,
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        id: 'cctv_surveillance',
        label: 'CCTV surveillance',
        renderIcon: (color) => <CctvCameraIcon color={color} size={24} />,
      },
      {
        id: 'security_personnel',
        label: 'Security personnel',
        renderIcon: (color) => <PoliceCapIcon color={color} size={24} />,
      },
    ],
  },
  {
    title: 'Entertainment',
    items: [
      {
        id: 'television',
        label: 'Television',
        renderIcon: (color) => <TvIcon color={color} size={24} />,
      },
      {
        id: 'sound_system',
        label: 'Sound system',
        renderIcon: (color) => <MusicPlayerIcon color={color} size={24} />,
      },
      {
        id: 'magazines',
        label: 'Magazines',
        renderIcon: (color) => <MagazinesIcon color={color} size={24} />,
      },
    ],
  },
  {
    title: 'Comfort',
    items: [
      {
        id: 'sealing_fan',
        label: 'Sealing fan',
        renderIcon: (color) => <FanIcon color={color} size={24} />,
      },
      {
        id: 'air_condition',
        label: 'Air condition',
        renderIcon: (color) => <AirConditionIcon color={color} size={24} />,
      },
      {
        id: 'waiting_bench',
        label: 'Waiting bench',
        renderIcon: (color) => <WaitingBenchIcon color={color} size={24} />,
      },
    ],
  },
  {
    title: 'Facility',
    items: [
      {
        id: 'parking_lot',
        label: 'Parking lot',
        renderIcon: (color) => <ParkingIcon color={color} size={24} />,
      },
      {
        id: 'restroom',
        label: 'Restroom',
        renderIcon: (color) => <RestroomIcon color={color} size={24} />,
      },
      {
        id: 'sauna',
        label: 'Sauna',
        renderIcon: (color) => <SaunaIcon color={color} size={24} />,
      },
      {
        id: 'pool',
        label: 'Pool',
        renderIcon: (color) => <PoolIcon color={color} size={24} />,
      },
    ],
  },
];

export const AmenitiesScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { salonDetails, setSalonDetails } = useProviderOnboarding();

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return salonDetails.amenities
      ? salonDetails.amenities.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  });
  const [customAmenity, setCustomAmenity] = useState('');

  const toggleAmenity = (label: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(label)) {
        return prev.filter((item) => item !== label);
      } else {
        return [...prev, label];
      }
    });
  };

  const isSelected = (label: string) => selectedIds.includes(label);

  const isConfirmActive = selectedIds.length > 0 || customAmenity.trim().length > 0;

  const handleConfirm = () => {
    if (!isConfirmActive) return;
    const all = [...selectedIds];
    if (customAmenity.trim() && !all.includes(customAmenity.trim())) {
      all.push(customAmenity.trim());
    }
    const val = all.join(', ');
    setSalonDetails({ amenities: val });
    safeRouter.back();
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* Top Safe Area Spacing */}
      <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

      {/* ── Header (56px, borderBottom 1px #ebebf5) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => safeRouter.back()}
        >
          <ArrowLeftIcon size={24} color="#000814" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Amenities</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {AMENITY_CATEGORIES.map((category) => (
            <View key={category.title} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.title}</Text>

              <View style={styles.pillsRow}>
                {category.items.map((item) => {
                  const active = isSelected(item.label);
                  const iconColor = active ? '#FFFFFF' : '#141B34';

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      style={[
                        styles.amenityButton,
                        active && styles.amenityButtonActive,
                      ]}
                      onPress={() => toggleAmenity(item.label)}
                    >
                      <Text
                        style={[
                          styles.amenityText,
                          active && styles.amenityTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.renderIcon(iconColor)}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* ── Custom Amenity Input (57px, borderBottom 1px #ebebf5) ── */}
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Enter an amenities that is not listed"
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={customAmenity}
              onChangeText={setCustomAmenity}
              returnKeyType="done"
            />
          </View>
        </ScrollView>

        {/* ── Action Button (height: 80px, padding: 16px) ── */}
        <View
          style={[
            styles.actionButtonContainer,
            {
              paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={isConfirmActive ? 0.85 : 1}
            disabled={!isConfirmActive}
            style={[
              styles.actionButton,
              isConfirmActive ? styles.actionButtonActive : styles.actionButtonDisabled,
            ]}
            onPress={handleConfirm}
          >
            <Text
              style={[
                styles.buttonText,
                isConfirmActive ? styles.buttonTextActive : styles.buttonTextDisabled,
              ]}
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default AmenitiesScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  header: {
    width: '100%',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
  },
  headerRightSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 40,
  },
  categorySection: {
    width: '100%',
    gap: 24,
  },
  categoryTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    rowGap: 16,
  },
  amenityButton: {
    height: 48,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  amenityButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  amenityText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  amenityTextActive: {
    color: '#FFFFFF',
  },
  customInputRow: {
    width: '100%',
    height: 57,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
  },
  customInput: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    padding: 0,
  },
  actionButtonContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.5)',
  },
  actionButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    ...Platform.select({
      ios: {
        shadowColor: '#858B94',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  buttonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
});
