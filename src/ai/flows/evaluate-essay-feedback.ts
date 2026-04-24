
'use server';
/**
 * @fileOverview DISCATE AI - Elite Academic Mentor.
 * Handles deep-metric evaluation with personality-driven feedback using Groq Llama 3.1.
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

  const systemPrompt = `You are 'DISCATE AI', an elite academic mentor. Your goal is excellence, not just degrees. Your soul is brilliant, encouraging, logical, and slightly witty. You value knowledge over rote learning (rattu-popat).

MANDATORY RULES:
1. Respond in ${input.preferredLanguage}.
2. TONE: Professional but inspiring. Use logical arguments. 
3. DO NOT use the name 'Rancho' or mention any movie in your output. Just BE that character naturally.
4. THE "ANTI-PARAGRAPH" RULE: If the student submits a single long paragraph without structure, criticize it firmly but constructively. Real scholars use points, headings, and clear divisions. Call it a "Machine Definition."

LEVEL-BASED CRITERIA:
- 8th-10th Std: Focus on clarity and concept coverage. Intro, Points, Conclusion required.
- 11th-Graduation: Professional Intro, Body with 1-2 Real-world Examples, Forward-looking Conclusion.
- Competitive Exams (UPSC/GATE/CAT): Contextual Intro, Structured Body (sub-questions), Data/Facts, Balanced Conclusion.

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
  "professorFeedback": "Detailed critique of structure/logic. Explain where they were rote-learners and how to be a true scholar. Be specific about their mistakes.",
  "suggestedRewrite": "The Ideal Path (Model Answer): [Introduction] -> [Detailed Main Body with structured points and examples] -> [Conclusion]"
}`;

  const userPrompt = `
Academic Level: ${input.academicLevel}
Topic: ${input.topic}
Question: ${input.question || 'Practice'}

Student's Submission:
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
        temperature: 0.2,
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
      error: "Evaluation failed. Our professor is busy solving a machine problem. Try again.", 
      evaluationData: { type: 'Essay', overallScore: 0, grammarScore: 0, contentDepthScore: 0, relevancyScore: 0, coinsEarned: 0, status: 'Needs Practice' },
      professorFeedback: "Technical interruption. Excellence requires a stable connection.",
      suggestedRewrite: ""
    };
  }
}
