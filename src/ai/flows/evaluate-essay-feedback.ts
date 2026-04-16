'use server';
/**
 * @fileOverview Expert Mentor Professor for Text-Only Evaluation.
 * Optimized using llama-3.1-8b-instant with a 1000 token limit target.
 */

import { z } from 'zod';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string(),
  topic: z.string(),
  academicLevel: z.string(),
  question: z.string().optional(),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  evaluationData: z.object({
    type: z.literal('Essay'),
    questionsTotal: z.number().nullable().optional(),
    questionsCorrect: z.number().nullable().optional(),
    accuracyPercent: z.number().nullable().optional(),
    essayScoreRaw: z.number(),
    coinsEarned: z.number(),
    status: z.enum(['Mastered', 'Improving', 'Needs Practice']),
  }),
  professorFeedback: z.string(),
  suggestedRewrite: z.string(),
  totalTokens: z.number().optional(),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { 
    error: "AI Key is missing.", 
    evaluationData: { type: 'Essay', essayScoreRaw: 0, coinsEarned: 0, status: 'Needs Practice' },
    professorFeedback: "",
    suggestedRewrite: ""
  };

  const systemPrompt = `You are the Mentur AI 'Expert Mentor Professor'. Evaluate the student's typed essay based on Clarity, Logic, and Depth.
Model: llama-3.1-8b-instant. Target response under 1000 tokens.

STRICT RULES:
1. RELEVANCE: If the answer is irrelevant or random, score 0% and 0 Coins.
2. FEEDBACK: Support but be strict. Use Hinglish nuances if needed.
3. COINS: 50-100 for genuine efforts. 0 for nonsense.
4. FORMAT: Return ONLY valid JSON.`;

  const userPrompt = `
Topic: ${input.topic}
Level: ${input.academicLevel}
Question: ${input.question || 'Practice'}

Student Answer:
"""
${input.essayText}
"""

Evaluate following the defined JSON structure.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) throw new Error("Groq API Error");

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    const usage = data.usage?.total_tokens || 0;
    
    return EvaluateEssayFeedbackOutputSchema.parse({
      ...content,
      totalTokens: usage,
      evaluationData: {
        ...content.evaluationData,
        type: 'Essay',
      }
    });
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    return { 
      error: "Technical interruption. Please resubmit your response.", 
      evaluationData: { type: 'Essay', essayScoreRaw: 0, coinsEarned: 0, status: 'Needs Practice' },
      professorFeedback: "Unable to evaluate at this moment.",
      suggestedRewrite: ""
    };
  }
}
