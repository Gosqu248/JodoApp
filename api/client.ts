import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { refreshToken as apiRefreshToken, logout as apiLogout } from '@/api/auth';
import { apiUrl } from '@/api/apiUrl';

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

privateApi.interceptors.request.use(async config => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
        config.headers!['Authorization'] = `Bearer ${token}`;
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
                const newToken = await apiRefreshToken();
                original.headers['Authorization'] = `Bearer ${newToken}`;
                return privateApi(original);
            } catch (refreshError) {
                await apiLogout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
