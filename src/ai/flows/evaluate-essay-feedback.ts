
'use server';
/**
 * @fileOverview Expert Mentor Professor for Deep Metrics Evaluation.
 */

import { z } from 'zod';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string(),
  topic: z.string(),
  academicLevel: z.string(),
  question: z.string().optional(),
  preferredLanguage: z.string().optional().default("English"),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  evaluationData: z.object({
    type: z.literal('Essay'),
    overallScore: z.number(),
    grammarScore: z.number(),
    contentDepthScore: z.number(),
    relevancyScore: z.number(),
    coinsEarned: z.number(),
    status: z.enum(['Mastered', 'Improving', 'Needs Practice']),
  }),
  professorFeedback: z.string(),
  suggestedRewrite: z.string(),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

function extractJson(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse AI response.");
  }
}

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { 
    error: "AI Key is missing.", 
    evaluationData: { type: 'Essay', overallScore: 0, grammarScore: 0, contentDepthScore: 0, relevancyScore: 0, coinsEarned: 0, status: 'Needs Practice' },
    professorFeedback: "",
    suggestedRewrite: ""
  };

  const languagePrompt = `Use ${input.preferredLanguage} style for feedback. If it is a "Mix" style (e.g., Hinglish), use the regional mix with English. Tone: "Baval" (energetic, encouraging but strictly academic).`;

  const systemPrompt = `You are the Mentur AI 'Expert Mentor Professor'. Evaluate the student's answer.
${languagePrompt}

METRICS:
1. Grammar Accuracy: Check grammar/spelling.
2. Content Depth: How solid and deep are the points?
3. Relevancy: How well does it answer the specific question?
4. Overall Score: Average of metrics.

JSON FORMAT ONLY:
{
  "evaluationData": {
    "overallScore": number,
    "grammarScore": number,
    "contentDepthScore": number,
    "relevancyScore": number,
    "coinsEarned": number,
    "status": "Mastered" | "Improving" | "Needs Practice"
  },
  "professorFeedback": "string in ${input.preferredLanguage}",
  "suggestedRewrite": "string - The Perfect Model Answer"
}`;

  const userPrompt = `
Topic: ${input.topic}
Level: ${input.academicLevel}
Question: ${input.question || 'Practice'}

Student Answer:
"""
${input.essayText}
"""`;

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
        temperature: 0.1,
      }),
    });

    if (!response.ok) throw new Error("Groq API Error");

    const data = await response.json();
    const content = extractJson(data.choices[0].message.content);
    
    return EvaluateEssayFeedbackOutputSchema.parse({
      ...content,
      evaluationData: {
        ...content.evaluationData,
        type: 'Essay',
      }
    });
  } catch (error: any) {
    return { 
      error: "Evaluation failed. Please try again.", 
      evaluationData: { type: 'Essay', overallScore: 0, grammarScore: 0, contentDepthScore: 0, relevancyScore: 0, coinsEarned: 0, status: 'Needs Practice' },
      professorFeedback: "Technical interruption. Please resubmit.",
      suggestedRewrite: ""
    };
  }
}
