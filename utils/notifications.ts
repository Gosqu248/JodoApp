import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_NOTIFICATION_KEY = 'last_workout_notification';
const NOTIFICATION_COOLDOWN_MS = 5 * 60 * 1000; // 5 minut

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Registers the device for push notifications
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
    try {
        // Configure notification channel for Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Ogólne',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#ffc500',
                sound: 'default',
                enableVibrate: true,
                showBadge: true,
            });

            await Notifications.setNotificationChannelAsync('workout', {
                name: 'Treningi',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#ffc500',
                sound: 'default',
                enableVibrate: true,
                showBadge: true,
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Brak uprawnień do powiadomień');
            return false;
        }

        console.log('Uprawnienia do powiadomień przyznane');
        return true;
    } catch (error) {
        console.error('Błąd podczas rejestracji powiadomień:', error);
        return false;
    }
}

/**
 * Sends a local notification when workout starts
 * @param startTime - The time when the workout started
 */
export async function sendWorkoutStartedNotification(startTime: string): Promise<void> {
    try {
        const now = Date.now();
        const lastNotificationStr = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);

        // Sprawdź cooldown
        if (lastNotificationStr) {
            const lastNotification = Number(lastNotificationStr);
            if (!isNaN(lastNotification) && now - lastNotification < NOTIFICATION_COOLDOWN_MS) {
                console.log('Powiadomienie zablokowane przez cooldown');
                return;
            }
        }

        const startDate = new Date(startTime);
        const timeString = startDate.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
        });

        // Wyślij powiadomienie
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Wlasnie zaczales trening!',
                body: `Godzina rozpoczecia: ${timeString}`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: {
                    type: 'workout_started',
                    startTime: startTime,
                },
            },
            trigger: null, // Natychmiast
        });

        // Zapisz timestamp ostatniego powiadomienia
        await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, now.toString());

        console.log('Powiadomienie wysłane:', notificationId);
    } catch (error) {
        console.error('Błąd wysyłania powiadomienia:', error);
    }
}

/**
 * Sends a notification when workout ends
 * @param duration - Duration of the workout in minutes
 */
export async function sendWorkoutEndedNotification(duration: number): Promise<void> {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Trening zakonczony!',
                body: `Gratulacje! Trenowales ${duration} minut`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: {
                    type: 'workout_ended',
                    duration: duration,
                },
            },
            trigger: null,
        });

        console.log('Powiadomienie o zakończeniu treningu wysłane');
    } catch (error) {
        console.error('Błąd wysyłania powiadomienia o zakończeniu:', error);
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('Wszystkie powiadomienia anulowane');
    } catch (error) {
        console.error('Błąd anulowania powiadomień:', error);
    }
}

/**
 * Get notification permissions status
 */
export async function getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
}