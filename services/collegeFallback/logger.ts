export const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[CollegeFallback] [INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    },
    warn: (message: string, meta?: any) => {
        console.warn(`[CollegeFallback] [WARN] ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message: string, error?: any) => {
        console.error(`[CollegeFallback] [ERROR] ${message}`, error);
    }
};
