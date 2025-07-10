import React, {} from 'react';
import { useAuth } from '@/context/AuthContext';

import LoginScreen from '@/components/auth/LoginScreen';
import UserProfile from '@/components/user/UserProfileScreen';
import UserSetupScreen from "@/components/user/UserSetupScreen";
import {useUser} from "@/context/UserContext";

export default function HomeScreen() {
    const { user} = useAuth();
    const { userInfo} = useUser();


    if (!user) {
        return <LoginScreen />;
    }
    if (!userInfo) {
        return <UserSetupScreen />;
    }
    return <UserProfile />;
}