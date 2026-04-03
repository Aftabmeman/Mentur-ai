import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

/**
 * Genkit initialization with Groq plugin.
 */
export const ai = genkit({
  plugins: [
    groq({
      apiKey: process.env.GROQ_API_KEY,
    }),
  ],
});
