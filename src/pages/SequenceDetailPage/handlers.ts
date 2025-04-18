// src/pages/SequenceDetailPage/handlers.ts
import { toast } from '@/hooks/use-toast';
import { CreateAnnotationInput } from '@/types';
import { GeneStreamService } from '../../services/genestreamService';
import { SequenceDataWithAnnotation } from '@/types';

export const createAnnotation = async (
    gs_id: string,
    input: CreateAnnotationInput,
    geneStreamService: GeneStreamService
) => {
    try {
        await geneStreamService.createAnnotation(gs_id, input.type, input.content);
        toast({
            title: "Success",
            description: "Annotation created successfully",
            type: "success"
        });
    } catch (error) {
        console.error('Failed to create annotation:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create annotation');
    }
};

export const editAnnotation = async (
    annotationId: string,
    content: string,
    geneStreamService: GeneStreamService
) => {
    try {
        await geneStreamService.editAnnotation(annotationId, content);
        toast({
            title: "Success",
            description: "Annotation updated successfully",
            type: "success"
        });
    } catch (error) {
        console.error('Failed to edit annotation:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update annotation');
    }
};

export const publishAnnotation = async (
    annotationId: string,
    geneStreamService: GeneStreamService
) => {
    try {
        await geneStreamService.publishAnnotation(annotationId);
        toast({
            title: "Success",
            description: "Annotation published successfully",
            type: "success"
        });
    } catch (error) {
        console.error('Failed to publish annotation:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to publish annotation');
    }
};

export const downloadSequence = (sequence: string, gs_id: string) => {
    // Create blob with sequence content
    const blob = new Blob([sequence], { type: 'text/plain' });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${gs_id}.txt`; // filename will be gs_id.txt

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Temporary implementation of display_name
// In the future, make Display Name a hard metadata in backend database
export const getDisplayName = (sequence: SequenceDataWithAnnotation): string => {
    if (!sequence.annotations?.name?.length) {
        // If no name annotations exist, fallback to gs_id
        return sequence.gs_id;
    }

    // Sort name annotations by created_at to get the most recent
    const sortedNames = [...sequence.annotations.name].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Return content of most recent name annotation, or gs_id if no content
    return sortedNames[0]?.content || sequence.gs_id;
};