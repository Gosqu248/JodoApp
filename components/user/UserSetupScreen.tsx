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
import * as ImagePicker from 'expo-image-picker';
import {useUser} from '@/context/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function UserSetupScreen() {
    const {updateUserInfo} = useUser();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || birthDate;
        setShowDatePicker(Platform.OS === 'ios');
        setBirthDate(currentDate);
    };

    const pickImageFromLibrary = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Błąd', 'Potrzebujemy uprawnień do dostępu do galerii!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Błąd', 'Potrzebujemy uprawnień do kamery!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Błąd', 'Proszę wypełnić wszystkie wymagane pola');
            return;
        }

        if (!profileImage) {
            Alert.alert('Błąd', 'Proszę dodać zdjęcie profilowe');
            return;
        }

        setLoading(true);
        try {
            await updateUserInfo({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                birthDate: birthDate.toISOString(),            // ← serializacja daty
                profileImageUri: profileImage!,                 // ← nazwa zgodna z API :contentReference[oaicite:1]{index=1}
            });
        } catch (e) {
            Alert.alert('Błąd', 'Nie udało się zapisać danych.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) =>
        date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
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
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Data urodzenia *</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(!showDatePicker)}
                            >
                                <Text style={styles.dateText}>
                                    {formatDate(birthDate)}
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
                            {profileImage ? (
                                <Image
                                    source={{uri: profileImage}}
                                    style={styles.profileImage}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="person-outline" size={60} color="#999"/>
                                </View>
                            )}
                        </View>

                        <View style={styles.photoButtonsContainer}>
                            <TouchableOpacity
                                style={styles.photoButton}
                                onPress={takePhoto}
                            >
                                <Ionicons name="camera-outline" size={20} color="#ffc500"/>
                                <Text style={styles.photoButtonText}>Zrób zdjęcie</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.photoButton}
                                onPress={pickImageFromLibrary}
                            >
                                <Ionicons name="images-outline" size={20} color="#ffc500"/>
                                <Text style={styles.photoButtonText}>
                                    {profileImage ? 'Zmień z galerii' : 'Dodaj z galerii'}
                                </Text>
                            </TouchableOpacity>
                        </View>

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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 80
    },
    header: {
        alignItems: 'center',
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
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
        overflow: 'hidden'
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
        backgroundColor: '#f5f5f5'
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 20
    },
    photoButtonText: {
        color: '#ffc500',
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
        borderColor: '#4CAF50'
    },
    photoInfoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#2E7D32',
        lineHeight: 20
    },
    photoButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffc500',
        borderRadius: 12,
        padding: 16,
        marginTop: 10
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc'
    },
    submitButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8
    }
});