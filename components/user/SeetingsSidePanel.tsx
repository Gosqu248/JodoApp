import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

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
                                               onChangePhoto
                                           }: SettingsSlidePanelProps) {
    const translateX = useSharedValue(PANEL_WIDTH);
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateX.value = withTiming(0, { duration: 350 });
            backdropOpacity.value = withTiming(1, { duration: 350 });
        } else {
            translateX.value = withTiming(PANEL_WIDTH, { duration: 300 });
            backdropOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [visible]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationX > 0) {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            const shouldClose = event.translationX > PANEL_WIDTH * 0.3 || event.velocityX > 500;
            if (shouldClose) {
                translateX.value = withTiming(PANEL_WIDTH, { duration: 300 });
                backdropOpacity.value = withTiming(0, { duration: 300 });
                runOnJS(onClose)();
            } else {
                translateX.value = withSpring(0, {
                    damping: 15,
                    stiffness: 150,
                });
            }
        });

    const panelAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const backdropAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: backdropOpacity.value,
        };
    });

    if (!visible) {
        return null;
    }

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Backdrop z możliwością zamknięcia */}
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

            {/* Panel ustawień */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.panel,
                        panelAnimatedStyle
                    ]}
                >
                    {/* Wskaźnik przeciągania */}
                    <View style={styles.dragIndicator} />

                    {/* Nagłówek */}
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

                    {/* Opcje menu */}
                    <View style={styles.menuContainer}>
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
                    </View>

                    {/* Footer z informacjami */}
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
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
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