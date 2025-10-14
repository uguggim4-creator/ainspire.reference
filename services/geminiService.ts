
import { GoogleGenAI, Type } from "@google/genai";
import type { Classification } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const classificationSchema = {
    type: Type.OBJECT,
    properties: {
        composition: { type: Type.STRING, description: 'e.g., Close-Up, Wide Shot, Low Angle' },
        action: { type: Type.STRING, description: 'e.g., Static, Walking, Action Sequence' },
        lighting: { type: Type.STRING, description: 'e.g., High-Key, Low-Key, Backlight' },
        color: { type: Type.STRING, description: 'e.g., Monochromatic, Warm Tones, Saturated' },
        setting: { type: Type.STRING, description: 'e.g., Urban, Nature, Indoor, Sci-Fi' },
    },
};

const PROMPT = `You are an expert film analyst and cinematographer. Analyze the provided image and classify it.
Describe each category with a short, concise term. If a criterion is not applicable, omit it from the result.
Categories:
1. Composition: (e.g., Close-Up, Medium Shot, Long Shot, Wide Shot, Over-the-Shoulder, Point of View, Low Angle, High Angle, Dutch Angle)
2. Action/Movement: (e.g., Static, Walking, Running, Jumping, Dialogue, Subtle Movement, Fast Paced)
3. Lighting: (e.g., High-Key, Low-Key, Backlight, Silhouette, Natural Light, Artificial Light, Hard Light, Soft Light)
4. Color Palette: (e.g., Monochromatic, Analogous, Complementary, Triadic, Warm Tones, Cool Tones, Saturated, Desaturated)
5. Setting: (e.g., Urban, Rural, Indoor, Outdoor, Nature, Sci-Fi, Fantasy)
Return the result as a JSON object adhering to the provided schema.`;

export const classifyImage = async (base64Image: string): Promise<Classification | null> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.split(',')[1],
            },
        };

        const textPart = {
            text: PROMPT,
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: classificationSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString) as Classification;
        return result;

    } catch (error) {
        console.error("Error classifying image with Gemini:", error);
        return null;
    }
};
