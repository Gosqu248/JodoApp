import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TouchableOpacity,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ActivityStatus } from '@/types/ActivityStatus';
import { getWeeklyStats, getMonthlyStats, getTotalActivity, getUsersOnGym, PaginationParams} from '@/api/activity';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { formatActivityDuration } from '@/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';

type StatsType = 'weekly' | 'monthly' | 'total';

export default function ActivityScreen() {
    const { user } = useAuth();
    const [selectedStats, setSelectedStats] = useState<StatsType>('weekly');
    const [activityStatus, setActivityStatus] = useState<ActivityStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [onGymCount, setOnGymCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMorePages, setHasMorePages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const { isInGym, sessionDetails } = useLocationTracking(user?.id || null);
    const { startTime, currentSessionMinutes } = sessionDetails;

    const fetchStats = useCallback(async (page: number = 0, reset: boolean = false) => {
        if (!user?.id) return;

        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const pagination: PaginationParams = {
                page,
                size: 10
            };

            let stats: ActivityStatus;

            // Fetch different stats based on selected period
            if (selectedStats === 'total') {
                stats = await getTotalActivity(user.id, pagination);
            } else if (selectedStats === 'weekly') {
                const weekStart = getWeekStart(new Date()).toISOString().split('T')[0];
                stats = await getWeeklyStats(user.id, weekStart, pagination);
            } else {
                const monthStart = getMonthStart(new Date()).toISOString().split('T')[0];
                stats = await getMonthlyStats(user.id, monthStart, pagination);
            }

            // Update state with new or concatenated data
            if (reset) {
                setActivityStatus(stats);
            } else {
                setActivityStatus(prev => {
                    if (!prev) return stats;
                    return {
                        ...stats,
                        activities: {
                            ...stats.activities,
                            content: [...prev.activities.content, ...stats.activities.content]
                        }
                    };
                });
            }

            const hasMore = page < stats.activities.totalPages - 1;
            setHasMorePages(hasMore);

        } catch {
            Alert.alert('Błąd', 'Nie udało się pobrać statystyk aktywności');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [user?.id, selectedStats]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                fetchOnGymCount();
                setCurrentPage(0);
                fetchStats(0, true);
            }
        }, [fetchStats, user?.id])
    );

    // Handle selectedStats change - reset page and fetch new data
    useEffect(() => {
        if (user?.id) {
            setCurrentPage(0);
            fetchStats(0, true);
        }
    }, [selectedStats, user?.id]);


    // Fetch current gym occupancy count
    const fetchOnGymCount = async () => {
        try {
            const count = await getUsersOnGym();
            setOnGymCount(count);
        } catch {
            Alert.alert('Błąd', 'Błąd przy pobieraniu liczby osób na siłowni');
        }
    };

    // Handle pull-to-refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        setCurrentPage(0);
        await fetchStats(0, true);
        await fetchOnGymCount();
        setRefreshing(false);
    };

    // Load more activities for pagination
    const handleLoadMore = () => {
        if (hasMorePages && !loadingMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchStats(nextPage, false);
        }
    };

    // Handle stats type selection
    const handleStatsTypeChange = (statsType: StatsType) => {
        setSelectedStats(statsType);
        // Reset page when changing stats type - fetchStats will be called by useEffect
        setCurrentPage(0);
    };

    // Utility functions for date calculations
    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getMonthStart = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1);

    // Get display title for selected stats period
    const getStatsTitle = () => {
        if (selectedStats === 'total') return 'Łączna aktywność';
        if (selectedStats === 'weekly') return 'Ten tydzień';
        return 'Ten miesiąc';
    };

    // Get activity status information for current session
    const getActivityStatusInfo = () => {
        if (!isInGym) return null;

        return {
            title: 'Trening w toku',
            icon: 'fitness' as const,
            color: '#4CAF50',
            statusText: 'W siłowni',
            statusColor: '#4CAF50',
            statusIcon: 'location' as const
        };
    };

    // Show loading spinner while initial data is loading
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#ffc500" style={styles.loader} />
            </SafeAreaView>
        );
    }

    const statusInfo = getActivityStatusInfo();

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#ffc500']}
                    />
                }
            >
                {/* Current gym occupancy display */}
                <View style={styles.activityButton}>
                    <Ionicons name="fitness-outline" size={24} color="#000" />
                    <Text style={styles.activityButtonText}>Ilość osób na siłowni: {onGymCount}</Text>
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Moja aktywność</Text>
                </View>

                {/* Current activity card - only shown when user has active session */}
                {isInGym && statusInfo && (
                    <View style={[
                        styles.currentActivityCard,
                        { borderColor: statusInfo.color }
                    ]}>
                        <View style={styles.currentActivityHeader}>
                            <Ionicons name={statusInfo.icon} size={24} color={statusInfo.color} />
                            <Text style={[
                                styles.currentActivityTitle,
                                { color: statusInfo.color }
                            ]}>
                                {statusInfo.title}
                            </Text>
                        </View>
                        <View style={styles.currentActivityTime}>
                            <Text style={styles.currentActivityDuration}>
                                {formatActivityDuration(currentSessionMinutes ?? 0)}
                            </Text>
                            <Text style={styles.currentActivityLabel}>
                                Rozpoczęto:{' '}
                                {startTime ? new Date(startTime).toLocaleTimeString('pl-PL', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : '...'}
                            </Text>
                        </View>
                        <View style={styles.locationStatus}>
                            <Ionicons
                                name={statusInfo.statusIcon}
                                size={16}
                                color={statusInfo.statusColor}
                            />
                            <Text style={[
                                styles.locationText,
                                { color: statusInfo.statusColor }
                            ]}>
                                {statusInfo.statusText}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Period selector tabs */}
                <View style={styles.periodSelector}>
                    {(['weekly', 'monthly', 'total'] as StatsType[]).map((period) => (
                        <TouchableOpacity
                            key={period}
                            style={[
                                styles.periodButton,
                                selectedStats === period && styles.periodButtonActive
                            ]}
                            onPress={() => handleStatsTypeChange(period)}
                        >
                            <Text
                                style={[
                                    styles.periodButtonText,
                                    selectedStats === period && styles.periodButtonTextActive
                                ]}
                            >
                                {period === 'total'
                                    ? 'Łącznie'
                                    : period === 'weekly'
                                        ? 'Tydzień'
                                        : 'Miesiąc'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Statistics section */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>{getStatsTitle()}</Text>

                    {activityStatus ? (
                        <>
                            {/* Summary statistics cards */}
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Ionicons name="time-outline" size={32} color="#ffc500" />
                                    <Text style={styles.statValue}>
                                        {formatActivityDuration(activityStatus.totalMinutes)}
                                    </Text>
                                    <Text style={styles.statLabel}>Łączny czas</Text>
                                </View>

                                <View style={styles.statCard}>
                                    <Ionicons
                                        name="fitness-outline"
                                        size={32}
                                        color="#4CAF50"
                                    />
                                    <Text style={styles.statValue}>
                                        {activityStatus.activities.totalElements}
                                    </Text>
                                    <Text style={styles.statLabel}>Sesje</Text>
                                </View>
                            </View>

                            {/* Activity history list */}
                            {activityStatus.activities.content.length > 0 && (
                                <View style={styles.activitiesSection}>
                                    <Text style={styles.sectionTitle}>
                                        Historia aktywności
                                    </Text>
                                    {activityStatus.activities.content.map((activity) => (
                                        <View
                                            key={activity.id}
                                            style={styles.activityItem}
                                        >
                                            <View style={styles.activityInfo}>
                                                <Text style={styles.activityDate}>
                                                    {new Date(
                                                        activity.startTime
                                                    ).toLocaleDateString('pl-PL',
                                                        { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' })}
                                                </Text>
                                                <Text style={styles.activityTime}>
                                                    {new Date(
                                                        activity.startTime
                                                    ).toLocaleTimeString('pl-PL', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}{' '}
                                                    -{' '}
                                                    {activity.endTime
                                                        ? new Date(activity.endTime).toLocaleTimeString('pl-PL', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : 'W toku'
                                                    }
                                                </Text>
                                            </View>
                                            <View style={styles.activityDuration}>
                                                <Text
                                                    style={
                                                        styles.activityDurationText
                                                    }
                                                >
                                                    {formatActivityDuration(
                                                        activity.durationMinutes
                                                    )}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}

                                    {/* Pagination - Load more button */}
                                    {hasMorePages && (
                                        <TouchableOpacity
                                            style={styles.loadMoreButton}
                                            onPress={handleLoadMore}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? (
                                                <ActivityIndicator size="small" color="#ffc500" />
                                            ) : (
                                                <>
                                                    <Ionicons name="chevron-down" size={20} color="#ffc500" />
                                                    <Text style={styles.loadMoreText}>Załaduj więcej</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </>
                    ) : (
                        // No data state
                        <View style={styles.noDataContainer}>
                            <Ionicons
                                name="fitness-outline"
                                size={48}
                                color="#ccc"
                            />
                            <Text style={styles.noDataText}>
                                Brak danych o aktywności
                            </Text>
                            <Text style={styles.noDataSubText}>
                                Rozpocznij trening, wchodząc do siłowni
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingBottom: Platform.OS === 'android' ? 25 : 0},
    scrollContainer: { padding: 20, paddingBottom: 80 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
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
    currentActivityCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#4CAF50'
    },
    currentActivityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    currentActivityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginLeft: 8
    },
    currentActivityTime: { alignItems: 'center' },
    currentActivityDuration: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000'
    },
    currentActivityLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },

    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20
    },
    periodButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8
    },
    periodButtonActive: { backgroundColor: '#ffc500' },
    periodButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
    periodButtonTextActive: { color: '#000' },

    statsSection: { marginBottom: 30 },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15
    },
    statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
    statLabel: { fontSize: 14, color: '#666', textAlign: 'center' },

    activitiesSection: { marginTop: 20 },
    activityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    activityInfo: { flex: 1 },
    activityDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4
    },
    activityTime: { fontSize: 14, color: '#666' },
    activityDuration: { alignItems: 'flex-end' },
    activityDurationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffc500'
    },

    loadMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
        borderWidth: 2,
        borderColor: '#ffc500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    loadMoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffc500',
        marginLeft: 8
    },

    noDataContainer: { alignItems: 'center', paddingVertical: 40 },
    noDataText: { fontSize: 16, color: '#666', marginTop: 12 },
    noDataSubText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 4 },
    locationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    locationText: {
        fontSize: 14,
        marginLeft: 6
    }
});