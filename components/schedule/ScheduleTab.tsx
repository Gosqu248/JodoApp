import React, { useMemo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { WeeklySchedule } from "@/types/WeeklySchedule";
import { Booking } from "@/types/Booking";
import { Schedule } from "@/types/Schedule";

// Polish day names mapping for consistent translation
const DAYS_PL = {
    MONDAY: 'Poniedziałek',
    TUESDAY: 'Wtorek',
    WEDNESDAY: 'Środa',
    THURSDAY: 'Czwartek',
    FRIDAY: 'Piątek',
} as const;

// Day order for consistent display
const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;

interface ScheduleTabProps {
    weeklySchedule: WeeklySchedule | null;
    userBookings: Booking[];
    isClassInPast: (classItem: Schedule, yearWeek?: string | null) => boolean;
    onClassPress: (classItem: Schedule) => void;
}

/**
 * Helper function to format time strings safely
 * @param timeString - Time in HH:mm format
 * @returns Formatted time string
 */
const formatTime = (timeString: string): string => {
    try {
        const [hours, minutes] = timeString.split(':');
        if (!hours || !minutes) {
            return '';
        }
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch {
        console.warn('Invalid time format:', timeString);
        return timeString;
    }
};

/**
 * ScheduleTab Component
 *
 * Displays weekly class schedule organized by days.
 * Features:
 * - Shows classes for each day of the week
 * - Indicates booked classes with visual markers
 * - Disables past classes
 * - Shows capacity information with color-coded indicators
 * - Handles empty states for days without classes
 */
export default function ScheduleTab({
    weeklySchedule,
    userBookings,
    isClassInPast,
    onClassPress
}: ScheduleTabProps) {

    /**
     * Memoized function to check if a class is booked by the user
     */
    const isClassBooked = useCallback((classId: string): boolean => {
        return userBookings.some(
            booking => booking.schedule.id === classId && booking.yearWeek === weeklySchedule?.yearWeek
        );
    }, [userBookings, weeklySchedule?.yearWeek]);

    /**
     * Memoized classes organized by day to prevent unnecessary recalculations
     */
    const classesByDay = useMemo(() => {
        if (!weeklySchedule?.schedules) return {};

        return weeklySchedule.schedules.reduce((acc, schedule) => {
            if (!acc[schedule.dayOfWeek]) {
                acc[schedule.dayOfWeek] = [];
            }
            acc[schedule.dayOfWeek].push(schedule);
            return acc;
        }, {} as Record<string, Schedule[]>);
    }, [weeklySchedule?.schedules]);

    /**
     * Get capacity indicator color based on available spots
     */
    const getCapacityIndicatorStyle = (availableSpots: number, maxCapacity: number) => {
        const percentage = (availableSpots / maxCapacity) * 100;

        if (availableSpots === 0) return styles.fullCapacity;
        if (percentage <= 20) return styles.lowCapacity;
        return styles.goodCapacity;
    };

    /**
     * Render a single day's schedule
     */
    const renderScheduleDay = (day: string) => {
        const classes = classesByDay[day] || [];
        const dayName = DAYS_PL[day as keyof typeof DAYS_PL] || day;

        return (
            <View key={day} style={styles.dayContainer}>
                {/* Day header with title and underline */}
                <View style={styles.dayTitleContainer}>
                    <Text style={styles.dayTitle}>{dayName}</Text>
                    <View style={styles.dayTitleUnderline} />
                </View>

                {classes.length === 0 ? (
                    // Empty state when no classes scheduled for this day
                    <View style={styles.noClassesContainer}>
                        <Text style={styles.noClassesText}>Brak zajęć</Text>
                    </View>
                ) : (
                    // Render classes for this day
                    classes
                        .sort((a, b) => a.startTime.localeCompare(b.startTime)) // Sort by start time
                        .map((classItem) => {
                            const isBooked = isClassBooked(classItem.id);
                            const isPast = isClassInPast(classItem, weeklySchedule?.yearWeek);
                            const isFull = classItem.availableSpots <= 0;

                            return (
                                <TouchableOpacity
                                    key={classItem.id}
                                    style={[
                                        styles.classCard,
                                        isBooked && styles.bookedClassCard,
                                        isPast && styles.pastClassCard
                                    ]}
                                    onPress={() => onClassPress(classItem)}
                                    activeOpacity={0.7}
                                    disabled={isPast}
                                    accessibilityLabel={`${classItem.name} o ${formatTime(classItem.startTime)}, ${classItem.availableSpots} wolnych miejsc z ${classItem.maxCapacity}`}
                                    accessibilityState={{
                                        disabled: isPast,
                                        selected: isBooked
                                    }}
                                >
                                    <View style={styles.classContent}>
                                        {/* Class header with name and booking indicator */}
                                        <View style={styles.classHeader}>
                                            <Text style={[
                                                styles.className,
                                                isPast && styles.pastClassName
                                            ]}>
                                                {classItem.name}
                                            </Text>
                                            {isBooked && (
                                                <View style={styles.bookedBadge}>
                                                    <Text style={styles.bookedBadgeText}>✓</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Class details: time and capacity */}
                                        <View style={styles.classDetails}>
                                            <View style={styles.timeContainer}>
                                                <Text style={[
                                                    styles.classTime,
                                                    isPast && styles.pastClassTime
                                                ]}>
                                                    {formatTime(classItem.startTime)}
                                                </Text>
                                            </View>

                                            <View style={styles.capacityContainer}>
                                                <Text style={[
                                                    styles.participantsText,
                                                    isPast && styles.pastParticipantsText
                                                ]}>
                                                    {classItem.availableSpots}/{classItem.maxCapacity}
                                                </Text>
                                                <View style={[
                                                    styles.capacityIndicator,
                                                    getCapacityIndicatorStyle(classItem.availableSpots, classItem.maxCapacity)
                                                ]} />
                                            </View>
                                        </View>

                                        {/* Status indicators */}
                                        {isFull && !isPast && (
                                            <View style={styles.fullClassIndicator}>
                                                <Text style={styles.fullClassText}>ZAPEŁNIONE</Text>
                                            </View>
                                        )}

                                        {isPast && (
                                            <View style={styles.pastClassIndicator}>
                                                <Text style={styles.pastClassIndicatorText}>ZAKOŃCZONE</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                )}
            </View>
        );
    };

    // Handle case when weekly schedule is not loaded
    if (!weeklySchedule) {
        return (
            <View style={styles.scheduleContent}>
                <Text style={styles.noScheduleText}>Brak danych harmonogramu</Text>
            </View>
        );
    }

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
    noScheduleText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 32,
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
        backgroundColor: '#FFFBF0',
    },
    pastClassCard: {
        backgroundColor: '#F5F5F5',
        opacity: 0.7,
        borderColor: '#DDD',
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
    pastClassName: {
        color: '#999',
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
        marginBottom: 8,
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
    pastClassTime: {
        color: '#999',
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
    pastParticipantsText: {
        color: '#999',
    },
    capacityIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    goodCapacity: {
        backgroundColor: '#4CAF50',
    },
    lowCapacity: {
        backgroundColor: '#FF9800',
    },
    fullCapacity: {
        backgroundColor: '#F44336',
    },
    fullClassIndicator: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    fullClassText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F44336',
    },
    pastClassIndicator: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    pastClassIndicatorText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#999',
    },
});