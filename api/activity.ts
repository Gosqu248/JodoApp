import {publicApi} from "@/api/client";
import {ActivityStatus} from "@/types/ActivityStatus";
import {ActivityResponse} from "@/types/ActivityResponse";

export const startActivity = async (userId: string | null): Promise<ActivityResponse> => {
    const response = await publicApi.post(`/activities/start/${userId}`);
    return response.data;
};

export const endActivity = async (activityId: string): Promise<ActivityResponse> => {
    const response = await publicApi.post(`/activities/end/${activityId}`);
    return response.data;
};

export const getWeeklyStats = async (userId: string, startDate: string): Promise<ActivityStatus> => {
    const response = await publicApi.get(`/activities/weekly/${userId}`, {
        params: { startDate }
    });
    return response.data;
};

export const getMonthlyStats = async (userId: string, startDate: string): Promise<ActivityStatus> => {
    const response = await publicApi.get(`/activities/monthly/${userId}`, {
        params: { startDate }
    });
    return response.data;
};

export const getTotalActivity = async (userId: string): Promise<ActivityStatus> => {
    const response = await publicApi.get(`/activities/total/${userId}`);
    return response.data;
}

export const getUsersOnGym = async (): Promise<number> => {
    const response = await publicApi.get(`/activities/users`);
    return response.data;
};