import {Booking} from "@/types/Booking";
import {publicApi, privateApi} from "@/api/client";
import {PageResponse} from "@/types/PageResponse";

export interface ClassBookingRequest {
    classScheduleId: string;
    userId: string;
    yearWeek: string;
}

export interface BookingPaginationParams {
    page?: number;
    size?: number;
}

export const getUserBookings = async (
    pagination?: BookingPaginationParams
): Promise<PageResponse<Booking>> => {
    const { page = 0, size = 10 } = pagination || {};
    const response = await privateApi.get(`/bookings/user`, {
        params: {
            page,
            size
        }
    });
    return response.data;
};

export const createClassBooking = async (request: ClassBookingRequest): Promise<Booking> => {
    const response = await publicApi.post('/bookings', request);
    return response.data;
};

export const cancelClassBooking = async (classBookingId: string): Promise<void> => {
    await privateApi.delete(`/bookings/${classBookingId}`);
};