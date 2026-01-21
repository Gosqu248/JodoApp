import {publicApi} from "@/api/client";
import {ActivityStatus} from "@/types/ActivityStatus";
import {LocationRequest} from "@/types/LocationRequest";
import {LocationResponse} from "@/types/LocationResponse";

export interface PaginationParams {
    page?: number;
    size?: number;
}

// Timeout for location updates - shorter for background tasks (iOS limit)
const LOCATION_UPDATE_TIMEOUT = 15_000; // 15 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Helper function to delay execution
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Updates user location with timeout and retry logic.
 * Optimized for iOS/Android background execution constraints.
 */
export const updateLocation = async (
    userId: string,
    location: LocationRequest,
    retryCount: number = 0
): Promise<LocationResponse> => {
    try {
        const response = await publicApi.post(
            `/activities/location-update/${userId}`,
            location,
            {
                timeout: LOCATION_UPDATE_TIMEOUT,
            }
        );
        return response.data;
    } catch (error: any) {
        // Retry on network errors or timeouts (not on 4xx/5xx server errors)
        const isRetryable =
            !error.response || // Network error
            error.code === 'ECONNABORTED' || // Timeout
            error.message?.includes('timeout') ||
            error.message?.includes('Network');

        if (isRetryable && retryCount < MAX_RETRIES) {
            console.log(`🔄 Retrying location update (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
            await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
            return updateLocation(userId, location, retryCount + 1);
        }

        throw error;
    }
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