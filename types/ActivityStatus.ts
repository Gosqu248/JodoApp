import {ActivityResponse} from "@/types/ActivityResponse";

export interface ActivityStatus {
    totalMinutes: number;
    sessionsCount: number;
    activities: ActivityResponse[];
}