// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setIsAuthenticated: (value: boolean) => void;
    setIsLoading: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user: User | null) => set({ user }),
    setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
    setIsLoading: (value: boolean) => set({ isLoading: value }),
}));