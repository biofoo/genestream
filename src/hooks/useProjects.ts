// src/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { ProjectApi } from '@/api/projectApi';
import { useAuth0 } from '@auth0/auth0-react';
import { Project } from '@/types';

// Query keys
export const projectKeys = {
    all: ['projects'] as QueryKey,
    lists: () => ['projects', 'list'] as QueryKey,
    list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
    active: () => [...projectKeys.all, 'active'] as const,
    details: (id: string) => [...projectKeys.all, 'detail', id] as const,
    members: (id: string) => [...projectKeys.all, 'members', id] as const,
};

export const useProjects = (projectApi: ProjectApi) => {
    const queryClient = useQueryClient();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth0();

    // Fetch projects list
    const {
        data: projects,
        isLoading: isLoadingProjects,
        error: projectsError
    } = useQuery({
        queryKey: projectKeys.lists(),
        queryFn: () => projectApi.getProjects(),
        enabled: isAuthenticated && !isAuthLoading,
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    });

    // Fetch active project
    const {
        data: activeProject,
        isLoading: isLoadingActive,
        error: activeError
    } = useQuery({
        queryKey: projectKeys.active(),
        queryFn: () => projectApi.getActiveProject(),
        enabled: isAuthenticated && !isAuthLoading,
        staleTime: 1000 * 60 * 5,
    });

    // Set active project mutation
    const setActiveMutation = useMutation({
        mutationFn: (project: Project) => projectApi.setActiveProject(project.id),
        onSuccess: (_, project) => {
            // Update active project in cache
            queryClient.setQueryData(projectKeys.active(), project);
            // Store in localStorage
            localStorage.setItem('activeProject', JSON.stringify(project));
        },
    });

    // Create project mutation
    const createMutation = useMutation({
        mutationFn: (name: string) => projectApi.createProject(name),
        onSuccess: (newProject) => {
            // Invalidate and refetch projects list
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists()
            });
            // Optionally set as active project
            setActiveMutation.mutate(newProject);
        },
    });

    // Delete project mutation
    const deleteMutation = useMutation({
        mutationFn: (projectId: string) => projectApi.deleteProject(projectId),
        onSuccess: (_, projectId) => {
            // Remove from cache
            queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) =>
                old?.filter(p => p.id !== projectId) ?? []
            );
            // If it was active project, clear it
            queryClient.setQueryData<Project | undefined>(projectKeys.active(), (current) =>
                current?.id === projectId ? undefined : current
            );
        },
    });

    // Update project mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            projectApi.updateProject(id, name),
        onSuccess: (updatedProject) => {
            // Update in cache
            queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) =>
                old?.map(p => p.id === updatedProject.id ? updatedProject : p) ?? []
            );
            // Update active project if it was the one updated
            queryClient.setQueryData<Project>(projectKeys.active(), (current) =>
                current?.id === updatedProject.id ? updatedProject : current
            );
        },
    });

    // Leave project mutation
    const leaveMutation = useMutation({
        mutationFn: (projectId: string) => projectApi.leaveProject(projectId),
        onSuccess: (_, projectId) => {
            // Remove from cache
            queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) =>
                old?.filter(p => p.id !== projectId) ?? []
            );
            // Clear active project if it was the one left
            queryClient.setQueryData<Project | undefined>(projectKeys.active(), (current) =>
                current?.id === projectId ? undefined : current
            );
        },
    });

    return {
        // Queries
        projects,
        activeProject,
        isLoading: isLoadingProjects || isLoadingActive,
        error: projectsError || activeError,

        // Mutations
        setActiveProject: setActiveMutation.mutate,
        createProject: createMutation.mutate,
        deleteProject: deleteMutation.mutate,
        updateProject: updateMutation.mutate,
        leaveProject: leaveMutation.mutate,

        // Mutation states
        isSettingActive: setActiveMutation.isPending,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
        isLeaving: leaveMutation.isPending,

        // Mutation errors
        mutationError:
            setActiveMutation.error ||
            createMutation.error ||
            deleteMutation.error ||
            updateMutation.error ||
            leaveMutation.error,

        // Reset functions
        reset: () => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.all
            });
        },
    };
};