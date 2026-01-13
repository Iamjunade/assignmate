export interface College {
    name: string;
    state: string;
}

let cachedColleges: College[] | null = null;
let fetchPromise: Promise<College[]> | null = null;

export const collegeService = {
    getAll: async (): Promise<College[]> => {
        if (cachedColleges) return cachedColleges;

        if (fetchPromise) return fetchPromise;

        fetchPromise = fetch('/colleges.json')
            .then(res => {
                if (!res.ok) throw new Error("Failed to load colleges");
                return res.json();
            })
            .then(data => {
                cachedColleges = data;
                fetchPromise = null;
                return data;
            })
            .catch(err => {
                console.error("Error loading colleges:", err);
                fetchPromise = null;
                return [];
            });

        return fetchPromise;
    },

    getRandomCollege: async (): Promise<string> => {
        const colleges = await collegeService.getAll();
        if (colleges.length === 0) return "IIT Bombay"; // Fallback
        return colleges[Math.floor(Math.random() * colleges.length)].name;
    },

    searchFallback: async (query: string): Promise<College[]> => {
        try {
            const res = await fetch(`/api/colleges/search?query=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error("Fallback search failed:", error);
            return [];
        }
    },

    search: async (query: string): Promise<College[]> => {
        if (!query || query.length < 2) return [];

        try {
            // 1. Try Local Search first
            const allColleges = await collegeService.getAll();
            const lowerQ = query.toLowerCase();
            const localMatches = allColleges.filter(c =>
                c.name.toLowerCase().includes(lowerQ) ||
                c.state.toLowerCase().includes(lowerQ)
            ).slice(0, 10);

            if (localMatches.length > 0) {
                return localMatches;
            }

            // 2. Fallback to API if no local matches
            return await collegeService.searchFallback(query);

        } catch (error) {
            console.error("Search failed:", error);
            return []; // Fail gracefully
        }
    }
};
