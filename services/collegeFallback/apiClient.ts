import { College } from './types';
import { CONFIG } from './config';
import { logger } from './logger';

export const apiClient = {
    fetchColleges: async (query: string): Promise<College[]> => {
        if (!CONFIG.ENABLED) {
            logger.warn('Fallback disabled, skipping API call');
            return [];
        }

        const url = `${CONFIG.API_URL}?name=${encodeURIComponent(query)}`;

        try {
            logger.info('Fetching from external API', { url });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                logger.error('External API failed', { status: response.status });
                return [];
            }

            const data = await response.json();

            // Validate response structure is array of objects
            if (!Array.isArray(data)) {
                logger.error('Invalid API response format', { data });
                return [];
            }

            // Map to internal College interface
            // The API returns { name: string, ... } based on requirement
            // We ensure it matches our interface
            const colleges: College[] = data.map((item: any) => ({
                name: item.name || item['college name'] || 'Unknown College',
                state: item.state || 'Unknown State',
                city: item.city,
                university: item.university,
                type: item.type
            })).filter(c => c.name !== 'Unknown College');

            logger.info('API fetch success', { count: colleges.length });
            return colleges;

        } catch (error: any) {
            if (error.name === 'AbortError') {
                logger.error('External API request timed out');
            } else {
                logger.error('External API request error', { error });
            }
            return [];
        }
    }
};
