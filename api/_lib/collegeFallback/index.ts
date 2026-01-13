import { College } from './types';
import { cache } from './cache';
import { ingestion } from './ingestion';
import { apiClient } from './apiClient';
import { CONFIG } from './config';
import { logger } from './logger';

export { CONFIG } from './config';

/**
 * Searches for colleges using the fallback strategy.
 * This should ONLY be called if the primary internal dataset returns no results.
 * 
 * Strategy:
 * 1. Check In-Memory Cache
 * 2. Check Ingested Fallback DB
 * 3. Call External API
 * 
 * If found in API:
 * - Save to Ingested Fallback DB (Async)
 * - Save to In-Memory Cache
 */
export const searchCollegeFallback = async (query: string): Promise<College[]> => {
    const start = Date.now();

    if (!CONFIG.ENABLED) {
        logger.info('Fallback disabled');
        return [];
    }

    if (!query || query.length < 3) {
        logger.warn('Query too short for fallback', { query });
        return [];
    }

    logger.info('Fallback triggered', { query });

    // 1. Check Cache
    const cachedResult = cache.get(query);
    if (cachedResult) {
        logger.info('Returning from cache', { query, duration: Date.now() - start });
        return cachedResult;
    }

    // 2. Check Fallback DB
    // Note: This requires firebase-admin to be initialized in the calling context
    const dbResult = await ingestion.searchInFallback(query);
    if (dbResult && dbResult.length > 0) {
        // Hydrate cache
        cache.set(query, dbResult);
        logger.info('Returning from fallback DB', { query, duration: Date.now() - start });
        return dbResult;
    }

    // 3. Call External API
    const apiResult = await apiClient.fetchColleges(query);
    if (apiResult && apiResult.length > 0) {
        // Async Ingestion (Fire and forget, but handled safely in ingestion module)
        ingestion.saveToFallbackOnly(apiResult).catch(err => {
            logger.error('Background ingestion failed unexpectedly', err);
        });

        // Update Cache
        cache.set(query, apiResult);

        logger.info('Returning from External API', { query, duration: Date.now() - start });
        return apiResult;
    }

    logger.info('No results found in fallback', { query, duration: Date.now() - start });
    return [];
};
