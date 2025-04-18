import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGeneStreamService } from '@/services';
import { CreateAnnotationInput } from '@/types';
import { APIAnnotation } from '@/types';
import { SequenceDataWithAnnotation } from '@/types';
import { useAuth0 } from '@auth0/auth0-react';

interface SequenceAnnotations {
    name: APIAnnotation[];
    description: APIAnnotation[];
}

export interface SequenceDetailError {
    code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR';
    message: string;
}

export const useSequenceDetail = (gs_id: string) => {
    const geneStreamService = useGeneStreamService();
    const queryClient = useQueryClient();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth0();

    // Primary query for metadata and sequence
    const {
        data: sequenceData,
        isLoading: isLoadingInitialData,
        error: queryError
    } = useQuery<SequenceDataWithAnnotation, Error>({
        queryKey: ['sequence', gs_id, isAuthenticated],
        queryFn: async () => {
            const response = await geneStreamService.fetchSequence(gs_id);
            if (!response?.metadata) {
                throw new Error('Sequence not found');
            }
            return response;
        },
        enabled: Boolean(gs_id) && !isAuthLoading,
        retry: (failureCount, error: any) => {
            if (error?.statusCode === 404 && !isAuthLoading) return false;
            if (error?.statusCode === 401) return false;
            return failureCount < 2;
        },
        staleTime: isAuthLoading ? 0 : 1000 * 60 * 5
    });

    // Lazy loaded annotations query
    const {
        data: annotations,
        isLoading: isLoadingAnnotations,
        refetch: loadAnnotations
    } = useQuery<SequenceAnnotations>({
        queryKey: ['sequence-annotations', gs_id],
        queryFn: async () => {
            const response = await geneStreamService.fetchSequence(gs_id, { include: 'annotations' });
            return {
                name: response.annotations?.name || [],
                description: response.annotations?.description || []
            };
        },
        enabled: false, // Don't load automatically
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // Mutation for creating annotations
    const createAnnotationMutation = useMutation({
        mutationFn: async (input: CreateAnnotationInput) => {
            await geneStreamService.createAnnotation(
                gs_id,
                input.type,
                input.content
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequence-annotations', gs_id] });
        },
    });

    // Mutation for editing annotations
    const editAnnotationMutation = useMutation({
        mutationFn: async ({ annotationId, content }: { annotationId: string; content: string }) => {
            await geneStreamService.editAnnotation(annotationId, content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequence-annotations', gs_id] });
        },
    });

    // Mutation for publishing annotations
    const publishAnnotationMutation = useMutation({
        mutationFn: async (annotationId: string) => {
            await geneStreamService.publishAnnotation(annotationId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequence-annotations', gs_id] });
        },
    });

    // Handler functions with error management
    const handleCreateAnnotation = async (input: CreateAnnotationInput) => {
        try {
            await createAnnotationMutation.mutateAsync(input);
            return true;
        } catch (error) {
            console.error('Failed to create annotation:', error);
            return false;
        }
    };

    const handleEditAnnotation = async (annotationId: string, content: string): Promise<void> => {
        try {
            await editAnnotationMutation.mutateAsync({ annotationId, content });
        } catch (error) {
            console.error('Failed to edit annotation:', error);
            throw error; // Re-throw to let component handle error
        }
    };

    const handlePublishAnnotation = async (annotationId: string): Promise<void> => {
        try {
            await publishAnnotationMutation.mutateAsync(annotationId);
        } catch (error) {
            console.error('Failed to publish annotation:', error);
            throw error;
        }
    };

    return {
        // Data
        metadata: sequenceData?.metadata,
        sequence: sequenceData?.sequence,
        annotations,

        // Loading states
        isLoadingMetadata: isLoadingInitialData || isAuthLoading,
        isLoadingSequence: isLoadingInitialData || isAuthLoading,
        isLoadingAnnotations,

        // Error states
        error: isAuthLoading ? undefined : queryError,
        annotationError: createAnnotationMutation.error ||
            editAnnotationMutation.error ||
            publishAnnotationMutation.error,

        // Mutation states
        isCreatingAnnotation: createAnnotationMutation.isPending,
        isEditingAnnotation: editAnnotationMutation.isPending,
        isPublishingAnnotation: publishAnnotationMutation.isPending,

        // Actions
        loadAnnotations,
        handleCreateAnnotation,
        handleEditAnnotation,
        handlePublishAnnotation,
    };
};