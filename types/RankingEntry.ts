import { Gender } from './Gender';

export interface RankingEntry {
    id: string;
    username: string;
    gender: Gender;
    bodyWeight: number | null;
    scorePercent: number | null;
    result: number;
    createdAt: string;
}