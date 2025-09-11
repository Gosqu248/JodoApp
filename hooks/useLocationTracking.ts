import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { updateLocation } from '@/api/activity';
import { sendWorkoutStartedNotification } from '@/utils/notifications';
import type { LocationResponse } from '@/types/LocationResponse';
import {LocationRequest} from "@/types/LocationRequest";

const BACKGROUND_TASK_NAME = 'JODO_LOCATION_UPDATES';
const LOCATION_UPDATE_INTERVAL = 60_000;
const STORAGE_KEYS = { USER_ID: 'user_id_for_location' } as const;

const LOCATION_CONFIG = { accuracy: Location.Accuracy.High } as const;

const BG_OPTIONS: Location.LocationTaskOptions = {
    accuracy: Location.Accuracy.High,
    activityType: Location.ActivityType.Fitness,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    distanceInterval: 8,
    timeInterval: LOCATION_UPDATE_INTERVAL,
    foregroundService: {
        notificationTitle: 'JodoGym',
        notificationBody: 'Śledzenie lokalizacji włączone.',
    },
};

TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
    try {
        if (error) { console.log('BG task error:', error); return; }
        const { locations } = (data ?? {}) as { locations?: Location.LocationObject[] };
        if (!locations?.length) return;

        const last = locations[locations.length - 1];
        const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!userId) { console.log('BG: brak userId – pomijam'); return; }

        const request: LocationRequest = {
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
        }

        const resp: LocationResponse = await updateLocation(userId, request);

        if (resp.isInGym && resp.currentSessionMinutes === 0 && resp.startTime) {
            await sendWorkoutStartedNotification(resp.startTime);
        }
    } catch (e) {
        console.log('BG task failed:', e);
    }
});

interface LocationTrackingState {
    isInGym: boolean;
    sessionDetails: { startTime: string | null; currentSessionMinutes: number | null };
    isTracking: boolean;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
}

export function useLocationTracking(userId: string | null): LocationTrackingState {
    const [isInGym, setIsInGym] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<{ startTime: string | null; currentSessionMinutes: number | null; }>({ startTime: null, currentSessionMinutes: null });
    const [isTracking, setIsTracking] = useState(false);

    const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (userId) { void AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId); }
        else { void AsyncStorage.removeItem(STORAGE_KEYS.USER_ID); }
    }, [userId]);

    const sendLocationUpdate = useCallback(async () => {
        if (!userId) { console.log('Brak userId – przerywam'); return; }
        try {
            const loc = await Location.getCurrentPositionAsync(LOCATION_CONFIG);
            const resp: LocationResponse = await updateLocation(userId, {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            setIsInGym(resp.isInGym);
            setSessionDetails({ startTime: resp.startTime, currentSessionMinutes: resp.currentSessionMinutes });
            if (resp.isInGym && resp.currentSessionMinutes === 0 && resp.startTime) {
                await sendWorkoutStartedNotification(resp.startTime);
            }
        } catch (e) {
            console.log('Błąd wysyłki lokalizacji:', e);
        }
    }, [userId]);

    const startTracking = useCallback(async () => {
        if (!userId || isTracking) { console.log('Tracking już działa lub brak userId'); return; }

        const fg = await Location.requestForegroundPermissionsAsync();
        if (fg.status !== 'granted') {
            Alert.alert('Błąd', 'Aplikacja wymaga dostępu do lokalizacji.');
            return;
        }
        const bg = await Location.requestBackgroundPermissionsAsync();
        if (bg.status !== 'granted') {
            Alert.alert('Wymagane uprawnienie', 'Włącz „Zawsze” dla lokalizacji, aby śledzenie działało w tle.');
        }

        setIsTracking(true);
        await sendLocationUpdate();
        if (!trackingInterval.current) {
            trackingInterval.current = setInterval(sendLocationUpdate, LOCATION_UPDATE_INTERVAL);
        }

        const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME);
        if (!started && bg.status === 'granted') {
            await Location.startLocationUpdatesAsync(BACKGROUND_TASK_NAME, BG_OPTIONS);
            console.log('Background location updates started');
        }
    }, [userId, isTracking, sendLocationUpdate]);

    const stopTracking = useCallback(async () => {
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }
        const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME);
        if (started) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_TASK_NAME);
            console.log('Background location updates stopped');
        }
        setIsTracking(false);
        setIsInGym(false);
        setSessionDetails({ startTime: null, currentSessionMinutes: null });
    }, []);

    useEffect(() => {
        return () => {
            if (trackingInterval.current) clearInterval(trackingInterval.current);
        };
    }, []);

    return { isInGym, sessionDetails, isTracking, startTracking, stopTracking };
}
