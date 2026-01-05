
import { AIService, AIResponse, GarmentDetails } from './aiService';

const MOCK_DELAY = 1000;

// A stunning, high-fashion AI generated result image for the "Wow" factor
export const MOCK_RESULT_IMAGE = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000";

export const mockAIService: AIService = {
    async chat(message: string, history: any[] = []) {
        console.log("[God Mode] Mock Chat Response");
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        return {
            text: "That is a stunning choice! The silhouette is very modern. I'd recommend pairing it with structured trousers and minimal gold jewelry for a chic, elevated look. (God Mode Active)"
        };
    },

    async analyzeImage(base64Image: string, prompt: string) {
        console.log("[God Mode] Mock Image Analysis");
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        return "This piece exudes varied textures and a sophisticated color palette, perfect for a contemporary wardrobe. (God Mode Active)";
    },

    async processGarment(base64Image: string): Promise<GarmentDetails> {
        console.log("[God Mode] Mock Garment Processing");
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        return {
            name: "Midnight Silk Wrap Dress",
            description: "A luxurious, fluid silk dress with a flattering wrap waist and deep navy hue.",
            category: "Dress",
            fit: "Regular",
            tags: ["Elegant", "Evening", "Silk", "GodMode"],
            enhancedImage: null
        };
    },

    async getCompositionAnalysis(garments: any[]) {
        console.log("[God Mode] Mock Composition Analysis");
        return "This ensemble strikes a perfect balance between structure and fluidity, offering a timeless yet modern silhouette. (God Mode Active)";
    },

    async performTryOn(userImage: string, garmentDescription: string) {
        console.log("[God Mode] Mock Try-On (Returning Stunning Result)");
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY * 2));
        // Return the stunning mock result instead of the original user image
        return MOCK_RESULT_IMAGE;
    },

    async generateVideo(base64Image: string, prompt: string) {
        console.log("[God Mode] Mock Video Generation (Disabled)");
        return null;
    }
};
