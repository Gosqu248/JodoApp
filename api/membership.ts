import {publicApi} from "@/api/client";
import { Membership } from "@/types/Membership";

export const getMembership = async (userId: string): Promise<Membership> => {
    const { data } = await publicApi.get<Membership>(`/memberships/${userId}`);
    return data;
};