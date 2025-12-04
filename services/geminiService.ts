import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Using the specified model for image editing tasks
const MODEL_NAME = 'gemini-2.5-flash-image';

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

/**
 * Edits an image based on a text prompt using Gemini.
 * @param imageBase64 The base64 string of the image (raw data, no prefix).
 * @param mimeType The mime type of the image.
 * @param prompt The text instruction for editing.
 * @returns The base64 data URL of the generated image.
 */
export const editImageWithGemini = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Note: responseMimeType and responseSchema are not supported for nano banana series (gemini-2.5-flash-image)
      // We rely on the model to return an image in the response parts.
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content returned from Gemini.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no image found, check for text indicating refusal or error
    const textPart = parts.find(p => p.text);
    if (textPart) {
      throw new Error(`Gemini returned text instead of an image: "${textPart.text}"`);
    }

    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw new Error(error.message || "Failed to edit image.");
  }
};
