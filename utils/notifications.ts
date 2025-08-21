import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<boolean> {
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

export async function sendWorkoutStartedNotification(startTime: Date) {
    const timeString = startTime.toLocaleTimeString('pl-PL', {
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