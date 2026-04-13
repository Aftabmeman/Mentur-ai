'use server';
/**
 * @fileOverview Advanced AI Essay Evaluator using Groq API.
 * Model: llama-3.1-70b-versatile for nuanced academic mentorship.
 */

import { z } from 'zod';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string(),
  topic: z.string(),
  academicLevel: z.enum(['High School', 'College', 'Graduate', 'Other', 'School Class 8-10', 'School Class 11-12', 'Undergraduate Year 1', 'Undergraduate Year 2', 'Undergraduate Year 3', 'Competitive Exams (UPSC)', 'Competitive Exams (JEE/NEET)', 'Competitive Exams (CAT/CLAT/SSC/NDA)']),
  wordLimit: z.string().optional(),
  question: z.string().optional(),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  score: z.number().int().min(0).max(10),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  modelAnswerOutline: z.array(z.string()),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is missing from environment variables.");
    throw new Error("GROQ_API_KEY is not set.");
  }

  const systemPrompt = `You are an elite academic mentor at Mentur AI. 
Evaluate this essay based on the '${input.academicLevel}' research logic:
- High School/8th Std: Focus on structure, grammar, and factual accuracy.
- University/College: Focus on critical analysis, theory, and evidence-based arguments.
- UPSC: Focus on multi-dimensional perspectives, ethical depth, and clarity of thought.

Strictly return a JSON object.`;

  const userPrompt = `Context:
- Level: ${input.academicLevel}
- Topic: ${input.topic}
${input.question ? `- Prompt: ${input.question}` : ''}

Student Essay:
"""
${input.essayText}
"""

Evaluation Schema:
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
      console.error("Groq API Error Response:", response.status, errorText);
      throw new Error(`Groq API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const parsedContent = JSON.parse(content);
      return EvaluateEssayFeedbackOutputSchema.parse(parsedContent);
    } catch (parseError: any) {
      console.error("JSON Parsing/Validation Failed:", parseError);
      console.error("Raw content received from Groq:", content);
      throw new Error(`Invalid mentorship data structure: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error("Flow Execution Failed:", error);
    throw error;
  }
}