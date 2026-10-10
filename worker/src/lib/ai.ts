import { GoogleGenAI } from "@google/genai";
import configKeys from "../config/config.ts";

const gemini = new GoogleGenAI({ apiKey: configKeys.GEMINI_API_KEY });

export default gemini;
