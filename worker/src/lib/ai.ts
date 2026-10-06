import { GoogleGenAI } from "@google/genai";
import configKeys from "../config/config.ts";
const BATCH_SIZE = 20;

const ai = new GoogleGenAI({ apiKey: configKeys.GEMINI_API_KEY });

export default ai;
