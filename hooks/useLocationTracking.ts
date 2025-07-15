import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert, Platform } from 'react-native';
import { startActivity, endActivity } from '@/api/activity';
import { ActivityResponse } from '@/types/ActivityResponse';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GYM_COORDINATES = {
    latitude: 49.84906983966339,
    longitude: 20.74353823284158,
    radius: 50, // w metrach
};

const LOCATION_TASK_NAME = 'background-location-task';
const STORAGE_KEYS = {
    CURRENT_ACTIVITY: 'current_activity',
    IS_IN_GYM: 'is_in_gym',
    USER_ID: 'user_id',
};

interface LocationTrackingState {
    isTracking: boolean;
    currentActivity: ActivityResponse | null;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
    isInGym: boolean;
}

// Obsługa lokalizacji w tle
const handleBackgroundLocation = async (location: Location.LocationObject) => {
    try {
        const isInGym = isLocationInGym(location.coords);
        const storedActivity = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
        const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
        const wasInGym = (await AsyncStorage.getItem(STORAGE_KEYS.IS_IN_GYM)) === 'true';

        console.log('Background location update:', {
            isInGym,
            wasInGym,
            hasActivity: !!storedActivity,
            userId: storedUserId
        });

        // Wejście do siłowni - rozpocznij aktywność
        if (isInGym && !wasInGym && !storedActivity && storedUserId) {
            try {
                const activity = await startActivity(storedUserId);
                await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_ACTIVITY, JSON.stringify(activity));
                console.log('Activity started in background:', activity.id);
            } catch (error) {
                console.error('Error starting activity in background:', error);
            }
        }

        // Wyjście z siłowni - zakończ aktywność
        if (!isInGym && wasInGym && storedActivity) {
            try {
                const activity = JSON.parse(storedActivity) as ActivityResponse;
                await endActivity(activity.id);
                await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ACTIVITY);
                console.log('Activity ended in background:', activity.id);
            } catch (error) {
                console.error('Error ending activity in background:', error);
            }
        }

        // Zawsze aktualizuj stan lokalizacji
        await AsyncStorage.setItem(STORAGE_KEYS.IS_IN_GYM, isInGym.toString());
    } catch (error) {
        console.error('Error in background handler:', error);
    }
};

// TaskManager dla background updates
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Location task error:', error);
        return;
    }
    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        if (locations && locations.length > 0) {
            await handleBackgroundLocation(locations[0]);
        }
    }
});

// Sprawdzenie, czy w obrębie siłowni
function isLocationInGym(coords: { latitude: number; longitude: number }): boolean {
    const distance = calculateDistance(
        coords.latitude,
        coords.longitude,
        GYM_COORDINATES.latitude,
        GYM_COORDINATES.longitude
    );
    return distance <= GYM_COORDINATES.radius;
}

