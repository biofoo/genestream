// src/stores/useProjectStore.ts
import { create } from 'zustand';
import { Project } from '../types';

interface ProjectState {
    projects: Project[];
    activeProject: Project | null;
    isLoading: boolean;
    setProjects: (projects: Project[]) => void;
    setActiveProject: (project: Project | null) => void;
    setIsLoading: (value: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    activeProject: null,
    isLoading: false,
    setProjects: (projects) => set({ projects }),
    setActiveProject: (project) => set({ activeProject: project }),
    setIsLoading: (value) => set({ isLoading: value }),
}));