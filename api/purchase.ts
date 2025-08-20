import { privateApi } from "@/api/client";
import { MembershipPurchase } from "@/types/MembershipPurchase";
import { PageResponse } from "@/types/PageResponse";

export const getPurchasesByMembershipId = async (
    membershipId: string,
    page: number = 0,
    size: number = 10,
): Promise<PageResponse<MembershipPurchase>> => {
    const { data } = await privateApi.get<PageResponse<MembershipPurchase>>(
        `/purchases/${membershipId}`,
        {
            params: { page, size }
        }
    );
    return data;
};

export const getLastPurchase = async (membershipId: string): Promise<MembershipPurchase | null> => {
        const { data } = await privateApi.get<MembershipPurchase>(
            `/purchases/${membershipId}/last`
        );
        return data;
}