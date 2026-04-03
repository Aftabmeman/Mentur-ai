'use server';
/**
 * @fileOverview An AI agent for evaluating student essays using Groq.
 *
 * - evaluateEssayFeedback - A function that handles the essay evaluation process.
 * - EvaluateEssayFeedbackInput - The input type for the evaluateEssayFeedback function.
 * - EvaluateEssayFeedbackOutput - The return type for the evaluateEssayFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string().describe('The typed content of the essay.'),
  topic: z.string().describe('The topic of the essay.'),
  academicLevel: z.enum(['High School', 'College', 'Graduate', 'Other']).describe('The academic level for which the essay is written.'),
  rubric: z.string().optional().describe('An optional rubric or specific criteria for evaluation.'),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  score: z.number().int().min(0).max(100).describe('Overall score for the essay out of 100.'),
  strengths: z.array(z.string()).describe('A list of specific strengths observed in the essay.'),
  weaknesses: z.array(z.string()).describe('A list of specific weaknesses observed in the essay.'),
  improvementSuggestions: z.array(z.string()).describe('Actionable suggestions for how the student can improve their essay writing.'),
  modelAnswerOutline: z.array(z.string()).describe('A structural outline of a model answer for the given essay topic, covering key points and organization.'),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  return evaluateEssayFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateEssayFeedbackPrompt',
  input: { schema: EvaluateEssayFeedbackInputSchema },
  output: { schema: EvaluateEssayFeedbackOutputSchema },
  model: 'groq/llama-3.1-8b-instant',
  prompt: `You are an expert essay evaluator. Your task is to provide comprehensive feedback on the student's essay.

Academic Level: {{{academicLevel}}}
Essay Topic: {{{topic}}}
{{#if rubric}}
Evaluation Rubric: {{{rubric}}}
{{/if}}

Critically analyze the provided essay and generate:
1.  An overall score out of 100.
2.  A list of specific strengths.
3.  A list of specific weaknesses.
4.  Actionable suggestions for improvement.
5.  A structural outline of a model answer for this essay topic, covering key points and organization.

--- Student Essay ---
{{{essayText}}}
--- End Student Essay ---`,
});

const evaluateEssayFeedbackFlow = ai.defineFlow(
  {
    name: 'evaluateEssayFeedbackFlow',
    inputSchema: EvaluateEssayFeedbackInputSchema,
    outputSchema: EvaluateEssayFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
