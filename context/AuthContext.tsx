import React, {createContext, ReactNode, useState} from 'react'

interface AuthContextValue {
    isLoggedIn: boolean;
    login: (username: string, password: string) => void;
    register: (username: string, password: string) => Promise<boolean>;
    resetPassword: (email: string) => Promise<boolean>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
    isLoggedIn: false,
    login: () => {},
    register: async () => false,
    resetPassword: async () => false,
    logout: () => {}
});

interface AuthProviderProps {
    children: ReactNode;
}


export const AuthProvider = ({children}: AuthProviderProps) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = (username: string, password: string) => {
        setIsLoggedIn(true);
    };

    const register = async (username: string, password: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Registered user: ${username}`);
                resolve(true);
            }, 1000);
        });
    };

    const resetPassword = async (email: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Password reset requested for: ${email}`);
                resolve(true);
            }, 1000);
        });
    };

    const logout = () => {
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{isLoggedIn, login, register, resetPassword, logout}}>
            {children}
        </AuthContext.Provider>
    );
};
