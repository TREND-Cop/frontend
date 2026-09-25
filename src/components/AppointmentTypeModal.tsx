import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

export type AppointmentBookingType = 'In-Person' | 'Home Service';

interface AppointmentTypeModalProps {
  visible: boolean;
  selectedType?: AppointmentBookingType | null;
  basePrice?: number;
  inPersonPrice?: number;
  homeServicePrice?: number;
  homeServiceDiscountedPrice?: number;
  homeServiceDiscountPercent?: number;
  distanceText?: string;
  onSelectType: (type: AppointmentBookingType) => void;
  onClose: () => void;
}

// 1:1 Figma In-Person Walking Icon (viewBox="32 225 40 40")
const InPersonIcon = () => (
  <Svg width={40} height={40} viewBox="32 225 40 40" fill="none">
    <Circle cx="52" cy="245" r="20" fill="#000814" fillOpacity={0.96} />
    <Path
      d="M46 245.5L47.7381 242.893C47.9103 242.634 48.1404 242.42 48.4099 242.266L50.599 241.015C51.1619 240.693 51.8483 240.674 52.4282 240.964C53.0851 241.292 53.4658 241.986 53.7461 242.665C54.2069 243.781 55.3984 245 58 245"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M53.0002 242L51.7774 247.595M50.5002 241.5L49.7748 244.764C49.6071 245.519 49.8892 246.303 50.4993 246.777L54.0002 249.5L55.5002 254"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M49.5 249L49 250.5L46.5 253.5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M55 237.5C55 238.328 54.3284 239 53.5 239C52.6716 239 52 238.328 52 237.5C52 236.672 52.6716 236 53.5 236C54.3284 236 55 236.672 55 237.5Z"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 1:1 Figma Home Service Icon (viewBox="32 339 40 40")
const HomeServiceIcon = () => (
  <Svg width={40} height={40} viewBox="32 339 40 40" fill="none">
    <Circle cx="52" cy="359" r="20" fill="#000814" fillOpacity={0.96} />
    <Path
      d="M62 357.5L52.8825 349.822C52.6355 349.614 52.3229 349.5 52 349.5C51.6771 349.5 51.3645 349.614 51.1175 349.822L42 357.5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M60.5 352V362.5C60.5 365.328 60.5 366.743 59.6213 367.621C58.7426 368.5 57.3284 368.5 54.5 368.5H49.5C46.6716 368.5 45.2574 368.5 44.3787 367.621C43.5 366.743 43.5 365.328 43.5 362.5V356.5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M55 368.5V363.5C55 362.086 55 361.379 54.5607 360.939C54.1213 360.5 53.4142 360.5 52 360.5C50.5858 360.5 49.8787 360.5 49.4393 360.939C49 361.379 49 362.086 49 363.5V368.5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AppointmentTypeModal: React.FC<AppointmentTypeModalProps> = ({
  visible,
  selectedType,
  basePrice,
  inPersonPrice,
  homeServicePrice,
  homeServiceDiscountedPrice,
  homeServiceDiscountPercent = 10,
  distanceText = '5 km',
  onSelectType,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const finalInPersonPrice = inPersonPrice ?? (basePrice !== undefined && basePrice !== 2200 ? basePrice : 1500);
  const finalHomeServicePrice = homeServicePrice ?? (basePrice !== undefined && basePrice !== 1500 ? basePrice : 2200);
  const finalDiscountedPrice =
    homeServiceDiscountedPrice ?? (basePrice !== undefined && basePrice !== 2200
      ? Math.round(basePrice * (1 - homeServiceDiscountPercent / 100))
      : 2100);

  const formatCurrency = (val: number) => `₦${val.toLocaleString()}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          {/* Top Drag Handle (56x5 radius 2.5) */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Illustration Header */}
          <View style={styles.sheetHeaderRow}>
            <Image
              source={require('../../assets/images/custom/appointment_type_women.png')}
              style={styles.typeIllustrationImage}
              resizeMode="contain"
            />
            <View style={styles.sheetHeaderTextCol}>
              <Text style={styles.sheetTitle}>Appointment Type</Text>
              <Text style={styles.sheetSubtitle}>
                How you would like to receive your booked service.
              </Text>
            </View>
          </View>

          {/* Divider Line (border 1px solid rgba(235, 235, 245, 0.96)) */}
          <View style={styles.sheetDivider} />

          {/* Options Container (gap: 16px) */}
          <View style={styles.typeOptionsContainer}>
            {/* In-Person Option (358x88, radius 24) */}
            <TouchableOpacity
              style={[
                styles.typeOptionCard,
                selectedType === 'In-Person' && styles.typeOptionCardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                onSelectType('In-Person');
                onClose();
              }}
            >
              <View style={styles.typeIconBox}>
                <InPersonIcon />
              </View>

              <View style={styles.typeInfoCol}>
                <View style={styles.typeRowBetween}>
                  <Text style={styles.typeNameText}>In-Person</Text>
                  <Text style={styles.typePriceText}>{formatCurrency(finalInPersonPrice)}</Text>
                </View>
                <Text style={styles.typeDistanceText}>{distanceText}</Text>
              </View>
            </TouchableOpacity>

            {/* Home Service Option (358x88, radius 24) */}
            <TouchableOpacity
              style={[
                styles.typeOptionCard,
                selectedType === 'Home Service' && styles.typeOptionCardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                onSelectType('Home Service');
                onClose();
              }}
            >
              <View style={styles.typeIconBox}>
                <HomeServiceIcon />
              </View>

              <View style={styles.typeInfoCol}>
                <View style={styles.typeRowBetween}>
                  <Text style={styles.typeNameText}>Home Service</Text>
                  <Text style={styles.typePriceText}>{formatCurrency(finalHomeServicePrice)}</Text>
                </View>
                <Text style={styles.typeDistanceText}>{distanceText}</Text>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 56,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 0,
  },
  typeIllustrationImage: {
    width: 48,
    height: 48,
  },
  sheetHeaderTextCol: {
    flex: 1,
    gap: 4,
  },
  sheetTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  sheetSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
    marginVertical: 4,
  },
  typeOptionsContainer: {
    gap: 16,
    marginBottom: 8,
  },
  typeOptionCard: {
    width: '100%',
    minHeight: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  typeOptionCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  typeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeInfoCol: {
    flex: 1,
    gap: 8,
  },
  typeRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  typePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  typeDistanceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

