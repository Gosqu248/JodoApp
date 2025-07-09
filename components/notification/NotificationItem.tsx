import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, ImageSourcePropType, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface NotificationItemProps {
  title: string;
  description: string;
  image: ImageSourcePropType;
  accentColor: string;
}

export default function NotificationItem({ title, description, image, accentColor }: NotificationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  const displayDescription = expanded ? description : (description.length > 120 ? `${description.substring(0, 120)}...` : description);

  return (
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.85}>
        <ThemedView style={[styles.container, {borderLeftColor: accentColor}] as unknown as ViewStyle}>
          <Image source={image} style={styles.image} />
          <ThemedView style={styles.contentContainer}>
            <ThemedText style={[styles.title, {color: accentColor}] as unknown as TextStyle}>{title}</ThemedText>
            <ThemedText style={styles.description}>{displayDescription}</ThemedText>
            {!expanded && description.length > 120 && (
                <ThemedText style={[styles.readMore, {color: accentColor}] as unknown as TextStyle}>
                  Naciśnij, aby zobaczyć więcej
                </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: 16,
    borderLeftWidth: 5,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
  },
  readMore: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
