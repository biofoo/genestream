// src/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL;

export function useAuth(): AuthState {
    const { user: auth0User, isAuthenticated, getAccessTokenSilently, isLoading: isAuth0Loading } = useAuth0();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUser = async () => {
        if (!isAuthenticated || !auth0User?.sub) {
            setIsLoading(false);
            return;
        }

        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get<User>(`${API_URL}/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('useAuth - Got user data!');

            // Combine Auth0 data with database data
            setUser(response.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
            console.error('Error fetching user data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuth0Loading && isAuthenticated) {
            fetchUser();
        } else if (!isAuth0Loading && !isAuthenticated) {
            setIsLoading(false);
            setUser(null);
        }
    }, [isAuth0Loading, isAuthenticated, auth0User?.sub]);

    return {
        user,
        isLoading: isLoading || isAuth0Loading,
        error,
        refetch: fetchUser
    };
}