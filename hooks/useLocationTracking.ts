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
    radius: 10, // 18 poprawne
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
 * Sprawdza czy podana lokalizacja znajduje się w obrębie siłowni
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
 * Mutex do zapobiegania równoczesnym operacjom na aktywności
 */
class ActivityMutex {
    private static isLocked = false;
    private static lockTimeout: NodeJS.Timeout | null = null;

    static async acquire(): Promise<boolean> {
        if (this.isLocked) {
            return false;
        }

        this.isLocked = true;

        // Automatyczne zwolnienie po 5 sekundach (zabezpieczenie)
        this.lockTimeout = setTimeout(() => {
            this.release();
        }, 5000);

        return true;
    }

    static release(): void {
        this.isLocked = false;
        if (this.lockTimeout) {
            clearTimeout(this.lockTimeout);
            this.lockTimeout = null;
        }
    }
}

// ================== ACTIVITY MANAGEMENT ==================
/**
 * Zarządzanie stanem aktywności z zabezpieczeniem przed duplikacją
 */
const ActivityManager = {
    /**
     * Rozpoczyna nową aktywność
     */
    async startNewActivity(userId: string): Promise<ActivityResponse | null> {
        if (!(await ActivityMutex.acquire())) {
            console.log('Operacja już w toku, pomijam duplikat');
            return null;
        }

        try {
            // Sprawdź czy nie ma już aktywnej sesji
            const existingActivity = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
            if (existingActivity) {
                console.log('Aktywność już istnieje, pomijam tworzenie nowej');
                return JSON.parse(existingActivity);
            }

            // Rozpocznij nową aktywność
            console.log('Rozpoczynam nową aktywność dla użytkownika:', userId);
            const newActivity = await startActivity(userId);

            // Zapisz do storage
            await AsyncStorage.setItem(
                STORAGE_KEYS.CURRENT_ACTIVITY,
                JSON.stringify(newActivity)
            );

            // Wyświetl alert o wejściu na siłownię
            Alert.alert(
                '🏋️ Witaj na siłowni!',
                'Trening został automatycznie rozpoczęty.',
                [{ text: 'OK' }]
            );

            // Wyślij powiadomienie
            await sendWorkoutStartedNotification(new Date(newActivity.startTime));

            return newActivity;
        } catch (error) {
            console.error('Błąd podczas rozpoczynania aktywności:', error);
            return null;
        } finally {
            ActivityMutex.release();
        }
    },

    /**
     * Kończy bieżącą aktywność
     */
    async endCurrentActivity(activityId: string): Promise<void> {
        if (!(await ActivityMutex.acquire())) {
            console.log('Operacja już w toku, pomijam duplikat');
            return;
        }

        try {
            console.log('Kończę aktywność:', activityId);
            await endActivity(activityId);
            await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ACTIVITY);

            // Alert o zakończeniu treningu
            Alert.alert(
                '✅ Trening zakończony',
                'Twój trening został automatycznie zapisany.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Błąd podczas kończenia aktywności: ' , error);
        } finally {
            ActivityMutex.release();
        }
    },

    /**
     * Aktualizuje status aktywności na podstawie lokalizacji
     */
    async updateActivityStatus(
        isInGym: boolean,
        userId: string | null
    ): Promise<ActivityResponse | null> {
        // Pobierz aktualny stan
        const storedActivityStr = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
        const currentActivity = storedActivityStr ? JSON.parse(storedActivityStr) : null;
        const wasInGym = !!currentActivity;

        // Wejście do siłowni
        if (isInGym && !wasInGym && userId) {
            return await this.startNewActivity(userId);
        }

        // Wyjście z siłowni
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
        console.error('[BACKGROUND] Błąd zadania:', error);
        return;
    }

    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        if (locations && locations.length > 0) {
            const location = locations[0];
            const inGym = isLocationInGym(location.coords);

            console.log('[BACKGROUND] Status siłowni:', {
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
     * Inicjalizacja - wczytanie stanu z AsyncStorage
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
                    console.log('Wczytano istniejącą aktywność:', activity.id);
                }
            } catch (error) {
                console.error('Błąd wczytywania stanu początkowego:', error);
            }
        };

        loadInitialState();
        initializationDone.current = true;
    }, []);

    /**
     * Zapisywanie userId dla zadania w tle
     */
    useEffect(() => {
        if (userId) {
            AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        } else {
            AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
        }
    }, [userId]);

    /**
     * Obsługa aktualizacji lokalizacji (foreground)
     */
    const handleLocationUpdate = useCallback(async (location: Location.LocationObject) => {
        // Debouncing - ignoruj aktualizacje częstsze niż co 3 sekundy
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

        console.log('[FOREGROUND] Lokalizacja:', {
            isInGym: nowInGym,
            distance: `${distance.toFixed(2)}m`,
            timestamp: new Date().toISOString()
        });

        // Aktualizuj stan tylko jeśli się zmienił
        if (nowInGym !== isInGym) {
            setIsInGym(nowInGym);
            const updatedActivity = await ActivityManager.updateActivityStatus(nowInGym, userId);
            setCurrentActivity(updatedActivity);
        }
    }, [userId, isInGym]);

    /**
     * Rozpoczęcie śledzenia lokalizacji
     */
    const startTracking = useCallback(async () => {
        if (!userId || isTracking) {
            console.log('Śledzenie już aktywne lub brak userId');
            return;
        }

        try {
            // Sprawdź uprawnienia
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

            // Rejestracja powiadomień
            await registerForPushNotificationsAsync();

            // Uruchom śledzenie w tle (jeśli mamy uprawnienia)
            if (backgroundStatus === 'granted' &&
                !(await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME))) {
                await Location.startLocationUpdatesAsync(
                    LOCATION_TASK_NAME,
                    LOCATION_CONFIG.BACKGROUND
                );
                console.log('Uruchomiono śledzenie w tle');
            }

            // Uruchom śledzenie na pierwszym planie
            if (!locationSubscription.current) {
                locationSubscription.current = await Location.watchPositionAsync(
                    LOCATION_CONFIG.FOREGROUND,
                    handleLocationUpdate
                );
                console.log('Uruchomiono śledzenie na pierwszym planie');
            }

            setIsTracking(true);
        } catch (error) {
            console.error('Błąd podczas uruchamiania śledzenia:', error);
            Alert.alert('Błąd', 'Nie udało się uruchomić śledzenia lokalizacji.');
        }
    }, [userId, isTracking, handleLocationUpdate]);

    /**
     * Zatrzymanie śledzenia lokalizacji
     */
    const stopTracking = useCallback(async () => {
        try {
            // Zatrzymaj śledzenie na pierwszym planie
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }

            // Zatrzymaj zadanie w tle
            if (await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)) {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }

            // Zakończ aktywność jeśli jest w toku
            if (currentActivity) {
                await ActivityManager.endCurrentActivity(currentActivity.id);
                setCurrentActivity(null);
                setIsInGym(false);
            }

            setIsTracking(false);
            console.log('Zatrzymano śledzenie lokalizacji');
        } catch (error) {
            console.error('Błąd podczas zatrzymywania śledzenia:', error);
        }
    }, [currentActivity]);

    /**
     * Cleanup przy odmontowaniu komponentu
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