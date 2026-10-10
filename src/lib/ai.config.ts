import configKeys from "@/config/config.keys";
import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({
  apiKey: configKeys.GEMINI_API_KEY!,
});
