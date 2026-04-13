'use server';
/**
 * @fileOverview High-performance academic assessment generator using Groq API.
 * Models: mixtral-8x7b-32768 for deep content extraction and research.
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
  studyMaterial: z.string(),
  assessmentTypes: z.array(z.enum(['MCQ', 'Flashcard', 'Essay', 'Mixed'])),
  academicLevel: z.enum(['8th Standard', 'Undergraduate Year 1', 'Competitive Exams (UPSC)', 'Competitive Exams (JEE/NEET)', 'Competitive Exams (CAT/CLAT/SSC/NDA)']),
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
});
export type GenerateStudyAssessmentsOutput = z.infer<typeof GenerateStudyAssessmentsOutputSchema>;

export async function generateStudyAssessments(input: GenerateStudyAssessmentsInput): Promise<GenerateStudyAssessmentsOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is missing from environment variables.");
    throw new Error("GROQ_API_KEY is not set.");
  }

  const systemPrompt = `You are the Lead Educational Researcher for Mentur AI.
Your workflow involves 4 critical steps:
1. FULL CONTENT EXTRACTION: Analyze every line of the provided material.
2. CONTEXTUAL RESEARCH: Apply strict educational standards for the '${input.academicLevel}' level.
   - 8th Standard: Focus on factual recall, basic concepts, and descriptive clarity.
   - Undergraduate: Focus on analytical thinking, conceptual application, and critical arguments.
   - UPSC: Focus on multi-dimensional analysis, ethical reasoning, and current relevance.
3. TAILORED CONTENT GENERATION: Create high-stakes questions based on this research.
4. JSON OUTPUT: Return only a valid JSON object.

REQUIRED QUANTITIES:
- MCQs: ${input.mcqCount}
- Essays: ${input.essayCount}
- Flashcards: ${input.flashcardCount}`;

  const userPrompt = `Input Material:
"""
${input.studyMaterial}
"""

Academic Target: ${input.academicLevel}
Difficulty: ${input.difficulty}

Generate the assessment now following the strict JSON format:
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
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
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
      return GenerateStudyAssessmentsOutputSchema.parse(parsedContent);
    } catch (parseError: any) {
      console.error("JSON Parsing/Validation Failed:", parseError);
      console.error("Raw content received from Groq:", content);
      throw new Error(`Invalid educational data structure: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error("Flow Execution Failed:", error);
    throw error;
  }
}