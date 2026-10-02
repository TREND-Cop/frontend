import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 9999,
    boxShadow: '0px 8px 24px rgba(99, 102, 241, 0.35)',
    elevation: 16,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: 'rgba(99, 102, 241, 0.35)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },

  buttonLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 15,
    fontStyle: 'normal',
    fontWeight: '600',
    includeFontPadding: false,
    letterSpacing: -0.2,
    lineHeight: 20,
  },

  iconSlot: {
    height: 20,
    width: 20,
  },
});
