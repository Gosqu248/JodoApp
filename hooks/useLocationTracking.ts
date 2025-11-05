/**
 * BACKGROUND LOCATION TRACKING FOR AUTOMATIC WORKOUT DETECTION
 *
 * This module implements background location tracking for JodoGym fitness app.
 *
 * PURPOSE:
 * - Automatically detect when user enters/exits the gym area
 * - Track workout duration without manual start/stop
 * - Send notifications when workouts begin/end
 * - Record workout history automatically for better fitness tracking
 *
 * USER BENEFITS:
 * - Hands-free workout tracking - no need to remember to start/stop timer
 * - Accurate workout duration - captures exact entry/exit times
 * - Complete workout history - never miss recording a gym session
 * - Workout notifications - stay informed about training progress
 *
 * TECHNICAL IMPLEMENTATION:
 * - Uses Location.startLocationUpdatesAsync with background task
 * - Updates every 3 minutes or 15 meters (battery-efficient)
 * - Sends location to server to detect gym proximity
 * - Shows iOS background location indicator for transparency
 * - Sends local notifications on gym entry/exit
 *
 * PRIVACY & BATTERY:
 * - Location only checked every 3 minutes (not continuous)
 * - Only sends coordinates to server, no other data
 * - Background tracking stops when user logs out
 * - Uses deferred updates for battery efficiency
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

const LOCATION_UPDATE_INTERVAL = 180_000; // 3 minutes - battery-efficient interval
const LOCATION_DISTANCE_INTERVAL = 15; // 15 meters - significant movement threshold
const BACKGROUND_LOCATION_TASK = 'background-location-task';

// AsyncStorage keys for background task
const USER_ID_KEY = 'tracking_user_id';
const WAS_IN_GYM_KEY = 'tracking_was_in_gym';
const LAST_SESSION_MINUTES_KEY = 'tracking_last_session_minutes';
const LAST_UPDATE_TIME_KEY = 'tracking_last_update_time';
const BG_PERMISSION_ALERT_SHOWN_KEY = 'bg_permission_alert_shown';
const LOCATION_STATUS_KEY = 'tracking_location_status'; // New key for persisting status

const LOCATION_CONFIG = {
    accuracy: Location.Accuracy.High,
    distanceInterval: LOCATION_DISTANCE_INTERVAL,
} as const;

interface LocationTrackingState {
    isTracking: boolean;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
    forceUpdate: () => Promise<void>;
}

/**
 * Background task - MUST be defined at module level
 * Runs in a separate context, so it uses AsyncStorage to store data
 */
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
    if (error) {
        console.error('❌ Background location error:', error);
        return;
    }

    if (!data) {
        console.log('⚠️ Background task: no data');
        return;
    }

    try {
        const { locations } = data as { locations: Location.LocationObject[] };

        if (!locations || locations.length === 0) {
            console.log('⚠️ Background task: no locations');
            return;
        }

        const location = locations[0];

        // Get userId from AsyncStorage (saved during startTracking)
        const userId = await AsyncStorage.getItem(USER_ID_KEY);

        if (!userId) {
            console.log('⚠️ Background task: no userId in storage');
            return;
        }

        // Check if enough time has passed since last update
        const lastUpdateTimeStr = await AsyncStorage.getItem(LAST_UPDATE_TIME_KEY);
        const lastUpdateTime = lastUpdateTimeStr ? parseInt(lastUpdateTimeStr, 10) : 0;
        const now = Date.now();

        if (now - lastUpdateTime < LOCATION_UPDATE_INTERVAL - 10000) { // 10s buffer
            console.log('⏱️ Background task: too soon since last update');
            return;
        }

        console.log('📍 Background location update:', {
            userId: userId,
            lat: location.coords.latitude.toFixed(6),
            lng: location.coords.longitude.toFixed(6),
            timestamp: new Date(location.timestamp).toLocaleTimeString(),
            timeSinceLastUpdate: `${Math.round((now - lastUpdateTime) / 1000)}s`
        });

        // Send location to server
        const request: LocationRequest = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };

        console.log('📤 Background: Sending request:', JSON.stringify(request));

        const resp: LocationResponse = await updateLocation(userId, request);

        console.log('✅ Background: Server response:', {
            isInGym: resp.isInGym,
            currentSessionMinutes: resp.currentSessionMinutes,
            startTime: resp.startTime
        });

        // Save update time
        await AsyncStorage.setItem(LAST_UPDATE_TIME_KEY, now.toString());

        // Get previous state from AsyncStorage
        const wasInGymStr = await AsyncStorage.getItem(WAS_IN_GYM_KEY);
        const lastSessionMinutesStr = await AsyncStorage.getItem(LAST_SESSION_MINUTES_KEY);

        const wasInGym = wasInGymStr === 'true';
        const lastSessionMinutes = lastSessionMinutesStr ? parseInt(lastSessionMinutesStr, 10) : null;

        // Detect gym entry
        const justEnteredGym = !wasInGym && resp.isInGym;

        // Detect gym exit
        const justLeftGym = wasInGym && !resp.isInGym;

        // Send notifications
        if (justEnteredGym && resp.startTime) {
            console.log('🏋️ Background: User entered gym');
            await sendWorkoutStartedNotification(resp.startTime);
        }

        if (justLeftGym && lastSessionMinutes !== null && lastSessionMinutes > 0) {
            console.log('✅ Background: User left gym (duration: ' + lastSessionMinutes + 'min)');
            await sendWorkoutEndedNotification(lastSessionMinutes);
        }

        // Save new state to AsyncStorage
        await AsyncStorage.setItem(WAS_IN_GYM_KEY, resp.isInGym.toString());
        await AsyncStorage.setItem(
            LAST_SESSION_MINUTES_KEY,
            (resp.currentSessionMinutes ?? 0).toString()
        );

        // Save location status for context recovery
        await AsyncStorage.setItem(LOCATION_STATUS_KEY, JSON.stringify({
            isInGym: resp.isInGym,
            startTime: resp.startTime,
            currentSessionMinutes: resp.currentSessionMinutes
        }));

    } catch (error: any) {
        console.error('❌ Background task error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
            stack: error.stack?.split('\n').slice(0, 3).join('\n')
        });

        // Log specific error types
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.error('🔒 Background: Authentication error');
        } else if (error.response?.status === 500) {
            console.error('🔥 Background: Server error');
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            console.error('⏰ Background: Request timeout');
        } else if (error.message?.includes('Network')) {
            console.error('📡 Background: Network error');
        }
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

    const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const appState = useRef(AppState.currentState);
    const lastLocationUpdate = useRef<number>(0);
    const wasInGym = useRef<boolean>(false);
    const lastSessionMinutes = useRef<number | null>(null);
    const hasBackgroundPermission = useRef<boolean>(false);

    /**
     * Load persisted location status from AsyncStorage on mount
     */
    useEffect(() => {
        const loadPersistedStatus = async () => {
            try {
                const statusStr = await AsyncStorage.getItem(LOCATION_STATUS_KEY);
                if (statusStr) {
                    const status = JSON.parse(statusStr);
                    console.log('📍 Loaded persisted location status:', status);
                    onLocationUpdate(status.isInGym, {
                        startTime: status.startTime,
                        currentSessionMinutes: status.currentSessionMinutes
                    });
                    wasInGym.current = status.isInGym;
                    lastSessionMinutes.current = status.currentSessionMinutes;
                }
            } catch (error) {
                console.error('❌ Error loading persisted status:', error);
            }
        };

        loadPersistedStatus();
    }, []);

    /**
     * Sends location update to server
     */
    const sendLocationUpdate = useCallback(async (location?: Location.LocationObject, forceUpdate: boolean = false) => {
        if (!userId) {
            console.log('⚠️ sendLocationUpdate: No userId');
            return;
        }

        const now = Date.now();
        const timeSinceLastUpdate = now - lastLocationUpdate.current;

        if (!forceUpdate && timeSinceLastUpdate < LOCATION_UPDATE_INTERVAL) {
            console.log(`⏱️ sendLocationUpdate: Too soon for next update (${Math.round(timeSinceLastUpdate / 1000)}s since last)`);
            return;
        }

        try {
            const loc = location || await Location.getCurrentPositionAsync(LOCATION_CONFIG);

            const request: LocationRequest = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };

            console.log('📍 Foreground location update:', {
                userId: userId,
                lat: loc.coords.latitude.toFixed(6),
                lng: loc.coords.longitude.toFixed(6),
                accuracy: loc.coords.accuracy?.toFixed(2),
                forceUpdate: forceUpdate,
                timeSinceLastUpdate: `${Math.round(timeSinceLastUpdate / 1000)}s`
            });

            console.log('📤 Foreground: Sending request:', JSON.stringify(request));

            const resp: LocationResponse = await updateLocation(userId, request);

            console.log('✅ Foreground: Server response:', {
                isInGym: resp.isInGym,
                currentSessionMinutes: resp.currentSessionMinutes,
                startTime: resp.startTime
            });

            lastLocationUpdate.current = now;

            // Detect status changes
            const justEnteredGym = !wasInGym.current && resp.isInGym;
            const justLeftGym = wasInGym.current && !resp.isInGym;

            // Update context via callback
            onLocationUpdate(resp.isInGym, {
                startTime: resp.startTime,
                currentSessionMinutes: resp.currentSessionMinutes
            });

            // Send notifications
            if (justEnteredGym && resp.startTime) {
                console.log('🏋️ Foreground: User entered gym');
                await sendWorkoutStartedNotification(resp.startTime);
            }

            if (justLeftGym && lastSessionMinutes.current !== null && lastSessionMinutes.current > 0) {
                console.log('✅ Foreground: User left gym');
                await sendWorkoutEndedNotification(lastSessionMinutes.current);
            }

            // Update references
            wasInGym.current = resp.isInGym;
            lastSessionMinutes.current = resp.currentSessionMinutes;

            // Save to AsyncStorage (for background task and persistence)
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
            console.error('❌ sendLocationUpdate error:', {
                message: e.message,
                status: e.response?.status,
                statusText: e.response?.statusText,
                data: e.response?.data,
                config: {
                    url: e.config?.url,
                    method: e.config?.method,
                    baseURL: e.config?.baseURL,
                    headers: e.config?.headers,
                },
                stack: e.stack?.split('\n').slice(0, 3).join('\n')
            });

            // Log specific error types
            if (e.response?.status === 401 || e.response?.status === 403) {
                console.error('🔒 Foreground: Authentication error - user may need to re-login');
            } else if (e.response?.status === 500) {
                console.error('🔥 Foreground: Server error - check backend logs:', e.response?.data);
            } else if (e.response?.status === 400) {
                console.error('⚠️ Foreground: Bad request - invalid data sent:', e.response?.data);
            } else if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
                console.error('⏰ Foreground: Request timeout');
            } else if (e.message?.includes('Network')) {
                console.error('📡 Foreground: Network error - check internet connection');
            }
        }
    }, [userId, onLocationUpdate]);

    /**
     * Starts foreground location tracking (watchPositionAsync + interval)
     */
    const startForegroundTracking = useCallback(async () => {
        console.log('🟢 Starting foreground tracking');

        // Stop any existing foreground tracking
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        // Start foreground subscription
        try {
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: LOCATION_DISTANCE_INTERVAL,
                },
                async (location) => {
                    await sendLocationUpdate(location);
                }
            );
            console.log('✅ Foreground location subscription started');
        } catch (error) {
            console.error('❌ Error starting foreground tracking:', error);
        }

        // Start interval as backup
        if (!trackingInterval.current) {
            trackingInterval.current = setInterval(async () => {
                if (appState.current === 'active') {
                    console.log('⏰ Interval update (foreground)');
                    await sendLocationUpdate();
                }
            }, LOCATION_UPDATE_INTERVAL);
            console.log('✅ Interval timer started');
        }
    }, [sendLocationUpdate]);

    /**
     * Stops foreground location tracking
     */
    const stopForegroundTracking = useCallback(() => {
        console.log('🔴 Stopping foreground tracking');

        // Clear interval
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }

        // Stop foreground subscription
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    }, []);

    /**
     * Starts location tracking (foreground + background)
     */
    const startTracking = useCallback(async () => {
        if (!userId || isTracking) {
            console.log('⚠️ startTracking: already running or no userId', { userId, isTracking });
            return;
        }

        console.log('🚀 Starting tracking for userId:', userId);

        // Step 1: Request foreground permissions
        const fgPermissions = await Location.requestForegroundPermissionsAsync();
        console.log('📱 Foreground permissions:', fgPermissions.status);

        if (fgPermissions.status !== 'granted') {
            Alert.alert(
                'Błąd',
                'Aplikacja wymaga dostępu do lokalizacji.'
            );
            return;
        }

        // Step 2: Request background permissions
        const bgPermissions = await Location.requestBackgroundPermissionsAsync();
        const hasBgPermission = bgPermissions.status === 'granted';
        hasBackgroundPermission.current = hasBgPermission;

        console.log('📱 Background permissions:', bgPermissions.status);

        if (!hasBgPermission) {
            // Check if alert was already shown
            const alertShown = await AsyncStorage.getItem(BG_PERMISSION_ALERT_SHOWN_KEY);

            if (!alertShown) {
                Alert.alert(
                    'Ograniczone uprawnienia',
                    'Bez dostępu do lokalizacji w tle, śledzenie będzie działać tylko gdy aplikacja jest otwarta.',
                    [{ text: 'OK' }]
                );
                // Mark alert as shown
                await AsyncStorage.setItem(BG_PERMISSION_ALERT_SHOWN_KEY, 'true');
                console.log('⚠️ Background permission alert shown (first time)');
            } else {
                console.log('ℹ️ Background permission denied, but alert already shown before');
            }
        } else {
            // User granted permission, reset the alert flag so if they revoke it later, they'll see the alert again
            await AsyncStorage.removeItem(BG_PERMISSION_ALERT_SHOWN_KEY);
            console.log('✅ Background permission granted, alert flag reset');
        }

        // Save userId to AsyncStorage (for background task)
        await AsyncStorage.setItem(USER_ID_KEY, userId);
        console.log('💾 Saved userId to AsyncStorage:', userId);

        setIsTracking(true);

        // Step 3: First update immediately
        console.log('📍 Sending initial location update...');
        await sendLocationUpdate(undefined, true);

        // Step 4: Start background tracking (if we have permissions)
        if (hasBgPermission) {
            try {
                const isTaskDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
                if (!isTaskDefined) {
                    console.error('❌ Background task is not defined!');
                } else {
                    console.log('✅ Background task is defined');
                }

                const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
                if (hasStarted) {
                    console.log('⚠️ Background tracking already running - stopping and restarting');
                    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
                }

                await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                    accuracy: Location.Accuracy.High,
                    timeInterval: LOCATION_UPDATE_INTERVAL,
                    distanceInterval: LOCATION_DISTANCE_INTERVAL,
                    deferredUpdatesInterval: LOCATION_UPDATE_INTERVAL,
                    foregroundService: {
                        notificationTitle: 'JodoGym śledzi treningi',
                        notificationBody: 'Automatyczne wykrywanie treningów jest włączone',
                    },
                    // iOS
                    showsBackgroundLocationIndicator: true,
                    pausesUpdatesAutomatically: false,
                });

                console.log('✅ Background location tracking started');
            } catch (error) {
                console.error('❌ Error starting background tracking:', error);
            }
        }

        // Step 5: Start foreground tracking only if app is active
        if (appState.current === 'active') {
            await startForegroundTracking();
        }

        console.log('🎉 Tracking started successfully');
    }, [userId, isTracking, sendLocationUpdate, startForegroundTracking]);

    /**
     * Stops location tracking
     */
    const stopTracking = useCallback(async () => {
        console.log('🛑 Stopping tracking...');

        // Stop foreground tracking
        stopForegroundTracking();

        // Stop background tracking
        try {
            const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
            if (hasStarted) {
                await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
                console.log('✅ Background tracking stopped');
            }
        } catch (error) {
            console.error('❌ Error stopping background tracking:', error);
        }

        // Clear AsyncStorage (but keep BG_PERMISSION_ALERT_SHOWN_KEY to avoid showing alert again)
        await AsyncStorage.multiRemove([
            USER_ID_KEY,
            WAS_IN_GYM_KEY,
            LAST_SESSION_MINUTES_KEY,
            LAST_UPDATE_TIME_KEY,
            LOCATION_STATUS_KEY
        ]);
        console.log('💾 Cleared AsyncStorage');

        // Reset state via callback
        onLocationUpdate(false, { startTime: null, currentSessionMinutes: null });

        // Reset local refs
        setIsTracking(false);
        wasInGym.current = false;
        lastSessionMinutes.current = null;
        hasBackgroundPermission.current = false;

        console.log('🎉 Tracking stopped completely');
    }, [stopForegroundTracking, onLocationUpdate]);

    /**
     * Listen to app state changes
     */
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            const previousState = appState.current;
            appState.current = nextAppState;

            console.log(`📱 AppState: ${previousState} -> ${nextAppState}`);

            if (!isTracking) return;

            // When app moves to foreground
            if (nextAppState === 'active' && previousState !== 'active') {
                console.log('📱 App became active - starting foreground tracking');

                // Force immediate update when returning to foreground
                const now = Date.now();
                if (now - lastLocationUpdate.current >= LOCATION_UPDATE_INTERVAL) {
                    sendLocationUpdate(undefined, true);
                }

                // Start foreground tracking
                startForegroundTracking();
            }

            // When app moves to background
            if (previousState === 'active' && nextAppState !== 'active') {
                console.log('📱 App became inactive - stopping foreground tracking');

                // Stop foreground tracking (background task will continue)
                stopForegroundTracking();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [isTracking, sendLocationUpdate, startForegroundTracking, stopForegroundTracking]);

    /**
     * Cleanup only when component is unmounted PERMANENTLY
     */
    useEffect(() => {
        return () => {
            console.log('⚠️ LocationTracking component unmounting');

            // Clear timers and subscriptions
            if (trackingInterval.current) {
                clearInterval(trackingInterval.current);
            }
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    /**
     * Force an immediate location update
     */
    const forceUpdate = useCallback(async () => {
        if (isTracking && userId) {
            console.log('🔄 Force update requested');
            await sendLocationUpdate(undefined, true);
        } else {
            console.log('⚠️ Cannot force update: isTracking:', isTracking, 'userId:', userId);
        }
    }, [isTracking, userId, sendLocationUpdate]);

    return {
        isTracking,
        startTracking,
        stopTracking,
        forceUpdate
    };
}