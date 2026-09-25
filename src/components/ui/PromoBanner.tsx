import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';

export interface PromoBannerProps {
  image: any;
  title: string;
  buttonText: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const PromoBanner = ({
  image,
  title,
  buttonText,
  onPress,
  style,
}: PromoBannerProps) => {
  return (
    <View style={[styles.container, style]}>
      <ImageBackground 
        source={typeof image === 'string' ? { uri: image } : image} 
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.title}>{title}</Text>
          
          <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 172,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 0,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: 24,
  },
  gradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    ...theme.typography.h1Med,
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 20,
    maxWidth: '80%', // widened slightly so "customer services" stays together
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30, // pill shape
  },
  buttonText: {
    ...theme.typography.bodyMed,
    color: theme.colors.barberPrimary,
    fontWeight: '600',
  },
});
