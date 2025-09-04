import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
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
import {handleApiError} from "@/utils/errorHandler";

/**
 * Interface defining the shape of user context values
 */
interface UserContextValue {
    userInfo: UserInfo | null;
    membership: Membership | null;
    loading: boolean;
    membershipLoading: boolean;
    refreshUserInfo: () => Promise<void>;
    refreshMembership: () => Promise<void>;
    updateUserInfo: (params: UpdateUserInfoParams) => Promise<void>;
}

/**
 * User context providing user information and membership state
 */
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

/**
 * User provider component that manages user information and membership state
 * Handles fetching and updating user data and membership information
 */
export const UserProvider = ({ children }: UserProviderProps) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [loading, setLoading] = useState(true);
    const [membershipLoading, setMembershipLoading] = useState(true);
    const { user, completeFirstLogin } = useAuth();

    /**
     * Fetches and updates user information from the API
     * Sets loading state during the operation
     */
    const refreshUserInfo = useCallback(async () => {
        setLoading(true);
        if (user) {
            try {
                const data = await fetchUserInfo();
                setUserInfo(data);
            } catch (error) {
                handleApiError(error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [user]);

    /**
     * Fetches and updates membership information from the API
     * Sets membership loading state during the operation
     */
    const refreshMembership = useCallback(async () => {
        setMembershipLoading(true);
        if (user?.id) {
            try {
                const membershipData = await getMembership(user.id);
                setMembership(membershipData);
            } catch (error) {
                handleApiError(error);
            } finally {
                setMembershipLoading(false);
            }
        } else {
            setMembershipLoading(false);
        }
    }, [user?.id]);

    /**
     * Updates user information via API and completes first login if applicable
     * Refreshes local user state with updated data
     */
    const updateUserInfo = useCallback(async (params: UpdateUserInfoParams) => {
        setLoading(true);
        try {
            const updated = await apiUpdateUserInfo(params);
            setUserInfo(updated);
            await completeFirstLogin();
        } catch (error: any) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }, [completeFirstLogin]);

    /**
     * Effect hook to handle user data initialization
     * Fetches user info and membership when user is available and not on first login
     */
    useEffect(() => {
        const initializeUserData = async () => {
            if (!user?.isFirstLogin) {
                // Fetch user data in parallel for better performance
                await Promise.all([
                    refreshUserInfo(),
                    refreshMembership()
                ]);
            } else {
                // Clear user data for first-time users
                setUserInfo(null);
                setMembership(null);
                setLoading(false);
                setMembershipLoading(false);
            }
        };

        initializeUserData();
    }, [user, refreshUserInfo, refreshMembership]);

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

/**
 * Custom hook to access user context
 * Provides convenient access to user state and methods
 */
export const useUser = () => useContext(UserContext);
