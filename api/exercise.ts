import {publicApi} from "@/api/client";
import {RankingEntry} from "@/types/RankingEntry";

export const getRankingEntries = async (exerciseId: string): Promise<RankingEntry[]> => {
    const response = await publicApi.get('/ranking-entries/' + exerciseId);
    return response.data;
};