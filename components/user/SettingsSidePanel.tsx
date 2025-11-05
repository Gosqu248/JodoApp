import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
} from 'react-native';
import Animated,
{
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.85;

interface SettingsSlidePanelProps {
    visible: boolean;
    onClose: () => void;
    onChangePassword: () => void;
    onChangePhoto: () => void;
}

export default function SettingsSlidePanel({
                                               visible,
                                               onClose,
                                               onChangePassword,
                                               onChangePhoto,
                                           }: SettingsSlidePanelProps) {
    const translateX = useSharedValue(PANEL_WIDTH);
    const backdropOpacity = useSharedValue(0);
    const { deleteUserAccount } = useUser();

    // Animate panel entrance/exit based on visibility
    useEffect(() => {
        if (visible) {
            translateX.value = withTiming(0, { duration: 350 });
            backdropOpacity.value = withTiming(1, { duration: 350 });
        } else {
            translateX.value = withTiming(PANEL_WIDTH, { duration: 300 });
            backdropOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [visible, translateX, backdropOpacity]);

    // Pan gesture handler for swipe-to-close functionality
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow right swipe (positive translation)
            if (event.translationX > 0) {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            // Close panel if swiped far enough or with sufficient velocity
            const shouldClose = event.translationX > PANEL_WIDTH * 0.3 || event.velocityX > 500;
            if (shouldClose) {
                translateX.value = withTiming(PANEL_WIDTH, { duration: 300 });
                backdropOpacity.value = withTiming(0, { duration: 300 });
                runOnJS(onClose)();
            } else {
                // Snap back to open position
                translateX.value = withSpring(0, {
                    damping: 15,
                    stiffness: 150,
                });
            }
        });

    // Handler for delete account with confirmation
    const handleDeleteAccount = () => {
        // Zamknij panel przed wyświetleniem alertu
        onClose();

        // Pokaż alert z opóźnieniem, aby panel zdążył się zamknąć
        setTimeout(() => {
            Alert.alert(
                "Usuń konto",
                "Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna i spowoduje trwałe usunięcie wszystkich Twoich danych, w tym historii treningów, karnetów i zdjęć.",
                [
                    {
                        text: "Anuluj",
                        style: "cancel"
                    },
                    {
                        text: "Usuń konto",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await deleteUserAccount();
                                console.log('✅ Konto zostało pomyślnie usunięte');
                            } catch (error) {
                                console.error('❌ Błąd podczas usuwania konta:', error);
                                Alert.alert(
                                    "Błąd",
                                    "Nie udało się usunąć konta. Sprawdź połączenie internetowe i spróbuj ponownie."
                                );
                            }
                        }
                    }
                ]
            );
        }, 350);
    };

    // Animated styles for panel position
    const panelAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    // Animated styles for backdrop opacity
    const backdropAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: backdropOpacity.value,
        };
    });

    // Don't render anything when not visible
    if (!visible) {
        return null;
    }

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Semi-transparent backdrop with tap-to-close */}
            <Animated.View
                style={[
                    styles.backdrop,
                    backdropAnimatedStyle
                ]}
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    activeOpacity={1}
                />
            </Animated.View>

            {/* Settings panel with gesture handling */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.panel,
                        panelAnimatedStyle
                    ]}
                >
                    {/* Visual drag indicator */}
                    <View style={styles.dragIndicator} />

                    {/* Panel header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Ustawienia</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Settings menu options */}
                    <View style={styles.menuContainer}>
                        {/* Change Password Option */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={onChangePassword}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="lock-closed-outline" size={22} color="#333" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>Zmień hasło</Text>
                                <Text style={styles.menuDescription}>
                                    Zaktualizuj swoje hasło logowania
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Change Photo Option */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={onChangePhoto}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="camera-outline" size={22} color="#333" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>Zdjęcie profilowe</Text>
                                <Text style={styles.menuDescription}>
                                    Zmień swoje zdjęcie profilowe
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Delete Account Option */}
                        <TouchableOpacity
                            style={[styles.menuItem, styles.dangerMenuItem]}
                            onPress={handleDeleteAccount}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconContainer, styles.dangerIconContainer]}>
                                <Ionicons name="trash-outline" size={22} color="#ff3b30" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={[styles.menuTitle, styles.dangerText]}>Usuń konto</Text>
                                <Text style={styles.menuDescription}>
                                    Trwale usuń swoje konto i wszystkie dane
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ff3b30" />
                        </TouchableOpacity>
                    </View>

                    {/* Instructional footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Przeciągnij w prawo lub dotknij poza panelem aby zamknąć
                        </Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    panel: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: PANEL_WIDTH,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: -3,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 15,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    dragIndicator: {
        position: 'absolute',
        left: 0,
        top: '50%',
        width: 4,
        height: 40,
        backgroundColor: '#ffc500',
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
        marginTop: -20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        paddingTop: 20,
        paddingHorizontal: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#fafafa',
        marginBottom: 12,
    },
    dangerMenuItem: {
        backgroundColor: '#fff5f5',
        borderWidth: 1,
        borderColor: '#ffe5e5',
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dangerIconContainer: {
        backgroundColor: '#fff0f0',
        borderWidth: 1,
        borderColor: '#ffe0e0',
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    dangerText: {
        color: '#ff3b30',
    },
    menuDescription: {
        fontSize: 14,
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
        marginHorizontal: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 16,
    },
});