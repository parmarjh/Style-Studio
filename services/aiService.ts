export interface AIResponse {
    text: string;
    grounding?: any[];
}

export interface GarmentDetails {
    name: string;
    description: string;
    category: string;
    fit: string;
    tags: string[];
    enhancedImage: string | null;
}

export interface AIService {
    chat(message: string, history?: any[], options?: any): Promise<AIResponse>;
    analyzeImage(base64Image: string, prompt: string): Promise<string>;
    processGarment(base64Image: string): Promise<GarmentDetails>;
    getCompositionAnalysis(garments: any[]): Promise<string>;

    // Try-On is specific, but we'll include a method for it that might return a mock/fallback
    performTryOn(userImage: string, garmentDescription: string): Promise<string | null>;

    // Video is also specific
    generateVideo(base64Image: string, prompt: string): Promise<string | null>;
}
