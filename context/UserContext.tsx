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
import {Membership} from "@/types/Membership";
import {getMembership} from "@/api/membership";

interface UserContextValue {
    userInfo: UserInfo | null;
    membership: Membership | null;
    loading: boolean;
    membershipLoading: boolean;
    refreshUserInfo: () => Promise<void>;
    refreshMembership: () => Promise<void>;
    updateUserInfo: (params: UpdateUserInfoParams) => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
    userInfo: null,
    membership: null,
    loading: true,
    membershipLoading: true,
    refreshUserInfo: async () => {},
    refreshMembership: async () => {},
    updateUserInfo: async () => {}
});

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [loading, setLoading] = useState(true);
    const [membershipLoading, setMembershipLoading] = useState(true);
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

    const refreshMembership = async () => {
        setMembershipLoading(true);
        if (user?.id) {
            try {
                const membershipData = await getMembership(user.id);
                setMembership(membershipData);
            } catch (error) {
                console.error('Błąd przy pobieraniu danych membership:', error);
                setMembership(null);
            } finally {
                setMembershipLoading(false);
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
            refreshMembership();
        } else {
            setUserInfo(null);
            setMembership(null);
            setLoading(false);
        }
    }, [user]);

    return (
        <UserContext.Provider
            value={{
                userInfo,
                membership,
                loading,
                membershipLoading,
                refreshUserInfo,
                refreshMembership,
                updateUserInfo
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
