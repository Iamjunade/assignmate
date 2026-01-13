import { searchCollegeFallback } from '../services/collegeFallback/index';
// @ts-ignore
import { ingestion } from '../services/collegeFallback/ingestion';
// @ts-ignore
import { cache } from '../services/collegeFallback/cache';

// Mock console to keep output clean but visible
const originalConsole = { ...console };

console.log("----------------------------------------------------------------");
console.log("STARTING COLLEGE FALLBACK VERIFICATION");
console.log("----------------------------------------------------------------");

// --- MOCKING --- 
// We are mocking dependencies to run this without a real Firebase Admin environment for safety
// and to avoid needing service account keys in this script context.

// Mock Ingestion (DB)
ingestion.searchInFallback = async (query: string) => {
    console.log(`[MOCK DB] Searching for: ${query}`);
    return []; // Return empty to force API call
};

ingestion.saveToFallbackOnly = async (data: any[]) => {
    console.log(`[MOCK DB] Saving ${data.length} items`);
    return;
};

// Mock Cache
// We use the real cache, but we can inspect it.

// Mock Env
process.env.ENABLE_COLLEGE_FALLBACK = 'true';

async function runTest() {
    try {
        const query = "Techno India"; // A college likely to be found via API

        console.log(`\nTEST 1: Search for '${query}' (Should hit API)`);
        console.log("Expectation: Cache Miss -> DB Miss -> API Hit -> Cache Set");

        const results = await searchCollegeFallback(query);

        console.log(`Result Count: ${results.length}`);
        if (results.length > 0) {
            console.log("First Result:", results[0]);
            console.log("✅ API Fetch Successful");
        } else {
            console.log("❌ API Fetch Failed (This implies API might be down or query invalid)");
        }

        // Test Cache Hit
        console.log(`\nTEST 2: Search for '${query}' again (Should hit Cache)`);

        // We need to spy on cache or just check speed/internal logs if we could. 
        // Since we are running valid code, let's just run it.
        const start = Date.now();
        const results2 = await searchCollegeFallback(query);
        const duration = Date.now() - start;

        console.log(`Result Count: ${results2.length}`);
        console.log(`Duration: ${duration}ms`);

        if (duration < 10 && results2.length === results.length) {
            console.log("✅ Cache Hit Successful (Super fast response)");
        } else {
            console.log("⚠️ Cache might have missed or logic is slow");
        }

    } catch (e) {
        console.error("TEST FAILED:", e);
    }
}

runTest();
