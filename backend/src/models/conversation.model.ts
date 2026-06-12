import { Schema, model, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const conversationSchema = new Schema(
  {
    title: { type: String, required: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true },
);

export type ConversationMessage = InferSchemaType<typeof messageSchema>;
export type Conversation = InferSchemaType<typeof conversationSchema>;

export const ConversationModel = model("Conversation", conversationSchema);
