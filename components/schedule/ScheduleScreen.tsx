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
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getCurrentWeekSchedule } from '@/api/schedule';
import { WeeklySchedule } from "@/types/WeeklySchedule";
import { Booking } from "@/types/Booking";
import { Schedule } from "@/types/Schedule";
import { getUserBookings, createClassBooking, cancelClassBooking } from "@/api/booking";
import ScheduleTab from './ScheduleTab';
import BookingsTab from './BookingTab';

const DAYS_PL = {
    MONDAY: 'Poniedziałek',
    TUESDAY: 'Wtorek',
    WEDNESDAY: 'Środa',
    THURSDAY: 'Czwartek',
    FRIDAY: 'Piątek',
};

const MONTHS_PL = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
];

export default function ScheduleScreen() {
    const { user } = useAuth();
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
    const [userBookings, setUserBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Schedule | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'schedule' | 'bookings'>('schedule');

    const formatTime = (timeString: string): string => {
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    const getWeekDateRange = (yearWeek: string): string => {
        const [year, weekStr] = yearWeek.split('-W');
        const weekNum = parseInt(weekStr);

        const jan4 = new Date(parseInt(year), 0, 4);
        const jan4Day = jan4.getDay() || 7;
        const monday = new Date(jan4);
        monday.setDate(jan4.getDate() - jan4Day + 1 + (weekNum - 1) * 7);

        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        const formatDate = (date: Date) => {
            const day = date.getDate();
            const month = MONTHS_PL[date.getMonth()];
            return `${day} ${month}`;
        };

        return `${formatDate(monday)} - ${formatDate(friday)}`;
    };

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [scheduleData, bookingsData] = await Promise.all([
                getCurrentWeekSchedule(),
                getUserBookings(user.id),
            ]);
            setWeeklySchedule(scheduleData);
            setUserBookings(bookingsData);
        } catch (error) {
            Alert.alert('Błąd', 'Nie udało się załadować harmonogramu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const handleClassPress = (classItem: Schedule) => {
        setSelectedClass(classItem);
        setModalVisible(true);
    };

    const handleBookClass = async () => {
        if (!selectedClass || !user?.id || !weeklySchedule) return;
        try {
            await createClassBooking({
                classScheduleId: selectedClass.id,
                userId: user.id,
                yearWeek: weeklySchedule.yearWeek,
            });
            Alert.alert('Sukces', 'Pomyślnie zapisano na zajęcia!');
            setModalVisible(false);
            loadData();
        } catch (error) {
            Alert.alert('Błąd', 'Nie udało się zapisać na zajęcia');
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
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
                            await cancelClassBooking(bookingId, user.id);
                            Alert.alert('Sukces', 'Rezerwacja została anulowana');
                            loadData();
                        } catch (error) {
                            Alert.alert('Błąd', 'Nie udało się anulować rezerwacji');
                        }
                    },
                },
            ]
        );
    };

    const isClassBooked = (classId: string): boolean => {
        return userBookings.some(
            booking => booking.schedule.id === classId
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Ładowanie harmonogramu...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {weeklySchedule && (
                    <Text style={styles.weekInfo}>
                        {getWeekDateRange(weeklySchedule.yearWeek)}
                    </Text>
                )}
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
                    onPress={() => setActiveTab('schedule')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
                        Harmonogram
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
                    onPress={() => setActiveTab('bookings')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>
                        Moje zapisy
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'schedule' ? (
                    <ScheduleTab
                        weeklySchedule={weeklySchedule}
                        userBookings={userBookings}
                        onClassPress={handleClassPress}
                    />
                ) : (
                    <BookingsTab
                        userBookings={userBookings}
                        onCancelBooking={handleCancelBooking}
                    />
                )}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedClass && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{selectedClass.name}</Text>
                                </View>
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
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.cancelModalButton}
                                        onPress={() => setModalVisible(false)}
                                        activeOpacity={0.8}
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