function calculateDistance(
    lat1: number, lon1: number, lat2: number, lon2: number
): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function useLocationTracking(userId: string | null): LocationTrackingState {
    const [isTracking, setIsTracking] = useState(false);
    const [currentActivity, setCurrentActivity] = useState<ActivityResponse | null>(null);
    const [isInGym, setIsInGym] = useState(false);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const storedActivity = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
                const storedInGym = await AsyncStorage.getItem(STORAGE_KEYS.IS_IN_GYM);

                if (storedActivity) {
                    setCurrentActivity(JSON.parse(storedActivity));
                }
                if (storedInGym) {
                    setIsInGym(storedInGym === 'true');
                }
            } catch (error) {
                console.error('Error loading stored data:', error);
            }
        };

        loadStoredData();
    }, []);

    useEffect(() => {
        const checkStorageChanges = async () => {
            try {
                const storedActivity = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
                const storedInGym = await AsyncStorage.getItem(STORAGE_KEYS.IS_IN_GYM);

                if (storedActivity) {
                    const activity = JSON.parse(storedActivity);
                    setCurrentActivity(activity);
                } else {
                    setCurrentActivity(null);
                }

                if (storedInGym) {
                    setIsInGym(storedInGym === 'true');
                }
            } catch (error) {
                console.error('Error checking storage changes:', error);
            }
        };

        const interval = setInterval(checkStorageChanges, 2000); // Sprawdzaj co 2 sekundy
        return () => clearInterval(interval);
    }, []);

    // Zapisz lub usuń userId
    useEffect(() => {
        if (userId) {
            AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        } else {
            AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
        }
    }, [userId]);

    // Cleanup przy odmontowaniu
    useEffect(() => {
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    // Sterowanie faktycznym śledzeniem przy zmianie isTracking
    useEffect(() => {
        if (isTracking && userId) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
    }, [isTracking, userId]);

    const requestPermissions = async (): Promise<boolean> => {
        try {
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            if (foregroundStatus !== Location.PermissionStatus.GRANTED) {
                Alert.alert(
                    'Brak uprawnień',
                    'Aplikacja potrzebuje dostępu do lokalizacji, aby śledzić Twoją aktywność.'
                );
                return false;
            }

            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus !== Location.PermissionStatus.GRANTED) {
                if (Platform.OS === 'android') {
                    Alert.alert(
                        'Brak uprawnień w tle',
                        'Włącz uprawnienia lokalizacji w tle, aby działało poprawnie.'
                    );
                }
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    };

    const startLocationTracking = async () => {
        const ok = await requestPermissions();
        if (!ok) return;

        // Pojedyncze subskrypcje w foreground
        if (!locationSubscription.current) {
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 1,
                },
                handleLocationUpdate
            );
        }

        // Uruchom background tracking
        try {
            const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
            if (!isTaskRegistered) {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 15000, // Zmniejszone z 30000 na 15000 dla szybszego reagowania
                    distanceInterval: 5, // Zmniejszone z 10 na 5 dla lepszej dokładności
                    deferredUpdatesInterval: 30000, // Zmniejszone z 60000
                    foregroundService:
                        Platform.OS === 'android'
                            ? {
                                notificationTitle: 'Śledzenie aktywności',
                                notificationBody: 'Aplikacja śledzi Twoją aktywność w siłowni',
                                notificationColor: '#ffc500',
                            }
                            : undefined,
                    pausesUpdatesAutomatically: false,
                });
            }
        } catch (error) {
            console.error('Error starting background location:', error);
        }
    };

    const stopLocationTracking = async () => {
        try {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }

            const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
            if (isTaskRegistered) {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }

            // Jeśli było uruchomione Activity, zakończ je
            const storedActivity = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
            if (storedActivity) {
                const activity = JSON.parse(storedActivity) as ActivityResponse;
                await endActivity(activity.id);
                await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ACTIVITY);
                setCurrentActivity(null);
            }
        } catch (error) {
            console.error('Error stopping location tracking:', error);
        }
    };

    const handleLocationUpdate = async (location: Location.LocationObject) => {
        try {
            const nowInGym = isLocationInGym(location.coords);
            const previousInGym = isInGym;

            console.log('Foreground location update:', {
                nowInGym,
                previousInGym,
                hasActivity: !!currentActivity,
                userId
            });

            // Aktualizuj stan
            setIsInGym(nowInGym);
            await AsyncStorage.setItem(STORAGE_KEYS.IS_IN_GYM, nowInGym.toString());

            // Wejście do siłowni - rozpocznij aktywność
            if (nowInGym && !previousInGym && !currentActivity && userId) {
                try {
                    const activity = await startActivity(userId);
                    setCurrentActivity(activity);
                    await AsyncStorage.setItem(
                        STORAGE_KEYS.CURRENT_ACTIVITY,
                        JSON.stringify(activity)
                    );
                    console.log('Activity started in foreground:', activity.id);
                } catch (error) {
                    console.error('Error starting activity in foreground:', error);
                }
            }

            // Wyjście z siłowni - zakończ aktywność
            if (!nowInGym && previousInGym && currentActivity) {
                try {
                    await endActivity(currentActivity.id);
                    setCurrentActivity(null);
                    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ACTIVITY);
                    console.log('Activity ended in foreground:', currentActivity.id);
                } catch (error) {
                    console.error('Error ending activity in foreground:', error);
                }
            }
        } catch (error) {
            console.error('Error in handleLocationUpdate:', error);
        }
    };

    const startTracking = async () => {
        if (!userId) {
            console.log('Brak userId, nie można rozpocząć śledzenia');
            return;
        }
        setIsTracking(true);
    };

    const stopTracking = async () => {
        setIsTracking(false);
    };

    return {
        isTracking,
        currentActivity,
        startTracking,
        stopTracking,
        isInGym,
    };
}