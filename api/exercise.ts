import {publicApi} from "@/api/client";
import {RankingEntry} from "@/types/RankingEntry";
import {Gender} from "@/types/Gender";
import {WeightCategory} from "@/types/WeightCategory";

export const getRankingEntries = async (
    exerciseId: string,
    gender?: Gender,
    weightCategory?: WeightCategory
): Promise<RankingEntry[]> => {
    const params = new URLSearchParams();
    if (gender) {
        params.append('gender', gender);
    }
    if (weightCategory) {
        params.append('weightCategory', weightCategory);
    }

    const queryString = params.toString();
    const url = `/ranking-entries/top5/${exerciseId}${queryString ? `?${queryString}` : ''}`;
    const response = await publicApi.get(url);
    return response.data;
};