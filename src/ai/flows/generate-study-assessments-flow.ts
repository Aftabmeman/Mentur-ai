'use server';
/**
 * @fileOverview High-performance academic assessment generator using Groq llama-3.1-8b-instant.
 * Optimized for cost-efficiency and speed.
 */

import { z } from 'zod';

const MCQSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string(),
});

const FlashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
});

const EssayPromptSchema = z.object({
  prompt: z.string(),
  evaluationCriteria: z.array(z.string()),
  modelAnswerOutline: z.array(z.string()),
});

const GenerateStudyAssessmentsInputSchema = z.object({
  studyMaterial: z.string().min(1, "Study material cannot be empty"),
  assessmentTypes: z.array(z.enum(['MCQ', 'Flashcard', 'Essay', 'Mixed'])),
  academicLevel: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  mcqCount: z.number().int().min(0).max(20).optional().default(5),
  essayCount: z.number().int().min(0).max(10).optional().default(2),
  flashcardCount: z.number().int().min(0).max(20).optional().default(5),
});
export type GenerateStudyAssessmentsInput = z.infer<typeof GenerateStudyAssessmentsInputSchema>;

const GenerateStudyAssessmentsOutputSchema = z.object({
  mcqs: z.array(MCQSchema).optional(),
  flashcards: z.array(FlashcardSchema).optional(),
  essayPrompts: z.array(EssayPromptSchema).optional(),
  totalTokens: z.number().optional(),
  error: z.string().optional(),
});
export type GenerateStudyAssessmentsOutput = z.infer<typeof GenerateStudyAssessmentsOutputSchema>;

export async function generateStudyAssessments(input: GenerateStudyAssessmentsInput): Promise<GenerateStudyAssessmentsOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { error: "AI Key is missing." };
  
  if (input.studyMaterial.length < 30) {
    return { error: "Content is too short. Please add more details." };
  }

  let material = input.studyMaterial;
  if (material.length > 8000) material = material.substring(0, 8000) + "...";

  const systemPrompt = `You are a Senior Academic Content Developer.
Generate content ONLY from the provided material using llama-3.1-8b-instant.
LEVEL: ${input.academicLevel} | DIFFICULTY: ${input.difficulty}
Return ONLY valid JSON.`;

  const userPrompt = `Material:
"""
${material}
"""

Generate:
- ${input.mcqCount} MCQs
- ${input.essayCount} Essay Prompts
- ${input.flashcardCount} Flashcards

JSON Schema:
{
  "mcqs": [{"question": "string", "options": ["string"], "correctAnswer": "string", "explanation": "string"}],
  "flashcards": [{"front": "string", "back": "string"}],
  "essayPrompts": [{"prompt": "string", "evaluationCriteria": ["string"], "modelAnswerOutline": ["string"]}]
}`;

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

    if (!response.ok) throw new Error("API Failure");
    
    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    const usage = data.usage?.total_tokens || 0;
    
    return GenerateStudyAssessmentsOutputSchema.parse({
      ...content,
      totalTokens: usage
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error.message);
    return { error: "Failed to generate assessment. Try again." };
  }
}
