export const CACHE_KEY_PREFIX = 'genestream_profile_picture_';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedProfilePicture {
    url: string;
    timestamp: number;
}

export const getCachedProfilePicture = (userId: string): string | null => {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + userId);
    if (!cached) return null;

    try {
        const { url, timestamp }: CachedProfilePicture = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY_PREFIX + userId);
            return null;
        }
        return url;
    } catch (error) {
        console.error('Error parsing cached profile picture:', error);
        localStorage.removeItem(CACHE_KEY_PREFIX + userId);
        return null;
    }
};

export const setCachedProfilePicture = (userId: string, url: string): void => {
    const cacheData: CachedProfilePicture = {
        url,
        timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY_PREFIX + userId, JSON.stringify(cacheData));
};

export const clearCachedProfilePicture = (userId: string): void => {
    localStorage.removeItem(CACHE_KEY_PREFIX + userId);
};