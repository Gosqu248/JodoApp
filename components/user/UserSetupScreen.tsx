import React, {useState} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    TextInput,
    Alert,
    Platform
} from 'react-native';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {useUser} from '@/context/UserContext';
import {useAuth} from '@/context/AuthContext';
import {useRouter} from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useImagePicker} from "@/utils/useImagePicker";
import {formatDate} from "@/utils/formatters";

export default function UserSetupScreen() {
    const {updateUserInfo, loading} = useUser();
    const {logout} = useAuth();
    const router = useRouter();
    const {selectedImage, showImagePicker} = useImagePicker();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Phone number formatting and validation
    const formatPhoneNumber = (text: string) => {
        // Remove all non-digits and limit to 9 digits (Polish mobile number)
        const cleaned = text.replace(/\D/g, '');
        return cleaned.slice(0, 9);
    };

    // Validate form fields
    const validateForm = () => {
        const errors: string[] = [];

        if (!firstName.trim()) {
            errors.push('Imię jest wymagane');
        } else if (firstName.trim().length < 2) {
            errors.push('Imię musi mieć co najmniej 2 znaki');
        }

        if (!lastName.trim()) {
            errors.push('Nazwisko jest wymagane');
        } else if (lastName.trim().length < 2) {
            errors.push('Nazwisko musi mieć co najmniej 2 znaki');
        }

        if (!phoneNumber.trim()) {
            errors.push('Numer telefonu jest wymagany');
        } else if (phoneNumber.length !== 9) {
            errors.push('Numer telefonu musi mieć 9 cyfr');
        }

        if (!selectedImage) {
            errors.push('Zdjęcie profilowe jest wymagane');
        }

        // Check if birth date is not in the future
        const today = new Date();
        if (birthDate > today) {
            errors.push('Data urodzenia nie może być w przyszłości');
        }

        // Check if user is at least 13 years old
        const minAge = new Date();
        minAge.setFullYear(minAge.getFullYear() - 13);
        if (birthDate > minAge) {
            errors.push('Musisz mieć co najmniej 13 lat');
        }

        return errors;
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || birthDate;
        setShowDatePicker(Platform.OS === 'ios');
        setBirthDate(currentDate);
    };

    const handleSubmit = async () => {
        const validationErrors = validateForm();

        if (validationErrors.length > 0) {
            Alert.alert('Błąd walidacji', validationErrors.join('\n'));
            return;
        }

        try {
            await updateUserInfo({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim(),
                birthDate: birthDate.toISOString(),
                profileImageUri: selectedImage!,
            });
        } catch {
            Alert.alert('Błąd', 'Nie udało się zapisać danych. Spróbuj ponownie.');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/(tabs)');
        } catch {
            Alert.alert('Błąd', 'Nie udało się wylogować.');
        }
    };

    const handlePhoneNumberChange = (text: string) => {
        const formatted = formatPhoneNumber(text);
        setPhoneNumber(formatted);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Uzupełnij swoje dane</Text>
                    <Text style={styles.subtitle}>
                        Potrzebujemy tych informacji, aby dokończyć konfigurację Twojego konta
                    </Text>
                </View>

                {/* Sekcja danych osobowych */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dane osobowe</Text>
                    <View style={styles.formCard}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Imię *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Wprowadź swoje imię"
                                value={firstName}
                                onChangeText={setFirstName}
                                autoCapitalize="words"
                                maxLength={50}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nazwisko *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Wprowadź swoje nazwisko"
                                value={lastName}
                                onChangeText={setLastName}
                                autoCapitalize="words"
                                maxLength={50}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Numer Telefonu *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="123456789"
                                value={phoneNumber}
                                onChangeText={handlePhoneNumberChange}
                                keyboardType="numeric"
                                maxLength={9}
                            />
                            <Text style={styles.helperText}>
                                Podaj 9 cyfr numeru telefonu (bez kierunkowego)
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Data urodzenia *</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(!showDatePicker)}
                            >
                                <Text style={styles.dateText}>
                                    {formatDate(new Date(birthDate))}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color="#666"/>
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={birthDate}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>
                </View>

                {/* Sekcja zdjęcia profilowego */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Zdjęcie profilowe</Text>
                    <View style={styles.photoCard}>
                        <View style={styles.photoContainer}>
                            {selectedImage ? (
                                <Image
                                    source={{uri: selectedImage}}
                                    style={styles.profileImage}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="person-outline" size={60} color="#999"/>
                                    <Text style={styles.placeholderText}>Wybierz zdjęcie</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.photoButton}
                            onPress={showImagePicker}
                        >
                            <Ionicons name="camera" size={20} color="#ffc500"/>
                            <Text style={styles.photoButtonText}>
                                {selectedImage ? 'Zmień zdjęcie' : 'Wybierz zdjęcie'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.photoInfo}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50"/>
                            <Text style={styles.photoInfoText}>
                                Zdjęcie profilowe jest wymagane, aby nikt nie mógł się podszywać
                                pod Ciebie i korzystać z Twojego karnetu
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Przycisk zapisania */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <Text style={styles.submitButtonText}>Zapisywanie...</Text>
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#000"/>
                            <Text style={styles.submitButtonText}>Zapisz i kontynuuj</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Przycisk powrotu */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="arrow-back" size={20} color="#000" />
                    <Text style={styles.submitButtonText}>Powrót do logowania</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContainer: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 30
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22
    },
    section: {
        marginBottom: 30
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#ffc500',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    inputContainer: {
        marginBottom: 20
    },
    inputLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600'
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginLeft: 4
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#f9f9f9'
    },
    dateText: {
        fontSize: 16,
        color: '#333'
    },
    photoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#ffc500',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center'
    },
    photoContainer: {
        width: 150,
        height: 150,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%'
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 50,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    photoButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8
    },
    photoInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f8f0',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4CAF50',
        width: '100%'
    },
    photoInfoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#2E7D32',
        lineHeight: 20
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffc500',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc'
    },
    submitButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#cccac9',
        borderRadius: 12,
        padding: 16,
        marginTop: 30,
        marginBottom: 40
    },
});