/**
 * LoginScreen Component
 *
 * Main login screen for the Jodo application.
 * Handles user authentication and navigation to registration and password reset.
 *
 * @returns {JSX.Element} Login screen with form
 */
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Linking
} from 'react-native'
import React, {useContext, useState, useEffect} from 'react'
import {AuthContext} from "@/context/AuthContext";
import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import * as SecureStore from 'expo-secure-store';
import RegisterScreen from './RegisterScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import {handleApiError} from "@/utils/errorHandler";

export default function LoginScreen() {
    // Get login function from AuthContext
    const { login } = useContext(AuthContext);

    // Login form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // View management state (login, register, reset)
    const [currentView, setCurrentView] = useState<'login' | 'register' | 'reset'>('login');

    // Loading state during login
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Load saved username on component mount
     */
    useEffect(() => {
        loadSavedUsername();
    }, []);

    /**
     * Load saved username from secure storage
     */
    const loadSavedUsername = async () => {
        try {
            const savedUsername = await SecureStore.getItemAsync('lastUsername');
            if (savedUsername) {
                setUsername(savedUsername);
            }
        } catch (error) {
            console.log('Error loading saved username:', error);
        }
    };

    /**
     * Save username to secure storage for future use
     */
    const saveUsername = async (username: string) => {
        try {
            await SecureStore.setItemAsync('lastUsername', username);
        } catch (error) {
            console.log('Error saving username:', error);
        }
    };

    /**
     * Handles user login process
     * Validates form fields and calls login function from AuthContext
     */
    const handleLogin = async () => {
        // Basic validation - check if fields are not empty
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await login(username, password);
            // Save username for future logins if login is successful
            await saveUsername(username);
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Opens privacy policy link in browser
     */
    const openPrivacyPolicy = () => {
        Linking.openURL('https://jodogym.com/polityka-prywatnosci');
    };

    /**
     * Opens terms and conditions link in browser
     */
    const openTerms = () => {
        Linking.openURL('https://jodogym.com/regulamin');
    };

    // Render registration screen
    if (currentView === 'register') {
        return <RegisterScreen onBackToLogin={() => setCurrentView('login')} />;
    }

    // Render password reset screen
    if (currentView === 'reset') {
        return <ResetPasswordScreen onBackToLogin={() => setCurrentView('login')} />;
    }

    // Main login screen view
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
                    contentContainerStyle={styles.scrollViewContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        {/* App logo */}
                        <Image source={require('@/assets/images/Jodo.png')} style={styles.logo} />

                        {/* Welcome header */}
                        <Text style={styles.title}>Witamy ponownie!</Text>
                        <Text style={styles.subtitle}>Zaloguj się do swojego konta</Text>

                        <View style={styles.formContainer}>
                            {/* Email field */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#666"
                                    value={username}
                                    onChangeText={setUsername}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect={false}
                                    textContentType="emailAddress"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Password field */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Hasło"
                                    placeholderTextColor="#666"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    autoComplete="current-password"
                                    textContentType="password"
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />
                            </View>

                            {/* Forgot password link */}
                            <TouchableOpacity
                                style={styles.forgotPasswordContainer}
                                onPress={() => setCurrentView('reset')}
                            >
                                <Text style={styles.forgotPasswordText}>Zapomniałeś hasła?</Text>
                            </TouchableOpacity>

                            {/* Login button */}
                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <Text style={styles.loginButtonText}>
                                    {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                                </Text>
                            </TouchableOpacity>

                            {/* Separator */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>lub</Text>
                                <View style={styles.divider} />
                            </View>

                            {/* Register button */}
                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={() => setCurrentView('register')}
                            >
                                <Text style={styles.registerButtonText}>Utwórz nowe konto</Text>
                            </TouchableOpacity>

                            {/* Privacy policy and terms links */}
                            <View style={styles.legalLinksContainer}>
                                <TouchableOpacity onPress={openPrivacyPolicy}>
                                    <Text style={styles.legalLinkText}>Polityka Prywatności</Text>
                                </TouchableOpacity>
                                <Text style={styles.legalSeparator}> | </Text>
                                <TouchableOpacity onPress={openTerms}>
                                    <Text style={styles.legalLinkText}>Regulamin</Text>
                                </TouchableOpacity>
                            </View>
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
    scrollViewContent: {
        flexGrow: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        paddingTop: 10,
        paddingBottom: 40,
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
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
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
    loginButtonText: {
        color: '#ffc500',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#ffffff',
        fontSize: 14,
    },
    registerButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    registerButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Nowe style dla linków prawnych
    legalLinksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    legalLinkText: {
        color: '#ffffff',
        fontSize: 14,
        textDecorationLine: 'underline',
        opacity: 0.8,
    },
    legalSeparator: {
        color: '#ffffff',
        fontSize: 14,
        opacity: 0.8,
    },
});
