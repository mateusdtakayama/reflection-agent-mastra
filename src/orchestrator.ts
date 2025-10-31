import { Agent } from "@mastra/core/agent";
import { createGeneratorAgent, generateResponse } from "./agents/generator.js";
import { createReflectorAgent, reflectOnResponse } from "./agents/reflector.js";
import { createRefinerAgent, refineResponse } from "./agents/refiner.js";
import { reflectionConfig } from "./config.js";

export interface ReflectionIteration {
  iteration: number;
  response: string;
  feedback: string;
  qualityScore: number;
}

export interface ReflectionResult {
  finalResponse: string;
  iterations: ReflectionIteration[];
  totalIterations: number;
  stoppedEarly: boolean;
}

const POSITIVE_KEYWORDS = [
  "excellent",
  "great",
  "accurate",
  "clear",
  "complete",
  "well-structured",
  "good",
  "satisfactory",
  "comprehensive",
  "precise",
  "inspiring",
  "impactful",
  "memorable",
  "uplifting",
  "motivational",
  "emotionally resonant",
] as const;

const NEGATIVE_KEYWORDS = [
  "missing",
  "unclear",
  "inaccurate",
  "incomplete",
  "needs improvement",
  "lacks",
  "confusing",
  "vague",
  "incorrect",
  "generic",
  "uninspiring",
  "lacks impact",
  "not memorable",
  "weak",
] as const;

const BASE_SCORE = 0.5;
const KEYWORD_WEIGHT = 0.1;
const MIN_SCORE = 0;
const MAX_SCORE = 1;

const STRUCTURED_FEEDBACK_BONUS = 0.1;
const NEGATIVE_OVERLOAD_PENALTY = 0.15;
const HIGHLY_POSITIVE_BONUS = 0.2;
const IMPROVEMENT_INDICATOR_WEIGHT = 0.05;

const MIN_POSITIVE_FOR_BONUS = 3;
const NEGATIVE_RATIO_THRESHOLD = 2;

const STRUCTURED_FEEDBACK_KEYWORDS = [
  "strength",
  "weakness",
  "suggestion",
  "rating",
  "specific",
] as const;

const IMPROVEMENT_INDICATORS = [
  "improved",
  "better",
  "enhanced",
  "stronger",
  "more impactful",
  "excellent",
] as const;

/**
 * Count how many keywords from the list appear in the text
 */
function countKeywords(text: string, keywords: readonly string[]): number {
  const textLower = text.toLowerCase();
  return keywords.filter((keyword) => textLower.includes(keyword)).length;
}

/**
 * Check if feedback has structured format (strengths, weaknesses, suggestions)
 */
function hasStructuredFormat(feedback: string): boolean {
  const feedbackLower = feedback.toLowerCase();
  return STRUCTURED_FEEDBACK_KEYWORDS.some((keyword) =>
    feedbackLower.includes(keyword)
  );
}

/**
 * Calculate base score from positive/negative keyword counts
 */
function calculateBaseScore(
  positiveCount: number,
  negativeCount: number
): number {
  return (
    BASE_SCORE + positiveCount * KEYWORD_WEIGHT - negativeCount * KEYWORD_WEIGHT
  );
}

/**
 * Apply bonus for structured feedback
 */
function applyStructuredFeedbackBonus(score: number, feedback: string): number {
  return hasStructuredFormat(feedback)
    ? score + STRUCTURED_FEEDBACK_BONUS
    : score;
}

/**
 * Apply penalty for excessive negative indicators
 */
function applyNegativeOverloadPenalty(
  score: number,
  positiveCount: number,
  negativeCount: number
): number {
  if (negativeCount > positiveCount * NEGATIVE_RATIO_THRESHOLD) {
    return score - NEGATIVE_OVERLOAD_PENALTY;
  }
  return score;
}

/**
 * Apply bonus for highly positive feedback
 */
function applyHighlyPositiveBonus(
  score: number,
  positiveCount: number,
  negativeCount: number
): number {
  if (positiveCount >= MIN_POSITIVE_FOR_BONUS && negativeCount === 0) {
    return score + HIGHLY_POSITIVE_BONUS;
  }
  return score;
}

/**
 * Apply bonus for improvement indicators (suggests progressive refinement)
 */
function applyImprovementBonus(score: number, feedback: string): number {
  const improvementCount = countKeywords(feedback, IMPROVEMENT_INDICATORS);
  return score + improvementCount * IMPROVEMENT_INDICATOR_WEIGHT;
}

/**
 * Evaluate quality score from feedback text
 * Analyzes positive/negative indicators and feedback structure to determine quality score
 */
function evaluateQuality(feedback: string): number {
  const positiveCount = countKeywords(feedback, POSITIVE_KEYWORDS);
  const negativeCount = countKeywords(feedback, NEGATIVE_KEYWORDS);

  let score = calculateBaseScore(positiveCount, negativeCount);
  score = applyStructuredFeedbackBonus(score, feedback);
  score = applyNegativeOverloadPenalty(score, positiveCount, negativeCount);
  score = applyHighlyPositiveBonus(score, positiveCount, negativeCount);
  score = applyImprovementBonus(score, feedback);

  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

/**
 * Orchestrator
 * Manages the reflection cycle for generating motivational phrases,
 * controls iterations, decides when to stop, maintains iteration history,
 * and returns the best motivational phrase.
 */
export class ReflectionOrchestrator {
  private readonly generatorAgent: Agent;
  private readonly reflectorAgent: Agent;
  private readonly refinerAgent: Agent;

  constructor() {
    this.generatorAgent = createGeneratorAgent();
    this.reflectorAgent = createReflectorAgent();
    this.refinerAgent = createRefinerAgent();
  }

  /**
   * Run the reflection cycle
   */
  async reflect(input: string): Promise<ReflectionResult> {
    const iterations: ReflectionIteration[] = [];
    let currentResponse = "";

    for (let i = 0; i < reflectionConfig.maxIterations; i++) {
      const iterationNumber = i + 1;
      currentResponse = await this.generateResponse(input, i, iterations);

      const iteration = await this.processIteration(
        input,
        currentResponse,
        iterationNumber
      );

      iterations.push(iteration);

      if (this.shouldStopEarly(iteration.qualityScore)) {
        return this.buildResult(currentResponse, iterations, true);
      }
    }

    return this.buildResult(currentResponse, iterations, false);
  }

  private async generateResponse(
    input: string,
    iterationIndex: number,
    previousIterations: ReflectionIteration[]
  ): Promise<string> {
    if (iterationIndex === 0) {
      return generateResponse(this.generatorAgent, { userInput: input });
    }

    const previous = previousIterations[iterationIndex - 1];
    return refineResponse(this.refinerAgent, {
      question: input,
      originalAnswer: previous.response,
      reflectionFeedback: previous.feedback,
    });
  }

  private async processIteration(
    input: string,
    response: string,
    iterationNumber: number
  ): Promise<ReflectionIteration> {
    const feedback = await reflectOnResponse(this.reflectorAgent, {
      question: input,
      answer: response,
    });

    const qualityScore = evaluateQuality(feedback);

    return {
      iteration: iterationNumber,
      response,
      feedback,
      qualityScore,
    };
  }

  private shouldStopEarly(qualityScore: number): boolean {
    return qualityScore >= reflectionConfig.qualityThreshold;
  }

  private buildResult(
    finalResponse: string,
    iterations: ReflectionIteration[],
    stoppedEarly: boolean
  ): ReflectionResult {
    return {
      finalResponse,
      iterations,
      totalIterations: iterations.length,
      stoppedEarly,
    };
  }
}
