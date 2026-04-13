'use server';
/**
 * @fileOverview A sophisticated academic assessment generator for Mentur AI.
 * Tailors content based on 8th Std, University, or UPSC levels.
 */

import { z } from 'zod';

const MCQSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string().describe('Detailed academic explanation based on the study level.'),
});

const FlashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
});

const EssayPromptSchema = z.object({
  prompt: z.string(),
  evaluationCriteria: z.array(z.string()).describe('Specific points a student must cover at this academic level.'),
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
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const systemPrompt = `You are the Lead Educational Researcher for Mentur AI.
Your task is to transform raw academic text into a high-stakes assessment journey.

ACADEMIC CONTEXT RESEARCH LOGIC:
- If '8th Standard': Focus on direct recall, basic conceptual understanding, and descriptive clarity.
- If 'Undergraduate Year 1': Focus on critical analysis, theory application, and comparative arguments.
- If 'Competitive Exams (UPSC)': Focus on multi-dimensional perspectives, ethical reasoning, current relevance, and high-level synthesis of information.

INSTRUCTIONS:
1. Extract every meaningful line from the input material before summarizing.
2. Tailor question depth strictly to the '${input.academicLevel}' level.
3. If 'Mixed' mode, you MUST provide both MCQs and Essays in the specified counts.
4. For MCQs: Ensure 4 distinct options. One is correct. Provide a professional explanation.
5. For Essays: Provide a structural blueprint (outline) and evaluation criteria.

STRICT JSON OUTPUT FORMAT:
{
  "mcqs": [{"question": "string", "options": ["string"], "correctAnswer": "string", "explanation": "string"}],
  "flashcards": [{"front": "string", "back": "string"}],
  "essayPrompts": [{"prompt": "string", "evaluationCriteria": ["string"], "modelAnswerOutline": ["string"]}]
}`;

  const userPrompt = `Study Material Extraction Target:
"""
${input.studyMaterial}
"""

TARGET SPECIFICATIONS:
- Academic Level: ${input.academicLevel}
- Difficulty: ${input.difficulty}
- MCQ Target Quantity: ${input.mcqCount}
- Essay Prompt Target Quantity: ${input.essayCount}
- Flashcard Target Quantity: ${input.flashcardCount}

Ensure the difficulty and depth perfectly match a ${input.academicLevel} student. Generate only relevant, high-quality questions. Return ONLY valid JSON.`;

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
      temperature: 0.6,
    }),
  });

  if (!response.ok) throw new Error(`Groq API Error: ${response.statusText}`);

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return GenerateStudyAssessmentsOutputSchema.parse(JSON.parse(content));
  } catch (e) {
    console.error("AI Output Parsing Failed:", content);
    throw new Error("Invalid educational data generated.");
  }
}
