import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native'
import React from 'react'
import {Exercise} from "@/types/Exercise";
import { RankingEntry } from '@/types/RankingEntry';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface RankingDetailsProps {
    exercise: Exercise;
    entries: RankingEntry[];
    loading: boolean;
    getExerciseIcon: (iconRN: string | null | undefined) => keyof typeof Ionicons.glyphMap;
}

export function RankingDetailsComponent({ exercise, entries, loading, getExerciseIcon }: RankingDetailsProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getPodiumColors = (position: number) => {
        switch (position) {
            case 0: return ['#ffd700', '#ffb347']; // Gold
            case 1: return ['#c0c0c0', '#a8a8a8']; // Silver
            case 2: return ['#cd7f32', '#b8860b']; // Bronze
            default: return ['#6366f1', '#8b5cf6']; // Default purple
        }
    };

    const getPodiumIcon = (position: number) => {
        switch (position) {
            case 0: return 'trophy';
            case 1: return 'medal';
            case 2: return 'medal';
            default: return 'ribbon';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Ładowanie rankingu...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Exercise Info Header */}
            <View style={styles.exerciseHeader}>
                <LinearGradient
                    colors={['#ffd500','#ff9000']}
                    style={styles.exerciseHeaderGradient}
                >
                    <View style={styles.exerciseIconContainer}>
                        <Ionicons
                            name={getExerciseIcon(exercise.iconRN)}
                            size={32}
                            color="#ffffff"
                        />
                    </View>
                    <View style={styles.exerciseHeaderText}>
                        <Text style={styles.exerciseHeaderTitle}>{exercise.name}</Text>
                        <Text style={styles.exerciseHeaderSubtitle}>TOP 5 Wyników</Text>
                    </View>
                    <View style={styles.trophyIcon}>
                        <Ionicons name="trophy" size={24} color="#ffffff" />
                    </View>
                </LinearGradient>
            </View>

            {/* Stats Overview */}
            {entries.length > 0 && (
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{entries[0]?.result} kg</Text>
                        <Text style={styles.statLabel}>Najlepszy wynik</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{entries.length}</Text>
                        <Text style={styles.statLabel}>Uczestników</Text>
                    </View>
                </View>
            )}

            {/* Ranking Entries */}
            <View style={styles.rankingContainer}>
                {entries.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="trophy-outline" size={64} color="#d1d5db" />
                        </View>
                        <Text style={styles.emptyStateTitle}>Brak wyników</Text>
                        <Text style={styles.emptyStateText}>
                            Zostań pierwszą osobą, która ustawi rekord w tej kategorii!
                        </Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.rankingTitle}>Ranking</Text>
                        {entries.map((entry, index) => (
                            <View key={entry.id} style={[
                                styles.rankingEntry,
                                index < 3 && styles.podiumEntry
                            ]}>
                                <LinearGradient
                                    colors={index < 3 ? getPodiumColors(index) : ['#ffffff', '#ffffff']}
                                    style={[
                                        styles.rankingGradient,
                                        index >= 3 && styles.regularEntryGradient
                                    ]}
                                >
                                    {/* Position */}
                                    <View style={styles.positionContainer}>
                                        {index < 3 ? (
                                            <View style={[
                                                styles.podiumBadge,
                                                { backgroundColor: 'rgba(0,0,0,0.2)' }
                                            ]}>
                                                <Ionicons
                                                    name={getPodiumIcon(index)}
                                                    size={24}
                                                    color="#ffffff"
                                                />
                                            </View>
                                        ) : (
                                            <View style={styles.regularBadge}>
                                                <Text style={styles.positionNumber}>{index + 1}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* User Info */}
                                    <View style={styles.userInfo}>
                                        <Text style={[
                                            styles.username,
                                            index < 3 && styles.podiumUsername
                                        ]}>
                                            {entry.username}
                                        </Text>
                                        <Text style={[
                                            styles.resultDate,
                                            index < 3 && styles.podiumDate
                                        ]}>
                                            {formatDate(entry.createdAt)}
                                        </Text>
                                    </View>

                                    {/* Result */}
                                    <View style={styles.resultContainer}>
                                        <Text style={[
                                            styles.resultValue,
                                            index < 3 && styles.podiumResult
                                        ]}>
                                            {entry.result}
                                        </Text>
                                        <Text style={[
                                            styles.resultUnit,
                                            index < 3 && styles.podiumUnit
                                        ]}>
                                            kg
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        ))}
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
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
        paddingHorizontal: 20,
        paddingBottom: 40
    },
    exerciseHeader: {
        marginBottom: 24
    },
    exerciseHeaderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 16,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    exerciseIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    exerciseHeaderText: {
        flex: 1
    },
    exerciseHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4
    },
    exerciseHeaderSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)'
    },
    trophyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center'
    },
    rankingContainer: {
        gap: 12
    },
    rankingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60
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
        marginBottom: 8
    },
    emptyStateText: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20
    },
    rankingEntry: {
        borderRadius: 16,
        overflow: 'hidden'
    },
    podiumEntry: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6
    },
    rankingGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16
    },
    regularEntryGradient: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    positionContainer: {
        marginRight: 16
    },
    podiumBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    regularBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb'
    },
    positionNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151'
    },
    userInfo: {
        flex: 1
    },
    username: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4
    },
    podiumUsername: {
        color: '#ffffff'
    },
    resultDate: {
        fontSize: 14,
        color: '#6b7280'
    },
    podiumDate: {
        color: 'rgba(255,255,255,0.8)'
    },
    resultContainer: {
        alignItems: 'flex-end'
    },
    resultValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    podiumResult: {
        color: '#ffffff'
    },
    resultUnit: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2
    },
    podiumUnit: {
        color: 'rgba(255,255,255,0.8)'
    }
});