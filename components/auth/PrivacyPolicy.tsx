import {StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar} from 'react-native'
import React from 'react'
import {LinearGradient} from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

interface PrivacyPolicyProps {
    onBack: () => void;
    onViewTerms?: () => void;
}

export default function PrivacyPolicy({ onBack, onViewTerms }: PrivacyPolicyProps) {
    return (
        <LinearGradient
            colors={['#1a1a1a', '#ffd700']}
            locations={[0.1, 1]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Polityka Prywatności</Text>
            </View>

            <TouchableOpacity 
                style={styles.termsButton}
                onPress={() => {
                    if (onViewTerms) {
                        onViewTerms();
                    } else {
                        // Fall back to onBack if onViewTerms is not provided
                        onBack();
                    }
                }}
            >
                <Ionicons name="document-text-outline" size={20} color="#fff" />
                <Text style={styles.termsButtonText}>Zobacz Regulamin</Text>
            </TouchableOpacity>

            <ScrollView 
                style={styles.scrollContainer} 
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
            >
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
    termsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 24,
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    termsButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 14,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
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
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContentContainer: {
        paddingBottom: 30,
    },
    content: {
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    lastUpdated: {
        fontSize: 13,
        color: '#555',
        fontStyle: 'italic',
        marginBottom: 24,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 24,
        marginBottom: 14,
        borderLeftWidth: 3,
        borderLeftColor: '#ffd700',
        paddingLeft: 10,
    },
    paragraph: {
        fontSize: 15,
        color: '#333',
        lineHeight: 24,
        marginBottom: 14,
        textAlign: 'justify',
        letterSpacing: 0.2,
    },
    bulletPoint: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginBottom: 8,
        paddingLeft: 16,
    },
});
