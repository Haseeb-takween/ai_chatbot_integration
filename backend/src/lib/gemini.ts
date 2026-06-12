import type { ApiError, GoogleGenAI } from "@google/genai" with { "resolution-mode": "import" };
import { env } from "../config/env";

export const GEMINI_MODEL = "gemini-2.5-flash";

type GenAIModule = typeof import("@google/genai", { with: { "resolution-mode": "import" } });

let modulePromise: Promise<GenAIModule> | null = null;

function loadModule(): Promise<GenAIModule> {
  modulePromise ??= import("@google/genai");
  return modulePromise;
}

let clientPromise: Promise<GoogleGenAI> | null = null;

export function getGeminiClient(): Promise<GoogleGenAI> {
  clientPromise ??= loadModule().then(
    ({ GoogleGenAI }) => new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }),
  );
  return clientPromise;
}

export async function isGeminiApiError(err: unknown): Promise<boolean> {
  const { ApiError } = await loadModule();
  return err instanceof ApiError;
}

export type { ApiError };
