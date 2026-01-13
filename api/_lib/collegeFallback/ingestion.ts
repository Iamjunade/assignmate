import { getFirestore } from 'firebase-admin/firestore';
import { College } from './types';
import { CONFIG } from './config';
import { logger } from './logger';

export const ingestion = {
    saveToFallbackOnly: async (colleges: College[]) => {
        if (colleges.length === 0) return;

        try {
            const db = getFirestore();
            const batch = db.batch();
            const collectionRef = db.collection(CONFIG.FALLBACK_COLLECTION);

            let count = 0;
            for (const college of colleges) {
                // Create a unique ID based on name + state to prevent duplicates
                // Sanitize ID
                const docId = `${college.name}-${college.state}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-');

                const docRef = collectionRef.doc(docId);

                // Use set with merge to be idempotent
                batch.set(docRef, {
                    ...college,
                    ingested_at: new Date().toISOString(),
                    source: 'fallback_api'
                }, { merge: true });

                count++;
                // Firestore batch limit is 500
                if (count >= 400) break;
            }

            await batch.commit();
            logger.info('Ingested to fallback collection', { count });

        } catch (error) {
            // We silently fail ingestion so we don't block the user response
            // The user gets the data from API anyway
            logger.error('Ingestion failed', { error });
        }
    },

    searchInFallback: async (query: string): Promise<College[]> => {
        try {
            const db = getFirestore();
            const collectionRef = db.collection(CONFIG.FALLBACK_COLLECTION);

            // Simple prefix search simulation 
            // Firestore doesn't do "contains" natively without third party
            // We'll trust the "internal dataset" (colleges.json) was checked first.
            // Here we check if we already have it in our fallback DB.
            // Using >= query and <= query + '\uf8ff' for prefix search

            const q = collectionRef
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .limit(20);

            const snapshot = await q.get();
            if (snapshot.empty) return [];

            const results: College[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    name: data.name,
                    state: data.state,
                    city: data.city,
                    university: data.university,
                    type: data.type
                };
            });

            logger.info('Fallback DB search success', { count: results.length });
            return results;

        } catch (error) {
            logger.error('Fallback DB search failed', { error });
            return [];
        }
    }
};
