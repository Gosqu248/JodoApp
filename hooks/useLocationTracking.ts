import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert } from 'react-native';
import { startActivity, endActivity } from '@/api/activity';
import { ActivityResponse } from '@/types/ActivityResponse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, sendWorkoutStartedNotification } from '@/utils/notifications';
import { calculateDistance } from '@/utils/calculateDistance';

// ================== CONSTANTS ==================
const GYM_COORDINATES = {
    latitude: 49.84906983966339, //49.813937 poprawne
    longitude: 20.74353823284158, //20.680089 poprawne
    radius: 1, // 18 poprawne
} as const;

const LOCATION_TASK_NAME = 'background-location-task';

const STORAGE_KEYS = {
    CURRENT_ACTIVITY: 'current_activity',
    USER_ID: 'user_id_for_background',
    IS_PROCESSING: 'is_processing_activity',
} as const;

const LOCATION_CONFIG = {
    FOREGROUND: {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
    },
    BACKGROUND: {
        accuracy: Location.Accuracy.High,
        timeInterval: 60000,
        distanceInterval: 5,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
            notificationTitle: 'Śledzenie aktywności',
            notificationBody: 'Aplikacja monitoruje Twoją lokalizację, aby śledzić treningi.',
            notificationColor: '#ffc500',
        },
    },
} as const;

// ================== INTERFACES ==================
interface LocationTrackingState {
    currentActivity: ActivityResponse | null;
    isInGym: boolean;
    isTracking: boolean;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
}

// ================== UTILITY FUNCTIONS ==================
/**
 * Checks if the given location is within the gym area
 */
function isLocationInGym(coords: { latitude: number; longitude: number }): boolean {
    const distance = calculateDistance(
        coords.latitude,
        coords.longitude,
        GYM_COORDINATES.latitude,
        GYM_COORDINATES.longitude
    );
    return distance <= GYM_COORDINATES.radius;
}

/**
 * Mutex to prevent concurrent operations on activity
 */
class ActivityMutex {
    private static isLocked = false;
    private static lockTimeout: number | null = null;

    static async acquire(): Promise<boolean> {
        if (this.isLocked) {
            return false;
        }

        this.isLocked = true;

        // Automatic release after 5 seconds (safety measure)
        this.lockTimeout = setTimeout(() => {
            this.release();
        }, 5000) as unknown as number;

        return true;
    }

    static release(): void {
        this.isLocked = false;
        if (this.lockTimeout) {
            clearTimeout(this.lockTimeout as unknown as NodeJS.Timeout);
            this.lockTimeout = null;
        }
    }
}

// ================== ACTIVITY MANAGEMENT ==================
/**
 * Activity state management with duplication protection
 */
const ActivityManager = {
    /**
     * Starts a new activity
     */
    async startNewActivity(userId: string): Promise<ActivityResponse | null> {
        if (!(await ActivityMutex.acquire())) {
            console.log('Operation already in progress, skipping duplicate');
            return null;
        }

        try {
            // Check if there's already an active session
            const existingActivity = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
            if (existingActivity) {
                console.log('Activity already exists, skipping new creation');
                return JSON.parse(existingActivity);
            }

            // Start new activity
            console.log('Starting new activity for user:', userId);
            const newActivity = await startActivity(userId);

            // Save to storage
            await AsyncStorage.setItem(
                STORAGE_KEYS.CURRENT_ACTIVITY,
                JSON.stringify(newActivity)
            );

            // Show gym entry alert
            Alert.alert(
                '🏋️ Witaj na siłowni!',
                'Trening został automatycznie rozpoczęty.',
                [{ text: 'OK' }]
            );

            // Send notification
            await sendWorkoutStartedNotification(new Date(newActivity.startTime));

            return newActivity;
        } catch (error) {
            console.error('Error starting activity:', error);
            return null;
        } finally {
            ActivityMutex.release();
        }
    },

    /**
     * Ends current activity
     */
    async endCurrentActivity(activityId: string): Promise<void> {
        if (!(await ActivityMutex.acquire())) {
            console.log('Operation already in progress, skipping duplicate');
            return;
        }

        try {
            console.log('Ending activity:', activityId);
            await endActivity(activityId);
            await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ACTIVITY);

            // Workout completion alert
            Alert.alert(
                '✅ Trening zakończony',
                'Twój trening został automatycznie zapisany.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error ending activity:', error);
        } finally {
            ActivityMutex.release();
        }
    },

    /**
     * Updates activity status based on location
     */
    async updateActivityStatus(
        isInGym: boolean,
        userId: string | null
    ): Promise<ActivityResponse | null> {
        // Get current state
        const storedActivityStr = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
        const currentActivity = storedActivityStr ? JSON.parse(storedActivityStr) : null;
        const wasInGym = !!currentActivity;

        // Entering gym
        if (isInGym && !wasInGym && userId) {
            return await this.startNewActivity(userId);
        }

        // Leaving gym
        if (!isInGym && wasInGym && currentActivity) {
            await this.endCurrentActivity(currentActivity.id);
            return null;
        }

        return currentActivity;
    }
};

