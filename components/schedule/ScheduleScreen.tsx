import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Modal,
    Alert,
    StyleSheet,
    SafeAreaView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getCurrentWeekSchedule } from '@/api/schedule';
import { WeeklySchedule } from "@/types/WeeklySchedule";
import { Booking } from "@/types/Booking";
import { Schedule } from "@/types/Schedule";
import { getUserBookings, createClassBooking, cancelClassBooking, BookingPaginationParams } from "@/api/booking";
import ScheduleTab from './ScheduleTab';
import BookingsTab from './BookingTab';
import { formatTime } from '@/utils/formatters';

// Polish day names mapping for consistent translation
const DAYS_PL = {
    MONDAY: 'Poniedziałek',
    TUESDAY: 'Wtorek',
    WEDNESDAY: 'Środa',
    THURSDAY: 'Czwartek',
    FRIDAY: 'Piątek',
} as const;

// Polish month names for date formatting
const MONTHS_PL = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
] as const;

/**
 * ScheduleScreen Component
 *
 * Main screen for managing class schedules and bookings.
 * Features:
 * - Weekly schedule view with class booking functionality
 * - User bookings management with pagination
 * - Modal for class booking confirmation
 * - Refresh functionality for data synchronization
 * - Past class detection and handling
 */
export default function ScheduleScreen() {
    const { user } = useAuth();

    // Schedule and booking state
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
    const [userBookings, setUserBookings] = useState<Booking[]>([]);
    const [totalBookings, setTotalBookings] = useState(0);

    // Loading and UI state
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Schedule | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'schedule' | 'bookings'>('schedule');

    // Pagination state for bookings
    const [currentBookingsPage, setCurrentBookingsPage] = useState(0);
    const [hasMoreBookings, setHasMoreBookings] = useState(false);
    const [loadingMoreBookings, setLoadingMoreBookings] = useState(false);

    /**
     * Calculate and format week date range from year-week string
     * @param yearWeek - String in format "YYYY-WW"
     * @returns Formatted date range string
     */
    const getWeekDateRange = useCallback((yearWeek: string): string => {
        try {
            const [year, weekStr] = yearWeek.split('-');
            const weekNum = parseInt(weekStr);

            // Calculate first day of week (Monday) based on ISO week numbering
            const jan4 = new Date(parseInt(year), 0, 4);
            const jan4Day = jan4.getDay() || 7; // Convert Sunday (0) to 7
            const monday = new Date(jan4);
            monday.setDate(jan4.getDate() - jan4Day + 1 + (weekNum - 1) * 7);

            // Calculate Friday (end of work week)
            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4);

            const formatDate = (date: Date) => {
                const day = date.getDate();
                const month = MONTHS_PL[date.getMonth()];
                return `${day} ${month}`;
            };

            return `${formatDate(monday)} - ${formatDate(friday)}`;
        } catch (error) {
            console.warn('Error formatting week date range:', error);
            return 'Nieprawidłowy zakres dat';
        }
    }, []);

    /**
     * Load user bookings with pagination support
     * @param page - Page number to load (0-based)
     * @param reset - Whether to reset the bookings list
     */
    const loadBookings = useCallback(async (page: number = 0, reset: boolean = false) => {
        if (!user?.id) {
            console.warn('User not authenticated, cannot load bookings');
            return;
        }

        // Set appropriate loading state
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMoreBookings(true);
        }

        try {
            const pagination: BookingPaginationParams = {
                page,
                size: 10 // Load 10 bookings per page
            };

            const bookingsData = await getUserBookings(pagination);
            setTotalBookings(bookingsData.totalElements);

            // Update bookings list based on reset flag
            if (reset) {
                setUserBookings(bookingsData.content);
            } else {
                setUserBookings(prev => [...prev, ...bookingsData.content]);
            }

            // Check if there are more pages to load
            const hasMore = page < bookingsData.totalPages - 1;
            setHasMoreBookings(hasMore);

        } catch (error) {
            console.error('Error loading bookings:', error);
            Alert.alert('Błąd', 'Nie udało się załadować rezerwacji');
        } finally {
            // Clear appropriate loading state
            if (reset) {
                setLoading(false);
            } else {
                setLoadingMoreBookings(false);
            }
        }
    }, [user?.id]);

    /**
     * Load all necessary data (schedule and bookings)
     */
    const loadData = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Load schedule and bookings in parallel for better performance
            const [scheduleData] = await Promise.all([
                getCurrentWeekSchedule(),
                loadBookings(0, true) // Reset bookings and load first page
            ]);

            setWeeklySchedule(scheduleData);
            setCurrentBookingsPage(0);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Błąd', 'Nie udało się załadować harmonogramu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id, loadBookings]);

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    /**
     * Handle pull-to-refresh functionality
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setCurrentBookingsPage(0);
        loadData();
    }, [loadData]);

    /**
     * Handle loading more bookings for pagination
     */
    const handleLoadMoreBookings = useCallback(() => {
        if (hasMoreBookings && !loadingMoreBookings) {
            const nextPage = currentBookingsPage + 1;
            setCurrentBookingsPage(nextPage);
            loadBookings(nextPage, false);
        }
    }, [hasMoreBookings, loadingMoreBookings, currentBookingsPage, loadBookings]);

    /**
     * Handle class selection for booking modal
     */
    const handleClassPress = useCallback((classItem: Schedule) => {
        setSelectedClass(classItem);
        setModalVisible(true);
    }, []);

    /**
     * Handle class booking creation
     */
    const handleBookClass = useCallback(async () => {
        if (!selectedClass || !user?.id || !weeklySchedule) return;

        try {
            await createClassBooking({
                classScheduleId: selectedClass.id,
                userId: user.id,
                yearWeek: weeklySchedule.yearWeek,
            });

            Alert.alert('Sukces', 'Pomyślnie zapisano na zajęcia!');
            setModalVisible(false);
            setSelectedClass(null);

            // Reload data to refresh bookings and schedule
            setCurrentBookingsPage(0);
            loadData();
        } catch  {
            Alert.alert('Błąd', 'Nie udało się zapisać na zajęcia');
        }
    }, [selectedClass, user?.id, weeklySchedule, loadData]);

    /**
     * Handle booking cancellation with confirmation
     */
    const handleCancelBooking = useCallback(async (bookingId: string) => {
        if (!user?.id) return;

        Alert.alert(
            'Anuluj rezerwację',
            'Czy na pewno chcesz anulować tę rezerwację?',
            [
                { text: 'Nie', style: 'cancel' },
                {
                    text: 'Tak',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelClassBooking(bookingId);
                            Alert.alert('Sukces', 'Rezerwacja została anulowana');

                            // Reload data to refresh bookings and schedule
                            setCurrentBookingsPage(0);
                            loadData();
                        } catch {
                            Alert.alert('Błąd', 'Nie udało się anulować rezerwacji');
                        }
                    },
                },
            ]
        );
    }, [user?.id, loadData]);

    /**
     * Check if a class is in the past
     * @param classItem - The class schedule item
     * @param yearWeek - The year-week string (optional)
     * @returns True if the class is in the past
     */
    const isClassInPast = useCallback((classItem: Schedule, yearWeek?: string | null): boolean => {
        if (!yearWeek) {
            return false;
        }

        try {
            const [year, weekStr] = yearWeek.split('-');
            const weekNum = parseInt(weekStr);

            // Map day names to indices (Monday = 0, Friday = 4)
            const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].indexOf(classItem.dayOfWeek);
            if (dayIndex === -1) return false;

            // Calculate the specific date of the class
            const jan4 = new Date(Number(year), 0, 4);
            const jan4Day = jan4.getDay() || 7;
            const monday = new Date(jan4);
            monday.setDate(jan4.getDate() - jan4Day + 1 + (weekNum - 1) * 7);

            const classDate = new Date(monday);
            classDate.setDate(classDate.getDate() + dayIndex);

            // Set the specific time of the class
            const [hours, minutes] = classItem.startTime.split(':');
            classDate.setHours(Number(hours), Number(minutes), 0, 0);

            return classDate.getTime() < new Date().getTime();
        } catch (error) {
            console.warn('Error checking if class is in past:', error);
            return false;
        }
    }, []);

    /**
     * Check if a class is already booked by the user
     * @param classId - The class ID to check
     * @returns True if the class is booked
     */
    const isClassBooked = useCallback((classId: string): boolean => {
        return userBookings.some(
            booking => booking.schedule.id === classId && booking.yearWeek === weeklySchedule?.yearWeek
        );
    }, [userBookings, weeklySchedule?.yearWeek]);

    /**
     * Close booking modal
     */
    const closeModal = useCallback(() => {
        setModalVisible(false);
        setSelectedClass(null);
    }, []);

    // Show loading screen while data is being fetched
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ffc500" />
                    <Text style={styles.loadingText}>Ładowanie harmonogramu...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with week information */}
            <View style={styles.header}>
                {weeklySchedule && (
                    <Text style={styles.weekInfo}>
                        {getWeekDateRange(weeklySchedule.yearWeek)}
                    </Text>
                )}
            </View>

            {/* Tab container for switching between schedule and bookings */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
                    onPress={() => setActiveTab('schedule')}
                    activeOpacity={0.7}
                    accessibilityLabel="Harmonogram zajęć"
                    accessibilityState={{ selected: activeTab === 'schedule' }}
                >
                    <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
                        Harmonogram
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
                    onPress={() => setActiveTab('bookings')}
                    activeOpacity={0.7}
                    accessibilityLabel="Moje zapisy na zajęcia"
                    accessibilityState={{ selected: activeTab === 'bookings' }}
                >
                    <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>
                        Moje zapisy
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Main content area with pull-to-refresh */}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#ffc500']} // Android
                        tintColor="#ffc500" // iOS
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'schedule' ? (
                    <ScheduleTab
                        weeklySchedule={weeklySchedule}
                        userBookings={userBookings}
                        isClassInPast={isClassInPast}
                        onClassPress={handleClassPress}
                    />
                ) : (
                    <BookingsTab
                        userBookings={userBookings}
                        totalBookings={totalBookings}
                        isClassInPast={isClassInPast}
                        onCancelBooking={handleCancelBooking}
                        hasMoreBookings={hasMoreBookings}
                        loadingMoreBookings={loadingMoreBookings}
                        onLoadMore={handleLoadMoreBookings}
                    />
                )}
            </ScrollView>

            {/* Class booking modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
                statusBarTranslucent={false}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedClass && (
                            <>
                                {/* Modal header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{selectedClass.name}</Text>
                                </View>

                                {/* Class details */}
                                <View style={styles.modalDetails}>
                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalLabel}>Dzień:</Text>
                                        <Text style={styles.modalValue}>
                                            {DAYS_PL[selectedClass.dayOfWeek as keyof typeof DAYS_PL]}
                                        </Text>
                                    </View>
                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalLabel}>Godzina:</Text>
                                        <Text style={styles.modalValue}>
                                            {formatTime(selectedClass.startTime)}
                                        </Text>
                                    </View>
                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalLabel}>Miejsca:</Text>
                                        <Text style={styles.modalValue}>
                                            {selectedClass.availableSpots}/{selectedClass.maxCapacity}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action buttons */}
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.cancelModalButton}
                                        onPress={closeModal}
                                        activeOpacity={0.8}
                                        accessibilityLabel="Zamknij modal"
                                    >
                                        <Text style={styles.cancelModalButtonText}>Anuluj</Text>
                                    </TouchableOpacity>

                                    {isClassBooked(selectedClass.id) ? (
                                        <View style={styles.alreadyBookedButton}>
                                            <Text style={styles.alreadyBookedText}>Już zapisany</Text>
                                        </View>
                                    ) : selectedClass.availableSpots <= 0 ? (
                                        <View style={styles.fullClassButton}>
                                            <Text style={styles.fullClassText}>Brak miejsc</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.bookButton}
                                            onPress={handleBookClass}
                                            activeOpacity={0.8}
                                            accessibilityLabel={`Zapisz się na ${selectedClass.name}`}
                                        >
                                            <Text style={styles.bookButtonText}>Zapisz się</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingBottom: Platform.OS === 'android' ? 25 : 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    header: {
        backgroundColor: '#FFD700',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    weekInfo: {
        textAlign: 'center',
        fontSize: 18,
        color: '#000',
        fontWeight: '700',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 25,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#FFD700',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        margin: 20,
        minWidth: 320,
        maxWidth: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
    },
    modalDetails: {
        marginBottom: 24,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    modalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelModalButton: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
    cancelModalButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    bookButton: {
        flex: 1,
        backgroundColor: '#FFD700',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '700',
    },
    alreadyBookedButton: {
        flex: 1,
        backgroundColor: '#E8F5E8',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
    alreadyBookedText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
    },
    fullClassButton: {
        flex: 1,
        backgroundColor: '#FFEBEE',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
    fullClassText: {
        fontSize: 16,
        color: '#F44336',
        fontWeight: '600',
    },
});