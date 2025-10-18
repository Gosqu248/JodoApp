/**
 * RegisterScreen Component
 *
 * Registration screen for new users of the Jodo application.
 * Contains registration form with data validation and links to legal documents.
 *
 * @param {RegisterScreenProps} props - Component properties
 * @returns {JSX.Element} Registration screen
 */
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Linking
} from 'react-native'
import React, {useState, useContext} from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import {Ionicons} from "@expo/vector-icons";
import {Image} from "expo-image";
import {AuthContext} from "@/context/AuthContext";
import {handleApiError} from "@/utils/errorHandler";

interface RegisterScreenProps {
    onBackToLogin: () => void;
}

export default function RegisterScreen({ onBackToLogin}: RegisterScreenProps) {
    // Get register function from AuthContext
    const { register } = useContext(AuthContext);

    // Registration form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Validation errors state
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    /**
     * Validates registration form
     * Checks email validity, password strength and confirmation match
     * @returns {boolean} True if form is valid
     */
    const validateForm = (): boolean => {
        const newErrors: {
            email?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Proszę podać email';
        } else if (!email.includes('@')) {
            newErrors.email = 'Proszę podać prawidłowy adres email';
        }

        // Password validation
        if (!password.trim()) {
            newErrors.password = 'Proszę podać hasło';
        } else if (password.length < 6) {
            newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            newErrors.password = 'Hasło musi zawierać małą literę, dużą literę i cyfrę';
        }

        // Password confirmation validation
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Proszę potwierdzić hasło';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Hasła nie są identyczne';
        }

        setErrors(newErrors);

        // Check if there are validation errors
        if (Object.keys(newErrors).length > 0) {
            return false;
        }

        // Check terms acceptance
        if (!acceptTerms) {
            Alert.alert('Błąd', 'Musisz zaakceptować regulamin i politykę prywatności');
            return false;
        }

        return true;
    };

    /**
     * Updates form field and clears corresponding error
     * @param {string} field - Field name to update
     * @param {string} value - New field value
     */
    const updateField = (field: 'email' | 'password' | 'confirmPassword', value: string) => {
        switch (field) {
            case 'email':
                setEmail(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                break;
        }

        // Clear error for the field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    /**
     * Handles user registration process
     * Validates form and calls register function from AuthContext
     */
    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await register(email, password);
            Alert.alert(
                'Sukces!',
                'Konto zostało utworzone pomyślnie. Możesz się teraz zalogować.',
                [{ text: 'OK', onPress: onBackToLogin }]
            );
        } catch (error) {
            handleApiError(error);
        } finally {
            resetForm();
            setIsLoading(false);
        }
    };

    /**
     * Resets form to initial state
     */
    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAcceptTerms(false);
        setErrors({});
    }

    /**
     * Opens privacy policy link in browser
     */
    const openPrivacyPolicy = () => {
        Linking.openURL('https://jodogym.pl/polityka-prywatnosci');
    };

    /**
     * Opens terms and conditions link in browser
     */
    const openTerms = () => {
        Linking.openURL('https://jodogym.pl/regulamin');
    };

    return (
        <LinearGradient
            colors={['#1a1a1a', '#ffc500']}
            locations={[0.3, 1]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#1a1a1a"/>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* App logo */}
                    <Image source={require('@/assets/images/Jodo.png')} style={styles.logo} />

                    {/* Header */}
                    <Text style={styles.title}>Utwórz konto</Text>
                    <Text style={styles.subtitle}>Dołącz do nas już dziś!</Text>

                    <View style={styles.formContainer}>
                        {/* Email field */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                placeholder="Email"
                                placeholderTextColor="#666"
                                value={email}
                                onChangeText={(text) => updateField('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Password field */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, errors.password && styles.inputError]}
                                placeholder="Hasło"
                                placeholderTextColor="#666"
                                secureTextEntry
                                value={password}
                                onChangeText={(text) => updateField('password', text)}
                                autoComplete="new-password"
                            />
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        {/* Password confirmation field */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, errors.confirmPassword && styles.inputError]}
                                placeholder="Potwierdź hasło"
                                placeholderTextColor="#666"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={(text) => updateField('confirmPassword', text)}
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>

                        {/* Password requirements section */}
                        <View style={styles.passwordRequirements}>
                            <Text style={styles.requirementsTitle}>Wymagania hasła:</Text>
                            <Text style={styles.requirementText}>• Co najmniej 6 znaków</Text>
                            <Text style={styles.requirementText}>• Zawiera małą literę</Text>
                            <Text style={styles.requirementText}>• Zawiera dużą literę</Text>
                            <Text style={styles.requirementText}>• Zawiera cyfrę</Text>
                        </View>

                        {/* Terms acceptance checkbox with links */}
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setAcceptTerms(!acceptTerms)}
                        >
                            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                                {acceptTerms && <Ionicons name="checkmark" size={16} color="#ffc500" />}
                            </View>
                            <Text style={styles.checkboxText}>
                                Akceptuję{' '}
                                <Text
                                    style={styles.linkText}
                                    onPress={openTerms}
                                >Regulamin</Text>
                                {' '}i{' '}
                                <Text
                                    style={styles.linkText}
                                    onPress={openPrivacyPolicy}
                                >Politykę Prywatności</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Registration button */}
                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerButtonText}>
                                {isLoading ? 'Tworzenie konta...' : 'Zarejestruj się'}
                            </Text>
                        </TouchableOpacity>

                        {/* Login link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Masz już konto? </Text>
                            <TouchableOpacity onPress={onBackToLogin}>
                                <Text style={styles.loginLink}>Zaloguj się</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 10,
        paddingBottom: 120,
    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: 'center',
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
        alignSelf: 'center',
    },
    inputContainer: {
        marginBottom: 16,
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
    inputError: {
        borderColor: '#F44336',
        borderWidth: 1,
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        marginTop: 4,
        marginLeft: 4,
    },
    passwordRequirements: {
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    checkboxChecked: {
        backgroundColor: '#000',
        borderColor: '#fff',
    },
    checkboxText: {
        fontSize: 14,
        color: '#ffffff',
        flex: 1,
    },
    linkText: {
        color: '#ffc500',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    registerButton: {
        backgroundColor: '#000000',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
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
    registerButtonText: {
        color: '#ffc500',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 16,
        color: '#f0f0f0',
    },
    loginLink: {
        fontSize: 18,
        color: '#000000',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
