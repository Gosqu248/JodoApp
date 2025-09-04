import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types/User';
import {AuthResponse} from "@/types/AuthResponse";
import { login as doLogin, register as doRegister, logout as doLogout} from '@/api/auth';
import { refreshTokenInternal as doRefreshToken } from '@/api/client';

/**
 * Interface defining the shape of authentication context values
 */
interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    completeFirstLogin: () => Promise<void>;
}

/**
 * Authentication context providing user authentication state and methods
 */
export const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    completeFirstLogin: async () => {}
});

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Authentication provider component that manages user authentication state
 * Handles login, register, logout, and token refresh functionality
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Marks the user as having completed their first login
     * Updates both local state and secure storage
     */
    const completeFirstLogin = async () => {
        if (!user) return;

        const updatedUser: User = { ...user, isFirstLogin: false };
        setUser(updatedUser);
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    };

    /**
     * Authenticates user with email and password
     * Updates user state and stores user data securely
     */
    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const authResponse: AuthResponse = await doLogin({ email, password });
            setUser(authResponse.user);
            // Store user data in secure storage for persistence
            await SecureStore.setItemAsync('user', JSON.stringify(authResponse.user));
        } catch (error) {
            // Re-throw error to be handled by the calling component
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Registers a new user with email and password
     * Note: This doesn't automatically log in the user after registration
     */
    const register = async (email: string, password: string) => {
        await doRegister({ email, password });
    };

    /**
     * Logs out the current user
     * Clears user state and removes stored authentication data
     */
    const logout = async () => {
        await doLogout();
        setUser(null);
        // Clear stored user data
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('refreshToken');
    };

    /**
     * Effect hook to handle authentication state initialization
     * Attempts to restore user session on app startup using stored tokens
     */
    useEffect(() => {
        (async () => {
            const storedUser = await SecureStore.getItemAsync('user');
            const storedRefresh = await SecureStore.getItemAsync('refreshToken');

            // If refresh token exists, attempt to refresh the session
            if (storedRefresh) {
                try {
                    setLoading(true);
                    await doRefreshToken();
                    if (storedUser) setUser(JSON.parse(storedUser));
                    console.log('Token refresh successful');
                } catch  {
                    // If refresh fails, clear all authentication data
                    console.log('Token refresh failed, logging out');
                    await doLogout();
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                // No refresh token, but check if user data exists (offline mode)
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

/**
 * Custom hook to access authentication context
 * Provides convenient access to auth state and methods
 */
export const useAuth = () => useContext(AuthContext);
