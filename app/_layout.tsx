import React, { useEffect, useRef } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserProvider, useUser } from '@/context/UserContext';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { registerForPushNotificationsAsync } from "@/utils/notifications";

function LocationInitializer() {
    const { user } = useAuth();
    const { setLocationStatus } = useUser();

    const { startTracking, stopTracking } = useLocationTracking(
        user?.id || null,
        setLocationStatus
    );

    const isInitialized = useRef(false);
    const initializationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        console.log('🔄 LocationInitializer effect triggered:', {
            userId: user?.id,
            userExists: !!user,
            isInitialized: isInitialized.current
        });

        // Register for push notifications once
        if (!isInitialized.current) {
            console.log('📱 Registering for push notifications...');
            registerForPushNotificationsAsync()
                .then(() => console.log('✅ Push notifications registered'))
                .catch((error) => console.error('❌ Push notification registration failed:', error));
        }

        // User logged in - start tracking
        if (user?.id && !isInitialized.current) {
            console.log('👤 User logged in, preparing to start tracking...');

            if (initializationTimeout.current) {
                clearTimeout(initializationTimeout.current);
            }

            initializationTimeout.current = setTimeout(() => {
                if (!isInitialized.current) {
                    console.log('🚀 Initializing location tracking...');
                    startTracking()
                        .then(() => {
                            isInitialized.current = true;
                            console.log('✅ Śledzenie lokalizacji zostało uruchomione');
                        })
                        .catch((error) => {
                            console.error('❌ Błąd podczas inicjalizacji śledzenia:', error);
                        });
                }
            }, 1000);
        }

        // User logged out - stop tracking
        if (!user?.id && isInitialized.current) {
            console.log('🛑 User logged out - stopping tracking');
            stopTracking()
                .then(() => {
                    isInitialized.current = false;
                    console.log('✅ Tracking stopped on logout');
                })
                .catch((error) => {
                    console.error('❌ Error stopping tracking:', error);
                });
        }

        return () => {
            if (initializationTimeout.current) {
                clearTimeout(initializationTimeout.current);
                initializationTimeout.current = null;
            }
        };
    }, [user?.id, startTracking, stopTracking]);

    return null;
}

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        console.log('🎨 RootLayout mounted, fonts loaded:', loaded);
    }, [loaded]);

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