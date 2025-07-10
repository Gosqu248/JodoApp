import React, { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

import LoginScreen from '@/components/auth/LoginScreen';
import UserProfile from '@/components/user/UserProfileScreen';

export default function HomeScreen() {
    const { user } = useContext(AuthContext);
    return user ? <UserProfile /> : <LoginScreen />;
}