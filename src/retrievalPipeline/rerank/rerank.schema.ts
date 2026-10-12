import { Type } from "@google/genai";

export const responseSchema = {
  type: Type.ARRAY,
  items: { type: Type.INTEGER },
};
