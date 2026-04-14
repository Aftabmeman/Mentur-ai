
'use server';
/**
 * @fileOverview High-performance academic assessment generator using Groq API.
 * Uses llama-3.3-70b-versatile for high-accuracy source-based generation.
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

  // Input Validation
  if (input.studyMaterial.length < 500) {
    return { error: "Could not read PDF content properly. The text extracted is too short to generate a high-quality assessment." };
  }

  // Intelligent Truncation (Max 10,000 chars to maintain context precision)
  let material = input.studyMaterial;
  if (material.length > 10000) {
    console.log("Truncating input material for Groq (Length: " + material.length + ")");
    material = material.substring(0, 10000) + "... [Truncated for Context Stability]";
  }

  // Logging Context for debugging
  console.log("Generating assessments for level:", input.academicLevel);
  console.log("Material snippet:", material.substring(0, 200));

  const systemPrompt = `You are an expert Educational Content Developer for Mentur AI.
STRICT ADHERENCE RULE: You must ONLY use the provided 'Study Material' to generate questions. Do NOT use outside knowledge or facts not present in the text.
TARGET LEVEL: ${input.academicLevel}
DIFFICULTY: ${input.difficulty}
LANGUAGE: Match the language of the source material.

Deliverables:
1. MCQs: ${input.mcqCount}
2. Essay Prompts: ${input.essayCount}
3. Flashcards: ${input.flashcardCount}

Output format: Return ONLY valid JSON. No pre-amble, no post-amble.`;

  const userPrompt = `Generate educational content strictly from this material:
\"\"\"
${material}
\"\"\"

Return a JSON object following this schema:
{
  "mcqs": [{"question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string", "explanation": "string"}],
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
      const errorData = await response.json();
      console.error("Groq API Error Details:", errorData);
      return { error: "AI Engine connection failed: " + (errorData.error?.message || response.statusText) };
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return GenerateStudyAssessmentsOutputSchema.parse(content);
  } catch (error: any) {
    console.error("Generation Error:", error);
    return { error: "Failed to generate assessments. Please ensure the PDF has readable text." };
  }
}
