import {User} from "@/types/User";
import {AuthResponse} from "@/types/AuthResponse";
import {publicApi} from "@/api/client";
import * as SecureStore from "expo-secure-store";


export type LoginParams = { email: string, password: string};
export type RegisterParams = { firstName: string, lastName: string, email: string, password: string };


export const login = async (params: LoginParams): Promise<User> => {
    const { data } = await publicApi.post<AuthResponse>('/auth/login', params);
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
 }

export const register = async (params: RegisterParams): Promise<User> => {
    const { data } = await publicApi.post<User>("/auth/register", params);
    return data;
};

export const refreshToken = async (): Promise<string> => {
    const refresh = await SecureStore.getItemAsync("refreshToken");
    if (!refresh) throw new Error("No refresh token available");
    const { data } = await publicApi.post<RefreshResponse>("/auth/refresh-token", { refreshToken: refresh });
    await SecureStore.setItemAsync("accessToken", data.accessToken);
    return data.accessToken;
};

export const logout = async (): Promise<void> => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("user");
};