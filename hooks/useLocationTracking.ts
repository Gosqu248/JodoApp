/**
 * FOREGROUND SERVICE LOCATION TRACKING FOR AUTOMATIC WORKOUT DETECTION
 *
 * This module implements location tracking for JodoGym fitness app using
 * Foreground Service (Android) and Background Modes (iOS).
 *
 * KEY APPROACH:
 * - Only requires "When In Use" location permission (no "Always" needed)
 * - Foreground Service is started DYNAMICALLY when user enters the gym
 * - Foreground Service is stopped when user leaves the gym
 * - This approach complies with Google Play policies
 *
 * FLOW:
 * 1. App starts -> Request "When In Use" location permission
 * 2. Monitor location in foreground using watchPositionAsync
 * 3. When backend returns isInGym: true -> Start Foreground Service
 * 4. Foreground Service keeps app alive while user is in gym
 * 5. When backend returns isInGym: false -> Stop Foreground Service
 *
 * USER BENEFITS:
 * - No need for "Always" permission - simpler permission request
 * - Workout tracking works when phone is locked (via Foreground Service)
 * - Battery efficient - service only runs during active workouts
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { updateLocation } from '@/api/activity';
import { sendWorkoutStartedNotification, sendWorkoutEndedNotification } from '@/utils/notifications';
import type { LocationResponse } from '@/types/LocationResponse';
import { LocationRequest } from "@/types/LocationRequest";

const LOCATION_UPDATE_INTERVAL = 180_000; // 3 minutes - battery efficient
const LOCATION_DISTANCE_INTERVAL = 15; // 15 meters - significant movement
const FOREGROUND_SERVICE_TASK = 'gym-workout-tracking-task';
const MIN_UPDATE_INTERVAL = 60_000; // 1 minute minimum between updates

// AsyncStorage keys
const USER_ID_KEY = 'tracking_user_id';
const WAS_IN_GYM_KEY = 'tracking_was_in_gym';
const LAST_SESSION_MINUTES_KEY = 'tracking_last_session_minutes';
const LAST_UPDATE_TIME_KEY = 'tracking_last_update_time';
const LOCATION_STATUS_KEY = 'tracking_location_status';
const UPDATE_IN_PROGRESS_KEY = 'tracking_update_in_progress';
const FOREGROUND_SERVICE_RUNNING_KEY = 'foreground_service_running';

const LOCATION_CONFIG = {
    accuracy: Location.Accuracy.High,
    distanceInterval: LOCATION_DISTANCE_INTERVAL,
} as const;

interface LocationTrackingState {
    isTracking: boolean;
    isWorkoutActive: boolean;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
    forceUpdate: () => Promise<void>;
}

/**
 * Stops the foreground service task
 */
async function stopForegroundServiceTask() {
    try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(FOREGROUND_SERVICE_TASK);
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(FOREGROUND_SERVICE_TASK);
            await AsyncStorage.setItem(FOREGROUND_SERVICE_RUNNING_KEY, 'false');
            console.log('🛑 Foreground service stopped');
        }
    } catch (error) {
        console.error('❌ Error stopping foreground service:', error);
    }
}

/**
 * Foreground Service Task - runs when user is in the gym
 * This task handles location updates while app is in background during workout
 */
