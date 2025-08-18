import {privateApi} from "@/api/client";
import { Membership } from "@/types/Membership";

export const getMembership = async (userId: string): Promise<Membership> => {
    const { data } = await privateApi.get<Membership>(`/memberships/${userId}`);
    return data;
};