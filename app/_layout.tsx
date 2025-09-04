import React, { useEffect, useRef } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { registerForPushNotificationsAsync } from "@/utils/notifications";

function LocationInitializer() {
    const { user } = useAuth();
    const { startTracking } = useLocationTracking(user?.id || null);
    const isInitialized = useRef(false);
    const initializationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!isInitialized.current) {
            registerForPushNotificationsAsync().catch(console.error);
        }

        if (user?.id && !isInitialized.current) {
            if (initializationTimeout.current) {
                clearTimeout(initializationTimeout.current);
            }

            initializationTimeout.current = setTimeout(() => {
                if (!isInitialized.current) {
                    startTracking()
                        .then(() => {
                            isInitialized.current = true;
                            console.log('Śledzenie lokalizacji zostało uruchomione');
                        })
                        .catch((error) => {
                            console.error('Błąd podczas inicjalizacji śledzenia:', error);
                        });
                }
            }, 1000);
        }

        if (!user?.id && isInitialized.current) {
            isInitialized.current = false;
        }

        return () => {
            if (initializationTimeout.current) {
                clearTimeout(initializationTimeout.current);
                initializationTimeout.current = null;
            }
        };
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <UserProvider>
                    <ThemeProvider value={DefaultTheme}>
                        <LocationInitializer />

                        <Stack>
                            <Stack.Screen
                                name="(tabs)"
                                options={{
                                    headerShown: false,
                                    title: 'Konto'
                                }}
                            />
                            <Stack.Screen
                                name="activity"
                                options={{
                                    title: 'Moja aktywność',
                                    headerShown: true,
                                    headerBackTitle: 'Wstecz',
                                }}
                            />
                            <Stack.Screen
                                name="schedule"
                                options={{
                                    title: 'Harmonogram zajęć',
                                    headerShown: true,
                                    headerBackTitle: 'Wstecz',
                                }}
                            />
                            <Stack.Screen
                                name="ranking"
                                options={{
                                    title: 'Ranking',
                                    headerShown: true,
                                    headerBackTitle: 'Wstecz',
                                }}
                            />
                            <Stack.Screen
                                name="membershipTypes"
                                options={{
                                    title: 'Dostępne karnety',
                                    headerShown: true,
                                    headerBackTitle: 'Wstecz',
                                }}
                            />
                            <Stack.Screen
                                name="purchase"
                                options={{
                                    title: 'Historia karnetów',
                                    headerShown: true,
                                    headerBackTitle: 'Wstecz',
                                }}
                            />
                        </Stack>

                        <StatusBar style="auto" />
                    </ThemeProvider>
                </UserProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}