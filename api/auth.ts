import {User} from "@/types/User";
import {AuthResponse} from "@/types/AuthResponse";
import {privateApi, publicApi} from "@/api/client";
import * as SecureStore from "expo-secure-store";
import {ResultResponse} from "@/types/ResultResponse";

export type LoginParams = { email: string, password: string};
export type RegisterParams = { email: string, password: string };
export type ResetCodeParams = { email: string, code: string };
export type ResetPasswordParams = { email: string, newPassword: string, confirmNewPassword: string };
export type ChangePasswordRequest = { currentPassword: string, newPassword: string, confirmNewPassword: string };

export const login = async (params: LoginParams): Promise<AuthResponse> => {
    const { data } = await publicApi.post<AuthResponse>('/auth/login', params);
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));

    return data;
}

export const register = async (params: RegisterParams): Promise<User> => {
    const { data } = await publicApi.post<User>("/auth/register", params);
    return data;
};

export const sendResetPasswordEmail = async (email: string): Promise<ResultResponse> => {
    const { data } = await publicApi.post<ResultResponse>("/auth/send-reset-mail/" + email);
    return data;
}

export const verifyResetCode = async(params: ResetCodeParams): Promise<ResultResponse> => {
    const { data } = await publicApi.post<ResultResponse>("/auth/verify-reset-code", params);
    return data;
}

export const resetPassword = async (params: ResetPasswordParams): Promise<ResultResponse> => {
    const { data } = await publicApi.post<ResultResponse>("/auth/reset-password", params);
    return data;
};

export const changePassword = async (params: ChangePasswordRequest): Promise<ResultResponse> => {
    const { data } = await privateApi.put<ResultResponse>("/auth/change-password", params);
    return data;
}

export const logout = async (): Promise<void> => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("user");
};