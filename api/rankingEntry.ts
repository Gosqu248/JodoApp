import {publicApi} from "@/api/client";
import {Exercise} from "@/types/Exercise";

export const getExercises = async (): Promise<Exercise[]> => {
    const response = await publicApi.get('/exercises/active');
    return response.data;
};