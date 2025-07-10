import axios from 'axios';
import * as SecureStore from "expo-secure-store";

const apiBaseUrl = 'http://192.168.0.30:8080/api';

export const publicApi = axios.create({
    baseURL: apiBaseUrl,
    headers: { 'Content-Type': 'application/json' },
});

export const privateApi = axios.create({
    baseURL: apiBaseUrl,
    headers: { 'Content-Type': 'application/json' },
});

privateApi.interceptors.request.use(async config => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) config.headers!['Authorization'] = `Bearer ${token}`;
    return config;
});

privateApi.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await refreshToken();
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return privateApi(originalRequest);
            } catch (e) {
                await logout();
            }
        }
        return Promise.reject(error);
    }
);
