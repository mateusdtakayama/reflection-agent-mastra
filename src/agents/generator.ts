import { Agent } from "@mastra/core/agent";
import { openAIConfig } from "../config.js";

const GENERATOR_PROMPT_TEMPLATE = `Create an inspiring and motivational phrase based on the following theme:

Theme: {user_input}

The phrase should be:
- Short and impactful
- Inspiring and uplifting
- Relevant to the theme
- Written in a positive tone`;

export interface GeneratorInput {
  userInput: string;
}

/**
 * Generator Agent
 * Responsibilities:
 * - Receive a theme as input
 * - Generate an initial motivational phrase
 * - Return phrase for reflection
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
 * Generate initial motivational phrase from a theme
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
