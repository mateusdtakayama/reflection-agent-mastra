import { Agent } from "@mastra/core/agent";
import { openAIConfig } from "../config.js";

// Reflector prompt template
const REFLECTOR_PROMPT_TEMPLATE = `Critically analyze the following response:

Question: {question}
Answer: {answer}

Evaluate:
1. Accuracy of information
2. Clarity of explanation
3. Completeness of the response
4. Structure and organization

Provide specific feedback and improvement suggestions.`;

export interface ReflectorInput {
  question: string;
  answer: string;
}

/**
 * Reflector Agent
 * Responsibilities:
 * - Analyze the generated response
 * - Identify problems (accuracy, clarity, completeness)
 * - Generate constructive feedback
 * - Suggest specific improvements
 */
export function createReflectorAgent() {
  return new Agent({
    name: "reflector",
    instructions: REFLECTOR_PROMPT_TEMPLATE,
    model: `openai/${openAIConfig.model}`,
    maxRetries: 2,
  });
}

/**
 * Reflect on a response and provide feedback
 */
export async function reflectOnResponse(
  agent: Agent,
  input: ReflectorInput
): Promise<string> {
  const prompt = REFLECTOR_PROMPT_TEMPLATE.replace(
    "{question}",
    input.question
  ).replace("{answer}", input.answer);

  const result = await agent.generate(prompt);

  return result.text;
}
