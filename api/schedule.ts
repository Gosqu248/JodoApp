import {WeeklySchedule} from "@/types/WeeklySchedule";
import {publicApi} from "@/api/client";

export const getCurrentWeekSchedule = async (): Promise<WeeklySchedule> => {
    const response = await publicApi.get('/schedules');
    return response.data;
};