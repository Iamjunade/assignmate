const env = (import.meta as any).env || {};
const API_KEY = env.VITE_GEMINI_API_KEY || '';

export const ai = {
    verifyIdCard: async (file: File): Promise<{ verified: boolean; confidence: number; reason: string }> => {
        if (!API_KEY) {
            console.warn("Gemini API Key missing");
            return { verified: false, confidence: 0, reason: "API Key Missing" };
        }

        try {
            const base64Data = await fileToGenerativePart(file);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: "Analyze this image. Is this a valid Indian Student ID Card? Return JSON with keys: 'is_valid' (boolean), 'confidence' (0-1), and 'reason' (string). Be strict. Look for College Name, Student Name, and Photo." },
                                { inline_data: { mime_type: file.type, data: base64Data } }
                            ]
                        }]
                    })
                }
            );

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("No response from AI");

            // Clean markdown code blocks if present
            const jsonStr = text.replace(/```json|```/g, '').trim();
            const result = JSON.parse(jsonStr);

            return {
                verified: result.is_valid && result.confidence > 0.85,
                confidence: result.confidence,
                reason: result.reason
            };

        } catch (e) {
            console.error("AI Verification Failed", e);
            return { verified: false, confidence: 0, reason: "Analysis Failed" };
        }
    }
};

async function fileToGenerativePart(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data url prefix (e.g. "data:image/jpeg;base64,")
            resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
