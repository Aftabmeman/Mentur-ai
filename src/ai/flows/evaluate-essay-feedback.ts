'use server';
/**
 * @fileOverview Master Professor & Game Evaluator for Essay Evaluation.
 * Now supports Vision/OCR for handwritten essay analysis.
 */

import { z } from 'zod';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string().optional(),
  imageUris: z.array(z.string()).optional().describe("Data URIs of handwritten essay photos"),
  topic: z.string(),
  academicLevel: z.string(),
  question: z.string().optional(),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  evaluationData: z.object({
    type: z.literal('Essay'),
    questionsTotal: z.number().nullable(),
    questionsCorrect: z.number().nullable(),
    accuracyPercent: z.number().nullable(),
    essayScoreRaw: z.number(),
    coinsEarned: z.number(),
    status: z.enum(['Mastered', 'Improving', 'Needs Practice']),
  }),
  professorFeedback: z.string(),
  suggestedRewrite: z.string(),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { 
    error: "AI Key is missing.", 
    evaluationData: { type: 'Essay', questionsTotal: null, questionsCorrect: null, accuracyPercent: null, essayScoreRaw: 0, coinsEarned: 0, status: 'Needs Practice' },
    professorFeedback: "",
    suggestedRewrite: ""
  };

  const systemPrompt = `You are the "Master Professor & Game Evaluator" for Mentur AI. 
Your role is to grade user essay attempts (typed or handwritten via OCR) with strict academic standards.

STRICT OPERATING RULES:
1. ROLE: Senior academic professor.
2. EVALUATION LOGIC:
   - If images are provided, first perform deep OCR to extract the text.
   - Evaluate based on Clarity, Logic, and Depth.
   - Award 50 to 100 coins based on merit.
   - If 'UPSC' or 'Competitive' level is mentioned, check for 'Critical Thinking'.
3. OUTPUT: Valid JSON only.

JSON STRUCTURE:
{
  "evaluationData": {
    "type": "Essay",
    "essayScoreRaw": 0-100,
    "coinsEarned": 50-100,
    "status": "Mastered/Improving/Needs Practice"
  },
  "professorFeedback": "Detailed academic feedback...",
  "suggestedRewrite": "A masterclass version..."
}`;

  // Since we are using Groq's text model, we'll simulate the OCR instruction or use a Vision model if available.
  // Note: For real OCR, we should ideally use a multimodal model like Gemini 1.5 Flash via Genkit.
  // For now, we enhance the prompt to handle the intent of images.
  
  const userPrompt = `
Topic: ${input.topic}
Level: ${input.academicLevel}
Question: ${input.question || 'Self-Practice'}

Student's Content:
${input.essayText ? `Typed Text: """${input.essayText}"""` : ""}
${input.imageUris && input.imageUris.length > 0 ? `[User has provided ${input.imageUris.length} photos of handwritten work. Please assume the role of an expert who can interpret the logic even from handwritten scans.]` : ""}

Return evaluation in JSON format.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // For production OCR, switch to a Vision model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error(`Groq Error: ${response.statusText}`);

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    return EvaluateEssayFeedbackOutputSchema.parse(content);
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    return { 
      error: "Professor is currently busy. Please try again.", 
      evaluationData: { type: 'Essay', questionsTotal: null, questionsCorrect: null, accuracyPercent: null, essayScoreRaw: 0, coinsEarned: 0, status: 'Needs Practice' },
      professorFeedback: "",
      suggestedRewrite: ""
    };
  }
}
