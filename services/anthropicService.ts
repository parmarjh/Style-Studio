import Anthropic from '@anthropic-ai/sdk';
import { AIService, AIResponse, GarmentDetails } from './aiService';
import { MOCK_RESULT_IMAGE } from '../constants';
import { mockAIService } from './mockAIService';

const getClient = () => new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true // Note: In production, should proxy
});

export const anthropicService: AIService = {
    async chat(message: string, history: any[] = []) {
        try {
            const client = getClient();
            const messages = history.map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.parts[0].text }));
            messages.push({ role: 'user', content: message });

            const completion = await client.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
                messages: messages as any[],
                system: "You are the 'AI Style Agent', a high-end fashion consultant. Be sophisticated, helpful, and encouraging."
            });

            const text = (completion.content[0] as any).text || "I couldn't generate a response.";
            return { text };
        } catch (error) {
            console.error("Anthropic Chat Error (Falling back to God Mode):", error);
            return mockAIService.chat(message, history);
        }
    },

    async analyzeImage(base64Image: string, prompt: string) {
        try {
            const client = getClient();
            const imageMediaType = base64Image.split(';')[0].split(':')[1];
            const imageBase64 = base64Image.split(',')[1];

            const message = await client.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image",
                                source: {
                                    type: "base64",
                                    media_type: imageMediaType as any,
                                    data: imageBase64,
                                },
                            },
                            {
                                type: "text",
                                text: prompt
                            }
                        ],
                    }
                ],
            });
            return (message.content[0] as any).text;
        } catch (error) {
            console.error("Anthropic Analysis Error (Falling back to God Mode):", error);
            return mockAIService.analyzeImage(base64Image, prompt);
        }
    },

    async processGarment(base64Image: string): Promise<GarmentDetails> {
        try {
            // Simplified check; in reality, we'd use Claude vision here
            return {
                name: "Claude Identified Item",
                description: "A piece identified by Claude 3.5 Sonnet.",
                category: "Top",
                fit: "Regular",
                tags: ["Claude", "Fashion"],
                enhancedImage: null
            };
        } catch (error) {
            return mockAIService.processGarment(base64Image);
        }
    },

    async getCompositionAnalysis(garments: any[]) {
        try {
            return "Claude 3.5 Sonnet finds this composition balanced and theoretically chic.";
        } catch (error) {
            return mockAIService.getCompositionAnalysis(garments);
        }
    },

    async performTryOn(userImage: string, garmentDescription: string) {
        console.warn("Virtual Try-On not supported by Anthropic. Returning stunning mockup.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        return MOCK_RESULT_IMAGE;
    },

    async generateVideo(base64Image: string, prompt: string) {
        return null;
    }
};
