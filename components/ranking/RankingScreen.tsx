import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {Exercise} from "@/types/Exercise";
import {RankingEntry} from "@/types/RankingEntry";
import {getExercises} from "@/api/rankingEntry";
import {getRankingEntries} from "@/api/exercise";
import {RankingDetailsComponent} from "@/components/ranking/RankingDetailsComponent";

export default function RankingScreen() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [rankingEntries, setRankingEntries] = useState<RankingEntry[]>([]);
    const [rankingLoading, setRankingLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const exercises = await getExercises();
            setExercises(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            Alert.alert('Błąd', 'Wystąpił błąd podczas pobierania danych');
        } finally {
            setLoading(false);
        }
    };

    const fetchRankingEntries = async (exerciseId: string) => {
        try {
            setRankingLoading(true);
            const rankingEntries = await getRankingEntries(exerciseId);
            setRankingEntries(rankingEntries);
        } catch (error) {
            console.error('Error fetching ranking entries:', error);
            Alert.alert('Błąd', 'Wystąpił błąd podczas pobierania rankingu');
            setRankingEntries([]);
        } finally {
            setRankingLoading(false);
        }
    };

    const handleExercisePress = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        fetchRankingEntries(exercise.id);
    };

    const getExerciseIcon = (iconRN: string | null | undefined): keyof typeof Ionicons.glyphMap => {
        if (!iconRN) return 'fitness-outline';

        if (iconRN in Ionicons.glyphMap) {
            return iconRN as keyof typeof Ionicons.glyphMap;
        }

        return 'fitness-outline';
    };

    const handleBackPress = () => {
        if (selectedExercise) {
            setSelectedExercise(null);
            setRankingEntries([]);
        } else {
            router.back();
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>Ładowanie ćwiczeń...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {!selectedExercise ? (
                // Exercise List View
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={['#ffd500','#ff9000']}
                            style={styles.heroGradient}
                        >
                            <View style={styles.heroContent}>
                                <View style={styles.trophyContainer}>
                                    <Ionicons name="trophy" size={48} color="#ffffff" />
                                </View>
                                <Text style={styles.heroTitle}>Ranking Siłowni</Text>
                                <Text style={styles.heroSubtitle}>
                                    Sprawdź najlepsze wyniki i pobij rekordy!
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.categoriesSection}>
                        <Text style={styles.sectionTitle}>Kategorie Ćwiczeń</Text>
                        <Text style={styles.sectionSubtitle}>
                            Wybierz ćwiczenie aby zobaczyć TOP 5 wyników
                        </Text>

                        <View style={styles.exercisesGrid}>
                            {exercises.map((exercise) => (
                                <TouchableOpacity
                                    key={exercise.id}
                                    style={styles.exerciseCard}
                                    onPress={() => handleExercisePress(exercise)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.exerciseCardContent}>
                                        <View style={styles.exerciseIconWrapper}>
                                            <LinearGradient
                                                colors={['#ffd500','#ff9000']}
                                                style={styles.exerciseIconContainer}
                                            >
                                                <Ionicons
                                                    name={getExerciseIcon(exercise.iconRN)}
                                                    size={24}
                                                    color="#ffffff"
                                                />
                                            </LinearGradient>
                                        </View>

                                        <View style={styles.exerciseInfo}>
                                            <Text style={styles.exerciseName}>
                                                {exercise.name}
                                            </Text>
                                            <Text style={styles.exerciseSubtext}>
                                                Zobacz najlepsze wyniki
                                            </Text>
                                        </View>

                                        <View style={styles.exerciseArrow}>
                                            <Ionicons
                                                name="chevron-forward"
                                                size={20}
                                                color="#9ca3af"
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                // Ranking Details View with Back Button
                <View style={styles.detailsWrapper}>
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBackPress}
                        >
                            <Ionicons name="arrow-back" size={24} color="#6366f1" />
                            <Text style={styles.backButtonText}>Powrót do kategorii</Text>
                        </TouchableOpacity>
                    </View>

                    <RankingDetailsComponent
                        exercise={selectedExercise}
                        entries={rankingEntries}
                        loading={rankingLoading}
                        getExerciseIcon={getExerciseIcon}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    heroSection: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 32
    },
    heroGradient: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8
    },
    heroContent: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24
    },
    trophyContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center'
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24
    },
    categoriesSection: {
        paddingHorizontal: 20
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 24,
        lineHeight: 22
    },
    exercisesGrid: {
        gap: 12
    },
    exerciseCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    exerciseCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20
    },
    exerciseIconWrapper: {
        marginRight: 16
    },
    exerciseIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    exerciseInfo: {
        flex: 1
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4
    },
    exerciseSubtext: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20
    },
    exerciseArrow: {
        padding: 4
    },
    detailsWrapper: {
        flex: 1
    },
    backButtonContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignSelf: 'flex-start'
    },
    backButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
        color: '#6366f1'
    }
});