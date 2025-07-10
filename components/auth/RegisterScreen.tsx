import {Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform} from 'react-native'
import React, {useState, useContext} from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import {Ionicons} from "@expo/vector-icons";
import {Image} from "expo-image";
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms';
import {AuthContext} from "@/context/AuthContext";

interface RegisterScreenProps {
    onBackToLogin: () => void;
}

export default function RegisterScreen({ onBackToLogin}: RegisterScreenProps) {
    const { register } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentView, setCurrentView] = useState<'register' | 'privacy' | 'terms'>('register');

    const validateForm = () => {
        if (!email.trim()) {
            Alert.alert('Błąd', 'Proszę podać email');
            return false;
        }
        if (!email.includes('@')) {
            Alert.alert('Błąd', 'Proszę podać prawidłowy adres email');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Błąd', 'Hasła nie są identyczne');
            return false;
        }
        if (!acceptTerms) {
            Alert.alert('Błąd', 'Musisz zaakceptować regulamin i politykę prywatności');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const success = await register(email, password);
            if (success) {
                Alert.alert(
                    'Sukces!',
                    'Konto zostało utworzone pomyślnie. Możesz się teraz zalogować.',
                    [{ text: 'OK', onPress: onBackToLogin }]
                );
            } else {
                Alert.alert('Błąd', 'Rejestracja nie powiodła się. Spróbuj ponownie.');
            }
        } catch (error) {
            Alert.alert('Błąd', 'Wystąpił błąd podczas rejestracji');
        } finally {
            setIsLoading(false);
        }
    };

    if (currentView === 'privacy') {
        return <PrivacyPolicy 
            onBack={() => setCurrentView('register')} 
            onViewTerms={() => setCurrentView('terms')}
        />;
    }

    if (currentView === 'terms') {
        return <Terms 
            onBack={() => setCurrentView('register')} 
            onViewPrivacy={() => setCurrentView('privacy')}
        />;
    }

    return (
        <LinearGradient
            colors={['#1a1a1a', '#ffc500']}
            locations={[0.3, 1]}
            style={styles.container}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Image source={require('@/assets/images/Jodo.png')} style={styles.logo} />

                    <Text style={styles.title}>Utwórz konto</Text>
                    <Text style={styles.subtitle}>Dołącz do nas już dziś!</Text>

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
                                autoComplete="new-password"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Potwierdź hasło"
                                placeholderTextColor="#666"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                autoComplete="new-password"
                            />
                        </View>

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
                                    onPress={() => setCurrentView('terms')}
                                >Regulamin</Text>
                                {' '}i{' '}
                                <Text
                                    style={styles.linkText}
                                    onPress={() => setCurrentView('privacy')}
                                >Politykę Prywatności</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerButtonText}>
                                {isLoading ? 'Tworzenie konta...' : 'Zarejestruj się'}
                            </Text>
                        </TouchableOpacity>

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
        paddingTop: 50,
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
