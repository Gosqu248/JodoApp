import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from "@/types/Booking";
import { Schedule } from "@/types/Schedule";
import { formatTime } from '@/utils/formatters';

interface BookingsTabProps {
    userBookings: Booking[];
    totalBookings: number;
    isClassInPast: (classItem: Schedule, yearWeek: string | null) => boolean;
    onCancelBooking: (bookingId: string) => void;
    hasMoreBookings: boolean;
    loadingMoreBookings: boolean;
    onLoadMore: () => void;
}

const DAYS_PL = {
    MONDAY: 'Poniedziałek',
    TUESDAY: 'Wtorek',
    WEDNESDAY: 'Środa',
    THURSDAY: 'Czwartek',
    FRIDAY: 'Piątek',
};

export default function BookingsTab({
                                        userBookings,
                                        totalBookings,
                                        isClassInPast,
                                        onCancelBooking,
                                        hasMoreBookings,
                                        loadingMoreBookings,
                                        onLoadMore
                                    }: BookingsTabProps) {
    const sortedBookings = [...userBookings];

    return (
        <View style={styles.bookingsContainer}>

            {sortedBookings.length === 0 ? (
                <View style={styles.noBookingsContainer}>
                    <Text style={styles.noBookingsText}>Brak zapisów na zajęcia</Text>
                </View>
            ) : (
                <>
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            Liczba odbytych zajęć: {totalBookings}
                        </Text>
                    </View>

                    {sortedBookings.map((booking) => (
                        <View key={booking.id} style={styles.bookingCard}>
                            <View style={styles.bookingHeader}>
                                <Text style={styles.bookingClassName}>{booking.schedule.name}</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>
                                        Aktywny
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.bookingDate}>
                                {DAYS_PL[booking.schedule.dayOfWeek as keyof typeof DAYS_PL]}: {new Date(booking.classDate).toLocaleDateString('pl-PL')}
                            </Text>
                            <Text style={styles.bookingTime}>
                                Godzina: {formatTime(booking.schedule.startTime)}
                            </Text>

                            {!isClassInPast(booking.schedule, booking.yearWeek) && (
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => onCancelBooking(booking.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.cancelButtonText}>Anuluj rezerwację</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {/* Load More Button */}
                    {hasMoreBookings && (
                        <TouchableOpacity
                            style={styles.loadMoreButton}
                            onPress={onLoadMore}
                            disabled={loadingMoreBookings}
                        >
                            {loadingMoreBookings ? (
                                <ActivityIndicator size="small" color="#ffc500" />
                            ) : (
                                <>
                                    <Ionicons name="chevron-down" size={20} color="#ffc500" />
                                    <Text style={styles.loadMoreText}>Załaduj więcej rezerwacji</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bookingsContainer: {
        padding: 16,
    },
    summaryContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    noBookingsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginTop: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    noBookingsText: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#999',
        fontSize: 16,
    },
    bookingCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bookingClassName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#E8F5E8',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
    },
    bookingDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    bookingTime: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    bookingWeek: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    cancelButton: {
        backgroundColor: '#F44336',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignSelf: 'flex-start',
    },
    cancelButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
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
        elevation: 3,
    },
    loadMoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffc500',
        marginLeft: 8,
    },
});