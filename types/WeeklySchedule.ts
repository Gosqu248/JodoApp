import {Schedule} from "@/types/Schedule";

export interface WeeklySchedule {
    yearWeek: string;
    schedules: Schedule[];
}