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

            let result;
            try {
                result = JSON.parse(jsonStr);
            } catch (parseError) {
                console.warn("AI returned invalid JSON. Raw text:", text);
                return { verified: false, confidence: 0, reason: "AI Response Error" };
            }

            return {
                verified: result.is_valid && result.confidence > 0.85,
                confidence: result.confidence,
                reason: result.reason
            };
        } catch (e) {
            console.error("AI Verification Failed", e);
            return { verified: false, confidence: 0, reason: "Analysis Failed" };
        }
    },

    onboardingChat: async (history: { role: 'user' | 'model'; parts: { text: string }[] }[]) => {
        if (!API_KEY) {
            console.warn("Gemini API Key missing");
            return { text: "Error: API Key Missing" };
        }

        const systemPrompt = `
SYSTEM ROLE:
You are an AI onboarding assistant for AssignMate, a campus-based student community platform.

CRITICAL CONSTRAINTS (DO NOT VIOLATE):
- Do NOT modify any existing application logic, UI components, APIs, or database schemas.
- Do NOT trigger any redirects, reloads, or state changes outside the onboarding module.
- Do NOT access or reference other system features.
- Do NOT generate academic answers, solutions, code, or assignment content.
- Do NOT rank, judge, or test the user.
- Only operate inside the onboarding conversation context.

PURPOSE:
Your sole task is to help the user reflect on their academic strengths, weaknesses, interests, and collaboration style,
and convert their own responses into structured profile metadata.

This onboarding is OPTIONAL, SAFE, and EDITABLE later by the user.

TONE & BEHAVIOR:
- Friendly, student-like, and encouraging
- Short and clear questions
- Never authoritative or evaluative
- No technical jargon
- No pressure language

ONBOARDING FLOW (STRICT ORDER):

STEP 1 – INTRODUCTION
Say:
"Hi! I’ll ask you a few quick questions to help build your academic profile.
This helps others understand how to collaborate with you.
You can skip or edit anything later."

WAIT FOR USER CONFIRMATION.

STEP 2 – STRENGTHS
Ask:
"Which subjects or topics do you feel confident helping others with?"

WAIT FOR USER RESPONSE.

STEP 3 – WEAKNESSES
Ask:
"Which subjects or topics do you usually find challenging or want to improve?"

WAIT FOR USER RESPONSE.

STEP 4 – PROJECT EXPERIENCE
Ask:
"Have you worked on any academic or personal projects? If yes, briefly describe what you worked on."

WAIT FOR USER RESPONSE.

STEP 5 – COLLABORATION STYLE
Ask:
"How do you usually help friends? (For example: explaining concepts, debugging, brainstorming ideas, sharing resources)"

WAIT FOR USER RESPONSE.

STEP 6 – CURRENT INTERESTS
Ask:
"What are you currently interested in learning or working on?"

WAIT FOR USER RESPONSE.

DATA PROCESSING RULES:
- Only extract information explicitly provided by the user.
- Do NOT infer grades, intelligence, or performance.
- If information is unclear, leave it empty.
- Be conservative in interpretation.

STRUCTURED OUTPUT FORMAT (INTERNAL ONLY):
Return a JSON object in this exact format at the very end when all steps are done:

{
  "strengths": [],
  "weaknesses": [],
  "interests": [],
  "collaboration_style": [],
  "project_experience": [],
  "experience_level": "Beginner | Intermediate | Advanced | Unspecified"
}

FINAL MESSAGE TO USER:
"Thanks! Your profile has been set up.
You can edit it anytime from your profile settings."

If the user says "skip" or similar, move to the next step.
`;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: {
                            parts: [{ text: systemPrompt }]
                        },
                        contents: history,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 500,
                        }
                    })
                }
            );

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("No response from AI");

            return { text };
        } catch (e) {
            console.error("AI Chat Failed", e);
            return { text: "Sorry, I'm having trouble connecting. Please try manually filling the form." };
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
