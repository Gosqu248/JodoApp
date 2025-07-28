import {Booking} from "@/types/Booking";
import {publicApi} from "@/api/client";

export interface ClassBookingRequest {
    classScheduleId: string;
    userId: string;
    yearWeek: string;
}

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
    const response = await publicApi.get(`/bookings/user/${userId}`);
    return response.data;
};

export const createClassBooking = async (request: ClassBookingRequest): Promise<Booking> => {
    const response = await publicApi.post('/bookings', request);
    return response.data;
};

export const cancelClassBooking = async (classBookingId: string, userId: string): Promise<void> => {
    await publicApi.delete(`/class-bookings/${classBookingId}/${userId}`);
};