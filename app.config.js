import 'dotenv/config';

export default {
    expo: {
        name: "JodoGym",
        slug: "JodoApp",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "jodoapp",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.gosqu.JodoApp",
            infoPlist: {
                NSCameraUsageDescription:
                    "JodoGym potrzebuje dostępu do aparatu, aby umożliwić Ci zrobienie zdjęcia profilowego. Na przykład: możesz zrobić zdjęcie swoim aparatem i od razu ustawić je jako zdjęcie profilowe w aplikacji, dzięki czemu trenerzy i inni członkowie siłowni będą mogli Cię łatwiej rozpoznać.",
                NSPhotoLibraryUsageDescription:
                    "JodoGym potrzebuje dostępu do Twojej biblioteki zdjęć, aby umożliwić Ci wybranie zdjęcia profilowego. Na przykład: możesz wybrać istniejące zdjęcie z galerii i ustawić je jako zdjęcie profilowe w aplikacji, dzięki czemu trenerzy i inni członkowie siłowni będą mogli Cię łatwiej rozpoznać.",
                NSLocationWhenInUseUsageDescription:
                    "JodoGym potrzebuje dostępu do Twojej lokalizacji podczas korzystania z aplikacji, aby automatycznie wykrywać, gdy znajdujesz się w pobliżu siłowni. Na przykład: gdy otworzysz aplikację i jesteś w okolicy siłowni, aplikacja może automatycznie zarejestrować rozpoczęcie sesji treningowej i wyświetlić odpowiednie funkcje treningowe.",
                NSLocationAlwaysAndWhenInUseUsageDescription:
                    "JodoGym potrzebuje dostępu do Twojej lokalizacji także w tle, aby automatycznie wykrywać, gdy wchodzisz lub wychodzisz z obszaru siłowni, nawet gdy aplikacja nie jest aktywna. Na przykład: gdy wejdziesz do siłowni z aplikacją w tle, otrzymasz powiadomienie o rozpoczęciu treningu i automatycznie rozpocznie się licznik czasu treningu. Gdy wyjdziesz z siłowni, trening zostanie automatycznie zakończony i zapisany do Twojej historii aktywności. To pozwala na dokładne śledzenie czasu spędzonego na treningach bez konieczności ręcznego włączania i wyłączania aplikacji.",
                NSLocationAlwaysUsageDescription:
                    "JodoGym potrzebuje dostępu do Twojej lokalizacji także w tle, aby automatycznie wykrywać, gdy wchodzisz lub wychodzisz z obszaru siłowni, nawet gdy aplikacja jest zamknięta. Na przykład: gdy wejdziesz do siłowni, otrzymasz powiadomienie o rozpoczęciu treningu i automatycznie rozpocznie się licznik czasu. Gdy wyjdziesz z siłowni, trening zostanie automatycznie zakończony i zapisany, co pozwala na precyzyjne śledzenie wszystkich Twoich sesji treningowych bez konieczności pamiętania o ręcznym uruchamianiu aplikacji.",
                NSUserNotificationsUsageDescription:
                    "JodoGym potrzebuje dostępu do powiadomień, aby informować Cię o ważnych wydarzeniach treningowych. Na przykład: otrzymasz powiadomienie, gdy automatycznie rozpocznie się lub zakończy sesja treningowa po wejściu lub wyjściu z siłowni, gdy zbliża się termin zajęć grupowych, na które się zapisałeś, lub gdy Twój karnet wkrótce wygaśnie.",
                UIBackgroundModes: [
                    "location"
                ],
                ITSAppUsesNonExemptEncryption: false,
                NSAppTransportSecurity: {
                    NSExceptionDomains: {
                        "jodogym.pl": {
                            NSExceptionAllowsInsecureHTTPLoads: true,
                            NSIncludesSubdomains: true,
                        },
                    },
                },
            },
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#000000"
            },
            edgeToEdgeEnabled: true,
            permissions: [
                "ACCESS_FINE_LOCATION",
                "ACCESS_COARSE_LOCATION",
                "ACCESS_BACKGROUND_LOCATION",
                "FOREGROUND_SERVICE",
                "WAKE_LOCK",
                "POST_NOTIFICATIONS"
            ],
            package: "com.gosqu.JodoApp"
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/JodoLOGO.png"
        },
        plugins: [
            "expo-router",
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission: "JodoGym potrzebuje dostępu do Twojej lokalizacji także w tle, aby automatycznie wykrywać, gdy wchodzisz lub wychodzisz z obszaru siłowni, nawet gdy aplikacja nie jest aktywna. Na przykład: gdy wejdziesz do siłowni z aplikacją w tle, otrzymasz powiadomienie o rozpoczęciu treningu i automatycznie rozpocznie się licznik czasu treningu. Gdy wyjdziesz z siłowni, trening zostanie automatycznie zakończony i zapisany do Twojej historii aktywności. To pozwala na dokładne śledzenie czasu spędzonego na treningach bez konieczności ręcznego włączania i wyłączania aplikacji.",
                    locationWhenInUsePermission: "JodoGym potrzebuje dostępu do Twojej lokalizacji podczas korzystania z aplikacji, aby automatycznie wykrywać, gdy znajdujesz się w pobliżu siłowni. Na przykład: gdy otworzysz aplikację i jesteś w okolicy siłowni, aplikacja może automatycznie zarejestrować rozpoczęcie sesji treningowej i wyświetlić odpowiednie funkcje treningowe.",
                    isIosBackgroundLocationEnabled: true,
                    isAndroidBackgroundLocationEnabled: true
                }
            ],
            [
                "expo-notifications",
                {
                    icon: "./assets/images/icon.png",
                    color: "#ffc500",
                    defaultChannel: "default",
                    sounds: []
                }
            ],
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/adaptive-icon.png",
                    backgroundColor: "#000000",
                    dark: {
                        image: "./assets/images/splash.png",
                        backgroundColor: "#000000"
                    },
                    imageWidth: 200
                }
            ]
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            router: {},
            eas: {
                projectId: "8b7a1333-655e-4701-ba0c-dc6c22c7f95b"
            },
            apiUrl: process.env.API_URL,
        },
    },
};
