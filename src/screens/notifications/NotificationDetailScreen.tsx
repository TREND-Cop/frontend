import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { getNotificationById } from '../../constants/mockData';

export const NotificationDetailScreen = ({ id }: { id: string }) => {
  const notification = getNotificationById(id);

  if (!notification) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Notification not found.</Text>
      </View>
    );
  }

  // The content from mockData has '\n\n' for paragraphs. Let's split it up nicely.
  const paragraphs = notification.content.split('\n\n');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            {notification.image ? (
              <Image
                source={typeof (notification as any).image === 'string' ? { uri: (notification as any).image } : (notification as any).image}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarInitialsContainer}>
                <Text style={styles.avatarInitials}>{notification.initials}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.time}>{notification.time}</Text>
          </View>
        </View>

        {/* Content Paragraphs */}
        <View style={styles.bodyContainer}>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...theme.typography.bodyRegular,
    color: theme.colors.barberPrimarySupport,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarInitialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...theme.typography.h2Med,
    color: '#000000',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.bodyRegular,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    color: '#000000',
    marginBottom: 4,
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.barberPrimarySupport,
    fontSize: 12,
    lineHeight: 18,
  },
  bodyContainer: {
    // Gap for spacing between paragraphs
    gap: 20,
  },
  paragraph: {
    ...theme.typography.bodyRegular,
    color: '#333333',
    lineHeight: 26,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
