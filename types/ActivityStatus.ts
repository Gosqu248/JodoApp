import {ActivityResponse} from "@/types/ActivityResponse";
import {PageResponse} from "@/types/PageResponse";

export interface ActivityStatus {
    totalMinutes: number;
    activities: PageResponse<ActivityResponse>;
}