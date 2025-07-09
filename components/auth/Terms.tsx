import {StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar} from 'react-native'
import React from 'react'
import {LinearGradient} from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

interface TermsProps {
    onBack: () => void;
    onViewPrivacy?: () => void;
}

export default function Terms({ onBack, onViewPrivacy }: TermsProps) {
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
                <Text style={styles.headerTitle}>Regulamin</Text>
            </View>

            <TouchableOpacity 
                style={styles.privacyButton}
                onPress={() => {
                    if (onViewPrivacy) {
                        onViewPrivacy();
                    } else {
                        // Fall back to onBack if onViewPrivacy is not provided
                        onBack();
                    }
                }}
            >
                <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                <Text style={styles.privacyButtonText}>Zobacz Politykę Prywatności</Text>
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

                    <Text style={styles.sectionTitle}>1. Postanowienia ogólne</Text>
                    <Text style={styles.paragraph}>
                        Niniejszy Regulamin określa zasady korzystania z aplikacji Jodo oraz prawa i obowiązki
                        Użytkowników. Korzystanie z aplikacji oznacza akceptację niniejszego Regulaminu.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Definicje</Text>
                    <Text style={styles.paragraph}>
                        Dla potrzeb niniejszego Regulaminu przyjmuje się następujące znaczenie pojęć:
                    </Text>
                    <Text style={styles.bulletPoint}>• Aplikacja - aplikacja mobilna Jodo</Text>
                    <Text style={styles.bulletPoint}>• Użytkownik - osoba korzystająca z Aplikacji</Text>
                    <Text style={styles.bulletPoint}>• Konto - indywidualne konto Użytkownika w Aplikacji</Text>

                    <Text style={styles.sectionTitle}>3. Rejestracja i konto</Text>
                    <Text style={styles.paragraph}>
                        Korzystanie z pełnej funkcjonalności Aplikacji wymaga utworzenia Konta. Podczas rejestracji
                        Użytkownik zobowiązany jest do podania prawdziwych danych oraz akceptacji Regulaminu i
                        Polityki Prywatności.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Zasady korzystania</Text>
                    <Text style={styles.paragraph}>
                        Użytkownik zobowiązuje się do:
                    </Text>
                    <Text style={styles.bulletPoint}>• Korzystania z Aplikacji zgodnie z jej przeznaczeniem</Text>
                    <Text style={styles.bulletPoint}>• Niepodejmowania działań zakłócających funkcjonowanie Aplikacji</Text>
                    <Text style={styles.bulletPoint}>• Nieudostępniania swojego Konta osobom trzecim</Text>
                    <Text style={styles.bulletPoint}>• Przestrzegania przepisów prawa oraz zasad współżycia społecznego</Text>

                    <Text style={styles.sectionTitle}>5. Odpowiedzialność</Text>
                    <Text style={styles.paragraph}>
                        Administrator Aplikacji nie ponosi odpowiedzialności za:
                    </Text>
                    <Text style={styles.bulletPoint}>• Przerwy w działaniu Aplikacji wynikające z przyczyn technicznych</Text>
                    <Text style={styles.bulletPoint}>• Szkody wynikłe z nieprawidłowego korzystania z Aplikacji</Text>
                    <Text style={styles.bulletPoint}>• Treści zamieszczane przez Użytkowników</Text>

                    <Text style={styles.sectionTitle}>6. Prawa własności intelektualnej</Text>
                    <Text style={styles.paragraph}>
                        Wszelkie prawa własności intelektualnej do Aplikacji, w tym do jej elementów graficznych,
                        logotypów, układu, treści oraz kodu źródłowego, przysługują Administratorowi Aplikacji.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Reklamacje</Text>
                    <Text style={styles.paragraph}>
                        Reklamacje dotyczące działania Aplikacji można zgłaszać na adres: support@jodo.app.
                        Reklamacja powinna zawierać opis problemu oraz dane kontaktowe Użytkownika.
                    </Text>

                    <Text style={styles.sectionTitle}>8. Zmiany Regulaminu</Text>
                    <Text style={styles.paragraph}>
                        Administrator zastrzega sobie prawo do zmiany Regulaminu. O wszelkich zmianach Użytkownicy
                        będą informowani za pośrednictwem Aplikacji.
                    </Text>

                    <Text style={styles.sectionTitle}>9. Postanowienia końcowe</Text>
                    <Text style={styles.paragraph}>
                        W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.
                        Wszelkie spory wynikłe na tle stosowania Regulaminu będą rozstrzygane przez sąd właściwy dla
                        siedziby Administratora.
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
    privacyButton: {
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
    privacyButtonText: {
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
