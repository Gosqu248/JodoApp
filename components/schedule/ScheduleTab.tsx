import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { WeeklySchedule } from "@/types/WeeklySchedule";
import { Booking } from "@/types/Booking";
import { Schedule } from "@/types/Schedule";

const DAYS_PL = {
    MONDAY: 'Poniedziałek',
    TUESDAY: 'Wtorek',
    WEDNESDAY: 'Środa',
    THURSDAY: 'Czwartek',
    FRIDAY: 'Piątek',
};

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

interface ScheduleTabProps {
    weeklySchedule: WeeklySchedule | null;
    userBookings: Booking[];
    isClassInPast: (classItem: Schedule, yearWeek?: string | null) => boolean;
    onClassPress: (classItem: Schedule) => void;
}

const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
};

export default function ScheduleTab({ weeklySchedule, userBookings, isClassInPast, onClassPress }: ScheduleTabProps) {
    const isClassBooked = (classId: string): boolean => {
        return userBookings.some(
            booking => booking.schedule.id === classId && booking.yearWeek === weeklySchedule?.yearWeek
        );
    };

    const renderScheduleDay = (day: string) => {
        const classes = weeklySchedule?.schedules.filter(s => s.dayOfWeek === day) || [];
        return (
            <View key={day} style={styles.dayContainer}>
                <View style={styles.dayTitleContainer}>
                    <Text style={styles.dayTitle}>{DAYS_PL[day as keyof typeof DAYS_PL]}</Text>
                    <View style={styles.dayTitleUnderline} />
                </View>
                {classes.length === 0 ? (
                    <View style={styles.noClassesContainer}>
                        <Text style={styles.noClassesText}>Brak zajęć</Text>
                    </View>
                ) : (
                    classes.map((classItem) => (
                        <TouchableOpacity
                            key={classItem.id}
                            style={[
                                styles.classCard,
                                isClassBooked(classItem.id) && styles.bookedClassCard,
                                isClassInPast(classItem, weeklySchedule?.yearWeek) && styles.pastClassCard
                            ]}
                            onPress={() => onClassPress(classItem)}
                            activeOpacity={0.7}
                            disabled={isClassInPast(classItem, weeklySchedule?.yearWeek)}
                        >
                            <View style={styles.classContent}>
                                <View style={styles.classHeader}>
                                    <Text style={styles.className}>{classItem.name}</Text>
                                    {isClassBooked(classItem.id) && (
                                        <View style={styles.bookedBadge}>
                                            <Text style={styles.bookedBadgeText}>✓</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.classDetails}>
                                    <View style={styles.timeContainer}>
                                        <Text style={styles.classTime}>{formatTime(classItem.startTime)}</Text>
                                    </View>
                                    <View style={styles.capacityContainer}>
                                        <Text style={styles.participantsText}>
                                            {classItem.availableSpots}/{classItem.maxCapacity}
                                        </Text>
                                        <View style={[
                                            styles.capacityIndicator,
                                            classItem.availableSpots === 0 && styles.fullCapacity,
                                            classItem.availableSpots <= 2 && classItem.availableSpots > 0 && styles.lowCapacity
                                        ]} />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        );
    };

    return (
        <View style={styles.scheduleContent}>
            {DAYS_ORDER.map(day => renderScheduleDay(day))}
        </View>
    );
}

const styles = StyleSheet.create({
    scheduleContent: {
        padding: 16,
    },
    dayContainer: {
        marginBottom: 24,
    },
    dayTitleContainer: {
        marginBottom: 16,
    },
    dayTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    dayTitleUnderline: {
        height: 3,
        backgroundColor: '#FFD700',
        width: 60,
        borderRadius: 2,
    },
    noClassesContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    noClassesText: {
        fontStyle: 'italic',
        color: '#999',
        fontSize: 16,
    },
    classCard: {
        borderColor: '#FFD700',
        borderWidth: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    bookedClassCard: {
        borderLeftWidth: 6,
        borderLeftColor: '#FFD700',
    },
    pastClassCard: {
        backgroundColor: '#E0E0E0',
        opacity: 0.6,
    },
    classContent: {
        padding: 16,
    },
    classHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    className: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        flex: 1,
    },
    bookedBadge: {
        backgroundColor: '#FFD700',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookedBadgeText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    classDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeContainer: {
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    classTime: {
        fontSize: 16,
        color: '#000',
        fontWeight: '600',
    },
    capacityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    participantsText: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
        fontWeight: '500',
    },
    capacityIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    lowCapacity: {
        backgroundColor: '#FF9800',
    },
    fullCapacity: {
        backgroundColor: '#F44336',
    },
});