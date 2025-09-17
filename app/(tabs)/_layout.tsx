import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
              position: 'absolute',
              backgroundColor: Colors['light'].background,
          },
          default: {
              backgroundColor: Colors['light'].background,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Konto',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: 'Powiadomienia',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
        }}
      />
        <Tabs.Screen
            name="shop"
            options={{
                title: 'Sklep',
                tabBarIcon: ({ color }) => <Ionicons size={28} name="cart" color={color} />,
            }}
        />
        <Tabs.Screen
            name="sativa"
            options={{
                title: 'Sativa Life',
                tabBarIcon: ({ color }) => <Ionicons size={28} name="heart-circle" color={color} />,
            }}
        />
    </Tabs>
  );
}
