import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SalonLocationScreen } from '../../screens/salon/SalonLocationScreen';

class RouteErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('[SalonLocationRoute] Render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#141A33', marginBottom: 8 }}>Unable to load Location</Text>
          <Text style={{ fontSize: 14, color: '#606066', textAlign: 'center', marginBottom: 20 }}>
            {String(this.state.error?.message || this.state.error || 'An unexpected error occurred.')}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function SalonLocationRoute() {
  return (
    <RouteErrorBoundary>
      <SalonLocationScreen />
    </RouteErrorBoundary>
  );
}
