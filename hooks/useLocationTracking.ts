import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';

import { updateLocation } from '@/api/activity';
import { sendWorkoutStartedNotification, sendWorkoutEndedNotification } from '@/utils/notifications';
import type { LocationResponse } from '@/types/LocationResponse';
import { LocationRequest } from "@/types/LocationRequest";

const LOCATION_UPDATE_INTERVAL = 180_000;
const LOCATION_DISTANCE_INTERVAL = 15;

const LOCATION_CONFIG = {
    accuracy: Location.Accuracy.High,
    distanceInterval: LOCATION_DISTANCE_INTERVAL,
} as const;

interface LocationTrackingState {
    isInGym: boolean;
    sessionDetails: { startTime: string | null; currentSessionMinutes: number | null };
    isTracking: boolean;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
}

export function useLocationTracking(userId: string | null): LocationTrackingState {
    const [isInGym, setIsInGym] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<{
        startTime: string | null;
        currentSessionMinutes: number | null;
    }>({
        startTime: null,
        currentSessionMinutes: null
    });
    const [isTracking, setIsTracking] = useState(false);

    const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const appState = useRef(AppState.currentState);
    const lastLocationUpdate = useRef<number>(0);
    const wasInGym = useRef<boolean>(false);
    const lastSessionMinutes = useRef<number | null>(null);

    const sendLocationUpdate = useCallback(async (location?: Location.LocationObject) => {
        if (!userId) {
            console.log('Brak userId – przerywam');
            return;
        }

        const now = Date.now();
        if (now - lastLocationUpdate.current < LOCATION_UPDATE_INTERVAL) {
            console.log('Za wcześnie na kolejną aktualizację lokalizacji');
            return;
        }

        try {
            const loc = location || await Location.getCurrentPositionAsync(LOCATION_CONFIG);

            const request: LocationRequest = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };

            const resp: LocationResponse = await updateLocation(userId, request);

            lastLocationUpdate.current = now;

            const justEnteredGym = !wasInGym.current && resp.isInGym;

            const justLeftGym = wasInGym.current && !resp.isInGym;

            setIsInGym(resp.isInGym);
            setSessionDetails({
                startTime: resp.startTime,
                currentSessionMinutes: resp.currentSessionMinutes
            });

            if (justEnteredGym && resp.startTime) {
                console.log('Użytkownik wszedł do siłowni - wysyłam powiadomienie');
                await sendWorkoutStartedNotification(resp.startTime);
            }

            if (justLeftGym && lastSessionMinutes.current !== null && lastSessionMinutes.current > 0) {
                console.log('Użytkownik wyszedł z siłowni - wysyłam powiadomienie');
                await sendWorkoutEndedNotification(lastSessionMinutes.current);
            }

            wasInGym.current = resp.isInGym;
            lastSessionMinutes.current = resp.currentSessionMinutes;

        } catch (e) {
            console.log('Błąd wysyłki lokalizacji:', e);
        }
    }, [userId]);

    const startTracking = useCallback(async () => {
        if (!userId || isTracking) {
            console.log('Tracking już działa lub brak userId');
            return;
        }

        const fg = await Location.requestForegroundPermissionsAsync();
        if (fg.status !== 'granted') {
            Alert.alert(
                'Błąd',
                'Aplikacja wymaga dostępu do lokalizacji podczas używania aplikacji.'
            );
            return;
        }

        setIsTracking(true);

        await sendLocationUpdate();

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: LOCATION_DISTANCE_INTERVAL,
            },
            async (location) => {
                await sendLocationUpdate(location);
            }
        );

        if (!trackingInterval.current) {
            trackingInterval.current = setInterval(async () => {
                if (appState.current === 'active') {
                    await sendLocationUpdate();
                }
            }, LOCATION_UPDATE_INTERVAL);
        }

        console.log('Śledzenie lokalizacji zostało uruchomione (tylko podczas używania aplikacji)');
    }, [userId, isTracking, sendLocationUpdate]);

    const stopTracking = useCallback(async () => {
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }

        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        setIsTracking(false);
        setIsInGym(false);
        setSessionDetails({ startTime: null, currentSessionMinutes: null });
        wasInGym.current = false;
        lastSessionMinutes.current = null;

        console.log('Śledzenie lokalizacji zostało zatrzymane');
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            appState.current = nextAppState;

            if (nextAppState === 'active' && isTracking) {
                const now = Date.now();
                if (now - lastLocationUpdate.current >= LOCATION_UPDATE_INTERVAL) {
                    sendLocationUpdate();
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [isTracking, sendLocationUpdate]);

    useEffect(() => {
        return () => {
            if (trackingInterval.current) {
                clearInterval(trackingInterval.current);
            }
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    return {
        isInGym,
        sessionDetails,
        isTracking,
        startTracking,
        stopTracking
    };
}