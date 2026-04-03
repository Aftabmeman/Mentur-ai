'use server';
/**
 * @fileOverview A Genkit flow for generating various academic assessments using Groq.
 *
 * - generateStudyAssessments - A function that handles the assessment generation process.
 * - GenerateStudyAssessmentsInput - The input type for the generateStudyAssessments function.
 * - GenerateStudyAssessmentsOutput - The return type for the generateStudyAssessments function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MCQSchema = z.object({
  question: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).describe('An array of possible answers for the MCQ.'),
  correctAnswer: z.string().describe('The correct answer option for the MCQ.'),
});

const FlashcardSchema = z.object({
  front: z.string().describe('The front side of the flashcard (e.g., question, term).'),
  back: z.string().describe('The back side of the flashcard (e.g., answer, definition).'),
});

const EssayPromptSchema = z.object({
  prompt: z.string().describe('The essay question or prompt.'),
  modelAnswerOutline: z.array(z.string()).describe('A bulleted outline of key points for a model answer.'),
});

const GenerateStudyAssessmentsInputSchema = z.object({
  studyMaterial: z.string().describe('The text content of the study material.'),
  assessmentTypes: z.array(z.enum(['MCQ', 'Flashcard', 'Essay', 'Mixed'])).describe('The types of assessments to generate.'),
  academicLevel: z.string().describe('The academic level for the assessments (e.g., "High School", "Undergraduate").'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level for the assessments.'),
  questionCount: z.number().int().min(1).max(20).describe('The desired number of questions for each assessment type.'),
});
export type GenerateStudyAssessmentsInput = z.infer<typeof GenerateStudyAssessmentsInputSchema>;

const GenerateStudyAssessmentsOutputSchema = z.object({
  mcqs: z.array(MCQSchema).optional().describe('Generated Multiple Choice Questions.'),
  flashcards: z.array(FlashcardSchema).optional().describe('Generated Flashcards.'),
  essayPrompts: z.array(EssayPromptSchema).optional().describe('Generated Essay Prompts with model answer outlines.'),
});
export type GenerateStudyAssessmentsOutput = z.infer<typeof GenerateStudyAssessmentsOutputSchema>;

export async function generateStudyAssessments(input: GenerateStudyAssessmentsInput): Promise<GenerateStudyAssessmentsOutput> {
  return generateStudyAssessmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyAssessmentsPrompt',
  input: { schema: GenerateStudyAssessmentsInputSchema },
  output: { schema: GenerateStudyAssessmentsOutputSchema },
  model: 'groq/llama-3.1-8b-instant',
  prompt: `You are an AI assistant specialized in creating diverse academic assessments.
Your task is to generate various types of assessments based on the provided study material and user specifications.

Study Material:
"""
{{{studyMaterial}}}
"""

Assessment Configuration:
- Desired Assessment Types: {{{assessmentTypes}}}
- Academic Level: {{{academicLevel}}}
- Difficulty: {{{difficulty}}}
- Number of Questions for each type: {{{questionCount}}}

Instructions:
1. Carefully read the study material.
2. Generate assessments according to the specified types, academic level, difficulty, and question count.
3. Ensure all generated content is directly derived from or highly relevant to the provided study material.
4. For MCQs, provide a question, at least 4 options, and clearly state the correct answer.
5. For Flashcards, provide a clear front (e.g., term, concept) and a concise back (e.g., definition, explanation).
6. For Essay prompts, create a thought-provoking question and provide a bulleted outline of key points for a model answer.
7. Format your response as a JSON object strictly following the provided output schema. Only include keys for the assessment types requested in 'assessmentTypes'. If 'Mixed' is requested, generate a mix of all available types up to the 'questionCount' limit, distributing them reasonably.
`,
});

const generateStudyAssessmentsFlow = ai.defineFlow(
  {
    name: 'generateStudyAssessmentsFlow',
    inputSchema: GenerateStudyAssessmentsInputSchema,
    outputSchema: GenerateStudyAssessmentsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
