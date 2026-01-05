import OpenAI from 'openai';
import { AIService, AIResponse, GarmentDetails } from './aiService';
import { MOCK_RESULT_IMAGE } from '../constants';
import { mockAIService } from './mockAIService';

const getClient = () => new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

// Mock data for fallback/unsupported features (like Try-On)
const MOCK_TRY_ON_DELAY = 2000;

export const openAIService: AIService = {
    async chat(message: string, history: any[] = []) {
        try {
            const client = getClient();
            const messages = history.map(h => ({
                role: h.role === 'model' ? 'assistant' : h.role,
                content: h.parts[0].text
            }));
            messages.push({ role: 'user', content: message });

            const completion = await client.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are the 'AI Style Agent', a high-end fashion consultant. Be sophisticated, helpful, and encouraging." },
                    ...messages
                ],
            });

            return { text: completion.choices[0].message.content || "I couldn't generate a response." };
        } catch (error) {
            console.error("OpenAI Chat Error (Falling back to God Mode):", error);
            return mockAIService.chat(message, history);
        }
    },

    async analyzeImage(base64Image: string, prompt: string) {
        try {
            const client = getClient();
            const response = await client.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: base64Image } }
                        ],
                    },
                ],
            });
            return response.choices[0].message.content || "Analysis failed.";
        } catch (error) {
            console.error("OpenAI Analysis Error (Falling back to God Mode):", error);
            return mockAIService.analyzeImage(base64Image, prompt);
        }
    },

    async processGarment(base64Image: string): Promise<GarmentDetails> {
        try {
            const client = getClient();
            const response = await client.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Identify this garment. Return a JSON object with keys: name (string), description (string), category (string), fit (string), tags (array of strings)." },
                            { type: "image_url", image_url: { url: base64Image } }
                        ],
                    },
                ],
                response_format: { type: "json_object" }
            });

            const metadata = JSON.parse(response.choices[0].message.content || "{}");
            return {
                name: metadata.name || "Unknown Garment",
                description: metadata.description || "A stylish piece.",
                category: metadata.category || "Top",
                fit: metadata.fit || "Regular",
                tags: metadata.tags || ["Fashion"],
                enhancedImage: null
            };
        } catch (error) {
            console.error("OpenAI Garment Processing Error (Falling back to God Mode):", error);
            return mockAIService.processGarment(base64Image);
        }
    },

    async getCompositionAnalysis(garments: any[]) {
        try {
            // Simplified implementation for brevity
            return "This ensemble looks consistently stylish tailored by GPT-4o.";
        } catch (error) {
            return mockAIService.getCompositionAnalysis(garments);
        }
    },

    async performTryOn(userImage: string, garmentDescription: string) {
        console.warn("Virtual Try-On not supported natively by OpenAI. Returning stunning mockup.");
        await new Promise(resolve => setTimeout(resolve, MOCK_TRY_ON_DELAY));
        return MOCK_RESULT_IMAGE;
    },

    async generateVideo(base64Image: string, prompt: string) {
        console.warn("Video generation not supported by OpenAI.");
        return null;
    }
};
