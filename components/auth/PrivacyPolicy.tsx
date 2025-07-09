import {StyleSheet, Text, View, TouchableOpacity, ScrollView} from 'react-native'
import React from 'react'
import {LinearGradient} from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
    return (
        <LinearGradient
            colors={['#000000', '#ffd500']}
            locations={[0.2, 1]}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Polityka Prywatności</Text>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.lastUpdated}>
                        Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
                    </Text>

                    <Text style={styles.sectionTitle}>1. Informacje ogólne</Text>
                    <Text style={styles.paragraph}>
                        Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych
                        przekazanych przez Użytkowników w związku z korzystaniem z aplikacji Jodo.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Administrator danych</Text>
                    <Text style={styles.paragraph}>
                        Administratorem danych osobowych jest [Nazwa firmy], z siedzibą w [Adres],
                        wpisana do rejestru przedsiębiorców pod numerem KRS [numer].
                    </Text>

                    <Text style={styles.sectionTitle}>3. Rodzaje przetwarzanych danych</Text>
                    <Text style={styles.paragraph}>
                        Przetwarzamy następujące kategorie danych osobowych:
                    </Text>
                    <Text style={styles.bulletPoint}>• Dane identyfikacyjne (imię, nazwisko)</Text>
                    <Text style={styles.bulletPoint}>• Dane kontaktowe (adres e-mail)</Text>
                    <Text style={styles.bulletPoint}>• Dane dotyczące korzystania z aplikacji</Text>

                    <Text style={styles.sectionTitle}>4. Cele przetwarzania danych</Text>
                    <Text style={styles.paragraph}>
                        Dane osobowe przetwarzane są w następujących celach:
                    </Text>
                    <Text style={styles.bulletPoint}>• Rejestracja i prowadzenie konta użytkownika</Text>
                    <Text style={styles.bulletPoint}>• Świadczenie usług aplikacji</Text>
                    <Text style={styles.bulletPoint}>• Komunikacja z użytkownikami</Text>
                    <Text style={styles.bulletPoint}>• Analiza i ulepszanie funkcjonalności</Text>

                    <Text style={styles.sectionTitle}>5. Podstawy prawne</Text>
                    <Text style={styles.paragraph}>
                        Przetwarzanie danych odbywa się na podstawie:
                    </Text>
                    <Text style={styles.bulletPoint}>• Zgody wyrażonej przez użytkownika (art. 6 ust. 1 lit. a RODO)</Text>
                    <Text style={styles.bulletPoint}>• Wykonania umowy (art. 6 ust. 1 lit. b RODO)</Text>
                    <Text style={styles.bulletPoint}>• Prawnie uzasadnionego interesu (art. 6 ust. 1 lit. f RODO)</Text>

                    <Text style={styles.sectionTitle}>6. Okres przechowywania danych</Text>
                    <Text style={styles.paragraph}>
                        Dane osobowe przechowywane są przez okres niezbędny do realizacji celów,
                        dla których zostały zebrane, nie dłużej jednak niż przez okres przedawnienia
                        roszczeń wynikających z umowy.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Prawa użytkownika</Text>
                    <Text style={styles.paragraph}>
                        Użytkownik ma prawo do:
                    </Text>
                    <Text style={styles.bulletPoint}>• Dostępu do swoich danych osobowych</Text>
                    <Text style={styles.bulletPoint}>• Sprostowania danych</Text>
                    <Text style={styles.bulletPoint}>• Usunięcia danych</Text>
                    <Text style={styles.bulletPoint}>• Ograniczenia przetwarzania</Text>
                    <Text style={styles.bulletPoint}>• Przenoszenia danych</Text>
                    <Text style={styles.bulletPoint}>• Wniesienia sprzeciwu</Text>
                    <Text style={styles.bulletPoint}>• Cofnięcia zgody</Text>

                    <Text style={styles.sectionTitle}>8. Bezpieczeństwo danych</Text>
                    <Text style={styles.paragraph}>
                        Stosujemy odpowiednie środki techniczne i organizacyjne w celu zapewnienia
                        bezpieczeństwa przetwarzanych danych osobowych.
                    </Text>

                    <Text style={styles.sectionTitle}>9. Kontakt</Text>
                    <Text style={styles.paragraph}>
                        W sprawach dotyczących ochrony danych osobowych można skontaktować się
                        z nami pod adresem: privacy@jodo.app
                    </Text>

                    <Text style={styles.sectionTitle}>10. Zmiany w Polityce Prywatności</Text>
                    <Text style={styles.paragraph}>
                        Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności.
                        O wszelkich zmianach poinformujemy użytkowników za pośrednictwem aplikacji.
                    </Text>
                </View>
            </ScrollView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    content: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 20,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        marginBottom: 12,
        textAlign: 'justify',
    },
    bulletPoint: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 6,
        paddingLeft: 10,
    },
});