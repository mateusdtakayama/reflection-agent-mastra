import { Agent } from "@mastra/core/agent";
import { openAIConfig } from "../config.js";

const REFLECTOR_PROMPT_TEMPLATE = `Critically analyze the following motivational phrase and provide detailed feedback:

Theme: {question}
Motivational Phrase: {answer}

Provide a comprehensive evaluation with:
1. **Strengths**: What works well (be specific - mention impact, word choice, emotional resonance)
2. **Weaknesses**: What needs improvement (be specific - mention what's missing, generic phrases, unclear meaning)
3. **Suggestions**: Concrete, actionable improvements (specific words to change, ideas to add, structure improvements)

Rate the overall quality on a scale and explain your rating. Be thorough and specific in your analysis.`;

export interface ReflectorInput {
  question: string;
  answer: string;
}

/**
 * Reflector Agent
 * Responsibilities:
 * - Analyze the generated motivational phrase
 * - Evaluate impact, relevance, and inspirational quality
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
 * Reflect on a motivational phrase and provide feedback
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
