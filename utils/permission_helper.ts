import * as Location from 'expo-location';
import { Alert, Platform, Linking } from 'react-native';

export interface PermissionStatus {
    foreground: boolean;
    background: boolean;
    canProceed: boolean;
}

export const checkLocationPermissions = async (): Promise<PermissionStatus> => {
    try {
        const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
        const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
        
        return {
            foreground: foregroundStatus === 'granted',
            background: backgroundStatus === 'granted',
            canProceed: foregroundStatus === 'granted'
        };
    } catch (error) {
        console.error('Error checking permissions:', error);
        return {
            foreground: false,
            background: false,
            canProceed: false
        };
    }
};

export const requestLocationPermissions = async (): Promise<PermissionStatus> => {
    try {
        // Najpierw sprawdź obecne uprawnienia
        let { foreground, background, canProceed } = await checkLocationPermissions();
        
        // Jeśli nie ma uprawnień foreground, poproś o nie
        if (!foreground) {
            const { status: newForegroundStatus } = await Location.requestForegroundPermissionsAsync();
            foreground = newForegroundStatus === 'granted';
            
            if (!foreground) {
                showPermissionAlert('foreground');
                return { foreground, background, canProceed: false };
            }
        }
        
        // Jeśli to iOS i nie ma uprawnień background, poproś o nie
        if (Platform.OS === 'ios' && !background) {
            const { status: newBackgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            background = newBackgroundStatus === 'granted';
            
            if (!background) {
                showPermissionAlert('background');
                // Na iOS można kontynuować bez uprawnień background, ale z ograniczeniami
            }
        }
        
        return {
            foreground,
            background,
            canProceed: foreground
        };
    } catch (error) {
        console.error('Error requesting permissions:', error);
        showPermissionAlert('error');
        return {
            foreground: false,
            background: false,
            canProceed: false
        };
    }
};

const showPermissionAlert = (type: 'foreground' | 'background' | 'error') => {
    switch (type) {
        case 'foreground':
            Alert.alert(
                'Wymagane uprawnienia lokalizacji',
                'Aplikacja potrzebuje dostępu do lokalizacji, aby automatycznie wykrywać trening w siłowni.',
                [
                    { text: 'Anuluj', style: 'cancel' },
                    { text: 'Otwórz ustawienia', onPress: () => Linking.openSettings() }
                ]
            );
            break;
            
        case 'background':
            Alert.alert(
                'Uprawnienia lokalizacji w tle',
                Platform.OS === 'ios' 
                    ? 'Aby aplikacja mogła automatycznie wykrywać trening gdy jest w tle, musisz włączyć "Zawsze" w ustawieniach lokalizacji.\n\nPrzejdź do:\nUstawienia → Prywatność i bezpieczeństwo → Usługi lokalizacji → JodoApp → Zawsze'
                    : 'Aby aplikacja mogła automatycznie wykrywać trening w tle, potrzebuje uprawnień do lokalizacji w tle.',
                [
                    { text: 'Kontynuuj bez tego', style: 'cancel' },
                    { text: 'Otwórz ustawienia', onPress: () => Linking.openSettings() }
                ]
            );
            break;
            
        case 'error':
            Alert.alert(
                'Błąd uprawnień',
                'Wystąpił problem z uprawnieniami lokalizacji. Sprawdź ustawienia aplikacji.',
                [
                    { text: 'OK' },
                    { text: 'Otwórz ustawienia', onPress: () => Linking.openSettings() }
                ]
            );
            break;
    }
};

export const showLocationSettingsGuide = () => {
    Alert.alert(
        'Jak włączyć uprawnienia lokalizacji',
        Platform.OS === 'ios'
            ? 'Aby włączyć śledzenie lokalizacji w tle:\n\n1. Otwórz Ustawienia iPhone\n2. Przewiń do JodoApp\n3. Dotknij "Lokalizacja"\n4. Wybierz "Zawsze"\n5. Włącz "Dokładna lokalizacja"'
            : 'Aby włączyć śledzenie lokalizacji w tle:\n\n1. Otwórz Ustawienia Android\n2. Znajdź JodoApp\n3. Dotknij "Uprawnienia"\n4. Dotknij "Lokalizacja"\n5. Wybierz "Zezwalaj cały czas"',
        [
            { text: 'OK' },
            { text: 'Otwórz ustawienia', onPress: () => Linking.openSettings() }
        ]
    );
};