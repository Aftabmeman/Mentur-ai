'use server';
/**
 * @fileOverview High-performance academic assessment generator using Groq API.
 * Model: llama-3.1-8b-instant for fast and reliable educational content generation.
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
  error: z.string().optional(),
});
export type GenerateStudyAssessmentsOutput = z.infer<typeof GenerateStudyAssessmentsOutputSchema>;

export async function generateStudyAssessments(input: GenerateStudyAssessmentsInput): Promise<GenerateStudyAssessmentsOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("GROQ_API_KEY is missing in environment variables.");
    return { error: "Configuration Error: AI Key is not set." };
  }

  if (!input.studyMaterial.trim()) {
    return { error: "No content provided for research." };
  }

  const systemPrompt = `You are the Lead Educational Researcher for Mentur AI.
Strictly follow these rules:
1. FULL CONTENT EXTRACTION: Analyze the material deeply.
2. ACADEMIC STANDARDS: Match the '${input.academicLevel}' level exactly.
3. OUTPUT FORMAT: Return ONLY a valid JSON object. No extra text.
4. REQUIRED QUANTITIES:
   - MCQs: ${input.mcqCount}
   - Essay Prompts: ${input.essayCount}
   - Flashcards: ${input.flashcardCount}`;

  const userPrompt = `Material:
"""
${input.studyMaterial}
"""

Target Level: ${input.academicLevel}
Difficulty: ${input.difficulty}

Generate strictly in this JSON structure:
{
  "mcqs": [{"question": "string", "options": ["string"], "correctAnswer": "string", "explanation": "string"}],
  "flashcards": [{"front": "string", "back": "string"}],
  "essayPrompts": [{"prompt": "string", "evaluationCriteria": ["string"], "modelAnswerOutline": ["string" ]}]
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
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API Error Details: Status ${response.status} - ${errorText}`);
      return { error: `AI Research Engine encountered an error (${response.status}).` };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsedContent = JSON.parse(content);
      return GenerateStudyAssessmentsOutputSchema.parse(parsedContent);
    } catch (parseError: any) {
      console.error("JSON Parsing Error:", content);
      return { error: "AI Research Engine returned an invalid response format." };
    }
  } catch (error: any) {
    console.error("Fetch Exception:", error.message);
    return { error: error.message || "A network error occurred during generation." };
  }
}
