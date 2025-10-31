import { Agent } from "@mastra/core/agent";
import { openAIConfig } from "../config.js";

const REFINER_PROMPT_TEMPLATE = `Improve the following motivational phrase based on the detailed feedback:

Theme: {question}
Original Phrase: {original_answer}
Feedback: {reflection_feedback}

Your task:
1. Carefully read ALL feedback points (strengths, weaknesses, suggestions)
2. Create a NEW, significantly improved version that addresses the weaknesses
3. Maintain what works well (the strengths mentioned)
4. Implement the concrete suggestions provided
5. Make the phrase SHORTER, MORE DIRECT, and more impactful

CRITICAL REQUIREMENTS:
- Maximum 15-20 words
- Short and direct (remove all unnecessary words)
- Keep only the essential message
- Make every word count
- More impactful and memorable than the original

Return ONLY the improved phrase, nothing else.`;

export interface RefinerInput {
  question: string;
  originalAnswer: string;
  reflectionFeedback: string;
}

/**
 * Refiner Agent
 * Responsibilities:
 * - Receive original motivational phrase + feedback
 * - Apply suggested improvements
 * - Generate refined motivational phrase
 * - Maintain relevance to the theme
 */
export function createRefinerAgent() {
  return new Agent({
    name: "refiner",
    instructions: REFINER_PROMPT_TEMPLATE,
    model: `openai/${openAIConfig.model}`,
    maxRetries: 2,
  });
}

/**
 * Refine a motivational phrase based on feedback
 */
export async function refineResponse(
  agent: Agent,
  input: RefinerInput
): Promise<string> {
  const prompt = REFINER_PROMPT_TEMPLATE.replace("{question}", input.question)
    .replace("{original_answer}", input.originalAnswer)
    .replace("{reflection_feedback}", input.reflectionFeedback);

  const result = await agent.generate(prompt);

  return result.text;
}
