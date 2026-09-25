import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeImage } from '../../components/ui/SafeImage';
import * as ImagePicker from 'expo-image-picker';

const CONFETTI_IMAGE = require('../../../assets/images/custom/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/custom/booking_success_characters.png');

export const ContactSupportScreen: React.FC = () => {
  const router = useRouter();

  // Screen states
  const [isSuccess, setIsSuccess] = useState(false);
  const [complainTitle, setComplainTitle] = useState('');
  const [complainBox, setComplainBox] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);

  // Photos state (up to 4 photos)
  const [photos, setPhotos] = useState<string[]>([]);
  const [complainBoxY, setComplainBoxY] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          if (complainBoxY > 0) {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, complainBoxY - 40),
              animated: true,
            });
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
  }, [complainBoxY]);

  const handleGoBack = () => {
    if (isSuccess) {
      setIsSuccess(false);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleTitleChange = (text: string) => {
    setComplainTitle(text);
    if (titleError) setTitleError(null);
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 4 photos.');
      return;
    }

    const pickFromLibrary = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission required',
            'Please grant photo library access to upload photos.'
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
          setPhotos((prev) => [...prev, result.assets[0].uri]);
        }
      } catch (err) {
        console.warn('Error launching image library:', err);
      }
    };

    const takeWithCamera = async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission required',
            'Please grant camera access to take photos.'
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
          setPhotos((prev) => [...prev, result.assets[0].uri]);
        }
      } catch (err) {
        console.warn('Error launching camera:', err);
      }
    };

    if (Platform.OS === 'web') {
      await pickFromLibrary();
      return;
    }

    Alert.alert(
      'Upload Photo',
      'Select a photo from your gallery or take a new one',
      [
        { text: 'Take Photo', onPress: takeWithCamera },
        { text: 'Choose from Gallery', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!complainTitle.trim()) {
      setTitleError('Complain tittle is missing, please add tittle.');
      return;
    }

    setTitleError(null);
    setIsSuccess(true);
  };

  const isFormEmpty = !complainTitle.trim() && !complainBox.trim() && photos.length === 0;

  // ── Success Animations ──
  const confettiScale = useRef(new Animated.Value(0.4)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;

  const charactersScale = useRef(new Animated.Value(0.5)).current;
  const charactersTranslateY = useRef(new Animated.Value(30)).current;
  const charactersOpacity = useRef(new Animated.Value(0)).current;
  const charactersFloat = useRef(new Animated.Value(0)).current;

  const textTranslateY = useRef(new Animated.Value(25)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const adsTranslateY = useRef(new Animated.Value(35)).current;
  const adsOpacity = useRef(new Animated.Value(0)).current;

  const buttonTranslateY = useRef(new Animated.Value(45)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Floating particles animations (8 animated particles)
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  React.useEffect(() => {
    if (!isSuccess) return;

    // 1. Reset all animated values
    confettiScale.setValue(0.4);
    confettiOpacity.setValue(0);
    charactersScale.setValue(0.5);
    charactersTranslateY.setValue(30);
    charactersOpacity.setValue(0);
    textTranslateY.setValue(25);
    textOpacity.setValue(0);
    adsTranslateY.setValue(35);
    adsOpacity.setValue(0);
    buttonTranslateY.setValue(45);
    buttonOpacity.setValue(0);

    // 2. Main Entrance Staggered Sequence
    Animated.parallel([
      // Confetti burst
      Animated.parallel([
        Animated.spring(confettiScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(confettiOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // Characters celebration bounce
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.spring(charactersScale, {
            toValue: 1,
            friction: 5,
            tension: 45,
            useNativeDriver: true,
          }),
          Animated.spring(charactersTranslateY, {
            toValue: 0,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(charactersOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Congratulations Text Slide Up
      Animated.sequence([
        Animated.delay(250),
        Animated.parallel([
          Animated.spring(textTranslateY, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Ads Section Slide Up
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.spring(adsTranslateY, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(adsOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Back to profile Button Slide Up
      Animated.sequence([
        Animated.delay(550),
        Animated.parallel([
          Animated.spring(buttonTranslateY, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // 3. Continuous Gentle Floating Loop for characters
      Animated.loop(
        Animated.sequence([
          Animated.timing(charactersFloat, {
            toValue: -5,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(charactersFloat, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Continuous subtle sway for confetti
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiSway, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(confettiSway, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Particle Burst Animations
    particleAnims.forEach((anim, i) => {
      const angle = (i / 8) * 2 * Math.PI;
      const distance = 60 + (i % 3) * 25;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance - 20;

      Animated.sequence([
        Animated.delay(120 + i * 30),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(anim.scale, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: targetX,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: targetY,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(anim.opacity, {
          toValue: 0.7,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [isSuccess]);

  const confettiRotation = confettiSway.interpolate({
    inputRange: [0, 1],
    outputRange: ['-1.5deg', '1.5deg'],
  });

  const confettiDriftY = confettiSway.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  const particleColors = [
    '#F59E0B',
    '#EC4899',
    '#3B82F6',
    '#10B981',
    '#8B5CF6',
    '#EF4444',
    '#06B6D4',
    '#F97316',
  ];

  // ── Render Successful Screen (100% Figma CSS 1:1 + Smooth Native Animations) ──
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.successContainer} edges={['top', 'bottom']}>
        {/* Layer 1: Confetti Graphic Background with Sway Animation */}
        <Animated.View
          style={[
            styles.confettiContainer,
            {
              opacity: confettiOpacity,
              transform: [
                { scale: confettiScale },
                { rotate: confettiRotation },
                { translateY: confettiDriftY },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <SafeImage
            source={CONFETTI_IMAGE}
            style={styles.confettiImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Dynamic Floating Particles Overlay */}
        <View style={styles.particlesContainer} pointerEvents="none">
          {particleAnims.map((anim, idx) => {
            const rot = anim.rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${(idx % 2 === 0 ? 1 : -1) * 360}deg`],
            });
            return (
              <Animated.View
                key={idx}
                style={[
                  styles.particleShape,
                  {
                    backgroundColor: particleColors[idx % particleColors.length],
                    borderRadius: idx % 2 === 0 ? 3 : 6,
                    width: idx % 3 === 0 ? 10 : 7,
                    height: idx % 3 === 0 ? 6 : 7,
                    opacity: anim.opacity,
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: anim.translateY },
                      { scale: anim.scale },
                      { rotate: rot },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Back Button (Figma: width 48px, height 48px, borderRadius 8px, left 16px, top 68px) */}
        <View style={styles.successHeaderRow}>
          <TouchableOpacity
            style={styles.successBackButton}
            onPress={() => router.replace('/profile' as any)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#141B34" />
          </TouchableOpacity>
        </View>

        {/* Layer 2: Dancing Characters Illustration with Spring Bounce & Floating */}
        <Animated.View
          style={[
            styles.charactersContainer,
            {
              opacity: charactersOpacity,
              transform: [
                { scale: charactersScale },
                { translateY: Animated.add(charactersTranslateY, charactersFloat) },
              ],
            },
          ]}
        >
          <SafeImage
            source={CHARACTERS_IMAGE}
            style={styles.charactersImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Congratulations Text Group (Figma: width 292px, height 68px, top 355px, gap 16px) */}
        <Animated.View
          style={[
            styles.congratulationsTextGroup,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.congratulationsTitle}>Congratulations</Text>
          <Text style={styles.congratulationsSubtitle}>Complain successfully sent</Text>
        </Animated.View>

        {/* Ads Section (Figma: width 358px, height 124px, top 560px, gap 16px) */}
        <Animated.View
          style={[
            styles.adsSection,
            {
              opacity: adsOpacity,
              transform: [{ translateY: adsTranslateY }],
            },
          ]}
        >
          <Text style={styles.adsHeaderTag}>
            Experience great offers as a subscriber
          </Text>

          {/* Ads Container Box (Figma: width 358px, height 88px, borderRadius 24px) */}
          <View style={styles.adsBox}>
            <Text style={styles.adsBoxText}>
              Save 10% on every booking for the next 1 Month
            </Text>
          </View>
        </Animated.View>

        {/* Bottom Back to Profile Button (Figma Spec) */}
        <Animated.View
          style={[
            styles.successBottomContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backToProfileButton}
            onPress={() => router.replace('/profile' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.backToProfileButtonText}>Back to profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Render Input & Error Form ──
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Page Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Contact Support</Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* ── Form Content ── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 360 : 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Field 1: Complain Title (Figma: height 88px, gap 16px) */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Complain Tittle</Text>
            <View
              style={[
                styles.titleInputBox,
                titleError ? styles.inputBoxError : null,
              ]}
            >
              <TextInput
                style={styles.titleTextInput}
                value={complainTitle}
                onChangeText={handleTitleChange}
                placeholder="e.g. Cancelled appointment"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
              />
            </View>
            {titleError && (
              <Text style={styles.errorText}>{titleError}</Text>
            )}
          </View>

          {/* Field 2: Complain Box (Figma: height 181px, gap 16px) */}
          <View
            style={styles.formGroup}
            onLayout={(e) => setComplainBoxY(e.nativeEvent.layout.y)}
          >
            <Text style={styles.fieldLabel}>Complain Box</Text>
            <View style={styles.complainTextareaBox}>
              <TextInput
                style={styles.textareaInput}
                value={complainBox}
                onChangeText={setComplainBox}
                placeholder="Write complain here"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                multiline
                textAlignVertical="top"
                onFocus={() => {
                  setTimeout(() => {
                    if (complainBoxY > 0) {
                      scrollViewRef.current?.scrollTo({
                        y: Math.max(0, complainBoxY - 20),
                        animated: true,
                      });
                    } else {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }
                  }, 200);
                }}
              />
            </View>
          </View>

          {/* Field 3: Photos Row (Figma: width 264px, gap 24px) */}
          <View style={styles.photosRow}>
            {/* Render uploaded photos */}
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoThumbContainer}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.photoDeleteBadge}
                  activeOpacity={0.8}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <X size={12} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Empty Camera Slot Frames (up to 4 total) */}
            {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, index) => (
              <TouchableOpacity
                key={`empty-${index}`}
                style={styles.cameraSlotButton}
                activeOpacity={0.7}
                onPress={handleAddPhoto}
              >
                <Camera size={24} color="#141B34" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ── Bottom Submit Button (Figma: 358x48px, borderRadius 24px) ── */}
        {!isKeyboardVisible && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isFormEmpty ? styles.submitButtonActive : styles.submitButtonDisabled,
              ]}
              activeOpacity={!isFormEmpty ? 0.8 : 1}
              disabled={isFormEmpty}
              onPress={handleSubmit}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  !isFormEmpty ? styles.submitButtonTextActive : styles.submitButtonTextDisabled,
                ]}
              >
                Submit
              </Text>
            </TouchableOpacity>
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
  keyboardContainer: {
    flex: 1,
  },

  // ── Header (Figma: 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Form Content (Figma: padding 16px, gap 32px) ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 28,
  },

  // ── Field Group (Figma: gap 16px) ──
  formGroup: {
    gap: 16,
  },
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.6,
    color: '#000000',
  },

  // ── Title Input (Figma: 358x48px, background rgba(247, 247, 247, 0.96), borderRadius 24px) ──
  titleInputBox: {
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputBoxError: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  titleTextInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(204, 41, 41, 0.9)',
    marginTop: -8,
    paddingHorizontal: 4,
  },

  // ── Complain Textarea (Figma: 360x141px, background rgba(247, 247, 247, 0.96), borderRadius 24px) ──
  complainTextareaBox: {
    height: 141,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
  },
  textareaInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },

  // ── Photos Row (Figma: width 264px, gap 24px) ──
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  photoThumbContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    position: 'relative',
  },
  photoThumb: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  photoDeleteBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(204, 41, 41, 0.9)',
    right: -7,
    top: -7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraSlotButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Bottom Action Button (Figma: 358x48px, borderRadius 24px) ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  submitButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
  },
  submitButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  submitButtonTextActive: {
    color: '#FFFFFF',
  },

  // ── Congratulatory Success State (Figma: 100% 1:1) ──
  successContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    width: 466,
    height: 308,
    top: -54,
    left: '50%',
    marginLeft: -247, // calc(50% - 466px/2 - 14px)
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiImage: {
    width: '100%',
    height: '100%',
  },
  successHeaderRow: {
    position: 'absolute',
    left: 16,
    top: 68,
    zIndex: 10,
  },
  successBackButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charactersContainer: {
    position: 'absolute',
    width: 213,
    height: 153,
    top: 130,
    left: '50%',
    marginLeft: -106, // calc(50% - 213px/2 + 0.5px)
    alignItems: 'center',
    justifyContent: 'center',
  },
  charactersImage: {
    width: '100%',
    height: '100%',
  },
  congratulationsTextGroup: {
    position: 'absolute',
    width: 292,
    height: 68,
    top: 355,
    left: '50%',
    marginLeft: -146,
    gap: 16,
    alignItems: 'center',
  },
  congratulationsTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  congratulationsSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  adsSection: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 124,
    top: 560,
    gap: 16,
    alignItems: 'center',
  },
  adsHeaderTag: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(248, 155, 24, 0.96)',
    textAlign: 'center',
  },
  adsBox: {
    width: '100%',
    height: 88,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  adsBoxText: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: '#000000',
    textAlign: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    width: 260,
    height: 200,
    top: 100,
    left: '50%',
    marginLeft: -130,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  particleShape: {
    position: 'absolute',
  },
  successBottomContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 32,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  backToProfileButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  backToProfileButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});
