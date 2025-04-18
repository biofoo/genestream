// src/pages/SequenceDetailPage/utils.ts
import { SequenceMetadataResponse } from '@/types';

export const getDisplayName = (metadata: SequenceMetadataResponse): string => {
    return metadata.public_names?.common || metadata.gs_id;
};