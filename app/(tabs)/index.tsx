import React from 'react';
import { useAuth } from '@/context/AuthContext';

import LoginScreen from '@/components/auth/LoginScreen';
import UserProfile from '@/components/user/UserProfileScreen';
import UserSetupScreen from "@/components/user/UserSetupScreen";

export default function HomeScreen() {
    const { user} = useAuth();

    if (!user) {
        return <LoginScreen />;
    }
    if (user.isFirstLogin) {
        return <UserSetupScreen />;
    }
    return <UserProfile />;
}