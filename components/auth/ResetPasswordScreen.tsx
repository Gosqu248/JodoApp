/**
 * ResetPasswordScreen Component
 *
 * Password reset screen for the Jodo application.
 * Handles three-step process: email sending, code verification and new password setting.
 *
 * @param {ResetPasswordScreenProps} props - Component properties
 * @returns {JSX.Element} Password reset screen
 */
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {ResetCodeParams, resetPassword, ResetPasswordParams, sendResetPasswordEmail, verifyResetCode} from "@/api/auth";
import {handleApiError} from "@/utils/errorHandler";

interface ResetPasswordScreenProps {
    onBackToLogin: () => void;
}

export default function ResetPasswordScreen({ onBackToLogin }: ResetPasswordScreenProps) {
    // Reset form state
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // States controlling password reset flow
    const [isLoading, setIsLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false); // Whether email was sent
    const [isValidCode, setIsValidCode] = useState(false); // Whether code was verified

    // Validation errors state
    const [errors, setErrors] = useState<{
        code?: string;
        newPassword?: string;
        confirmNewPassword?: string;
    }>({});

    /**
     * Validates email format
     * @param {string} email - Email address to validate
     * @returns {boolean} True if email is valid
     */
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Handles sending email with password reset code
     * First step of reset process
     */
    const handleResetPassword = async () => {
        // Email validation
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
            await sendResetPasswordEmail(email);
            setResetSent(true);
        } catch (error: any) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles verification of code received in email
     * Second step of reset process
     */
    const handleVerifyCode = async () => {
        setIsLoading(true);
        try {
            const params: ResetCodeParams = { email, code };
            const response = await verifyResetCode(params);
            if (response.success) {
                setIsValidCode(true);
            }
        } catch (error: any) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles final password reset
     * Third step of reset process
     */
    const handleResetPasswordFinal = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const params: ResetPasswordParams = { email, newPassword, confirmNewPassword };
            const response = await resetPassword(params);
            if (response.success) {
                Alert.alert('Sukces', 'Hasło zostało pomyślnie zresetowane.');
                onBackToLogin();
            }
        } catch (error: any) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Validates new password form
     * @returns {boolean} True if form is valid
     */
    const validateForm = (): boolean => {
        const newErrors: {
            newPassword?: string;
            confirmNewPassword?: string;
        } = {};

        // New password validation
        if (!newPassword.trim()) {
            newErrors.newPassword = 'Nowe hasło jest wymagane';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Hasło musi mieć co najmniej 6 znaków';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            newErrors.newPassword = 'Hasło musi zawierać małą literę, dużą literę i cyfrę';
        }

        // Password confirmation validation
        if (!confirmNewPassword.trim()) {
            newErrors.confirmNewPassword = 'Potwierdzenie hasła jest wymagane';
        } else if (newPassword !== confirmNewPassword) {
            newErrors.confirmNewPassword = 'Hasła nie są identyczne';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Updates form field and clears corresponding error
     * @param {string} field - Field name to update
     * @param {string} value - New field value
     */
    const updateField = (field: 'code' | 'newPassword' | 'confirmNewPassword', value: string) => {
        switch (field) {
            case 'code':
                setCode(value);
                break;
            case 'newPassword':
                setNewPassword(value);
                break;
            case 'confirmNewPassword':
                setConfirmNewPassword(value);
                break;
        }

        // Clear error for the field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <LinearGradient
            colors={['#1a1a1a', '#ffc500']}
            locations={[0.3, 1]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            {/* Header with back button */}
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
                        {/* App logo */}
                        <Image source={require('@/assets/images/Jodo.png')} style={styles.logo} />

                        {/* Step 1: Email input */}
                        {!resetSent && !isValidCode ? (
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
                        ) : resetSent && !isValidCode ? (
                            /* Step 2: Code verification */
                            <>
                                <Text style={styles.title}>Kod weryfikacyjny</Text>
                                <Text style={styles.subtitle}>
                                    Podaj swój kod weryfikacyjny, który został wysłany na Twój adres email.
                                </Text>

                                <View style={styles.formContainer}>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Kod weryfikacyjny"
                                            placeholderTextColor="#666"
                                            value={code}
                                            onChangeText={setCode}
                                            keyboardType="numeric"
                                            autoCapitalize="none"
                                            editable={!isLoading}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.resetButton, isLoading && styles.buttonDisabled]}
                                        onPress={handleVerifyCode}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.resetButtonText}>
                                            {isLoading ? 'Wysyłanie...' : 'Wprowadź kod'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            /* Step 3: New password setting */
                            <>
                                <Text style={styles.title}>Nowe hasło</Text>
                                <Text style={styles.subtitle}>
                                    Wprowadź swoje nowe hasło.
                                </Text>

                                <View style={styles.formContainer}>
                                    {/* New password field */}
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[styles.input, errors.newPassword && styles.inputError]}
                                            placeholder="Nowe hasło"
                                            placeholderTextColor="#666"
                                            value={newPassword}
                                            onChangeText={(text) => updateField('newPassword', text)}
                                            keyboardType="default"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            editable={!isLoading}
                                        />
                                        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                                    </View>

                                    {/* Password confirmation field */}
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[styles.input, errors.confirmNewPassword && styles.inputError]}
                                            placeholder="Powtórz hasło"
                                            placeholderTextColor="#666"
                                            value={confirmNewPassword}
                                            onChangeText={(text) => updateField('confirmNewPassword', text)}
                                            keyboardType="default"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            editable={!isLoading}
                                        />
                                        {errors.confirmNewPassword && <Text style={styles.errorText}>{errors.confirmNewPassword}</Text>}
                                    </View>

                                    {/* Password requirements section */}
                                    <View style={styles.passwordRequirements}>
                                        <Text style={styles.requirementsTitle}>Wymagania hasła:</Text>
                                        <Text style={styles.requirementText}>• Co najmniej 6 znaków</Text>
                                        <Text style={styles.requirementText}>• Zawiera małą literę</Text>
                                        <Text style={styles.requirementText}>• Zawiera dużą literę</Text>
                                        <Text style={styles.requirementText}>• Zawiera cyfrę</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.resetButton, isLoading && styles.buttonDisabled]}
                                        onPress={handleResetPasswordFinal}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.resetButtonText}>
                                            {isLoading ? 'Wysyłanie...' : 'Zmień hasło'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
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
        marginBottom: 40,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
        width: '100%',
    },
    subtitle: {
        fontSize: 16,
        color: '#f0f0f0',
        marginBottom: 32,
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 24,
    },
    input: {
        width: '100%',
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
    inputError: {
        borderColor: '#F44336',
        borderWidth: 1,
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        marginTop: 4,
        marginLeft: 4,
        textAlign: 'left',
        width: '100%',
    },
    passwordRequirements: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    requirementText: {
        fontSize: 12,
        color: '#f0f0f0',
        marginBottom: 2,
    },
    resetButton: {
        width: '100%',
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