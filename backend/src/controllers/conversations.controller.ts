import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../middleware/errorHandler";
import { ConversationModel } from "../models/conversation.model";

export async function listConversations(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conversations = await ConversationModel.find()
      .sort({ updatedAt: -1 })
      .select("title createdAt updatedAt")
      .lean();

    res.json({
      conversations: conversations.map((conversation) => ({
        id: conversation._id.toString(),
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getConversation(
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

export async function deleteConversation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError(404, "Conversation not found");
    }

    const conversation = await ConversationModel.findByIdAndDelete(req.params.id);

    if (!conversation) {
      throw new AppError(404, "Conversation not found");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createConversation(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conversation = await ConversationModel.create({
      title: "New conversation",
      messages: [],
    });

    res.status(201).json({
      id: conversation._id.toString(),
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}
