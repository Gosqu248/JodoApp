import {publicApi} from "@/api/client";
import {ActivityStatus} from "@/types/ActivityStatus";
import {ActivityResponse} from "@/types/ActivityResponse";

export const startActivity = async (userId: string | null): Promise<ActivityResponse> => {
    const response = await publicApi.post(`/activity/start/${userId}`);
    return response.data;
};

export const endActivity = async (activityId: string): Promise<ActivityResponse> => {
    const response = await publicApi.post(`/activity/end/${activityId}`);
    return response.data;
};

export const getDailyStats = async (userId: string, date: string): Promise<ActivityStatus> => {
    const response = await publicApi.get(`/activity/daily/${userId}`, {
        params: { date }
    });
    return response.data;
};

export const getWeeklyStats = async (userId: string, startDate: string): Promise<ActivityStatus> => {
    const response = await publicApi.get(`/activity/weekly/${userId}`, {
        params: { startDate }
    });
    return response.data;
};

export const getMonthlyStats = async (userId: string, startDate: string): Promise<ActivityStatus> => {
    const response = await publicApi.get(`/activity/monthly/${userId}`, {
        params: { startDate }
    });
    return response.data;
};

export const getUsersOnGym = async (): Promise<number> => {
    const response = await publicApi.get(`/activity/users`);
    return response.data;
};