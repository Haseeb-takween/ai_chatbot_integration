import fs from "fs";
import path from "path";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { GEMINI_MODEL, getGeminiClient, isGeminiApiError, type ApiError } from "../lib/gemini";
import { ConversationModel } from "../models/conversation.model";

const PROMPTS_DIR = path.join(__dirname, "../../prompts");

const SYSTEM_PROMPT = [
  fs.readFileSync(path.join(PROMPTS_DIR, "system-prompt.md"), "utf-8"),
  "\n\n# Knowledge Base\n\n",
  fs.readFileSync(path.join(PROMPTS_DIR, "knowledge-base.md"), "utf-8"),
].join("");

const chatRequestSchema = z.object({
  conversationId: z.string().nullish(),
  message: z.string().min(1).max(8000),
});

function makeTitle(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  return trimmed.length > 50 ? `${trimmed.slice(0, 50)}...` : trimmed;
}

function mapGeminiError(err: ApiError): AppError {
  if (err.status === 429) {
    return new AppError(
      429,
      "The AI is receiving too many requests right now. Please wait a moment and try again.",
    );
  }

  if (err.status === 401 || err.status === 403) {
    console.error("Gemini API authentication error:", err.message);
    return new AppError(
      503,
      "The chat service is not configured correctly. Please contact the administrator.",
    );
  }

  if (err.status >= 500) {
    return new AppError(
      503,
      "The AI service is temporarily unavailable. Please try again shortly.",
    );
  }

  console.error("Gemini API error:", err.message);
  return new AppError(502, "The AI service returned an error. Please try again.");
}

export async function postChat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { conversationId, message } = chatRequestSchema.parse(req.body);

    let conversation;
    if (conversationId) {
      if (!mongoose.isValidObjectId(conversationId)) {
        throw new AppError(404, "Conversation not found");
      }

      conversation = await ConversationModel.findById(conversationId);
      if (!conversation) {
        throw new AppError(404, "Conversation not found");
      }
    } else {
      conversation = new ConversationModel({
        title: makeTitle(message),
        messages: [],
      });
    }

    const history = conversation.messages.map((entry) => ({
      role: entry.role === "assistant" ? "model" : "user",
      parts: [{ text: entry.content }],
    }));

    const gemini = await getGeminiClient();
    const chat = gemini.chats.create({
      model: GEMINI_MODEL,
      config: { systemInstruction: SYSTEM_PROMPT },
      history,
    });
    const response = await chat.sendMessage({ message });

    const reply = response.text;
    if (!reply) {
      throw new AppError(502, "Received an empty response from Gemini");
    }

    const now = new Date();
    conversation.messages.push({ role: "user", content: message, timestamp: now });
    conversation.messages.push({ role: "assistant", content: reply, timestamp: new Date() });
    await conversation.save();

    res.json({ conversationId: conversation._id.toString(), reply });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, "Invalid chat request"));
      return;
    }
    if (await isGeminiApiError(err)) {
      next(mapGeminiError(err as ApiError));
      return;
    }
    next(err);
  }
}
