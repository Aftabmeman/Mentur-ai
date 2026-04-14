'use server';
/**
 * @fileOverview High-performance academic assessment generator using Groq API.
 * Strictly source-based generation for specified educational levels.
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
  academicLevel: z.enum([
    'Class 8th', 'Class 9th', 'Class 10th', 'Class 11th', 'Class 12th',
    'UG Year 1', 'UG Year 2', 'UG Year 3',
    'Competitive (UPSC)', 'Competitive (JEE)', 'Competitive (NEET)', 'Competitive (Others)'
  ]),
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
  error: z.string().optional(),
});
export type GenerateStudyAssessmentsOutput = z.infer<typeof GenerateStudyAssessmentsOutputSchema>;

export async function generateStudyAssessments(input: GenerateStudyAssessmentsInput): Promise<GenerateStudyAssessmentsOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("GROQ_API_KEY is missing.");
    return { error: "Configuration Error: AI Key is not set." };
  }

  const systemPrompt = `You are an expert Educational Content Developer for Mentur AI.
STRICT ADHERENCE RULE: You must ONLY use the provided 'Study Material' to generate questions. Do NOT use outside knowledge or facts not present in the text.
TARGET LEVEL: ${input.academicLevel}
DIFFICULTY: ${input.difficulty}

Deliverables:
1. MCQs: ${input.mcqCount}
2. Essay Prompts: ${input.essayCount}
3. Flashcards: ${input.flashcardCount}

Output format: STRICT JSON.`;

  const userPrompt = `Generate educational content strictly from this material:
"""
${input.studyMaterial}
"""

Return a JSON object:
{
  "mcqs": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "explanation": "..."}],
  "flashcards": [{"front": "...", "back": "..."}],
  "essayPrompts": [{"prompt": "...", "evaluationCriteria": ["..."], "modelAnswerOutline": ["..." ]}]
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
        temperature: 0.3,
      }),
    });

    if (!response.ok) return { error: "AI Engine connection failed." };

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return GenerateStudyAssessmentsOutputSchema.parse(content);
  } catch (error: any) {
    console.error("Generation Error:", error);
    return { error: "Failed to generate assessments." };
  }
}