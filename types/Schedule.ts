export interface Schedule {
    id: string;
    name: string;
    dayOfWeek: string;
    startTime: string;
    maxCapacity: number;
    availableSpots: number;
}