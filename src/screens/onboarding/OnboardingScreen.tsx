import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { theme } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    headline: '[Slide 1 headline]',
    description: '[Slide 1 description goes here. It should be short and sweet.]',
  },
  {
    id: '2',
    headline: '[Slide 2 headline]',
    description: '[Slide 2 description goes here. It should be short and sweet.]',
  },
  {
    id: '3',
    headline: '[Slide 3 headline]',
    description: '[Slide 3 description goes here. It should be short and sweet.]',
  },
  {
    id: '4',
    headline: '[Slide 4 headline]',
    description: '[Slide 4 description goes here. It should be short and sweet.]',
  },
];

export const OnboardingScreen = ({ navigation }: { navigation?: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    // Calculate the index based on the scroll position
    const index = Math.round(scrollPosition / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const skipToSignUp = () => {
    // Navigate to SignUpScreen
    if (navigation) {
      // navigation.navigate('SignUpScreen');
    }
    console.log('Navigate to SignUpScreen');
  };

  const goToNextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>[Image Placeholder]</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.headline}>{item.headline}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Skip button */}
      <View style={styles.header}>
        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={skipToSignUp} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipButtonPlaceholder} />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Footer with Pagination and Navigation Buttons */}
      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {currentIndex === SLIDES.length - 1 ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={skipToSignUp}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={goToNextSlide}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 50, // Safe area inset approximation for status bar
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    ...theme.typography.button,
    color: theme.colors.primarySupportText,
  },
  skipButtonPlaceholder: {
    height: 44, // Match touchable height approx
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imagePlaceholder: {
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: theme.colors.inactive,
    borderRadius: theme.radius.large,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  placeholderText: {
    ...theme.typography.bodyMed,
    color: theme.colors.primarySupportText,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  headline: {
    ...theme.typography.h1,
    color: '#000000', // Hardcoding black for headline as it wasn't strictly in theme, or we could use primarySupportText
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.bodyRegular,
    color: theme.colors.primarySupportText,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 50, // Safe area inset approximation for bottom
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24, // Pill shape for active state
  },
  inactiveDot: {
    backgroundColor: theme.colors.inactive,
  },
  nextButton: {
    padding: theme.spacing.buttonPadding,
  },
  nextText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  getStartedButton: {
    backgroundColor: '#000000', // Black as requested
    paddingVertical: theme.spacing.buttonPadding,
    paddingHorizontal: 24,
    borderRadius: theme.radius.medium,
    ...theme.shadows.card1,
  },
  getStartedText: {
    ...theme.typography.button,
    color: theme.colors.appBackground, // White text
  },
});
