export interface College {
    name: string;
    state: string;
    city?: string;
    university?: string;
    type?: string;
}

export interface VerificationResult {
    source: 'cache' | 'db_fallback' | 'api' | 'none';
    data: College[];
    durationMs: number;
}
