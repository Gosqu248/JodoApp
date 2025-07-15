import React, {useContext, useEffect, useState} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { getMembership } from '@/api/membership';
import { Membership } from '@/types/Membership';
import { apiUrl } from '@/api/apiUrl';
import { useRouter } from 'expo-router';

export default function UserProfileScreen() {
    const { user, logout } = useContext(AuthContext);
    const { userInfo, loading: userLoading } = useUser();
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [photoLoading, setPhotoLoading] = useState(true);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [membershipLoading, setMembershipLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (userInfo?.id) {
            const uri = `${apiUrl}/user/${userInfo.id}/photo`;
            fetch(uri)
                .then(res => {
                    if (res.ok) {
                        setPhotoUri(uri);
                    } else {
                        setPhotoUri(null);
                    }
                })
                .finally(() => setPhotoLoading(false));
        }
    }, [userInfo]);

    useEffect(() => {
        const fetchMembership = async () => {
            if (user?.id) {
                try {
                    setMembershipLoading(true);
                    const membershipData = await getMembership(user.id);
                    setMembership(membershipData);
                } catch (error) {
                    console.error('Błąd przy pobieraniu danych membership:', error);
                    setMembership(null);
                } finally {
                    setMembershipLoading(false);
                }
            }
        };

        fetchMembership();
    }, [user]);



    if (userLoading || photoLoading || membershipLoading) return <ActivityIndicator />;
    if (!userInfo || !user) return null;

    const membershipExpiryDate = membership?.expiryDate ? new Date(membership.expiryDate) : null;
    const currentDate = new Date();
    const isActive = membership ? membership.isActive : false;
    const daysLeft = membershipExpiryDate ?
        Math.ceil((membershipExpiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const formatDate = (date: Date) =>
        date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

    const handleSettingsPress = () => {
        console.log('Przejdź do ustawień');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header z awatarem, imieniem i ustawieniami */}
                <View style={styles.header}>
                    {/* Ustawienia w prawym górnym rogu */}
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={handleSettingsPress}
                    >
                        <Ionicons name="settings-outline" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Awatar */}
                    <View style={styles.avatarContainer}>
                        {photoUri ? (
                            <Image
                                source={{ uri: photoUri }}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                        ) : (
                            <Image
                                source={require('@/assets/images/Jodo.png')}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                        )}
                    </View>

                    {/* Imię i nazwisko wyśrodkowane */}
                    <View style={styles.nameContainerCenter}>
                        <Text style={styles.firstName}>{userInfo.firstName}</Text>
                        <Text style={styles.lastName}>{userInfo.lastName}</Text>
                    </View>
                </View>

                {/* Sekcja ważności karnetu */}
                <View style={styles.membershipSection}>
                    <Text style={styles.sectionTitle}>Status karnetu</Text>
                    {membership ? (
                        <View style={styles.membershipCard}>
                            <View style={styles.membershipInfo}>
                                <Text style={styles.membershipLabel}>Ważność do:</Text>
                                <Text style={styles.membershipDate}>
                                    {membershipExpiryDate ? formatDate(membershipExpiryDate) : 'Brak danych'}
                                </Text>
                                {isActive && daysLeft > 0 && (
                                    <Text style={styles.daysLeftText}>
                                        Pozostało {daysLeft} dni
                                    </Text>
                                )}
                                {membership.isFrozen && (
                                    <Text style={styles.frozenText}>
                                        Karnet jest zamrożony
                                    </Text>
                                )}
                            </View>
                            <View
                                style={[
                                    styles.statusButton,
                                    { backgroundColor: isActive ? '#4CAF50' : '#F44336' }
                                ]}
                            >
                                <Ionicons
                                    name={isActive ? 'checkmark-circle' : 'close-circle'}
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.statusText}>
                                    {isActive ? 'Aktywny' : 'Nieaktywny'}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.membershipCard}>
                            <Text style={styles.noMembershipText}>
                                Brak danych o karnecie
                            </Text>
                        </View>
                    )}
                </View>

                {/* Przycisk aktywności */}
                <TouchableOpacity
                    style={styles.activityButton}
                    onPress={() => router.push('/activity')}
                >
                    <Ionicons name="fitness-outline" size={24} color="#000" />
                    <Text style={styles.activityButtonText}>Moja aktywność</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>


                {/* Sekcja informacji osobistych */}
                <View style={styles.personalInfoSection}>
                    <Text style={styles.sectionTitle}>Informacje osobiste</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={22} color="#000" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{user.email}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={22} color="#000" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Data urodzenia</Text>
                                <Text style={styles.infoValue}>
                                    {formatDate(new Date(userInfo.birthDate))}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Ionicons name="person-add-outline" size={22} color="#000" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Członek od</Text>
                                <Text style={styles.infoValue}>
                                    {formatDate(new Date(userInfo.createdDate))}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Przycisk wylogowania */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={logout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#ffc500" />
                    <Text style={styles.logoutText}>Wyloguj się</Text>
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
        position: 'relative',
        alignItems: 'center',
        marginBottom: 30
    },
    settingsButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 12,
        backgroundColor: '#ffc500',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4
    },
    avatarContainer: {
        width: 200,
        height: 200,
        borderRadius: 25,
        backgroundColor: '#ffc500',
        borderWidth: 3,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        marginBottom: 16
    },
    avatar: {
        width: 190,
        height: 190,
        borderRadius: 20
    },
    nameContainerCenter: {
        alignItems: 'center'
    },
    firstName: {
        fontSize: 22,
        color: '#666',
        marginBottom: 4
    },
    lastName: {
        fontSize: 26,
        color: '#000',
        fontWeight: 'bold'
    },
    membershipSection: { marginBottom: 30 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 15 },
    membershipCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffc500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    membershipInfo: { flex: 1 },
    membershipLabel: { fontSize: 16, color: '#666', marginBottom: 5 },
    membershipDate: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 3 },
    daysLeftText: { fontSize: 14, color: '#ffc500', fontWeight: '600' },
    frozenText: { fontSize: 14, color: '#FF9800', fontWeight: '600', marginTop: 3 },
    statusButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 15 },
    statusText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 5 },
    noMembershipText: { fontSize: 16, color: '#666', textAlign: 'center', flex: 1 },
    activityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 2,
        borderColor: '#ffc500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    activityButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginLeft: 12,
        flex: 1
    },
    personalInfoSection: { marginBottom: 30 },
    infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: '#ffc500', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    infoContent: { marginLeft: 15, flex: 1 },
    infoLabel: { fontSize: 15, color: '#666', marginBottom: 3 },
    infoValue: { fontSize: 17, color: '#000', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', borderRadius: 12, padding: 16, marginTop: 10 },
    logoutText: { color: '#ffc500', fontSize: 16, fontWeight: '600', marginLeft: 8 }
});