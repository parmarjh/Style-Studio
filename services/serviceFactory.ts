import { openAIService } from './openaiService';
import { anthropicService } from './anthropicService';
import { mockAIService } from './mockAIService';
import { AIService } from './aiService';

// Simple factory - prioritized based on API key availability
// Order: OpenAI -> Anthropic -> Mock (God Mode)

export const getAIService = (): AIService => {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    console.log("[ServiceFactory] Checking for API Keys...");
    console.log("- OpenAI Key:", openaiKey ? `Present (Starts with ${openaiKey.substring(0, 5)}...)` : "Missing");
    console.log("- Anthropic Key:", anthropicKey ? `Present (Starts with ${anthropicKey.substring(0, 5)}...)` : "Missing");

    if (openaiKey && openaiKey.trim().length > 10) {
        console.log("Using OpenAI Service");
        return openAIService;
    }

    if (anthropicKey && anthropicKey.trim().length > 10) {
        console.log("Using Anthropic Service");
        return anthropicService;
    }

    // God Mode Fallback
    console.warn("No valid API Keys found for OpenAI or Anthropic. Entering God Mode (Mock Services). Check your .env.local file for VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY.");
    return mockAIService;
};
