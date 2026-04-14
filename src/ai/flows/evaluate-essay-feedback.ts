'use server';
/**
 * @fileOverview Advanced AI Professor for Essay Evaluation.
 * Analyzes structure (Intro, Body, Conclusion), Grammar, and provides a full rewrite.
 */

import { z } from 'zod';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string().min(1, "Essay content cannot be empty"),
  topic: z.string(),
  academicLevel: z.string(),
  question: z.string().optional(),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  score: z.number().int().min(0).max(10),
  feedbackBySection: z.object({
    introduction: z.string(),
    mainBody: z.string(),
    conclusion: z.string(),
    grammarAndVocabulary: z.string(),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestedRewrite: z.string().describe("A perfectly rewritten version of the student's essay."),
  modelAnswerOutline: z.array(z.string()),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { error: "AI Key is missing.", score: 0, feedbackBySection: { introduction: "", mainBody: "", conclusion: "", grammarAndVocabulary: "" }, strengths: [], weaknesses: [], suggestedRewrite: "", modelAnswerOutline: [] };

  const systemPrompt = `You are a Senior Professor at Mentur AI. 
Evaluate the essay for the '${input.academicLevel}' level.
CRITERIA: Evaluate Introduction, Main Body, Conclusion, and Grammar separately.
TASK: Provide a comprehensive score out of 10 and a FULL suggested rewrite that would earn a perfect score.
Return ONLY valid JSON.`;

  const userPrompt = `Topic: ${input.topic}
${input.question ? `Question/Prompt: ${input.question}` : ''}

Student's Essay:
"""
${input.essayText}
"""

JSON Schema required:
{
  "score": number,
  "feedbackBySection": {
    "introduction": "...",
    "mainBody": "...",
    "conclusion": "...",
    "grammarAndVocabulary": "..."
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestedRewrite": "...",
  "modelAnswerOutline": ["..."]
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
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error("API Failure");

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return EvaluateEssayFeedbackOutputSchema.parse(parsed);
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    return { error: "Failed to evaluate essay.", score: 0, feedbackBySection: { introduction: "", mainBody: "", conclusion: "", grammarAndVocabulary: "" }, strengths: [], weaknesses: [], suggestedRewrite: "", modelAnswerOutline: [] };
  }
}