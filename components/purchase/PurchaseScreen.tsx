import React, {useCallback, useEffect, useState} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MembershipPurchase } from "@/types/MembershipPurchase";
import PurchaseItem from './PurchaseItem';
import {getPurchasesByMembershipId} from "@/api/purchase";
import {useUser} from "@/context/UserContext";

/**
 * PurchaseScreen Component
 *
 * Main screen for displaying user's purchase history and statistics.
 * Features pull-to-refresh, loading states, empty states, and purchase analytics.
 *
 * Key Features:
 * - Displays total purchases count and spending
 * - Shows purchase history with individual items
 * - Pull-to-refresh functionality
 * - Loading and error handling
 * - Empty state when no purchases exist
 */
export default function PurchaseScreen() {
    const [purchases, setPurchases] = useState<MembershipPurchase[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { membership } = useUser();

    // Fetch purchases when membership changes
    useEffect(() => {
        if (membership?.id) {
            fetchPurchases();
        }
    }, [membership]);

    /**
     * Fetches purchase data from API based on current membership ID
     * Handles loading states and error scenarios
     */
    const fetchPurchases = useCallback(async () => {
        if (!membership?.id) return;

        try {
            setLoading(true);
            const response = await getPurchasesByMembershipId(membership.id);
            setPurchases(response.content || []);
            setTotal(response.totalElements || 0);
        } catch {
            Alert.alert('Błąd', 'Wystąpił błąd podczas pobierania danych zakupów');
        } finally {
            setLoading(false);
        }
    }, [membership?.id]);

    /**
     * Handles pull-to-refresh functionality
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPurchases();
        setRefreshing(false);
    };

    /**
     * Calculates total amount spent across all purchases
     * @returns Total spending amount
     */
    const calculateTotalSpent = (): number => {
        return purchases.reduce((total, purchase) => total + purchase.price, 0);
    };

    // Show loading screen while fetching initial data
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ffd500" />
                    <Text style={styles.loadingText}>Ładowanie zakupów...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#ffd500']}
                        tintColor="#ffd500"
                    />
                }
            >
                {/* Header section with title and description */}
                <View style={styles.headerSection}>
                    <LinearGradient
                        colors={['#ffd500', '#ff9000']}
                        style={styles.headerGradient}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.headerIconContainer}>
                                <Ionicons name="receipt" size={32} color="#ffffff" />
                            </View>
                            <Text style={styles.headerTitle}>Moje Zakupy</Text>
                            <Text style={styles.headerSubtitle}>Historia karnetów i płatności</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Statistics cards showing purchase metrics */}
                <View style={styles.statsSection}>
                    <View style={styles.statsRow}>
                        {/* Total purchases count card */}
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="card" size={20} color="#4CAF50" />
                            </View>
                            <View style={styles.statTextContainer}>
                                <Text style={styles.statValue}>{total}</Text>
                                <Text style={styles.statLabel}>Łącznie karnetów</Text>
                            </View>
                        </View>

                        {/* Total spending card */}
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="trending-up" size={20} color="#2196F3" />
                            </View>
                            <View style={styles.statTextContainer}>
                                <Text style={styles.statValue}>
                                    {calculateTotalSpent().toLocaleString('pl-PL', {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2
                                    })} zł
                                </Text>
                                <Text style={styles.statLabel}>Łączne wydatki</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Purchase history list */}
                <View style={styles.listSection}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Historia zakupów</Text>
                        <Text style={styles.listSubtitle}>
                            {purchases.length} {purchases.length === 1 ? 'zakup' : 'zakupów'}
                        </Text>
                    </View>

                    {purchases.length > 0 ? (
                        <View style={styles.purchasesList}>
                            {purchases.map((purchase) => (
                                <PurchaseItem
                                    key={purchase.id}
                                    purchase={purchase}
                                />
                            ))}
                        </View>
                    ) : (
                        // Empty state when no purchases exist
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
                            </View>
                            <Text style={styles.emptyStateTitle}>Brak zakupów</Text>
                            <Text style={styles.emptyStateText}>
                                Nie masz jeszcze żadnych zakupionych karnetów
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingBottom: Platform.OS === 'android' ? 25 : 0
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500'
    },
    scrollView: {
        flex: 1
    },
    scrollContainer: {
        paddingBottom: 32
    },
    headerSection: {
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 20
    },
    headerGradient: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#ffd500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    headerContent: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 24
    },
    headerIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center'
    },
    statsSection: {
        marginHorizontal: 16,
        marginBottom: 24
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 213, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    statTextContainer: {
        flex: 1
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2
    },
    statLabel: {
        fontSize: 12,
        color: '#666'
    },
    listSection: {
        flex: 1
    },
    listHeader: {
        paddingHorizontal: 16,
        marginBottom: 16
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4
    },
    listSubtitle: {
        fontSize: 14,
        color: '#666'
    },
    purchasesList: {
        gap: 0
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6b7280',
        marginBottom: 8,
        textAlign: 'center'
    },
    emptyStateText: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 24
    }
});