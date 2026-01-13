import { College } from './types';
import { CONFIG } from './config';
import { logger } from './logger';

interface CacheEntry {
    data: College[];
    timestamp: number;
}

// Global cache outside the function scope to persist across invocations in warm environments
const memoryCache = new Map<string, CacheEntry>();

export const cache = {
    get: (query: string): College[] | null => {
        const entry = memoryCache.get(query.toLowerCase());
        if (!entry) return null;

        const isExpired = (Date.now() - entry.timestamp) > CONFIG.CACHE_TTL_MS;
        if (isExpired) {
            memoryCache.delete(query.toLowerCase());
            logger.info('Cache expired', { query });
            return null;
        }

        logger.info('Cache hit', { query });
        return entry.data;
    },

    set: (query: string, data: College[]): void => {
        memoryCache.set(query.toLowerCase(), {
            data,
            timestamp: Date.now()
        });
        logger.info('Cache set', { query, count: data.length });
    },

    clear: () => {
        memoryCache.clear();
        logger.info('Cache cleared');
    }
};
