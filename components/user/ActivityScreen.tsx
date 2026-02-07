import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useUser } from '@/context/UserContext';
import { ActivityStatus } from '@/types/ActivityStatus';
import { getWeeklyStats, getMonthlyStats, getTotalActivity, getUsersOnGym, PaginationParams} from '@/api/activity';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { formatActivityDuration } from '@/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';

type StatsType = 'weekly' | 'monthly' | 'total';

export default function ActivityScreen() {
    const { user } = useAuth();
    const { isInGym, sessionDetails, setLocationStatus } = useUser();
    const [selectedStats, setSelectedStats] = useState<StatsType>('weekly');
    const [activityStatus, setActivityStatus] = useState<ActivityStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [onGymCount, setOnGymCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMorePages, setHasMorePages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const { forceUpdate } = useLocationTracking(user?.id || null, setLocationStatus);
    const { startTime, currentSessionMinutes } = sessionDetails;
    const [liveMinutes, setLiveMinutes] = useState<number>(0);

    // Calculate live session duration based on startTime from backend
    // This ensures accurate time display after returning from background
    useEffect(() => {
        if (!isInGym || !startTime) {
            setLiveMinutes(0);
            return;
        }

        const calculateMinutes = () => {
            const start = new Date(startTime).getTime();
            const now = Date.now();
            const diffMinutes = Math.floor((now - start) / 60000);
            setLiveMinutes(diffMinutes);
        };

        // Calculate immediately
        calculateMinutes();

        // Update every 30 seconds for live display
        const interval = setInterval(calculateMinutes, 30000);

        return () => clearInterval(interval);
    }, [isInGym, startTime]);

    // Use live calculated minutes, fallback to backend value
    const displayMinutes = useMemo(() => {
        if (!isInGym) return 0;
        // Use the larger of liveMinutes or currentSessionMinutes for accuracy
        return Math.max(liveMinutes, currentSessionMinutes ?? 0);
    }, [isInGym, liveMinutes, currentSessionMinutes]);

    // Debug logging for location tracking state
    useEffect(() => {
        console.log('🎯 ActivityScreen - Location Tracking State:', {
            isInGym,
            startTime,
            currentSessionMinutes,
            liveMinutes,
            displayMinutes,
            hasSessionDetails: !!sessionDetails,
            userId: user?.id
        });
    }, [isInGym, startTime, currentSessionMinutes, liveMinutes, displayMinutes, sessionDetails, user?.id]);

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

            console.log('📊 Stats fetched:', {
                selectedStats,
                totalMinutes: stats.totalMinutes,
                totalActivities: stats.activities.totalElements
            });

        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            Alert.alert('Błąd', 'Nie udało się pobrać statystyk aktywności');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [user?.id, selectedStats]);

    // Fetch current gym occupancy count
    const fetchOnGymCount = useCallback(async () => {
        try {
            const count = await getUsersOnGym();
            setOnGymCount(count);
            console.log('👥 Gym occupancy:', count);
        } catch (error) {
            console.error('❌ Error fetching gym count:', error);
            Alert.alert('Błąd', 'Błąd przy pobieraniu liczby osób na siłowni');
        }
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log('🔄 ActivityScreen focused');
            if (user?.id) {
                // Force location update to get latest gym status
                console.log('📍 Calling forceUpdate...');
                forceUpdate().then(() => {
                    console.log('✅ forceUpdate completed');
                }).catch((error) => {
                    console.error('❌ forceUpdate error:', error);
                });

                fetchOnGymCount();
                setCurrentPage(0);
                fetchStats(0, true);
            }
        }, [user?.id, forceUpdate, fetchOnGymCount, fetchStats])
    );

    // Handle selectedStats change - reset page and fetch new data
    useEffect(() => {
        if (user?.id) {
            setCurrentPage(0);
            fetchStats(0, true);
        }
    }, [selectedStats, user?.id]);

    // Handle pull-to-refresh
    const handleRefresh = async () => {
        console.log('🔄 Manual refresh triggered');
        setRefreshing(true);
        setCurrentPage(0);
        await Promise.all([
            forceUpdate(),
            fetchStats(0, true),
            fetchOnGymCount()
        ]);
        setRefreshing(false);
        console.log('✅ Manual refresh completed');
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

    // Show loading spinner while initial data is loading
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#ffc500" style={styles.loader} />
            </SafeAreaView>
        );
    }

    console.log('🎨 Render state:', {
        isInGym,
        displayMinutes,
        startTime
    });

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
                {/* Gym status indicator - always visible */}
                <View style={[
                    styles.gymStatusCard,
                    isInGym ? styles.gymStatusCardActive : styles.gymStatusCardInactive
                ]}>
                    <View style={styles.gymStatusRow}>
                        <Ionicons
                            name={isInGym ? 'location' : 'location-outline'}
                            size={24}
                            color={isInGym ? '#4CAF50' : '#999'}
                        />
                        <Text style={[
                            styles.gymStatusLabel,
                            isInGym ? styles.gymStatusLabelActive : styles.gymStatusLabelInactive
                        ]}>
                            Jesteś na siłowni:
                        </Text>
                        <View style={[
                            styles.gymStatusBadge,
                            isInGym ? styles.gymStatusBadgeActive : styles.gymStatusBadgeInactive
                        ]}>
                            <Text style={[
                                styles.gymStatusBadgeText,
                                isInGym ? styles.gymStatusBadgeTextActive : styles.gymStatusBadgeTextInactive
                            ]}>
                                {isInGym ? 'TAK' : 'NIE'}
                            </Text>
                        </View>
                    </View>
                    {isInGym && startTime && (
                        <View style={styles.gymStatusDetails}>
                            <Text style={styles.gymStatusTime}>
                                Czas treningu: {formatActivityDuration(displayMinutes)}
                            </Text>
                            <Text style={styles.gymStatusStartTime}>
                                Start: {new Date(startTime).toLocaleTimeString('pl-PL', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Current gym occupancy display */}
                <View style={styles.activityButton}>
                    <Ionicons name="people-outline" size={24} color="#000" />
                    <Text style={styles.activityButtonText}>Osób na siłowni: {onGymCount}</Text>
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Moja aktywność</Text>
                </View>

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

    // Gym status card - always visible
    gymStatusCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
    },
    gymStatusCardActive: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
    },
    gymStatusCardInactive: {
        backgroundColor: '#f8f9fa',
        borderColor: '#e0e0e0',
    },
    gymStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gymStatusLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
        flex: 1,
    },
    gymStatusLabelActive: {
        color: '#2E7D32',
    },
    gymStatusLabelInactive: {
        color: '#666',
    },
    gymStatusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    gymStatusBadgeActive: {
        backgroundColor: '#4CAF50',
    },
    gymStatusBadgeInactive: {
        backgroundColor: '#e0e0e0',
    },
    gymStatusBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    gymStatusBadgeTextActive: {
        color: '#fff',
    },
    gymStatusBadgeTextInactive: {
        color: '#666',
    },
    gymStatusDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#C8E6C9',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gymStatusTime: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    gymStatusStartTime: {
        fontSize: 14,
        color: '#4CAF50',
    },

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
        padding: 16,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#ffc500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    activityButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginLeft: 12,
        flex: 1
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
});