import React, { useEffect } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { useLocationTracking } from '@/hooks/useLocationTracking';

function LocationInitializer() {
    const { user } = useAuth();
    const { startTracking } = useLocationTracking(user?.id || null);

    useEffect(() => {
        if (user?.id) {
            // Małe opóźnienie aby pozwolić na załadowanie UI
            setTimeout(() => {
                startTracking();
            }, 1000);
        }
    }, [user?.id, startTracking]);

    return null;
}

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!loaded) {
        return null;
    }

    return (
        <AuthProvider>
            <UserProvider>
                <ThemeProvider value={DefaultTheme}>
                    <LocationInitializer />
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Konto' }} />
                        <Stack.Screen
                            name="activity"
                            options={{
                                title: 'Moja aktywność',
                                headerShown: true,
                            }}
                        />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </UserProvider>
        </AuthProvider>
    );
}