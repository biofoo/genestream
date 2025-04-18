// src/api/projects.ts
import axios from 'axios';
import { Project } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Add authentication interceptor
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const projectApi = {
    getProjects: async () => {
        const response = await api.get<Project[]>('/projects');
        return response.data;
    },

    getActiveProject: async () => {
        const response = await api.get<{ activeProject: Project }>('/projects/getActiveProject');
        return response.data.activeProject;
    },

    setActiveProject: async (projectId: string) => {
        const response = await api.post<{ activeProject: Project }>('/projects/setActiveProject', { projectId });
        return response.data.activeProject;
    }
};