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
            infoPlist: {
                NSLocationWhenInUseUsageDescription: "Aplikacja potrzebuje dostępu do Twojej lokalizacji, aby automatycznie wykrywać gdy jesteś w siłowni i rejestrować trening.",
                NSLocationAlwaysAndWhenInUseUsageDescription: "Aplikacja potrzebuje dostępu do Twojej lokalizacji w tle, aby automatycznie rozpoczynać i kończyć trening gdy wchodzisz i wychodzisz z siłowni.",
                NSLocationAlwaysUsageDescription: "Aplikacja potrzebuje dostępu do Twojej lokalizacji w tle, aby automatycznie rozpoczynać i kończyć trening gdy wchodzisz i wychodzisz z siłowni.",
                UIBackgroundModes: ["location"],
                ITSAppUsesNonExemptEncryption: false,
                NSAppTransportSecurity: {
                    NSExceptionDomains: {
                        "jodogym.pl": {
                            NSExceptionAllowsInsecureHTTPLoads: true,
                            NSIncludesSubdomains: true
                        }
                    }
                }
            },
            bundleIdentifier: "com.gosqu.JodoApp"
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
                    locationAlwaysAndWhenInUsePermission: "Aplikacja potrzebuje dostępu do Twojej lokalizacji w tle, aby automatycznie rozpoczynać i kończyć trening gdy wchodzisz i wychodzisz z siłowni.",
                    locationWhenInUsePermission: "Aplikacja potrzebuje dostępu do Twojej lokalizacji, aby automatycznie wykrywać gdy jesteś w siłowni i rejestrować trening.",
                    isIosBackgroundLocationEnabled: true,
                    isAndroidBackgroundLocationEnabled: true,
                    UIBackgroundModes: ["location"]
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
