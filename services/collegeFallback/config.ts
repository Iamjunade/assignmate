export const CONFIG = {
    ENABLED: process.env.ENABLE_COLLEGE_FALLBACK === 'true',
    API_URL: process.env.COLLEGE_API_URL || 'https://indian-colleges-list.vercel.app/api/institutions',
    CACHE_TTL_MS: 1000 * 60 * 60, // 1 hour
    FALLBACK_COLLECTION: 'colleges_fallback'
};
