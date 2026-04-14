'use server';
/**
 * @fileOverview Advanced AI Essay Evaluator using Groq API.
 * Model: llama-3.1-70b-versatile for high-quality academic mentorship.
 */

import { z } from 'zod';

// Increase timeout for complex evaluations
export const maxDuration = 30;

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string().min(1, "Essay content cannot be empty"),
  topic: z.string(),
  academicLevel: z.enum(['High School', 'College', 'Graduate', 'Other', 'School Class 8-10', 'School Class 11-12', 'Undergraduate Year 1', 'Undergraduate Year 2', 'Undergraduate Year 3', 'Competitive Exams (UPSC)', 'Competitive Exams (JEE/NEET)', 'Competitive Exams (CAT/CLAT/SSC/NDA)']),
  wordLimit: z.string().optional(),
  question: z.string().optional(),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  score: z.number().int().min(0).max(10).optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  improvementSuggestions: z.array(z.string()).optional(),
  modelAnswerOutline: z.array(z.string()).optional(),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("GROQ_API_KEY is missing in environment variables.");
    return { error: "Configuration Error: AI Key is not set." };
  }

  if (!input.essayText.trim()) {
    return { error: "Essay content is empty." };
  }

  const systemPrompt = `You are an elite academic mentor at Mentur AI.
Evaluate strictly for the '${input.academicLevel}' level.
Return ONLY a valid JSON object. No extra text.`;

  const userPrompt = `Essay Evaluation Task:
- Level: ${input.academicLevel}
- Topic: ${input.topic}
${input.question ? `- Specific Prompt: ${input.question}` : ''}

Essay Text:
"""
${input.essayText}
"""

Output JSON Schema:
{
  "score": number (0-10),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvementSuggestions": ["string"],
  "modelAnswerOutline": ["string"]
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq Evaluation API Error: Status ${response.status} - ${errorText}`);
      return { error: `AI Evaluator encountered an error (${response.status}).` };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const parsedContent = JSON.parse(content);
      return EvaluateEssayFeedbackOutputSchema.parse(parsedContent);
    } catch (parseError: any) {
      console.error("JSON Parsing Error in Evaluation:", content);
      return { error: "AI Evaluator returned an invalid response format." };
    }
  } catch (error: any) {
    console.error("Fetch Exception in Evaluation:", error.message);
    return { error: error.message || "An unexpected error occurred during evaluation." };
  }
}
