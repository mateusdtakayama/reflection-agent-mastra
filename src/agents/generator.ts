import { Agent } from "@mastra/core/agent";
import { openAIConfig } from "../config.js";

// Generator prompt template
const GENERATOR_PROMPT_TEMPLATE = `You are a specialized assistant. Answer the following question:

{user_input}

Provide a complete and well-structured response.`;

export interface GeneratorInput {
  userInput: string;
}

/**
 * Generator Agent
 * Responsibilities:
 * - Receive user input
 * - Generate initial response using GPT-4
 * - Return response for reflection
 */
export function createGeneratorAgent() {
  return new Agent({
    name: "generator",
    instructions: GENERATOR_PROMPT_TEMPLATE,
    model: `openai/${openAIConfig.model}`,
    maxRetries: 2,
  });
}

/**
 * Generate initial response from user input
 */
export async function generateResponse(
  agent: Agent,
  input: GeneratorInput
): Promise<string> {
  const prompt = GENERATOR_PROMPT_TEMPLATE.replace(
    "{user_input}",
    input.userInput
  );

  const result = await agent.generate(prompt);

  return result.text;
}
