import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Rect, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop, ClipPath } from 'react-native-svg';

interface ProfilePromoBannerProps {
  style?: object;
}

export function ProfilePromoBanner({ style }: ProfilePromoBannerProps) {
  return (
    <View style={[styles.container, style]}>
      {/* ── Exact 1:1 Figma SVG Vector Background & Elements ── */}
      <Svg width="100%" height="100%" viewBox="0 0 358 88" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient
            id="paint0_linear_profile_promo"
            x1="-28.6601"
            y1="44.5301"
            x2="519.402"
            y2="44.0532"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.96} />
            <Stop offset="1" stopColor="#0F28CE" />
          </SvgLinearGradient>
          <ClipPath id="clip0_profile_promo">
            <Rect width="358" height="88" rx="16" fill="#FFFFFF" />
          </ClipPath>
        </Defs>

        <G clipPath="url(#clip0_profile_promo)">
          {/* Main Background Rectangle with Linear Gradient */}
          <Rect width="358" height="88" rx="16" fill="url(#paint0_linear_profile_promo)" fillOpacity={0.96} />

          {/* Big Blue Verified Badge Overflowing Left Edge */}
          <Path
            d="M44.6319 50.6663H44.6667H44.6319ZM44.6319 50.6663C42.3486 52.9305 38.2108 52.3666 35.309 52.3666C31.7472 52.3666 30.0319 53.0632 27.4898 55.6053C25.3254 57.7701 22.4236 61.6663 19 61.6663C15.5765 61.6663 12.6747 57.7701 10.5101 55.6053C7.96807 53.0632 6.25284 52.3666 2.69093 52.3666C-0.2108 52.3666 -4.34863 52.9305 -6.63183 50.6663C-8.93332 48.3842 -8.36693 44.2291 -8.36693 41.3086C-8.36693 37.6181 -9.17404 35.9212 -11.8022 33.2929C-15.7118 29.3835 -17.6666 27.4285 -17.6666 24.9997C-17.6666 22.5705 -15.7119 20.6158 -11.8023 16.7063C-9.45623 14.3602 -8.36693 12.0354 -8.36693 8.69056C-8.36693 5.78872 -8.93083 1.65085 -6.66663 -0.63238C-4.38438 -2.9338 -0.229425 -2.36737 2.691 -2.36737C6.0357 -2.36737 8.36054 -3.45659 10.7066 -5.80264C14.6162 -9.71222 16.5709 -11.667 19 -11.667C21.4292 -11.667 23.3839 -9.71222 27.2933 -5.80264C29.6389 -3.45707 31.9635 -2.36737 35.309 -2.36737C38.2108 -2.36737 42.349 -2.93127 44.6322 -0.666992C46.9334 1.61525 46.3669 5.77017 46.3669 8.69056C46.3669 12.3811 47.1743 14.078 49.8022 16.7063C53.712 20.6158 55.6667 22.5705 55.6667 24.9997C55.6667 27.4285 53.712 29.3835 49.8022 33.2929C47.174 35.9212 46.3669 37.6181 46.3669 41.3086C46.3669 44.2291 46.9334 48.3842 44.6319 50.6663Z"
            fill="#1A82FF"
            fillOpacity={0.9}
            stroke="#1A82FF"
            strokeOpacity={0.9}
            strokeWidth={1.5}
          />

          {/* White Checkmark Vector inside Badge */}
          <Path
            d="M8 28.2736L14.6 34.1663L30 15.833"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sparkle 1: Top Right */}
          <Path
            d="M349.5 -7L351.438 4.56217L363 6.5L351.438 8.43783L349.5 20L347.562 8.43783L336 6.5L347.562 4.56217L349.5 -7Z"
            fill="#FFFFFF"
          />

          {/* Sparkle 2: Top Center/Right */}
          <Path
            d="M247.5 11L249.438 22.5622L261 24.5L249.438 26.4378L247.5 38L245.562 26.4378L234 24.5L245.562 22.5622L247.5 11Z"
            fill="#FFFFFF"
            fillOpacity={0.9}
          />

          {/* Sparkle 3: Bottom Right */}
          <Path
            d="M283.5 74L285.438 85.5622L297 87.5L285.438 89.4378L283.5 101L281.562 89.4378L270 87.5L281.562 85.5622L283.5 74Z"
            fill="#FFFFFF"
          />

          {/* Sparkle 4: Top Left / Center */}
          <Path
            d="M146.5 -11L148.438 0.562174L160 2.5L148.438 4.43783L146.5 16L144.562 4.43783L133 2.5L144.562 0.562174L146.5 -11Z"
            fill="#FFFFFF"
          />
        </G>
      </Svg>

      {/* ── Text Content positioned identically to Figma ── */}
      <View style={styles.textContainer} pointerEvents="none">
        <Text style={styles.promoText}>
          Go premium to unlock exclusive{'\n'}benefits, special discounts.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 88,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    left: 70,
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  promoText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
});
