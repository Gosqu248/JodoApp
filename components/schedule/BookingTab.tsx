import React, { useMemo } from 'react';
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

// Polish day names mapping for consistent translation
const DAYS_PL = {
    MONDAY: 'Poniedziałek',
    TUESDAY: 'Wtorek',
    WEDNESDAY: 'Środa',
    THURSDAY: 'Czwartek',
    FRIDAY: 'Piątek',
} as const;

/**
 * BookingsTab Component
 *
 * Displays user's class bookings with pagination support.
 * Features:
 * - Shows total number of completed classes
 * - Lists current bookings with cancellation option
 * - Pagination with "Load More" functionality
 * - Past class detection to disable cancellation
 */
export default function BookingsTab({
    userBookings,
    totalBookings,
    isClassInPast,
    onCancelBooking,
    hasMoreBookings,
    loadingMoreBookings,
    onLoadMore
}: BookingsTabProps) {
    // Helper function to safely format dates
    const formatBookingDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString('pl-PL');
        } catch  {
            return 'Nieprawidłowa data';
        }
    };

    // Helper function to get day name safely
    const getDayName = (dayOfWeek: string): string => {
        return DAYS_PL[dayOfWeek as keyof typeof DAYS_PL] || dayOfWeek;
    };

    return (
        <View style={styles.bookingsContainer}>
            {userBookings.length === 0 ? (
                // Empty state when no bookings exist
                <View style={styles.noBookingsContainer}>
                    <Ionicons name="calendar-outline" size={48} color="#ccc" />
                    <Text style={styles.noBookingsText}>Brak zapisów na zajęcia</Text>
                    <Text style={styles.noBookingsSubtext}>
                        Przejdź do harmonogramu, aby zapisać się na zajęcia
                    </Text>
                </View>
            ) : (
                <>
                    {/* Summary section showing total completed classes */}
                    <View style={styles.summaryContainer}>
                        <Ionicons name="trophy-outline" size={24} color="#ffc500" />
                        <Text style={styles.summaryText}>
                            Liczba zapisów na zajęcia: {totalBookings}
                        </Text>
                    </View>

                    {/* List of user bookings */}
                    {userBookings.map((booking) => {
                        const isPastClass = isClassInPast(booking.schedule, booking.yearWeek);

                        return (
                            <View key={booking.id} style={styles.bookingCard}>
                                <View style={styles.bookingHeader}>
                                    <Text style={styles.bookingClassName}>
                                        {booking.schedule.name}
                                    </Text>
                                    <View style={[
                                        styles.statusBadge,
                                        isPastClass && styles.pastStatusBadge
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            isPastClass && styles.pastStatusText
                                        ]}>
                                            {isPastClass ? 'Zakończone' : 'Aktywny'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Booking details */}
                                <View style={styles.bookingDetails}>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="calendar" size={16} color="#666" />
                                        <Text style={styles.bookingDate}>
                                            {getDayName(booking.schedule.dayOfWeek)}: {formatBookingDate(booking.classDate)}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Ionicons name="time" size={16} color="#666" />
                                        <Text style={styles.bookingTime}>
                                            Godzina: {formatTime(booking.schedule.startTime)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Cancel button - only show for future classes */}
                                {!isPastClass && (
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => onCancelBooking(booking.id)}
                                        activeOpacity={0.8}
                                        accessibilityLabel={`Anuluj rezerwację na ${booking.schedule.name}`}
                                        accessibilityHint="Dotknij aby anulować tę rezerwację"
                                    >
                                        <Ionicons name="close-circle" size={18} color="#FFF" />
                                        <Text style={styles.cancelButtonText}>Anuluj rezerwację</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}

                    {/* Load More Button - only show when there are more bookings to load */}
                    {hasMoreBookings && (
                        <TouchableOpacity
                            style={[
                                styles.loadMoreButton,
                                loadingMoreBookings && styles.loadMoreButtonDisabled
                            ]}
                            onPress={onLoadMore}
                            disabled={loadingMoreBookings}
                            accessibilityLabel="Załaduj więcej rezerwacji"
                            accessibilityState={{ disabled: loadingMoreBookings }}
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
        flexDirection: 'row',
        alignItems: 'center',
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
        marginLeft: 8,
        flex: 1,
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
        fontWeight: '600',
        color: '#333',
        fontSize: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    noBookingsSubtext: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#999',
        fontSize: 14,
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
        marginBottom: 12,
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
    pastStatusBadge: {
        backgroundColor: '#F5F5F5',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
    },
    pastStatusText: {
        color: '#666',
    },
    bookingDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    bookingDate: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    bookingTime: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        marginLeft: 6,
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
    loadMoreButtonDisabled: {
        opacity: 0.6,
    },
    loadMoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffc500',
        marginLeft: 8,
    },
});