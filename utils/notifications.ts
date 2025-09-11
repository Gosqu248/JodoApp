import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_NOTIFICATION_KEY = 'last_workout_notification';
const NOTIFICATION_COOLDOWN_MS = 5 * 60 * 1000; // 5 minut

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

/**
 * Registers the device for push notifications
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
    // Configure notification channel for Android
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

/**
 * Sends a local notification when workout starts
 * @param startTime - The time when the workout started
 */
export async function sendWorkoutStartedNotification(startTime: string) {
    const now = new Date.now();
    const last = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
    if (last && now - Number(last) < NOTIFICATION_COOLDOWN_MS) {
        return;
    }

    const startDate = new Date(startTime);
    const timeString = startDate.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    });

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Właśnie zacząłeś trening! 💪',
            body: `Godzina rozpoczęcia: ${timeString}`,
        },
        trigger: null,
    });
}