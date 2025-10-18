import {publicApi} from "@/api/client";
import {ActivityStatus} from "@/types/ActivityStatus";
import {LocationRequest} from "@/types/LocationRequest";
import {LocationResponse} from "@/types/LocationResponse";

export interface PaginationParams {
    page?: number;
    size?: number;
}

export const updateLocation = async (
    userId: string,
    location: LocationRequest
): Promise<LocationResponse> => {
    const response = await publicApi.post(`/activities/location-update/${userId}`, location);
    return  response.data;
}

export const getWeeklyStats = async (
    userId: string,
    startDate: string,
    pagination?: PaginationParams
): Promise<ActivityStatus> => {
    const { page = 0, size = 10 } = pagination || {};
    const response = await publicApi.get(`/activities/weekly/${userId}`, {
        params: {
            startDate,
            page,
            size
        }
    });
    return response.data;
};

export const getMonthlyStats = async (
    userId: string,
    startDate: string,
    pagination?: PaginationParams
): Promise<ActivityStatus> => {
    const { page = 0, size = 10 } = pagination || {};
    const response = await publicApi.get(`/activities/monthly/${userId}`, {
        params: {
            startDate,
            page,
            size
        }
    });
    return response.data;
};

export const getTotalActivity = async (
    userId: string,
    pagination?: PaginationParams
): Promise<ActivityStatus> => {
    const { page = 0, size = 10 } = pagination || {};
    const response = await publicApi.get(`/activities/total/${userId}`, {
        params: {
            page,
            size
        }
    });
    return response.data;
};

export const getUsersOnGym = async (): Promise<number> => {
    const response = await publicApi.get(`/activities/users`);
    return response.data;
};