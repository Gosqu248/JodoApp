import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startActivity, endActivity } from '@/api/activity';

const TASK_NAME = 'ACTIVITY_TRACKING';
const GYM = { latitude: 50.06465, longitude: 19.94498 }; // przykładowe
const RADIUS = 50; // w metrach

const haversine = (c1: any, c2: any) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const dLat = toRad(c2.latitude - c1.latitude);
    const dLon = toRad(c2.longitude - c1.longitude);
    const a = Math.sin(dLat/2)**2 +
        Math.cos(toRad(c1.latitude)) * Math.cos(toRad(c2.latitude)) *
        Math.sin(dLon/2)**2;
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return 6371000 * d; // odległość w metrach
};

// Zdefiniuj task
TaskManager.defineTask(TASK_NAME, async ({ data: { locations }, error }) => {
    if (error || !locations?.length) return;
    const { latitude, longitude } = locations[0].coords;
    const inGym = haversine({ latitude, longitude }, GYM) <= RADIUS;
    const currentId = await AsyncStorage.getItem('currentActivityId');

    if (inGym && !currentId) {
        const resp = await startActivity(await AsyncStorage.getItem('userId')!);
        await AsyncStorage.setItem('currentActivityId', resp.id);
    }
    if (!inGym && currentId) {
        await endActivity(currentId);
        await AsyncStorage.removeItem('currentActivityId');
    }
});

export const LocationService = {
    isLocationTrackingActive: async () =>
        (await Location.hasStartedLocationUpdatesAsync(TASK_NAME)),
    getActivityState: async () => ({
        isActive: !!(await AsyncStorage.getItem('currentActivityId')),
    }),

    startLocationTracking: async (userId: string) => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return false;
        const { status: bg } = await Location.requestBackgroundPermissionsAsync();
        if (bg !== 'granted') return false;

        await AsyncStorage.setItem('userId', userId);
        await Location.startLocationUpdatesAsync(TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 60_000,
            distanceInterval: 0,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: 'Śledzenie aktywności',
                notificationBody: 'Monitoruję Twoją lokalizację co minutę',
            },
        });
        return true;
    },

    stopLocationTracking: async () => {
        await Location.stopLocationUpdatesAsync(TASK_NAME);
        await AsyncStorage.removeItem('currentActivityId');
        await AsyncStorage.removeItem('userId');
    },

    isCurrentlyInGym: async () => {
        const loc = await Location.getCurrentPositionAsync({});
        return haversine(loc.coords, GYM) <= RADIUS;
    },
};