TaskManager.defineTask(FOREGROUND_SERVICE_TASK, async ({ data, error }: any) => {
    if (error) {
        console.error('❌ Foreground service error:', error);
        return;
    }

    if (!data) {
        console.log('⚠️ Foreground service: no data');
        return;
    }

    try {
        const { locations } = data as { locations: Location.LocationObject[] };

        if (!locations || locations.length === 0) {
            console.log('⚠️ Foreground service: no locations');
            return;
        }

        const location = locations[0];
        const userId = await AsyncStorage.getItem(USER_ID_KEY);

        if (!userId) {
            console.log('⚠️ Foreground service: no userId in storage');
            return;
        }

        const now = Date.now();

        // Check mutex
        const updateInProgress = await AsyncStorage.getItem(UPDATE_IN_PROGRESS_KEY);
        if (updateInProgress) {
            const inProgressTime = parseInt(updateInProgress, 10);
            if (now - inProgressTime < 30_000) {
                console.log('🔒 Foreground service: update in progress, skipping');
                return;
            }
        }

        // Check time since last update
        const lastUpdateTimeStr = await AsyncStorage.getItem(LAST_UPDATE_TIME_KEY);
        const lastUpdateTime = lastUpdateTimeStr ? parseInt(lastUpdateTimeStr, 10) : 0;

        if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
            console.log(`⏱️ Foreground service: too soon (${Math.round((now - lastUpdateTime) / 1000)}s)`);
            return;
        }

        console.log('📍 Foreground service location update:', {
            lat: location.coords.latitude.toFixed(6),
            lng: location.coords.longitude.toFixed(6),
        });

        await AsyncStorage.setItem(UPDATE_IN_PROGRESS_KEY, now.toString());

        const request: LocationRequest = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };

        let resp: LocationResponse;
        try {
            resp = await updateLocation(userId, request);
        } finally {
            await AsyncStorage.removeItem(UPDATE_IN_PROGRESS_KEY);
        }

        console.log('✅ Foreground service response:', {
            isInGym: resp.isInGym,
            currentSessionMinutes: resp.currentSessionMinutes,
        });

        await AsyncStorage.setItem(LAST_UPDATE_TIME_KEY, now.toString());

        // Get previous state
        const wasInGymStr = await AsyncStorage.getItem(WAS_IN_GYM_KEY);
        const lastSessionMinutesStr = await AsyncStorage.getItem(LAST_SESSION_MINUTES_KEY);
        const wasInGym = wasInGymStr === 'true';
        const lastSessionMinutes = lastSessionMinutesStr ? parseInt(lastSessionMinutesStr, 10) : null;

        // Detect gym exit - STOP the foreground service
        if (wasInGym && !resp.isInGym) {
            console.log('🚪 User left gym - stopping foreground service');

            if (lastSessionMinutes !== null && lastSessionMinutes > 0) {
                await sendWorkoutEndedNotification(lastSessionMinutes);
            }

            // Stop the foreground service since user left gym
            await stopForegroundServiceTask();
        }

        // Save state
        await AsyncStorage.setItem(WAS_IN_GYM_KEY, resp.isInGym.toString());
        await AsyncStorage.setItem(
            LAST_SESSION_MINUTES_KEY,
            (resp.currentSessionMinutes ?? 0).toString()
        );
        await AsyncStorage.setItem(LOCATION_STATUS_KEY, JSON.stringify({
            isInGym: resp.isInGym,
            startTime: resp.startTime,
            currentSessionMinutes: resp.currentSessionMinutes
        }));

    } catch (error: any) {
        console.error('❌ Foreground service error:', error.message);
        await AsyncStorage.removeItem(UPDATE_IN_PROGRESS_KEY);
    }
});

