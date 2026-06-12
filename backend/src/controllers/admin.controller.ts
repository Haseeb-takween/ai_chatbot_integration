import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { z } from "zod";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { ConversationModel } from "../models/conversation.model";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function adminLogin(req: Request, res: Response, next: NextFunction): void {
  try {
    const { email, password } = loginSchema.parse(req.body);

    if (email !== env.ADMIN_EMAIL || password !== env.ADMIN_PASSWORD) {
      throw new AppError(401, "Invalid credentials");
    }

    const token = jwt.sign({ role: "admin" }, env.ADMIN_SESSION_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, "Email and password are required"));
      return;
    }
    next(err);
  }
}

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function adminListConversations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit } = listQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      ConversationModel.find()
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title createdAt updatedAt messages")
        .lean(),
      ConversationModel.countDocuments(),
    ]);

    res.json({
      conversations: conversations.map((conversation) => ({
        id: conversation._id.toString(),
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messages.length,
      })),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, "Invalid pagination parameters"));
      return;
    }
    next(err);
  }
}

export async function adminGetConversation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError(404, "Conversation not found");
    }

    const conversation = await ConversationModel.findById(req.params.id).lean();

    if (!conversation) {
      throw new AppError(404, "Conversation not found");
    }

    res.json({
      id: conversation._id.toString(),
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function adminStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [totalConversations, messageCountResult] = await Promise.all([
      ConversationModel.countDocuments(),
      ConversationModel.aggregate<{ totalMessages: number }>([
        { $project: { messageCount: { $size: "$messages" } } },
        { $group: { _id: null, totalMessages: { $sum: "$messageCount" } } },
      ]),
    ]);

    res.json({
      totalConversations,
      totalMessages: messageCountResult[0]?.totalMessages ?? 0,
    });
  } catch (err) {
    next(err);
  }
}
