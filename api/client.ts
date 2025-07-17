import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { apiUrl } from '@/api/apiUrl';
import { RefreshResponse } from '@/types/RefreshResponse';

const apiBaseUrl = apiUrl;

export const publicApi = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const privateApi = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

const refreshTokenInternal = async (): Promise<string> => {
    const refresh = await SecureStore.getItemAsync("refreshToken");
    if (!refresh) throw new Error("No refresh token available");

    const { data } = await publicApi.post<RefreshResponse>("/auth/refresh-token", {}, {
        headers: {
            'Authorization': `Bearer ${refresh}`
        }
    });

    await SecureStore.setItemAsync("accessToken", data.accessToken);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);
    return data.accessToken;
};

const logoutInternal = async (): Promise<void> => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("user");
};

privateApi.interceptors.request.use(async config => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
        config.headers!['Authorization'] = `Bearer ${token}`;
    } else {
        return
    }

    if (config.data instanceof FormData) {
        delete config.headers!['Content-Type'];
    }

    return config;
});

privateApi.interceptors.response.use(
    resp => resp,
    async error => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const newToken = await refreshTokenInternal();
                original.headers['Authorization'] = `Bearer ${newToken}`;
                return privateApi(original);
            } catch (refreshError) {
                await logoutInternal();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);