/* app/(tabs)/auth.tsx */
import React, { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

import LoginScreen from '@/components/auth/LoginScreen';
import HomeContent from '@/components/auth/index.original';

export default function HomeScreen() {
    const { isLoggedIn } = useContext(AuthContext);
    return isLoggedIn ? <HomeContent /> : <LoginScreen />;
}