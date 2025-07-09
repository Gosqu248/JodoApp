import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AuthContext } from '@/context/AuthContext';

interface ResetPasswordScreenProps {
    onBackToLogin: () => void;
}

export default function ResetPasswordScreen({ onBackToLogin }: ResetPasswordScreenProps) {
    const { resetPassword } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Błąd', 'Proszę podać adres email');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Błąd', 'Proszę podać prawidłowy adres email');
            return;
        }

        setIsLoading(true);
        try {
            const success = await resetPassword(email);
            if (success) {
                setResetSent(true);
            } else {
                Alert.alert('Błąd', 'Wystąpił problem podczas resetowania hasła. Spróbuj ponownie później.');
            }
        } catch (error) {
            Alert.alert('Błąd', 'Wystąpił problem podczas resetowania hasła. Spróbuj ponownie później.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#1a1a1a', '#ffc500']}
            locations={[0.3, 1]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Resetowanie hasła</Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollViewContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        <Image source={require('@/assets/images/Jodo.png')} style={styles.logo} />

                        {!resetSent ? (
                            <>
                                <Text style={styles.title}>Zapomniałeś hasła?</Text>
                                <Text style={styles.subtitle}>
                                    Podaj swój adres email, a wyślemy Ci link do zresetowania hasła.
                                </Text>

                                <View style={styles.formContainer}>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email"
                                            placeholderTextColor="#666"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            editable={!isLoading}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.resetButton, isLoading && styles.buttonDisabled]}
                                        onPress={handleResetPassword}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.resetButtonText}>
                                            {isLoading ? 'Wysyłanie...' : 'Zresetuj hasło'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View style={styles.successContainer}>
                                <Ionicons name="checkmark-circle" size={80} color="#ffc500" style={styles.successIcon} />
                                <Text style={styles.successTitle}>Email wysłany!</Text>
                                <Text style={styles.successText}>
                                    Instrukcje resetowania hasła zostały wysłane na adres {email}.
                                    Sprawdź swoją skrzynkę odbiorczą i postępuj zgodnie z instrukcjami.
                                </Text>
                                <TouchableOpacity
                                    style={styles.backToLoginButton}
                                    onPress={onBackToLogin}
                                >
                                    <Text style={styles.backToLoginText}>Powrót do logowania</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#f0f0f0',
        marginBottom: 32,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#000',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    resetButton: {
        backgroundColor: '#000000',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#666',
    },
    resetButtonText: {
        color: '#ffc500',
        fontSize: 18,
        fontWeight: 'bold',
    },
    successContainer: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
    },
    successIcon: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 24,
    },
    backToLoginButton: {
        backgroundColor: '#000000',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: '100%',
    },
    backToLoginText: {
        color: '#ffc500',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
