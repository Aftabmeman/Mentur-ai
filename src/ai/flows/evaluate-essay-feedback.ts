'use server';
/**
 * @fileOverview Elite Academic Mentor for Essay Evaluation using llama-3.3-70b.
 * Performs deep multi-dimensional analysis, strict scoring, and provides a Masterclass Rewrite.
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
  score: z.number().min(0).max(10).describe("A strict score out of 10. Be a tough grader."),
  feedbackBySection: z.object({
    introduction: z.string().describe("Critique of the hook and thesis statement."),
    mainBody: z.string().describe("Analysis of logical flow and depth of insight."),
    conclusion: z.string().describe("Evaluation of the synthesis and final thought."),
    grammarAndVocabulary: z.string().describe("List specific sophisticated alternatives for used words."),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestedRewrite: z.string().describe("A Masterclass version of the student's essay using sophisticated structure and vocabulary."),
  modelAnswerOutline: z.array(z.string()).describe("Key multi-dimensional points (e.g., Bio-Psycho-Social or Ethical-Legal-Social)."),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { 
    error: "AI Key is missing.", 
    score: 0, 
    feedbackBySection: { introduction: "", mainBody: "", conclusion: "", grammarAndVocabulary: "" }, 
    strengths: [], 
    weaknesses: [], 
    suggestedRewrite: "", 
    modelAnswerOutline: [] 
  };

  const isUPSC = input.academicLevel.includes("UPSC") || input.academicLevel.includes("Competitive");

  const systemPrompt = `You are an Elite Academic Mentor and Senior Professor at Mentur AI.
Your task is to evaluate a student's essay for the '${input.academicLevel}' level with extreme rigor.

STRICT MARKING RULES:
1. Do not give high scores (8+) unless the answer is truly exceptional. Give 5/10 if the depth is missing.
2. If the topic is philosophical, analyze the depth of thought across Biological, Psychological, and Social factors.
3. ${isUPSC ? "This is a UPSC level evaluation. Look for 'Critical Thinking', 'Ethical Reasoning', and 'Balanced Perspective'." : "Focus on structural integrity and logical clarity."}
4. OCR Handling: If parts of the text (extracted from handwriting) seem unclear, mention it instead of guessing.

EVALUATION CRITERIA:
- Introduction: Does it have a strong hook and a clear roadmap?
- Main Body: Are the points multidimensional? Is there deep insight?
- Conclusion: Does it synthesize the argument or just repeat it?
- Masterclass Rewrite: Take the student's original points and rewrite them with sophisticated vocabulary, better structure (Intro, Body, Conclusion), and deeper backing.

Return ONLY valid JSON according to the provided schema.`;

  const userPrompt = `Topic: ${input.topic}
Question: ${input.question || 'Self-Practice'}

Student's Essay:
"""
${input.essayText}
"""

JSON Schema required:
{
  "score": number,
  "feedbackBySection": {
    "introduction": "string",
    "mainBody": "string",
    "conclusion": "string",
    "grammarAndVocabulary": "string"
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestedRewrite": "string",
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
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return EvaluateEssayFeedbackOutputSchema.parse(parsed);
  } catch (error: any) {
    console.error("Evaluation Flow Error:", error);
    return { 
      error: "Professor is currently busy or connection failed. Please try again.", 
      score: 0, 
      feedbackBySection: { introduction: "", mainBody: "", conclusion: "", grammarAndVocabulary: "" }, 
      strengths: [], 
      weaknesses: [], 
      suggestedRewrite: "", 
      modelAnswerOutline: [] 
    };
  }
}
