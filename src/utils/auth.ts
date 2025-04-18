// src/utils/auth.ts

import { useAuth0 } from "@auth0/auth0-react";

export const getToken = async (): Promise<string> => {
    const { getAccessTokenSilently } = useAuth0();
    try {
        const token = await getAccessTokenSilently();
        return token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw new Error('Failed to get access token');
    }
};

export const useAuthToken = () => {
    const { getAccessTokenSilently } = useAuth0();
    return async () => {
        try {
            return await getAccessTokenSilently();
        } catch (error) {
            console.error('Error getting access token:', error);
            throw new Error('Failed to get access token');
        }
    };
};