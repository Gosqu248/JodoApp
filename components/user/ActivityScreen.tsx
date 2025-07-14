import React, { useContext, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/context/AuthContext';
import {
    startActivity,
    endActivity,
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
} from '@/api/activity';
import { useRouter } from 'expo-router';
import {ActivityStatus} from "@/types/ActivityStatus";
import { ActivityResponse } from '@/types/ActivityResponse';

type PeriodType = 'daily' | 'weekly' | 'monthly';

export default function ActivityScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [currentActivity, setCurrentActivity] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('daily');
    const [stats, setStats] = useState<ActivityStatus | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadStats();
        }
    }, [user, selectedPeriod]);

    const loadStats = async () => {
        if (!user?.id) return;

        setStatsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            let data: ActivityStatus;

            switch (selectedPeriod) {
                case 'daily':
                    data = await getDailyStats(user.id, today);
                    break;
                case 'weekly':
                    const weekStart = getWeekStart(new Date()).toISOString().split('T')[0];
                    data = await getWeeklyStats(user.id, weekStart);
                    break;
                case 'monthly':
                    const monthStart = getMonthStart(new Date()).toISOString().split('T')[0];
                    data = await getMonthlyStats(user.id, monthStart);
                    break;
                default:
                    data = await getDailyStats(user.id, today);
            }

            setStats(data);
        } catch (error) {
            console.error('Błąd przy pobieraniu statystyk:', error);
            Alert.alert('Błąd', 'Nie udało się pobrać statystyk aktywności');
        } finally {
            setStatsLoading(false);
        }
    };

    const handleStartActivity = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        try {
            const result = await startActivity(user.id);
            setCurrentActivity(result.id);
            Alert.alert('Sukces', 'Aktywność została rozpoczęta!');
        } catch (error) {
            console.error('Błąd przy rozpoczynaniu aktywności:', error);
            Alert.alert('Błąd', 'Nie udało się rozpocząć aktywności');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndActivity = async () => {
        if (!currentActivity) return;

        setIsLoading(true);
        try {
            await endActivity(currentActivity);
            setCurrentActivity(null);
            Alert.alert('Sukces', 'Aktywność została zakończona!');
            loadStats(); // Odświeżamy statystyki
        } catch (error) {
            console.error('Błąd przy kończeniu aktywności:', error);
            Alert.alert('Błąd', 'Nie udało się zakończyć aktywności');
        } finally {
            setIsLoading(false);
        }
    };

    const getWeekStart = (date: Date): Date => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getMonthStart = (date: Date): Date => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPeriodTitle = (): string => {
        switch (selectedPeriod) {
            case 'daily':
                return 'Dzisiaj';
            case 'weekly':
                return 'Ten tydzień';
            case 'monthly':
                return 'Ten miesiąc';
            default:
                return 'Dzisiaj';
        }
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Moja aktywność</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Przycisk Start/Stop */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            currentActivity ? styles.stopButton : styles.startButton
                        ]}
                        onPress={currentActivity ? handleEndActivity : handleStartActivity}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons
                                    name={currentActivity ? "stop" : "play"}
                                    size={32}
                                    color="#fff"
                                />
                                <Text style={styles.actionButtonText}>
                                    {currentActivity ? 'Zakończ trening' : 'Rozpocznij trening'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Selektor okresu */}
                <View style={styles.periodSelector}>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            selectedPeriod === 'daily' && styles.activePeriodButton
                        ]}
                        onPress={() => setSelectedPeriod('daily')}
                    >
                        <Text style={[
                            styles.periodButtonText,
                            selectedPeriod === 'daily' && styles.activePeriodButtonText
                        ]}>
                            Dzień
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            selectedPeriod === 'weekly' && styles.activePeriodButton
                        ]}
                        onPress={() => setSelectedPeriod('weekly')}
                    >
                        <Text style={[
                            styles.periodButtonText,
                            selectedPeriod === 'weekly' && styles.activePeriodButtonText
                        ]}>
                            Tydzień
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            selectedPeriod === 'monthly' && styles.activePeriodButton
                        ]}
                        onPress={() => setSelectedPeriod('monthly')}
                    >
                        <Text style={[
                            styles.periodButtonText,
                            selectedPeriod === 'monthly' && styles.activePeriodButtonText
                        ]}>
                            Miesiąc
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Statystyki */}
                <View style={styles.statsSection}>
                    <Text style={styles.statsTitle}>{getPeriodTitle()}</Text>

                    {statsLoading ? (
                        <ActivityIndicator style={styles.loader} />
                    ) : stats ? (
                        <View>
                            <View style={styles.statsCards}>
                                <View style={styles.statsCard}>
                                    <Ionicons name="time-outline" size={24} color="#ffc500" />
                                    <Text style={styles.statsValue}>
                                        {formatDuration(stats.totalMinutes)}
                                    </Text>
                                    <Text style={styles.statsLabel}>Łączny czas</Text>
                                </View>
                                <View style={styles.statsCard}>
                                    <Ionicons name="fitness-outline" size={24} color="#ffc500" />
                                    <Text style={styles.statsValue}>{stats.sessionsCount}</Text>
                                    <Text style={styles.statsLabel}>Sesje</Text>
                                </View>
                            </View>

                            {/* Lista aktywności */}
                            {stats.activities.length > 0 && (
                                <View style={styles.activitiesSection}>
                                    <Text style={styles.activitiesTitle}>Historia aktywności</Text>
                                    {stats.activities.map((activity: ActivityResponse) => (
                                        <View key={activity.id} style={styles.activityItem}>
                                            <View style={styles.activityInfo}>
                                                <Text style={styles.activityTime}>
                                                    {formatDate(activity.startTime)} - {formatDate(activity.endTime)}
                                                </Text>
                                                <Text style={styles.activityDuration}>
                                                    {formatDuration(activity.durationMinutes)}
                                                </Text>
                                            </View>
                                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text style={styles.noDataText}>Brak danych o aktywności</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    backButton: {
        marginRight: 15
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000'
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 80
    },
    actionSection: {
        alignItems: 'center',
        marginBottom: 30
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8
    },
    startButton: {
        backgroundColor: '#4CAF50'
    },
    stopButton: {
        backgroundColor: '#F44336'
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 30
    },
    periodButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8
    },
    activePeriodButton: {
        backgroundColor: '#ffc500'
    },
    periodButtonText: {
        fontSize: 16,
        color: '#666'
    },
    activePeriodButtonText: {
        color: '#000',
        fontWeight: 'bold'
    },
    statsSection: {
        marginBottom: 30
    },
    statsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center'
    },
    loader: {
        marginTop: 20
    },
    statsCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30
    },
    statsCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: '#ffc500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    statsValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 10,
        marginBottom: 5
    },
    statsLabel: {
        fontSize: 14,
        color: '#666'
    },
    activitiesSection: {
        marginTop: 20
    },
    activitiesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    activityInfo: {
        flex: 1
    },
    activityTime: {
        fontSize: 16,
        color: '#000',
        marginBottom: 5
    },
    activityDuration: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600'
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20
    }
});