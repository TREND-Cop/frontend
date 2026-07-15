export const colors = {
  primary: '#0C8CE4', // Ink Blue
  primarySupportText: '#666666', // Gray (estimated from image)
  secondaryButton: '#1A8BFF', // Blue
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

export const typography = {
  sectionHeader: { fontSize: 32, lineHeight: 32, fontWeight: '700' },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '400' },
  h1Med: { fontSize: 24, lineHeight: 32, fontWeight: '500' },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '400' },
  h2Med: { fontSize: 20, lineHeight: 28, fontWeight: '500' },
  bodyRegular: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMed: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  labelMed: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  button: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  captionMed: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  topHeader: { fontSize: 17, lineHeight: 24, fontWeight: '500' },
  extraTiny: { fontSize: 10, lineHeight: 14, fontWeight: '400' },
};

export const shadows = {
  card1: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4, // For Android
  },
  card2: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  card3: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  card4: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 24,
  },
};

export const radius = {
  medium: 16,
  large: 24,
};

export const spacing = {
  buttonPadding: 16,
};

export const theme = {
  colors,
  typography,
  shadows,
  radius,
  spacing,
};
