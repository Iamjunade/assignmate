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
    }
};
