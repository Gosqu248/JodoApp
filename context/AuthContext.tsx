import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as doLogin, register as doRegister, logout as doLogout } from '@/api/auth';
import { User } from '@/types/User';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: false,
    login: async () => {},
    register: async () => false,
    logout: async () => {}
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const loggedUser = await doLogin({ email, password });
            setUser(loggedUser);
        } finally {
            setLoading(false);
        }
    };

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        try {
            await doRegister({ firstName, lastName, email, password });
            return true;
        } catch {
            return false;
        }
    };

    const logout = async () => {
        await doLogout();
        setUser(null);
    };

    useEffect(() => {
        (async () => {
            const storedUser = await SecureStore.getItemAsync('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        })();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};