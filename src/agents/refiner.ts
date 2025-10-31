import { Agent } from "@mastra/core/agent";
import { openAIConfig } from "../config.js";

// Refiner prompt template
const REFINER_PROMPT_TEMPLATE = `Improve the following response based on the feedback:

Question: {question}
Original Answer: {original_answer}
Feedback: {reflection_feedback}

Generate an improved version that incorporates the suggestions.`;

export interface RefinerInput {
  question: string;
  originalAnswer: string;
  reflectionFeedback: string;
}

/**
 * Refiner Agent
 * Responsibilities:
 * - Receive original response + feedback
 * - Apply suggested improvements
 * - Generate refined version
 * - Maintain context of the original question
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
 * Refine a response based on feedback
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
