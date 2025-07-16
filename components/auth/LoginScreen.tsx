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
    StatusBar
} from 'react-native'
import React, {useContext, useState} from 'react'
import {AuthContext} from "@/context/AuthContext";
import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import RegisterScreen from './RegisterScreen';
import PrivacyPolicy from './PrivacyPolicy';
import ResetPasswordScreen from './ResetPasswordScreen';

export default function LoginScreen() {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [currentView, setCurrentView] = useState<'login' | 'register' | 'privacy' | 'terms' | 'reset'>('login');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Błąd', 'Proszę wypełnić wszystkie pola');
            return;
        }

        setIsLoading(true);
        try {
            await login(username, password);
        } catch (error) {
            Alert.alert('Błąd logowania', 'Nieprawidłowe dane logowania');
        } finally {
            setIsLoading(false);
        }
    };

    if (currentView === 'register') {
        return <RegisterScreen onBackToLogin={() => setCurrentView('login')} />;
    }

    if (currentView === 'privacy') {
        return <PrivacyPolicy onBack={() => setCurrentView('login')} />;
    }

    if (currentView === 'reset') {
        return <ResetPasswordScreen onBackToLogin={() => setCurrentView('login')} />;
    }


    return (
        <LinearGradient
            colors={['#1a1a1a', '#ffc500']}
            locations={[0.3, 1]}
            style={styles.container}
        >
            <StatusBar barStyle="white-content" backgroundColor="#1a1a1a"/>

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

                        <Text style={styles.title}>Witamy ponownie!</Text>
                        <Text style={styles.subtitle}>Zaloguj się do swojego konta</Text>

                        <View style={styles.formContainer}>
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
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Hasło"
                                    placeholderTextColor="#666"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    autoComplete="password"
                                />
                            </View>

                            <TouchableOpacity 
                                style={styles.forgotPasswordContainer}
                                onPress={() => setCurrentView('reset')}
                            >
                                <Text style={styles.forgotPasswordText}>Zapomniałeś hasła?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <Text style={styles.loginButtonText}>
                                    {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>lub</Text>
                                <View style={styles.divider} />
                            </View>

                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={() => setCurrentView('register')}
                            >
                                <Text style={styles.registerButtonText}>Utwórz nowe konto</Text>
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
});
