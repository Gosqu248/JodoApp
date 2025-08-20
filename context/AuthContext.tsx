import React, {createContext, useState, useEffect, ReactNode, useContext} from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types/User';
import {AuthResponse} from "@/types/AuthResponse";
import { login as doLogin, register as doRegister, logout as doLogout} from '@/api/auth';
import { refreshTokenInternal as doRefreshToken } from '@/api/client';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    completeFirstLogin: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: false,
    login: async () => {},
    register: async () => false,
    logout: async () => {},
    completeFirstLogin: async () => {}
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const completeFirstLogin = async () => {
        if (!user) return;
        const updatedUser: User = { ...user, isFirstLogin: false };
        setUser(updatedUser);
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
            const authResponse: AuthResponse = await doLogin({ email, password });
            setUser(authResponse.user);
    };

    const register = async (email: string, password: string) => {
        await doRegister({ email, password });
    };

    const logout = async () => {
        await doLogout();
        setUser(null);
    };

    useEffect(() => {
        (async () => {
            const storedUser = await SecureStore.getItemAsync('user');
            const storedRefresh = await SecureStore.getItemAsync('refreshToken');

            if (storedRefresh) {
                try {
                    setLoading(true);
                    await doRefreshToken();
                    if (storedUser) setUser(JSON.parse(storedUser));
                    console.log('Token refresh successful');
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    await doLogout();
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                if (storedUser) setUser(JSON.parse(storedUser));
                setLoading(false);
            }
        })();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, completeFirstLogin }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);
