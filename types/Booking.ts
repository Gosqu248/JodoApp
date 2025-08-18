import {Schedule} from "@/types/Schedule";

export interface Booking {
    id: string;
    schedule: Schedule;
    yearWeek: string;
    bookingDate: string;
    isCancelled: boolean;
    classDate: string;
}