export function useLocationTracking(
    userId: string | null,
    onLocationUpdate: (isInGym: boolean, sessionDetails: {
        startTime: string | null;
        currentSessionMinutes: number | null;
    }) => void
): LocationTrackingState {
    const [isTracking, setIsTracking] = useState(false);
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);

    const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const appState = useRef(AppState.currentState);
    const lastLocationUpdate = useRef<number>(0);
    const wasInGym = useRef<boolean>(false);
    const lastSessionMinutes = useRef<number | null>(null);
    const foregroundServiceRunning = useRef<boolean>(false);

    /**
     * Load persisted location status on mount
     */
    useEffect(() => {
        const loadPersistedStatus = async () => {
            try {
                const statusStr = await AsyncStorage.getItem(LOCATION_STATUS_KEY);
                const serviceRunning = await AsyncStorage.getItem(FOREGROUND_SERVICE_RUNNING_KEY);

                if (statusStr) {
                    const status = JSON.parse(statusStr);
                    console.log('📍 Loaded persisted status:', status);
                    onLocationUpdate(status.isInGym, {
                        startTime: status.startTime,
                        currentSessionMinutes: status.currentSessionMinutes
                    });
                    wasInGym.current = status.isInGym;
                    lastSessionMinutes.current = status.currentSessionMinutes;
                    setIsWorkoutActive(status.isInGym);
                }

                foregroundServiceRunning.current = serviceRunning === 'true';
            } catch (error) {
                console.error('❌ Error loading persisted status:', error);
            }
        };

        loadPersistedStatus();
    }, []);

    const isUpdatingRef = useRef<boolean>(false);

    /**
     * Starts the foreground service for workout tracking
     */
    const startForegroundService = useCallback(async () => {
        if (foregroundServiceRunning.current) {
            console.log('ℹ️ Foreground service already running');
            return;
        }

        try {
            const isTaskDefined = TaskManager.isTaskDefined(FOREGROUND_SERVICE_TASK);
            if (!isTaskDefined) {
                console.error('❌ Foreground service task not defined!');
                return;
            }

            // Check if already running
            const hasStarted = await Location.hasStartedLocationUpdatesAsync(FOREGROUND_SERVICE_TASK);
            if (hasStarted) {
                console.log('⚠️ Foreground service already started');
                foregroundServiceRunning.current = true;
                await AsyncStorage.setItem(FOREGROUND_SERVICE_RUNNING_KEY, 'true');
                return;
            }

            await Location.startLocationUpdatesAsync(FOREGROUND_SERVICE_TASK, {
                accuracy: Location.Accuracy.High,
                timeInterval: LOCATION_UPDATE_INTERVAL,
                distanceInterval: LOCATION_DISTANCE_INTERVAL,
                foregroundService: {
                    notificationTitle: 'Trening w toku',
                    notificationBody: 'JodoGym monitoruje Twój czas treningu',
                    notificationColor: '#ffc500',
                },
                // iOS
                showsBackgroundLocationIndicator: true,
                pausesUpdatesAutomatically: false,
                activityType: Location.ActivityType.Fitness,
            });

            foregroundServiceRunning.current = true;
            await AsyncStorage.setItem(FOREGROUND_SERVICE_RUNNING_KEY, 'true');
            console.log('🏋️ Foreground service started - workout tracking active');

        } catch (error) {
            console.error('❌ Error starting foreground service:', error);
        }
    }, []);

    /**
     * Stops the foreground service
     */
    const stopForegroundService = useCallback(async () => {
        await stopForegroundServiceTask();
        foregroundServiceRunning.current = false;
    }, []);

    /**
     * Sends location update to server
     */
    const sendLocationUpdate = useCallback(async (
        location?: Location.LocationObject,
        forceUpdate: boolean = false
    ) => {
        if (!userId) {
            console.log('⚠️ sendLocationUpdate: No userId');
            return;
        }

        if (isUpdatingRef.current) {
            console.log('🔒 sendLocationUpdate: Already updating');
            return;
        }

        const now = Date.now();
        const timeSinceLastUpdate = now - lastLocationUpdate.current;

        const minInterval = forceUpdate ? 0 : MIN_UPDATE_INTERVAL;
        if (!forceUpdate && timeSinceLastUpdate < minInterval) {
            console.log(`⏱️ Too soon for update (${Math.round(timeSinceLastUpdate / 1000)}s)`);
            return;
        }

        isUpdatingRef.current = true;

        try {
            await AsyncStorage.setItem(UPDATE_IN_PROGRESS_KEY, now.toString());

            const loc = location || await Location.getCurrentPositionAsync(LOCATION_CONFIG);

            const request: LocationRequest = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };

            console.log('📍 Location update:', {
                lat: loc.coords.latitude.toFixed(6),
                lng: loc.coords.longitude.toFixed(6),
                forceUpdate,
            });

            const resp: LocationResponse = await updateLocation(userId, request);

            console.log('✅ Server response:', {
                isInGym: resp.isInGym,
                currentSessionMinutes: resp.currentSessionMinutes,
            });

            lastLocationUpdate.current = now;

            // Detect status changes
            const justEnteredGym = !wasInGym.current && resp.isInGym;
            const justLeftGym = wasInGym.current && !resp.isInGym;

            // Update context
            onLocationUpdate(resp.isInGym, {
                startTime: resp.startTime,
                currentSessionMinutes: resp.currentSessionMinutes
            });

            // Handle gym entry - START foreground service
            if (justEnteredGym) {
                console.log('🏋️ User entered gym - starting foreground service');
                setIsWorkoutActive(true);

                if (resp.startTime) {
                    await sendWorkoutStartedNotification(resp.startTime);
                }

                // Start foreground service to keep tracking while screen is off
                await startForegroundService();
            }

            // Handle gym exit - STOP foreground service
            if (justLeftGym) {
                console.log('🚪 User left gym - stopping foreground service');
                setIsWorkoutActive(false);

                if (lastSessionMinutes.current !== null && lastSessionMinutes.current > 0) {
                    await sendWorkoutEndedNotification(lastSessionMinutes.current);
                }

                await stopForegroundService();
            }

            // Update refs
            wasInGym.current = resp.isInGym;
            lastSessionMinutes.current = resp.currentSessionMinutes;

            // Save to AsyncStorage
            await AsyncStorage.setItem(WAS_IN_GYM_KEY, resp.isInGym.toString());
            await AsyncStorage.setItem(
                LAST_SESSION_MINUTES_KEY,
                (resp.currentSessionMinutes ?? 0).toString()
            );
            await AsyncStorage.setItem(LAST_UPDATE_TIME_KEY, now.toString());
            await AsyncStorage.setItem(LOCATION_STATUS_KEY, JSON.stringify({
                isInGym: resp.isInGym,
                startTime: resp.startTime,
                currentSessionMinutes: resp.currentSessionMinutes
            }));

        } catch (e: any) {
            console.error('❌ sendLocationUpdate error:', e.message);
        } finally {
            isUpdatingRef.current = false;
            await AsyncStorage.removeItem(UPDATE_IN_PROGRESS_KEY);
        }
    }, [userId, onLocationUpdate, startForegroundService, stopForegroundService]);

    /**
     * Starts foreground location watching
     */
    const startForegroundTracking = useCallback(async () => {
        console.log('🟢 Starting foreground tracking');

        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        try {
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: LOCATION_DISTANCE_INTERVAL,
                    timeInterval: LOCATION_UPDATE_INTERVAL,
                },
                async (location) => {
                    await sendLocationUpdate(location);
                }
            );
            console.log('✅ Foreground location watching started');
        } catch (error) {
            console.error('❌ Error starting foreground tracking:', error);
        }

        // Backup interval
        if (!trackingInterval.current) {
            trackingInterval.current = setInterval(async () => {
                if (appState.current === 'active') {
                    await sendLocationUpdate();
                }
            }, LOCATION_UPDATE_INTERVAL);
        }
    }, [sendLocationUpdate]);

    /**
     * Stops foreground location watching
     */
    const stopForegroundTracking = useCallback(() => {
        console.log('🔴 Stopping foreground tracking');

        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }

        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    }, []);

    /**
     * Starts location tracking - only requires "When In Use" permission
     */
    const startTracking = useCallback(async () => {
        if (!userId || isTracking) {
            console.log('⚠️ startTracking: already running or no userId');
            return;
        }

        console.log('🚀 Starting tracking for userId:', userId);

        // Request only "When In Use" permission
        const permissions = await Location.requestForegroundPermissionsAsync();
        console.log('📱 Location permission:', permissions.status);

        if (permissions.status !== 'granted') {
            Alert.alert(
                'Wymagana lokalizacja',
                'Aplikacja potrzebuje dostępu do lokalizacji, aby śledzić Twoje treningi na siłowni.'
            );
            return;
        }

        // Save userId
        await AsyncStorage.setItem(USER_ID_KEY, userId);
        setIsTracking(true);

        // Initial update
        console.log('📍 Sending initial location update...');
        await sendLocationUpdate(undefined, true);

        // Start foreground tracking
        if (appState.current === 'active') {
            await startForegroundTracking();
        }

        // If user was in gym (from persisted state), restart foreground service
        const statusStr = await AsyncStorage.getItem(LOCATION_STATUS_KEY);
        if (statusStr) {
            const status = JSON.parse(statusStr);
            if (status.isInGym) {
                console.log('🏋️ Restoring workout session - starting foreground service');
                await startForegroundService();
                setIsWorkoutActive(true);
            }
        }

        console.log('🎉 Tracking started successfully');
    }, [userId, isTracking, sendLocationUpdate, startForegroundTracking, startForegroundService]);

    /**
     * Stops all location tracking
     */
    const stopTracking = useCallback(async () => {
        console.log('🛑 Stopping tracking...');

        stopForegroundTracking();
        await stopForegroundService();

        await AsyncStorage.multiRemove([
            USER_ID_KEY,
            WAS_IN_GYM_KEY,
            LAST_SESSION_MINUTES_KEY,
            LAST_UPDATE_TIME_KEY,
            LOCATION_STATUS_KEY,
            FOREGROUND_SERVICE_RUNNING_KEY
        ]);

        onLocationUpdate(false, { startTime: null, currentSessionMinutes: null });

        setIsTracking(false);
        setIsWorkoutActive(false);
        wasInGym.current = false;
        lastSessionMinutes.current = null;

        console.log('🎉 Tracking stopped');
    }, [stopForegroundTracking, stopForegroundService, onLocationUpdate]);

    /**
     * Listen to app state changes
     */
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
            const previousState = appState.current;
            appState.current = nextAppState;

            console.log(`📱 AppState: ${previousState} -> ${nextAppState}`);

            if (!isTracking) return;

            // App became active
            if (nextAppState === 'active' && previousState !== 'active') {
                console.log('📱 App active - updating location');

                // Force update when returning to foreground
                await sendLocationUpdate(undefined, true);
                await startForegroundTracking();
            }

            // App went to background
            if (previousState === 'active' && nextAppState !== 'active') {
                console.log('📱 App inactive');
                stopForegroundTracking();

                // If workout is active, foreground service will keep tracking
                if (isWorkoutActive) {
                    console.log('🏋️ Workout active - foreground service will continue');
                }
            }
        });

        return () => subscription.remove();
    }, [isTracking, isWorkoutActive, sendLocationUpdate, startForegroundTracking, stopForegroundTracking]);

    /**
     * Cleanup on unmount
     */
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

    /**
     * Force location update
     */
    const forceUpdate = useCallback(async () => {
        if (isTracking && userId) {
            console.log('🔄 Force update requested');
            await sendLocationUpdate(undefined, true);
        }
    }, [isTracking, userId, sendLocationUpdate]);

    return {
        isTracking,
        isWorkoutActive,
        startTracking,
        stopTracking,
        forceUpdate,
    };
}