// ================== BACKGROUND TASK ==================
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('[BACKGROUND] Task error:', error);
        return;
    }

    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        if (locations && locations.length > 0) {
            const location = locations[0];
            const inGym = isLocationInGym(location.coords);

            console.log('[BACKGROUND] Gym status:', {
                isInGym: inGym,
                timestamp: new Date().toISOString(),
                coords: location.coords
            });

            const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
            if (userId) {
                await ActivityManager.updateActivityStatus(inGym, userId);
            }
        }
    }
});

// ================== MAIN HOOK ==================
export function useLocationTracking(userId: string | null): LocationTrackingState {
    const [currentActivity, setCurrentActivity] = useState<ActivityResponse | null>(null);
    const [isInGym, setIsInGym] = useState(false);
    const [isTracking, setIsTracking] = useState(false);

    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const lastLocationUpdate = useRef<number>(0);
    const initializationDone = useRef(false);

    /**
     * Initialization - load state from AsyncStorage
     */
    useEffect(() => {
        if (initializationDone.current) return;

        const loadInitialState = async () => {
            try {
                const storedActivity = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
                if (storedActivity) {
                    const activity = JSON.parse(storedActivity);
                    setCurrentActivity(activity);
                    setIsInGym(true);
                    console.log('Loaded existing activity:', activity.id);
                }
            } catch (error) {
                console.error('Error loading initial state:', error);
            }
        };

        void loadInitialState();
        initializationDone.current = true;
    }, []);

    /**
     * Save userId for background task
     */
    useEffect(() => {
        if (userId) {
            void AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        } else {
            void AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
        }
    }, [userId]);

    /**
     * Handle location updates (foreground)
     */
    const handleLocationUpdate = useCallback(async (location: Location.LocationObject) => {
        // Debouncing - ignore updates more frequent than every 3 seconds
        const now = Date.now();
        if (now - lastLocationUpdate.current < 3000) {
            return;
        }
        lastLocationUpdate.current = now;

        const nowInGym = isLocationInGym(location.coords);
        const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            GYM_COORDINATES.latitude,
            GYM_COORDINATES.longitude
        );

        console.log('[FOREGROUND] Location:', {
            isInGym: nowInGym,
            distance: `${distance.toFixed(2)}m`,
            timestamp: new Date().toISOString()
        });

        // Update state only if it changed
        if (nowInGym !== isInGym) {
            setIsInGym(nowInGym);
            const updatedActivity = await ActivityManager.updateActivityStatus(nowInGym, userId);
            setCurrentActivity(updatedActivity);
        }
    }, [userId, isInGym]);

    /**
     * Start location tracking
     */
    const startTracking = useCallback(async () => {
        if (!userId || isTracking) {
            console.log('Tracking already active or missing userId');
            return;
        }

        try {
            // Check permissions
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            if (foregroundStatus !== 'granted') {
                Alert.alert('Błąd', 'Aplikacja potrzebuje dostępu do lokalizacji.');
                return;
            }

            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus !== 'granted') {
                Alert.alert(
                    'Uwaga',
                    'Brak uprawnień do lokalizacji w tle. Śledzenie będzie działać tylko gdy aplikacja jest aktywna.'
                );
            }

            // Register notifications
            await registerForPushNotificationsAsync();

            // Start background tracking (if we have permissions)
            if (backgroundStatus === 'granted' &&
                !(await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME))) {
                await Location.startLocationUpdatesAsync(
                    LOCATION_TASK_NAME,
                    LOCATION_CONFIG.BACKGROUND
                );
                console.log('Started background tracking');
            }

            // Start foreground tracking
            if (!locationSubscription.current) {
                locationSubscription.current = await Location.watchPositionAsync(
                    LOCATION_CONFIG.FOREGROUND,
                    handleLocationUpdate
                );
                console.log('Started foreground tracking');
            }

            setIsTracking(true);
        } catch (error) {
            console.error('Error starting tracking:', error);
            Alert.alert('Błąd', 'Nie udało się uruchomić śledzenia lokalizacji.');
        }
    }, [userId, isTracking, handleLocationUpdate]);

    /**
     * Stop location tracking
     */
    const stopTracking = useCallback(async () => {
        try {
            // Stop foreground tracking
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }

            // Stop background task
            if (await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)) {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }

            // End activity if in progress
            if (currentActivity) {
                await ActivityManager.endCurrentActivity(currentActivity.id);
                setCurrentActivity(null);
                setIsInGym(false);
            }

            setIsTracking(false);
            console.log('Stopped location tracking');
        } catch (error) {
            console.error('Error stopping tracking:', error);
        }
    }, [currentActivity]);

    /**
     * Cleanup on component unmount
     */
    useEffect(() => {
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    return {
        currentActivity,
        isInGym,
        isTracking,
        startTracking,
        stopTracking,
    };
}