// src/components/SequenceCard/types.ts
import { SequenceResponse } from '@/types';

export interface SequenceCardProps {
    sequence: SequenceResponse;
    onNavigate?: (gs_id: string) => void;
    className?: string;
}