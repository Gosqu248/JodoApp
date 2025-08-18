import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext
} from 'react';
import {
    getUserInfo as fetchUserInfo,
    updateUserInfo as apiUpdateUserInfo,
    UpdateUserInfoParams
} from '@/api/user';
import { UserInfo } from '@/types/UserInfo';
import { useAuth } from './AuthContext';

interface UserContextValue {
    userInfo: UserInfo | null;
    loading: boolean;
    refreshUserInfo: () => Promise<void>;
    updateUserInfo: (params: UpdateUserInfoParams) => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
    userInfo: null,
    loading: true,
    refreshUserInfo: async () => {},
    updateUserInfo: async () => {}
});

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, completeFirstLogin } = useAuth();

    const refreshUserInfo = async () => {
        setLoading(true);
        if (user) {
            try {
                const data = await fetchUserInfo();
                setUserInfo(data);
            } finally {
                setLoading(false);
            }
        }
    };

    const updateUserInfo = async (params: UpdateUserInfoParams) => {
        setLoading(true);
        try {
            const updated = await apiUpdateUserInfo(params);
            setUserInfo(updated);
            await completeFirstLogin();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.isFirstLogin) {
            refreshUserInfo();
        } else {
            setUserInfo(null);
            setLoading(false);
        }
    }, [user]);

    return (
        <UserContext.Provider
            value={{ userInfo, loading, refreshUserInfo, updateUserInfo }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
