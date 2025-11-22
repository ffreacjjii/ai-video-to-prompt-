
import { GoogleGenAI, type Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateVideoPromptFromMedia(
  mediaPart: Part,
  style?: string,
  additionalContext?: string
): Promise<string> {
  try {
    const model = ai.models;

    // Note: mediaPart is now passed in, already processed by fileToGenerativePart in the UI layer.

    const prompt = `You are an expert visual and audio analyst. Your task is to meticulously describe the contents of the provided image or video file to generate a prompt for a text-to-video AI model that would recreate this media as accurately as possible.

${style ? `**IMPORTANT - Target Style:** The user specifically requests the video prompt to be in the style of: "${style}". Ensure this style is prominently described and applied to the scene.` : ''}
${additionalContext ? `**IMPORTANT - User Instructions:** Incorporate the following specific keywords or details into the description naturally: "${additionalContext}".` : ''}

Your description must be a literal and highly detailed account of everything visible and audible, including:
- **Subject(s):** Identify all main subjects (people, animals, objects). Describe their appearance, clothing, expressions, and features in great detail.
- **Action(s):** Detail every action and interaction. For videos, describe the sequence of events.
- **Setting/Environment:** Describe the location, time of day, weather, lighting, and background elements. Be specific about colors, textures, and architecture.
- **Composition & Camera:** Describe the camera angle (e.g., low angle, eye-level), shot type (e.g., close-up, wide shot), and any camera movement (e.g., panning, static).
- **Style & Mood:** Define the visual style and the emotional mood.
- **Audio:** If a video is provided, describe any speech, dialogue, narration, or significant sound effects.

Combine these elements into a single, cohesive, and comprehensive paragraph. The goal is an exact, detailed replication of the source media, modified by any requested style or user instructions.`;

    const result = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [ {text: prompt}, mediaPart ] },
    });
    
    const text = result.text;
    if (!text) {
      throw new Error("The AI model returned an empty response. The media might not be recognizable.");
    }

    return text.trim();

  } catch (error: any) {
    console.error("Error generating prompt:", error);
    
    let errorMessage = "An unknown error occurred.";
    
    // Robustly extract the error message
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      try {
        // Handle raw objects or JSON responses from SDK
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = "Unknown error object";
      }
    } else {
        errorMessage = String(error);
    }

    const msgLower = errorMessage.toLowerCase();

    // 1. API Key / Permissions / 403
    if (
        msgLower.includes('api key') || 
        msgLower.includes('403') || 
        msgLower.includes('permission denied') || 
        msgLower.includes('permission_denied') 
    ) {
        if (msgLower.includes('api key')) {
             throw new Error("Invalid API key. Please check your configuration.");
        }
        throw new Error("Access denied. Please check if your API key has the necessary permissions and the Generative AI API is enabled.");
    }

    // 2. FileReader / Local File Issues
    // Note: Most FileReader errors should now be caught in the UI layer before reaching here,
    // but we keep this as a fallback.
    if (msgLower.includes('filereader') || msgLower.includes('read the file') || msgLower.includes('source data')) {
         throw new Error("The AI model failed to process the request. This could be due to a network issue, invalid media format, or an internal service error. Please try again.\n\nDetails: Unable to read the file. It may be corrupt or restricted.");
    }

    // 3. Common Failure Scenarios (Network, Bad Request, Server Error)
    if (
        msgLower.includes('fetch failed') || 
        msgLower.includes('network') ||
        msgLower.includes('400') || 
        msgLower.includes('invalid_argument') ||
        msgLower.includes('503') ||
        msgLower.includes('overloaded')
      ) {
          let details = errorMessage;
          
          if (msgLower.includes('400') || msgLower.includes('invalid_argument')) {
            details = "The file format may be unsupported, or the file is corrupted.";
          } else if (msgLower.includes('503') || msgLower.includes('overloaded')) {
            details = "The service is temporarily overloaded.";
          } else if (details.length > 200) {
             details = details.substring(0, 200) + "...";
          }

          throw new Error(`The AI model failed to process the request. This could be due to a network issue, invalid media format, or an internal service error. Please try again.\n\nDetails: ${details}`);
      }

    // Fallback for other errors
    throw new Error(errorMessage);
  }
}
