'use server';
/**
 * @fileOverview Master Professor & Game Evaluator for Essay Evaluation using llama-3.3-70b.
 * Performs deep multi-dimensional analysis and provides structured EVALUATION_DATA output.
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
  evaluationData: z.object({
    type: z.literal('Essay'),
    questionsTotal: z.number().nullable().describe("N/A for Essay"),
    questionsCorrect: z.number().nullable().describe("N/A for Essay"),
    accuracyPercent: z.number().nullable().describe("N/A for Essay"),
    essayScoreRaw: z.number().describe("Score percentage out of 100"),
    coinsEarned: z.number().describe("Coins awarded (50-100 based on quality)"),
    status: z.enum(['Mastered', 'Improving', 'Needs Practice']),
  }),
  professorFeedback: z.string().describe("Detailed, professor-style explanation, corrections, and guidance."),
  suggestedRewrite: z.string().describe("A Masterclass version of the student's essay."),
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
Your role is to grade user essay attempts with strict but supportive academic standards.

STRICT OPERATING RULES:
1. ROLE: Act as a senior academic professor. Be a strict marker.
2. EVALUATION LOGIC:
   - Evaluate based on Clarity, Logic, and Depth.
   - Award 50 to 100 coins based on quality.
   - If the student provides a multi-dimensional perspective (e.g., Bio-Psycho-Social), award higher coins.
   - If 'UPSC' or 'Competitive' level is mentioned, check for 'Critical Thinking' and 'Ethical Reasoning'.
3. OUTPUT: You must return valid JSON that satisfies the schema.

EVALUATION_DATA DETAILS:
- type: Always 'Essay'
- essayScoreRaw: 0-100 percentage based on merit.
- coinsEarned: 50-100 based on quality.
- status: 'Mastered' (90+), 'Improving' (60-89), 'Needs Practice' (<60).

PROFESSOR_FEEDBACK:
- Explain WHY the score was given.
- Provide a Masterclass Rewrite in the suggestedRewrite field.`;

  const userPrompt = `Topic: ${input.topic}
Level: ${input.academicLevel}
Question: ${input.question || 'Self-Practice'}

Student's Essay:
"""
${input.essayText}
"""

Return evaluation in JSON format.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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
