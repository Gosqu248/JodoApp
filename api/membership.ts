import {privateApi, publicApi} from "@/api/client";
import { Membership } from "@/types/Membership";
import {MembershipType} from "@/types/MembershipType";

export const getMembership = async (userId: string): Promise<Membership> => {
    const { data } = await privateApi.get<Membership>(`/memberships/${userId}`);
    return data;
};


export const getActiveMembershipTypes = async (): Promise<MembershipType[]> => {
    const { data } = await publicApi.get<MembershipType[]>('/membership_types/active');
    return data;
}