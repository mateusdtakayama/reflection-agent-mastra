import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY é obrigatória").optional(),
  MAX_ITERATIONS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  QUALITY_THRESHOLD: z
    .string()
    .transform(Number)
    .pipe(z.number().min(0).max(1))
    .optional(),
  MODEL_NAME: z.string().optional(),
});

const envParsed = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MAX_ITERATIONS: process.env.MAX_ITERATIONS ?? "3",
  QUALITY_THRESHOLD: process.env.QUALITY_THRESHOLD ?? "0.8",
  MODEL_NAME: process.env.MODEL_NAME ?? "gpt-4o-mini",
});

export const config = {
  OPENAI_API_KEY: envParsed.OPENAI_API_KEY || "sk-placeholder",
  MAX_ITERATIONS: envParsed.MAX_ITERATIONS ?? 3,
  QUALITY_THRESHOLD: envParsed.QUALITY_THRESHOLD ?? 0.8,
  MODEL_NAME: envParsed.MODEL_NAME ?? "gpt-4o-mini",
};

export const openAIConfig = {
  model: config.MODEL_NAME,
  temperature: {
    generator: 0.7,
    reflector: 0.3,
    refiner: 0.5,
  },
  maxTokens: 2000,
  topP: 1.0,
};

export const reflectionConfig = {
  maxIterations: config.MAX_ITERATIONS,
  qualityThreshold: config.QUALITY_THRESHOLD,
  enableMemory: true,
  saveHistory: true,
};
