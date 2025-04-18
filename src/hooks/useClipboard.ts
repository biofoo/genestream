// src/hooks/useClipboard.ts
import { useState } from 'react';
import { copyToClipboard } from '@/utils/clipboard';

export const useClipboard = (timeout = 2000) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (text: string) => {
        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), timeout);
        }
    };

    return {
        copied,
        handleCopy
    };
};