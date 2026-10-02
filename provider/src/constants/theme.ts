import { Platform } from 'react-native';

export const colors = {
  primary: '#0C8CE4', // Ink Blue
  primarySupportText: 'rgba(96, 96, 102, 0.96)', // Primary support/secondary text
  barberPrimary: 'rgba(0, 8, 20, 0.96)', // Dark navy/black used in the barber app
  barberPrimarySupport: 'rgba(96, 96, 102, 0.96)', // Secondary text
  layerBg: 'rgba(247, 247, 247, 0.98)',
  lightBrown: 'rgba(245, 149, 15, 0.96)', // Ratings star / Bookings text
  outlineBorders: '#CCCCCC', // Gray
  appBackground: '#FFFFFF', // White
  inactive: '#E5E5E5', // Grayish Blue
  dangerVibrant: '#CC292B', // Red
  dangerBackground: '#FAE5E5', // Red
  successVibrant: '#0C940C', // Green
  successBackground: '#E7FDE7', // Green
  tertiaryVibrant: '#F9890F', // Orange
  tertiaryBackground: '#F2E5DA', // Orange
  iconInactive: '#C6C6C6', // Gray
  linkText: '#1A8BFF', // Blue
};

const defaultFontFamily = Platform.select({ 
  ios: 'SF Pro', 
  android: 'DMSans_400Regular',
  default: '-apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI", Roboto, sans-serif',
});
const mediumFontFamily = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: '-apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI", Roboto, sans-serif',
});
const interMediumFontFamily = Platform.select({
  ios: 'Inter',
  android: 'Inter_500Medium',
  default: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

export const fontFamilies = {
  body: defaultFontFamily,
  bodyMedium: mediumFontFamily,
  button: interMediumFontFamily,
  pageHeader: mediumFontFamily,
  tag: defaultFontFamily,
};

export const typography = {
  // H2 ( Sub header ) - SF Pro, Medium (500), Size 20, Line Height 28, Letter Spacing 0.02
  h2: { fontFamily: defaultFontFamily, fontSize: 20, lineHeight: 28, letterSpacing: 0.02, fontWeight: '400' as const, fontStyle: 'normal' as const },
  h2Med: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,
  h3: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,
  subHeader: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 20, lineHeight: 24, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,

  // Page Header Text - SF Pro on iOS, DM Sans Medium on Android (17px, Line Height 24, Letter Spacing 0.2, Weight 500)
  pageHeader: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 17, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 17, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 17, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,
  topHeader: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 17, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 17, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 17, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,

  // Caption Text / Tags - DM Sans Regular on Android, SF Pro on iOS (400), Size 12, Line Height 16, Letter Spacing 0.5
  caption: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,
  captionTag: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,
  tag: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,
  tags: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,
  captionMed: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,

  // Button - Inter (Medium 500), Size 16, Line Height 24, Letter Spacing 0.15px
  button: Platform.select({
    ios: { fontFamily: 'Inter', fontSize: 16, lineHeight: 24, letterSpacing: 0.15, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: 0.15, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: 24, letterSpacing: 0.15, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,

  // Numerals ( Numbers (Price Tags) ) - SF Pro on iOS (0.6px), DM Sans Regular on Android (0.5px)
  numerals: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 14, lineHeight: 20, letterSpacing: 0.6, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 14, lineHeight: 20, letterSpacing: 0.6, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,
  priceTag: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 14, lineHeight: 20, letterSpacing: 0.6, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 14, lineHeight: 20, letterSpacing: 0.6, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,

  // Other preserved tokens
  sectionHeader: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 32, lineHeight: 36, letterSpacing: 0.6, fontWeight: '700' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_700Bold', fontSize: 32, lineHeight: 36, letterSpacing: 0.6, fontWeight: '700' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 32, lineHeight: 36, letterSpacing: 0.6, fontWeight: '700' as const, fontStyle: 'normal' as const },
  })!,
  h1: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 24, lineHeight: 32, letterSpacing: 0.4, fontWeight: '600' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_600SemiBold', fontSize: 24, lineHeight: 32, letterSpacing: 0.4, fontWeight: '600' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 24, lineHeight: 32, letterSpacing: 0.4, fontWeight: '600' as const, fontStyle: 'normal' as const },
  })!,
  h1Med: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 24, lineHeight: 32, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 24, lineHeight: 32, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 24, lineHeight: 32, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,
  
  // Body Regular (16px, 400) - DM Sans Regular on Android, SF Pro on iOS (16px, Line Height 24, Letter Spacing 0.2px)
  bodyRegular: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,

  // Body text - Default 16px Regular (400) per Android/iOS Spec (Line Height 24, Letter Spacing 0.2px)
  bodyText: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,

  body: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '400' as const, fontStyle: 'normal' as const },
  })!,

  // Body Medium (16px, 500) - SF Pro on iOS (0.4px), DM Sans on Android (0.2px)
  bodyMed: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 16, lineHeight: 24, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 16, lineHeight: 24, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,
  bodyMedium: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 16, lineHeight: 24, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 16, lineHeight: 24, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
  })!,

  // Service Name (16px, 500) - Universal standard for all service card titles
  serviceName: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 16, lineHeight: 24, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 16, lineHeight: 24, letterSpacing: 0.4, fontWeight: '500' as const, fontStyle: 'normal' as const },
  }),
  
  // 14px Regular Body Text / Support / Labels / Ratings (14px, Line Height 20, Letter Spacing 0.5, Regular 400)
  body14: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
  }),
  ratingNumber: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
  }),
  paragraph: { fontFamily: defaultFontFamily, fontSize: 15, lineHeight: 24, letterSpacing: 0.4, fontWeight: '400' as const, fontStyle: 'normal' as const },
  supportText: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
  }),
  label: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 14, lineHeight: 20, letterSpacing: 0.5, fontWeight: '400' as const, fontStyle: 'normal' as const },
  }),
  labelMed: { fontFamily: mediumFontFamily, fontSize: 14, lineHeight: 20, letterSpacing: 0.3, fontWeight: '500' as const, fontStyle: 'normal' as const },
  homeHeader: Platform.select({
    ios: { fontFamily: 'SF Pro', fontSize: 24, lineHeight: 32, letterSpacing: 0.5, fontWeight: '600' as const, fontStyle: 'normal' as const },
    android: { fontFamily: 'DMSans_500Medium', fontSize: 24, lineHeight: 28, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
    default: { fontFamily: 'sans-serif', fontSize: 24, lineHeight: 28, letterSpacing: 0.2, fontWeight: '500' as const, fontStyle: 'normal' as const },
  }),
  extraTiny: { fontFamily: defaultFontFamily, fontSize: 10, lineHeight: 14, letterSpacing: 0.1, fontWeight: '400' as const, fontStyle: 'normal' as const },
  onboardingBrandTitle: {
    color: 'rgba(0, 8, 20, 0.96)',
    fontFamily: Platform.select({
      ios: 'DMSans_700Bold',
      android: 'DMSans_700Bold',
      default: 'DMSans_700Bold',
    }),
    fontWeight: '700' as const,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
};

export const shadows = {
  card1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1, // For Android
  },
  card2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  card3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  card4: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  complexCard: {
    // @ts-ignore - React Native 0.74+ supports standard CSS boxShadow
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
    // Fallbacks for older devices
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
};

export const radius = {
  small: 8,
  medium: 16,
  large: 24,
  pill: 9999,
};

export const spacing = {
  screenHorizontal: 16,
  headerTopMargin: 83,
  buttonPadding: 16,
  fieldMargin: 40,
};

export const sectionSpacing = {
  cardPadding: 20,
  cardGap: 24, // gap between intro paragraph & first section, and between sections
  sectionGap: 24, // gap between full sections
  iconTextGap: 12, // gap between icon circle and text content
  titleBulletGap: 6, // gap between title and bullet list
  bulletGap: 4, // gap between bullet items
  bulletLineHeight: 22,
  cardMarginBottom: 32,
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    backgroundElement: '#f0f0f0',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    ...colors,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    backgroundElement: '#282828',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
    ...colors,
  },
};

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = {
  regular: defaultFontFamily,
  medium: defaultFontFamily,
  bold: defaultFontFamily,
};

export const theme = {
  colors,
  typography,
  shadows,
  radius,
  spacing,
  sectionSpacing,
  Colors,
  Fonts,
};

export default theme;
