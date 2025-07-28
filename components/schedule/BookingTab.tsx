import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Booking } from "@/types/Booking";

interface BookingsTabProps {
    userBookings: Booking[];
    onCancelBooking: (bookingId: string) => void;
}

const DAYS_PL = {
    MONDAY: 'Poniedziałek',
    TUESDAY: 'Wtorek',
    WEDNESDAY: 'Środa',
    THURSDAY: 'Czwartek',
    FRIDAY: 'Piątek',
};


export default function BookingsTab({ userBookings, onCancelBooking }: BookingsTabProps) {
    const sortedBookings = [...userBookings].sort(
        (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );

    return (
        <View style={styles.bookingsContainer}>
            {sortedBookings.length === 0 ? (
                <View style={styles.noBookingsContainer}>
                    <Text style={styles.noBookingsText}>Brak zapisów na zajęcia</Text>
                </View>
            ) : (
                sortedBookings.map((booking) => (
                    <View key={booking.id} style={styles.bookingCard}>
                        <View style={styles.bookingHeader}>
                            <Text style={styles.bookingClassName}>{booking.schedule.name}</Text>

                            <View style={[
                                styles.statusBadge,
                                booking.isCancelled ? styles.statusCANCELLED : styles.statusACTIVE
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    booking.isCancelled ? styles.statusCANCELLEDText : styles.statusACTIVEText
                                ]}>
                                    {booking.isCancelled ? 'Anulowany' : 'Aktywny'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.bookingDate}>
                            {DAYS_PL[booking.schedule.dayOfWeek as keyof typeof DAYS_PL]}: {new Date(booking.scheduleDate).toLocaleDateString('pl-PL')}
                        </Text>
                        {!booking.isCancelled && (
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => onCancelBooking(booking.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Anuluj rezerwację</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bookingsContainer: {
        padding: 16,
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
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusACTIVE: {
        backgroundColor: '#E8F5E8',
    },
    statusCANCELLED: {
        backgroundColor: '#FFEBEE',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusACTIVEText: {
        color: '#4CAF50',
    },
    statusCANCELLEDText: {
        color: '#F44336',
    },
    bookingDate: {
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
});